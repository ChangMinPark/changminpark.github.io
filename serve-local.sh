#!/usr/bin/env bash
# Local preview for this Jekyll site (github-pages + Ruby 3.3 shims).
set -euo pipefail
cd "$(dirname "$0")"

export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

if ! bundle check >/dev/null 2>&1; then
  echo "Installing gems..."
  bundle install
fi

echo "Serving at http://127.0.0.1:4000/ (Ctrl+C to stop)"
exec ruby -r./.ruby3_logger_patch.rb -S bundle exec jekyll serve \
  --watch --livereload --host 127.0.0.1 --port 4000
