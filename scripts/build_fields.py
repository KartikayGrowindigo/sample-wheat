#!/usr/bin/env python
"""
build_fields.py — Excel -> wheat-fields.geo.json / wheat-boundaries.geo.json

Source: "273 Farmer Data (Clearharvest).xlsx" (one row per farmer field, POINT
coordinates only — no real field-boundary export exists for this programme).
Regenerate any time the Excel changes:

    python scripts/build_fields.py

WHAT THIS DOES
  1. Loads the sheet, normalises District / Taluka / Village spelling (the raw
     sheet has heavy free-text drift: "LUDHIANA I" / "Ludhiana 1" / "Ldh1" /
     "Ldh 1" all mean the same taluka — see ALIASES below).
  2. Fixes ~14 rows whose GPS points are wildly outside Punjab (data-entry /
     GPS-drift errors placing them in UP/Bihar) by relocating them near their
     own village's other, valid points.
  3. Groups fields by (district, taluka, village) into "village" units, and
     partitions the whole study area with one master Voronoi diagram over
     village centroids so no two villages' land blobs can ever overlap.
  4. Builds an irregular village "land blob" (perturbed-radius polygon, not a
     circle) sized to the village's total Excel acreage, clipped to that
     village's Voronoi cell.
  5. Scatters one seed per field (from its real lon/lat, pulled inside the
     blob if needed), Lloyd-relaxes 3x against a bounded Voronoi diagram so
     parcel sizes even out, then clips cells to the blob boundary.
  6. Subtracts a random "canal" + "access track" so the block isn't one solid
     sheet, erodes each parcel ~1.5-2m for a bund gap, then densifies +
     jitters the edges so boundaries read as surveyed, not machine-drawn.
  7. Recomputes acreage from the drawn polygon (locally-projected area) —
     that's what ships in the properties; the Excel value ships too, as
     `acresExcel`, for reference/QA only.

Requires: pandas, numpy, shapely>=2.0, scipy, openpyxl (all already present
in this environment / repo's Python).
"""
import json
import math
import os
import re
import numpy as np
import pandas as pd
from shapely.geometry import Point, Polygon, MultiPoint, box
from shapely.ops import unary_union
from scipy.spatial import Voronoi

RNG = np.random.default_rng(20260819)  # fixed seed -> regeneration is stable

XLSX = "273 Farmer Data (Clearharvest).xlsx"
OUT_FIELDS = "wheat-fields.geo.json"
OUT_BOUNDARIES = "wheat-boundaries.geo.json"

ACRE_M2 = 4046.8564224
M_PER_DEG_LAT = 111_320.0

# ----------------------------------------------------------------------------
# 1. load + normalise
# ----------------------------------------------------------------------------
TALUKA_ALIASES = {
    "ludhiana 1": "Ludhiana I", "ludhiana i": "Ludhiana I", "ldh 1": "Ludhiana I", "ldh1": "Ludhiana I",
    "ludhiana 2": "Ludhiana II", "ludhiana ii": "Ludhiana II",
    "ldh": "Ludhiana", "ludhiana": "Ludhiana",
    "kotkapura": "Kotkapura", "kot kapura": "Kotkapura",
    "faridkot": "Faridkot",
    "jagraon": "Jagraon",
}
VILLAGE_ALIASES = {
    "gounsgar": "Gaunsgarh", "gaushgarh": "Gaunsgarh", "gaunsgarh": "Gaunsgarh",
    "macchian kalan": "Machhian Kalan", "machhian kalan": "Machhian Kalan",
    "nupur bet": "Nurpur Bet", "nurpur bet": "Nurpur Bet",
    "khawajke": "Khwajke", "khwajke": "Khwajke",
    "sasrali clony": "Sasrali Colony", "sasrali colony": "Sasrali Colony",
    "panch sheel clony": "Panch Sheel Colony",
}


def norm_words(s):
    return re.sub(r"\s+", " ", str(s).strip()).title()


def canon(s, alias_table):
    key = re.sub(r"\s+", " ", str(s).strip()).lower()
    return alias_table.get(key, norm_words(s))


def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s


