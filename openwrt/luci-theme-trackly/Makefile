include $(TOPDIR)/rules.mk

PKG_NAME:=luci-theme-trackly
PKG_VERSION:=0.1.1
PKG_RELEASE:=3
PKGARCH:=all
PKG_LICENSE:=Apache-2.0

LUCI_TITLE:=Trackly neutral LuCI theme
LUCI_DEPENDS:=+luci-base

define Package/luci-theme-trackly/prerm
#!/bin/sh
[ -z "$${IPKG_INSTROOT:-}" ] || exit 0
if [ "$$1" = remove ] && [ "$$(uci -q get luci.main.mediaurlbase)" = /luci-static/trackly ]; then
	printf '%s\n' 'Select another LuCI theme before removing Trackly.' >&2
	exit 1
fi
exit 0
endef

define Package/luci-theme-trackly/postrm
#!/bin/sh
[ -z "$${IPKG_INSTROOT:-}" ] || exit 0
if [ "$$1" = remove ]; then
	uci -q delete luci.themes.Trackly
	uci commit luci
fi
exit 0
endef

include $(TOPDIR)/feeds/luci/luci.mk
