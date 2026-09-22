#!/usr/bin/env python
"""
fetch_boundaries.py — pull real Punjab state + Ludhiana/Faridkot district
polygons and drop them into wheat-boundaries.geo.json, replacing the old
placeholder rectangles.

Source: geohacker/india (GADM-derived state/district polygons, CC-licensed,
mirrored on GitHub) - simplified for web use. This dataset predates the 2019
J&K reorganisation and, on inspection, still follows a Line-of-Control-style
cut for Jammu & Kashmir (max latitude ~35.5°N vs ~37.1°N for the real full
claim) - it is NOT a Survey-of-India-aligned full-claim source. Punjab and
Ludhiana/Faridkot sit nowhere near J&K, so this is fine for those two
shapes; the India-wide outline itself is intentionally left untouched here
(still the basemap's own outline) - swapping that for a true full-claim
polygon is a separate, still-open TODO already flagged in WheatHarvestMap.jsx.

One-off / re-run manually if the upstream files change - large (~55MB
combined) so results are cached in scripts/_cache/ and not re-downloaded
if already present.

Usage: python scripts/fetch_boundaries.py
"""
import json
import os
import subprocess
import sys

from shapely.geometry import shape, mapping
from shapely.ops import unary_union

CACHE = os.path.join(os.path.dirname(__file__), "_cache")
STATE_URL = "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson"
DISTRICT_URL = "https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson"
OUT_BOUNDARIES = os.path.join(os.path.dirname(__file__), "..", "wheat-boundaries.geo.json")


def ensure_cached(url, filename):
    path = os.path.join(CACHE, filename)
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        print(f"downloading {filename} ...")
        subprocess.run(["curl", "-s", "-m", "180", "-o", path, url], check=True)
    return path


def simplify_for_web(geom, tolerance=0.003):
    """Douglas-Peucker simplify (~300m at this latitude) - real admin
    boundaries have far more vertices than a web map needs."""
    g = geom.simplify(tolerance, preserve_topology=True)
    if not g.is_valid:
        g = g.buffer(0)
    return g


def main():
    state_path = ensure_cached(STATE_URL, "india_state.geojson")
    district_path = ensure_cached(DISTRICT_URL, "india_district.geojson")

    states = json.load(open(state_path, encoding="utf-8"))
    districts = json.load(open(district_path, encoding="utf-8"))

    punjab_geoms = [
        shape(f["geometry"]) for f in states["features"]
        if f["properties"].get("NAME_1") == "Punjab"
    ]
    punjab = simplify_for_web(unary_union(punjab_geoms))

    # Ludhiana and Faridkot are NOT adjacent (Moga district sits between
    # them) - keep them as two separate named features (not dissolved into
    # one shape) so the map can tell which one was clicked and zoom into
    # just that district.
    district_by_name = {}
    for f in districts["features"]:
        name = f["properties"].get("NAME_2")
        if f["properties"].get("NAME_1") == "Punjab" and name in ("Ludhiana", "Faridkot"):
            district_by_name.setdefault(name, []).append(shape(f["geometry"]))
    if len(district_by_name) < 2:
        print("WARNING: expected Ludhiana + Faridkot, found", list(district_by_name), file=sys.stderr)

    with open(OUT_BOUNDARIES, "r", encoding="utf-8") as f:
        boundaries = json.load(f)

    by_id = {f["properties"]["id"]: f for f in boundaries["features"]}
    by_id["punjab"]["geometry"] = mapping(punjab)
    by_id["punjab"]["properties"]["name"] = "Punjab"
    by_id["punjab"]["properties"]["source"] = "geohacker/india (GADM-derived), simplified"

    # replace the single dissolved "project-district" placeholder with one
    # feature per real district
    boundaries["features"] = [f for f in boundaries["features"] if f["properties"]["id"] != "project-district"]
    for name, geoms in district_by_name.items():
        geom = simplify_for_web(unary_union(geoms))
        boundaries["features"].append({
            "type": "Feature",
            "properties": {
                "id": f"district-{name.lower()}",
                "name": name,
                "districtName": name,
                "source": "geohacker/india (GADM-derived), simplified",
            },
            "geometry": mapping(geom),
        })

    boundaries["_comment"] = (
        "Punjab and the two project districts (Ludhiana, Faridkot - kept as "
        "separate features since they aren't adjacent) are real "
        "administrative polygons from geohacker/india (GADM-derived), "
        "simplified for web use - see scripts/fetch_boundaries.py. India's "
        "own outline is still the basemap's default (not this file) - "
        "swapping in a Survey-of-India-aligned full-claim J&K outline remains "
        "an open TODO, see WheatHarvestMap.jsx."
    )

    with open(OUT_BOUNDARIES, "w", encoding="utf-8") as f:
        json.dump(boundaries, f, ensure_ascii=False, indent=2)

    print("punjab area (deg^2, unprojected):", punjab.area)
    print("districts:", list(district_by_name))
    print("wrote", OUT_BOUNDARIES)


if __name__ == "__main__":
    main()
