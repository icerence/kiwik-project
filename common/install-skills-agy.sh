#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_SKILLS_DIR="$PROJECT_ROOT/.agents/skills"

GLOBAL=1
DESTINATION=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    -l|--local) GLOBAL=0; shift ;;
    -g|--global) GLOBAL=1; shift ;;
    -d|--dest) DESTINATION="$2"; shift 2 ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
done

if [ ! -d "$SOURCE_SKILLS_DIR" ]; then
  echo "Error: Source skills directory not found: $SOURCE_SKILLS_DIR"
  exit 1
fi

if [ -n "$DESTINATION" ]; then
  TARGET_DIR="$DESTINATION"
elif [ "$GLOBAL" -eq 1 ]; then
  TARGET_DIR="$HOME/.gemini/config/skills"
else
  TARGET_DIR="$PROJECT_ROOT/.agents/skills"
fi

echo "========================================"
echo " Antigravity (agy) Skills Installer"
echo "========================================"
echo "Source: $SOURCE_SKILLS_DIR"
echo "Target: $TARGET_DIR"
echo ""

mkdir -p "$TARGET_DIR"

if [ "$TARGET_DIR" = "$SOURCE_SKILLS_DIR" ]; then
  echo "[Info] Source and Target are the same (.agents/skills is already prepared)."
else
  for skill_dir in "$SOURCE_SKILLS_DIR"/*; do
    if [ -d "$skill_dir" ]; then
      skill_name=$(basename "$skill_dir")
      cp -r "$skill_dir" "$TARGET_DIR/"
      echo "[Success] Installed skill: $skill_name -> $TARGET_DIR/$skill_name"
    fi
  done
fi

echo ""
echo "All agy skills successfully installed!"
