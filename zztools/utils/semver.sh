#!/bin/bash
set -euo pipefail

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "This script is intended to be sourced, not executed directly.";
  exit 1;
fi

__INTERNAL__semver_parse_prerelease_to_key() {
    case "$1" in
        alpha) echo "000" ;;
        beta) echo "100" ;;
        rc) echo "200" ;;
        "") echo "300" ;;
        *) exit 1 ;;
    esac
}

__INTERNAL__semver_parse_version_to_key() {
    local version="$1";
    if [[ "$version" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-([A-Za-z]+)(\.([0-9]+))?)?(\+.*)?$ ]]; then
        local maj="${BASH_REMATCH[1]}"
        local min="${BASH_REMATCH[2]}"
        local pat="${BASH_REMATCH[3]}"
        local pr="${BASH_REMATCH[5]:-}"
        local prnum="${BASH_REMATCH[7]:-}"
    else
        logger_error "Invalid semantic version format: '$version'.";
        return 2;
    fi

    pr="${pr,,}";

    local prcode;
    prcode="$(__INTERNAL__semver_parse_prerelease_to_key "$pr")" || {
        logger_error "Invalid prerelease identifier '$pr'. Only 'alpha', 'beta', or 'rc' are allowed.";
        return 3;
    }

    prnum="${prnum:-0}";
    if ! [[ "$prnum" =~ ^[0-9]+$ ]]; then
        logger_error "Invalid prerelease number '$prnum'. It should be a number.";
        return 4;
    fi

    printf -v maj_p "%03d" "$maj";
    printf -v min_p "%03d" "$min";
    printf -v pat_p "%03d" "$pat";
    printf -v prnum_p "%03d" "$prnum";

    echo "${maj_p}${min_p}${pat_p}${prcode}${prnum_p}";
}

semver_verify() {
    local v1="$1";
    local k1;
    k1="$(__INTERNAL__semver_parse_version_to_key "$v1")" || return $?;
    return 0;
}

semver_compare() {
    local v1="$1";
    local v2="$2";

    local k1 k2;
    k1="$(__INTERNAL__semver_parse_version_to_key "$v1")" || return $?;
    k2="$(__INTERNAL__semver_parse_version_to_key "$v2")" || return $?;

    if [[ "$k1" == "$k2" ]]; then
        echo "0";
        return 0;
    elif [[ "$k1" > "$k2" ]]; then
        echo "1";
        return 0;
    else
        echo "-1";
        return 0;
    fi
}
