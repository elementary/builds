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
map_env NUXT_R2_ACCOUNT_ID R2_ACCOUNT_ID
map_env NUXT_R2_ENDPOINT R2_ENDPOINT
map_env NUXT_R2_REGION R2_REGION
map_env NUXT_R2_ACCESS_KEY_ID R2_ACCESS_KEY_ID
map_env NUXT_R2_SECRET_ACCESS_KEY R2_SECRET_ACCESS_KEY
map_env NUXT_R2_DAILY_BUCKET R2_DAILY_BUCKET
map_env NUXT_R2_STABLE_BUCKET R2_STABLE_BUCKET
map_env NUXT_PUBLIC_GITHUB_CLIENT_ID GITHUB_CLIENT_ID

exec node /app/.output/server/index.mjs "$@"
