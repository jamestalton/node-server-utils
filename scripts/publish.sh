#!/bin/bash
set -x
set -e

PUBLISHED_VERSION=`npm view node-server-utils version`
npm version --no-git-tag-version $PUBLISHED_VERSION
PUBLISHED_SHA=`npm view node-server-utils --json | jq .dist.shasum`
NEW_SHA=`npm publish --dry-run --json | jq .shasum`
if [ "$PUBLISHED_SHA" != "$NEW_SHA" ]; then 
    npm version patch --no-git-tag-version
    npm login
    npm publish
fi
