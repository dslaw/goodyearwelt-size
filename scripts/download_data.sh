#!/usr/bin/env bash

set -e
set -u


urls=(
    "https://www.reddit.com/r/goodyearwelt/comments/5ibtzh/manufacturer_last_sizing_thread/.json"
    "https://www.reddit.com/r/goodyearwelt/comments/7t1whc/manufacturer_last_sizing_thread_2018/.json"
)
years=(2017 2018)
output_subdir="src/data"

# Set User-Agent string as specified by https://github.com/reddit/reddit/wiki/API
# (more or less).
platform="n/a"
user_agent="${platform}:${npm_package_name}:v${npm_package_version} (by ${npm_package_homepage})"

mkdir -p ${output_subdir}

for i in ${!urls[@]}; do
    url=${urls[$i]}
    year=${years[$i]}
    output_filename=${output_subdir}/last_sizing_thread_${year}.json

    if [[ ! -f ${output_filename} ]]; then
        curl --silent \
            -X GET \
            --header "User-Agent: ${user_agent}" \
            ${url} \
            | python -m json.tool > ${output_filename}
    fi
done