def load():
    df = pd.read_excel(XLSX)
    df.columns = [c.strip() for c in df.columns]
    df = df.rename(columns={
        "Acres": "acresExcel",
        "Procurement (In MT)": "procurementMt",
        "Miller Name": "millerName",
        "Farmer_ID": "farmerId",
        "Longitude": "lon", "Latitude": "lat",
    })
    df["district"] = df["District"].map(lambda s: norm_words(s))
    df["taluka"] = df["Taluka"].map(lambda s: canon(s, TALUKA_ALIASES))
    df["village"] = df["Village"].map(lambda s: canon(s, VILLAGE_ALIASES))
    df["villageKey"] = (df["district"] + "|" + df["taluka"] + "|" + df["village"]).map(
        lambda s: slugify(s)
    )
    df["farmerId"] = df["farmerId"].astype(str)
    return df


def fix_outliers(df):
    """Punjab bbox with margin; anything outside it is a bad GPS fix -
    relocate near the rest of its own village (or taluka, or district)."""
    good = df[(df.lon.between(73.3, 77.6)) & (df.lat.between(29.0, 33.0))]
    bad_idx = df.index.difference(good.index)
    for i in bad_idx:
        row = df.loc[i]
        pool = good[good.villageKey == row.villageKey]
        if pool.empty:
            pool = good[(good.district == row.district) & (good.taluka == row.taluka)]
        if pool.empty:
            pool = good[good.district == row.district]
        if pool.empty:
            pool = good
        base_lon, base_lat = pool.lon.mean(), pool.lat.mean()
        jlon = RNG.normal(0, 0.004)
        jlat = RNG.normal(0, 0.004)
        df.loc[i, "lon"] = base_lon + jlon
        df.loc[i, "lat"] = base_lat + jlat
    return df


# ----------------------------------------------------------------------------
# local equirectangular projection helpers (good enough over a few km)
# ----------------------------------------------------------------------------
def make_proj(lat0):
    m_per_deg_lon = M_PER_DEG_LAT * math.cos(math.radians(lat0))

    def to_m(lon, lat):
        return ((lon) * m_per_deg_lon, (lat) * M_PER_DEG_LAT)

    def to_deg(x, y):
        return (x / m_per_deg_lon, y / M_PER_DEG_LAT)

    return to_m, to_deg


def poly_to_m(poly, to_m):
    ext = [to_m(x, y) for x, y in poly.exterior.coords]
    return Polygon(ext)


def poly_to_deg(poly, to_deg):
    ext = [to_deg(x, y) for x, y in poly.exterior.coords]
    return Polygon(ext)


# ----------------------------------------------------------------------------
# organic blob: perturbed-radius polygon around a center, area-scaled
# ----------------------------------------------------------------------------
def blob_polygon(cx, cy, target_area_m2, n=64, seed=0):
    rng = np.random.default_rng(seed)
    base_r = math.sqrt(target_area_m2 / math.pi)
    n_terms = rng.integers(3, 6)
    freqs = rng.integers(2, 6, size=n_terms)
    amps = rng.uniform(0.10, 0.28, size=n_terms) * base_r
    phases = rng.uniform(0, 2 * math.pi, size=n_terms)
    thetas = np.linspace(0, 2 * math.pi, n, endpoint=False)
    r = np.full(n, base_r)
    for f, a, p in zip(freqs, amps, phases):
        r = r + a * np.sin(f * thetas + p)
    r = np.clip(r, base_r * 0.35, None)
    pts = [(cx + r[i] * math.cos(thetas[i]), cy + r[i] * math.sin(thetas[i])) for i in range(n)]
    poly = Polygon(pts)
    if not poly.is_valid:
        poly = poly.buffer(0)
    # rescale to hit the target area (radius perturbation drifts area a bit)
    if poly.area > 0:
        scale = math.sqrt(target_area_m2 / poly.area)
        poly = Polygon([(cx + (x - cx) * scale, cy + (y - cy) * scale) for x, y in poly.exterior.coords])
    return poly


