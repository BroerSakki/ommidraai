#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <openstreetmap-extract-url>" >&2
  echo "Example: $0 https://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf" >&2
  exit 1
fi

URL="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="$PROJECT_ROOT/osrm/data"
PROCESSED_DIR="$PROJECT_ROOT/osrm/processed"

command -v docker >/dev/null 2>&1 || {
  echo "Docker is required but was not found in PATH." >&2
  exit 1
}

mkdir -p "$DATA_DIR" "$PROCESSED_DIR"

FILE_NAME="$(basename "${URL%%\?*}")"
TARGET_FILE="$DATA_DIR/$FILE_NAME"

if [[ ! "$FILE_NAME" =~ \.osm\.pbf$ ]]; then
  echo "The input URL must point to an .osm.pbf extract." >&2
  exit 1
fi

if [[ -f "$TARGET_FILE" ]]; then
  echo "Removing existing download: $TARGET_FILE"
  rm -f "$TARGET_FILE"
fi

echo "Downloading extract into $DATA_DIR"
curl -fsSL "$URL" -o "$TARGET_FILE"

MAP_STEM="${FILE_NAME%.osm.pbf}"
EXTRACTED_OSRM="$PROCESSED_DIR/$MAP_STEM.osrm"

if [[ -f "$EXTRACTED_OSRM" ]]; then
  echo "Removing existing processed files for $MAP_STEM"
  rm -f "$PROCESSED_DIR/$MAP_STEM".*
fi

echo "Step A: download complete"
echo "Step B: extracting routing graph with osrm-extract"
docker run --rm \
  -v "$DATA_DIR:/data" \
  -v "$PROCESSED_DIR:/processed" \
  osrm/osrm-backend:latest \
  sh -lc "cd /processed && osrm-extract -p /opt/car.lua /data/$FILE_NAME"

echo "Step C: partitioning graph with osrm-partition"
docker run --rm \
  -v "$PROCESSED_DIR:/processed" \
  osrm/osrm-backend:latest \
  osrm-partition "/processed/$MAP_STEM.osrm"

echo "Step D: customizing graph for MLD with osrm-customize"
docker run --rm \
  -v "$PROCESSED_DIR:/processed" \
  osrm/osrm-backend:latest \
  osrm-customize "/processed/$MAP_STEM.osrm"

echo "OSRM processing completed successfully."
echo "Processed files are available in $PROCESSED_DIR"
