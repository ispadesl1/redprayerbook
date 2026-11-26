#!/usr/bin/env bash
# Push current HEAD to the GitHub remote (boilerplate/expo-app branch).
# Requires GITHUB_PERSONAL_ACCESS_TOKEN to be set in the environment.
set -euo pipefail

REPO="https://github.com/ispadesl1/redprayerbook.git"
BRANCH="boilerplate/expo-app"

if [[ -z "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set." >&2
  exit 1
fi

AUTH_REPO="https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/ispadesl1/redprayerbook.git"

echo "Pushing HEAD → ${BRANCH} ..."
git --no-optional-locks push --force "${AUTH_REPO}" HEAD:refs/heads/${BRANCH} 2>&1 \
  | sed "s/${GITHUB_PERSONAL_ACCESS_TOKEN}/[TOKEN]/g"

echo "Done. Pushed to ${REPO} on branch ${BRANCH}."