# ----------------------------------------------------------------------------
# bounded Voronoi (scipy + ghost points, index-safe)
# ----------------------------------------------------------------------------
def bounded_voronoi_cells(seed_pts, clip_poly):
    """Return one polygon per input seed (same order), each clipped to
    clip_poly and guaranteed disjoint from every other returned cell.
    Uses distant ghost points so real cells stay finite; any cell that still
    can't be resolved falls back to a small disk around its own seed
    (never to the whole clip_poly - that would duplicate-overlap whichever
    other cell also falls back)."""
    pts = np.array(seed_pts, dtype=float)
    n = len(pts)
    if n == 1:
        return [clip_poly]
    # nudge exact duplicates/collinear points a hair so scipy doesn't choke
    pts = pts + np.random.default_rng(int(abs(pts.sum() * 1000)) & 0xFFFF).normal(0, 1e-6, pts.shape)
    cx, cy = pts[:, 0].mean(), pts[:, 1].mean()
    spread = max(pts[:, 0].ptp(), pts[:, 1].ptp(), 1.0) * 8 + 200
    ghosts = np.array([
        [cx - spread, cy - spread], [cx + spread, cy - spread],
        [cx - spread, cy + spread], [cx + spread, cy + spread],
        [cx, cy - spread * 1.6], [cx, cy + spread * 1.6],
        [cx - spread * 1.6, cy], [cx + spread * 1.6, cy],
    ])
    all_pts = np.vstack([pts, ghosts])
    vor = Voronoi(all_pts)
    fallback_r = math.sqrt(max(clip_poly.area, 1.0) / n / math.pi) * 1.15

    raw_cells = []
    for i in range(n):
        region_idx = vor.point_region[i]
        region = vor.regions[region_idx]
        cell = None
        if region and -1 not in region and len(region) >= 3:
            try:
                c = Polygon([vor.vertices[v] for v in region])
                if not c.is_valid:
                    c = c.buffer(0)
                if not c.is_empty and c.area > 0:
                    cell = c
            except Exception:
                cell = None
        if cell is None:
            cell = Point(pts[i]).buffer(fallback_r)
        raw_cells.append(cell)

    # nearest point on/in clip_poly for a seed that ended up outside it
    def nearest_in(px, py):
        p = Point(px, py)
        if clip_poly.contains(p):
            return p
        return clip_poly.exterior.interpolate(clip_poly.exterior.project(p))

    # clip to the blob, then re-subtract any earlier cell in the list so a
    # bad fallback can never duplicate territory another cell already claims
    claimed = None
    cells = []
    for i, c in enumerate(raw_cells):
        clipped = c.intersection(clip_poly)
        if claimed is not None and not claimed.is_empty:
            clipped = clipped.difference(claimed)
        if clipped.geom_type == "MultiPolygon" and clipped.geoms:
            clipped = max(clipped.geoms, key=lambda g: g.area)
        if clipped.is_empty or clipped.geom_type != "Polygon" or clipped.area < 1e-9:
            anchor = nearest_in(pts[i][0], pts[i][1])
            fb = anchor.buffer(fallback_r * 0.4).intersection(clip_poly)
            if claimed is not None and not claimed.is_empty:
                fb = fb.difference(claimed)
            if fb.geom_type == "MultiPolygon" and fb.geoms:
                fb = max(fb.geoms, key=lambda g: g.area)
            clipped = fb if (not fb.is_empty and fb.geom_type == "Polygon") else anchor.buffer(1e-7)
        cells.append(clipped)
        claimed = clipped if claimed is None else unary_union([claimed, clipped])
    return cells


def lloyd_relax(seed_pts, clip_poly, iterations=3):
    pts = list(seed_pts)
    cells = bounded_voronoi_cells(pts, clip_poly)
    for _ in range(iterations):
        new_pts = []
        for i, cell in enumerate(cells):
            c = cell.centroid if (cell is not None and not cell.is_empty) else None
            if c is None or c.is_empty or not clip_poly.buffer(1e-9).contains(c):
                new_pts.append(pts[i])  # keep previous seed rather than crash/drift outside
            else:
                new_pts.append((c.x, c.y))
        pts = new_pts
        cells = bounded_voronoi_cells(pts, clip_poly)
    return cells  # cells[i] still corresponds to original seed i


# ----------------------------------------------------------------------------
# canal / track subtraction
# ----------------------------------------------------------------------------
def carve_channels(blob, rng, width_canal=2.2, width_track=1.6):
    minx, miny, maxx, maxy = blob.bounds
    diag = math.hypot(maxx - minx, maxy - miny)
    lines = []
    for width in (width_canal, width_track):
        ang = rng.uniform(0, math.pi)
        cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
        dx, dy = math.cos(ang), math.sin(ang)
        ox = rng.uniform(-0.25, 0.25) * diag
        oy = rng.uniform(-0.25, 0.25) * diag
        p1 = (cx + ox - dx * diag, cy + oy - dy * diag)
        p2 = (cx + ox + dx * diag, cy + oy + dy * diag)
        from shapely.geometry import LineString
        lines.append(LineString([p1, p2]).buffer(width))
    return unary_union(lines)


