#!/bin/sh
set -e

# map unprefixed environment variables to NUXT_-prefixed ones for Nuxt 3 runtimeConfig
map_env() {
  eval "_target=\${$1:-}"
  eval "_source=\${$2:-}"
  if [ -z "$_target" ] && [ -n "$_source" ]; then
    export "$1=$_source"
  fi
}

map_env NUXT_GITHUB_CLIENT_SECRET GITHUB_CLIENT_SECRET
map_env NUXT_SIGNING_KEY SIGNING_KEY
map_env NUXT_SPACES_KEY SPACES_KEY
map_env NUXT_SPACES_SECRET SPACES_SECRET
map_env NUXT_PUBLIC_GITHUB_CLIENT_ID GITHUB_CLIENT_ID

exec node /app/.output/server/index.mjs "$@"
