#!/usr/bin/env bash

set -e
set -u


url="https://www.reddit.com/r/goodyearwelt/comments/5ibtzh/manufacturer_last_sizing_thread/.json"
output_subdir="src/data"
output_filename="${output_subdir}/last_sizing_thread.json"

# Set User-Agent string as specified by https://github.com/reddit/reddit/wiki/API
# (more or less).
platform="n/a"
user_agent="${platform}:${npm_package_name}:v${npm_package_version} (by ${npm_package_homepage})"


mkdir -p ${output_subdir}

curl --silent \
    -X GET \
    --header "User-Agent: ${user_agent}" \
    ${url} \
    | python -m json.tool > ${output_filename}
