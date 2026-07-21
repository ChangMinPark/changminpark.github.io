#!/usr/bin/env bash
# Local preview for this Jekyll site (github-pages + Ruby 3.3 shims).
#
# Writing posts are hard-linked from $PERSONAL_WEBSITE_WRITING so
# Jekyll reads the same files as in the private repo (not a separate copy).
# Hard links are required because the github-pages gem forces safe mode and
# rejects symlinks that point outside this site.
#
# Usage:
#   ./serve-local.sh              # include draft posts (default)
#   ./serve-local.sh --drafts     # include draft posts
#   ./serve-local.sh --no-drafts  # hide posts with draft: true
#   INCLUDE_DRAFTS=0 ./serve-local.sh
#
# Env:
#   PERSONAL_WEBSITE_WRITING  Required. Absolute path to personal-website-writing.
#   INCLUDE_DRAFTS            1/true/yes = show drafts, 0/false/no = hide (overridden by flags)
set -euo pipefail
cd "$(dirname "$0")"

export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

if [[ -z "${PERSONAL_WEBSITE_WRITING:-}" ]]; then
  echo "Error: PERSONAL_WEBSITE_WRITING is not set." >&2
  echo "Add this to your ~/.zshrc (then open a new terminal or run: source ~/.zshrc):" >&2
  echo "  export PERSONAL_WEBSITE_WRITING=\"\$HOME/Personal/personal-website-writing\"" >&2
  exit 1
fi

PRIVATE_WRITING="$PERSONAL_WEBSITE_WRITING"
INCLUDE_DRAFTS="${INCLUDE_DRAFTS:-1}"

if [[ ! -d "$PRIVATE_WRITING" ]]; then
  echo "Error: PERSONAL_WEBSITE_WRITING does not exist: $PRIVATE_WRITING" >&2
  exit 1
fi

usage() {
  sed -n '1,20p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --drafts)
      INCLUDE_DRAFTS=1
      shift
      ;;
    --no-drafts)
      INCLUDE_DRAFTS=0
      shift
      ;;
    -h|--help)
      usage 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage 1
      ;;
  esac
done

case "${INCLUDE_DRAFTS}" in
  1|true|TRUE|yes|YES|on|ON) INCLUDE_DRAFTS=1 ;;
  0|false|FALSE|no|NO|off|OFF) INCLUDE_DRAFTS=0 ;;
  *)
    echo "Invalid INCLUDE_DRAFTS=${INCLUDE_DRAFTS} (use 1/0 or --drafts/--no-drafts)" >&2
    exit 1
    ;;
esac

is_draft_post() {
  # True if front matter contains draft: true
  awk '
    BEGIN { in_fm = 0; found = 0 }
    /^---[[:space:]]*$/ {
      if (in_fm == 0) { in_fm = 1; next }
      exit
    }
    in_fm && /^draft:[[:space:]]*true[[:space:]]*$/ { found = 1 }
    END { exit found ? 0 : 1 }
  ' "$1"
}

link_private_writing() {
  if [[ ! -d "$PRIVATE_WRITING/_posts" ]]; then
    echo "Warning: no _posts/ under PERSONAL_WEBSITE_WRITING: $PRIVATE_WRITING"
    return 0
  fi

  mkdir -p _posts/writing

  # Remove previous local links/copies; keep the static README.
  find _posts/writing -mindepth 1 -maxdepth 1 ! -name 'README.md' -exec rm -rf {} +

  local linked=0
  local skipped_draft=0
  local src base
  for src in "$PRIVATE_WRITING/_posts"/*; do
    [[ -f "$src" ]] || continue
    base="$(basename "$src")"
    # Skip templates / private helpers (_template.md, etc.)
    [[ "$base" == _* ]] && continue

    if is_draft_post "$src"; then
      if [[ "$INCLUDE_DRAFTS" -eq 0 ]]; then
        skipped_draft=$((skipped_draft + 1))
        echo "skip draft: $base"
        continue
      fi
    fi

    # Hard link = same file inode as the private repo (direct read/write).
    ln "$src" "_posts/writing/$base"
    linked=$((linked + 1))
  done

  # Mirror post images (hard-link files; copy directory tree structure).
  if [[ -d "$PRIVATE_WRITING/images/posts" ]]; then
    mkdir -p images/posts
    local img
    for img in "$PRIVATE_WRITING/images/posts"/*; do
      [[ -e "$img" ]] || continue
      base="$(basename "$img")"
      [[ "$base" == README.md ]] && continue
      rm -rf "images/posts/$base"
      if [[ -d "$img" ]]; then
        mkdir -p "images/posts/$base"
        local f rel
        while IFS= read -r -d '' f; do
          rel="${f#$img/}"
          mkdir -p "images/posts/$base/$(dirname "$rel")"
          ln "$f" "images/posts/$base/$rel"
        done < <(find "$img" -type f -print0)
      else
        ln "$img" "images/posts/$base"
      fi
    done
  fi

  if [[ "$INCLUDE_DRAFTS" -eq 1 ]]; then
    echo "Drafts: ON (posts with draft: true are included)"
  else
    echo "Drafts: OFF (skipped $skipped_draft draft post(s))"
  fi
  echo "Hard-linked $linked Writing post(s) from $PRIVATE_WRITING (same files as the private repo)."
  echo "Edits in the private repo are picked up on regenerate; re-run this script after adding/removing posts."
}

if ! bundle check >/dev/null 2>&1; then
  echo "Installing gems..."
  bundle install
fi

link_private_writing

echo "Serving at http://127.0.0.1:4000/ (Ctrl+C to stop)"
exec ruby -r./.ruby3_logger_patch.rb -S bundle exec jekyll serve \
  --watch --livereload --host 127.0.0.1 --port 4000
