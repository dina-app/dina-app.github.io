#!/usr/bin/env sh
set -eu

message="${*:-Deploy site updates}"

branch="$(git branch --show-current)"

if [ -z "$branch" ]; then
  echo "Error: not on a named git branch." >&2
  exit 1
fi

git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$message"

if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
  git push
else
  git push -u origin "$branch"
fi
