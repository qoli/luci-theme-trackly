#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
node --check openwrt/luci-theme-trackly/htdocs/luci-static/resources/menu-trackly.js
sh -n openwrt/luci-theme-trackly/root/etc/uci-defaults/30_luci-theme-trackly
python3 -m py_compile scripts/build-ipk.py
python3 scripts/build-ipk.py