# ----------------------------------------------------------------------------
# densify + jitter edges so boundaries look walked, not machine-drawn
# ----------------------------------------------------------------------------
def densify_jitter(poly, seed, step_m=15, jitter_m=1.2):
    rng = np.random.default_rng(seed)
    coords = list(poly.exterior.coords)
    out = []
    for i in range(len(coords) - 1):
        x0, y0 = coords[i]
        x1, y1 = coords[i + 1]
        seg_len = math.hypot(x1 - x0, y1 - y0)
        n_steps = max(1, int(seg_len // step_m))
        for s in range(n_steps):
            t = s / n_steps
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t
            x += rng.normal(0, jitter_m)
            y += rng.normal(0, jitter_m)
            out.append((x, y))
    out.append(out[0])
    p = Polygon(out)
    if not p.is_valid:
        p = p.buffer(0)
        if p.geom_type == "MultiPolygon":
            p = max(p.geoms, key=lambda g: g.area)
    return p


# ----------------------------------------------------------------------------
# main
# ----------------------------------------------------------------------------
def main():
    df = load()
    df = fix_outliers(df)

    villages = df.groupby("villageKey")
    village_meta = villages.agg(
        district=("district", "first"), taluka=("taluka", "first"),
        village=("village", "first"), lon=("lon", "mean"), lat=("lat", "mean"),
        acresExcel=("acresExcel", "sum"),
    ).reset_index()

    # --- master partition: one Voronoi over village centroids, big envelope
    all_lon, all_lat = df.lon.values, df.lat.values
    lat0 = float(np.mean(all_lat))
    to_m, to_deg = make_proj(lat0)
    centers_m = [to_m(r.lon, r.lat) for r in village_meta.itertuples()]
    minx, miny = min(x for x, y in centers_m), min(y for x, y in centers_m)
    maxx, maxy = max(x for x, y in centers_m), max(y for x, y in centers_m)
    pad = 6000
    envelope = box(minx - pad, miny - pad, maxx + pad, maxy + pad)
    village_cells_m = bounded_voronoi_cells(centers_m, envelope)

    field_features = []
    village_blob_debug = {}

    for vi, vrow in enumerate(village_meta.itertuples()):
        vkey = vrow.villageKey
        cell_m = village_cells_m[vi]
        cx, cy = centers_m[vi]

        rows = df[df.villageKey == vkey].reset_index(drop=True)
        n_fields = len(rows)
        total_acres = max(float(vrow.acresExcel), 0.5)
        target_area_m2 = total_acres * ACRE_M2 * 1.7  # headroom for gaps/canals

        blob = blob_polygon(cx, cy, target_area_m2, seed=(hash(vkey) & 0xFFFF))
        blob = blob.intersection(cell_m)
        if blob.is_empty or blob.area < 100:
            blob = cell_m.buffer(-5) if cell_m.area > 200 else cell_m
        if blob.geom_type == "MultiPolygon":
            blob = max(blob.geoms, key=lambda g: g.area)
        village_blob_debug[vkey] = blob

        # seeds: real field points, pulled inside the blob if outside it
        seeds = []
        for r in rows.itertuples():
            sx, sy = to_m(r.lon, r.lat)
            pt = Point(sx, sy)
            if not blob.contains(pt):
                near = blob.exterior.interpolate(blob.exterior.project(pt))
                bc = blob.centroid
                sx = near.x + (bc.x - near.x) * 0.15
                sy = near.y + (bc.y - near.y) * 0.15
            seeds.append((sx, sy))

        if n_fields == 1:
            cells = [blob]
        else:
            cells = lloyd_relax(seeds, blob, iterations=3)

        for r, cell in zip(rows.itertuples(), cells):
            channels = carve_channels(blob, np.random.default_rng(hash((vkey, "ch")) & 0xFFFF))
            parcel = cell.difference(channels)
            if parcel.geom_type == "MultiPolygon":
                parcel = max(parcel.geoms, key=lambda g: g.area) if len(parcel.geoms) else cell
            if parcel.is_empty:
                parcel = cell

            erode_m = RNG.uniform(1.5, 2.0)
            eroded = parcel.buffer(-erode_m)
            if eroded.is_empty or eroded.area < 30:
                eroded = parcel  # tiny parcel: skip erosion rather than vanish
            if eroded.geom_type == "MultiPolygon":
                eroded = max(eroded.geoms, key=lambda g: g.area)

            seed_j = abs(hash(r.farmerId)) & 0xFFFF
            final_m = densify_jitter(eroded, seed=seed_j)
            final_deg = poly_to_deg(final_m, to_deg)
            if not final_deg.is_valid:
                final_deg = final_deg.buffer(0)

            area_m2 = final_m.area
            acres_drawn = round(area_m2 / ACRE_M2, 2)

            field_features.append({
                "type": "Feature",
                "properties": {
                    "id": r.farmerId,
                    "farmer": r.farmerId,  # no farmer-name column in source data
                    "acres": acres_drawn,
                    "acresExcel": float(r.acresExcel),
                    "village": vkey,
                    "villageName": vrow.village,
                    "block": vrow.taluka,
                    "district": vrow.district,
                    "state": "Punjab",
                    "millerName": r.millerName,
                    "procurementMt": float(r.procurementMt),
                },
                "geometry": {"type": "Polygon", "coordinates": [list(final_deg.exterior.coords)]},
            })

    fields_fc = {
        "_comment": (
            "Generated by scripts/build_fields.py from '273 Farmer Data "
            "(Clearharvest).xlsx'. Polygons are synthetic parcels built from "
            "each farmer's point coordinate + acreage (village land-blob -> "
            "Voronoi -> erosion -> jitter) since no real field-boundary/KML "
            "export exists for this programme. `acres` is measured off the "
            "drawn polygon; `acresExcel` is the source-sheet value kept for "
            "reference only. Regenerate with: python scripts/build_fields.py"
        ),
        "type": "FeatureCollection",
        "features": field_features,
    }

    with open(OUT_FIELDS, "w", encoding="utf-8") as f:
        json.dump(fields_fc, f, ensure_ascii=False)

    # --- boundaries: this script does NOT touch Punjab/project-district
    # geometry - those are real administrative polygons fetched once by
    # scripts/fetch_boundaries.py (run that separately, or after editing the
    # Excel, if you want the district shape re-clipped). We only create a
    # rough placeholder rectangle here if wheat-boundaries.geo.json doesn't
    # exist yet at all, so the map still has *something* to render.
    if not os.path.exists(OUT_BOUNDARIES):
        lon_min, lon_max = float(df.lon.min()), float(df.lon.max())
        lat_min, lat_max = float(df.lat.min()), float(df.lat.max())
        mlon, mlat = (lon_max - lon_min) * 0.08 + 0.02, (lat_max - lat_min) * 0.08 + 0.02
        district_rect = [
            [lon_min - mlon, lat_min - mlat], [lon_max + mlon, lat_min - mlat],
            [lon_max + mlon, lat_max + mlat], [lon_min - mlon, lat_max + mlat],
            [lon_min - mlon, lat_min - mlat],
        ]
        boundaries = {
            "_comment": "Placeholder only - run scripts/fetch_boundaries.py for real Punjab/district shapes.",
            "type": "FeatureCollection",
            "features": [
                {"type": "Feature", "properties": {"id": "punjab", "name": "Punjab"},
                 "geometry": {"type": "Polygon", "coordinates": [[[73.9, 29.5], [76.9, 29.5], [76.9, 32.5], [73.9, 32.5], [73.9, 29.5]]]}},
                {"type": "Feature", "properties": {"id": "project-district", "name": "Ludhiana & Faridkot, Punjab"},
                 "geometry": {"type": "Polygon", "coordinates": [district_rect]}},
            ],
        }
        with open(OUT_BOUNDARIES, "w", encoding="utf-8") as f:
            json.dump(boundaries, f, ensure_ascii=False, indent=2)

    # --- miller manifest (drives fill-color legend in the map component) ---
    millers = sorted(df.millerName.dropna().unique().tolist())
    with open("wheat-millers.json", "w", encoding="utf-8") as f:
        json.dump(millers, f, ensure_ascii=False, indent=2)

    # --- village lookup (for VILLAGES const in the map component) ---
    village_list = []
    for vrow in village_meta.itertuples():
        village_list.append({
            "key": vrow.villageKey, "name": vrow.village,
            "lon": round(float(vrow.lon), 5), "lat": round(float(vrow.lat), 5),
            "block": vrow.taluka, "district": vrow.district,
        })
    with open("wheat-villages.json", "w", encoding="utf-8") as f:
        json.dump(village_list, f, ensure_ascii=False, indent=2)

    total_drawn = sum(ff["properties"]["acres"] for ff in field_features)
    total_excel = float(df.acresExcel.sum())
    print(f"fields: {len(field_features)}  villages: {len(village_meta)}")
    print(f"acres drawn total: {total_drawn:.1f}  excel total: {total_excel:.1f}  "
          f"(ratio {total_drawn/total_excel:.2f})")


if __name__ == "__main__":
    main()
