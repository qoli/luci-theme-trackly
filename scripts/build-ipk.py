#!/usr/bin/env python3
"""Build a reproducible, architecture-independent OpenWrt IPK without an SDK."""
import gzip
import io
import os
from pathlib import Path
import re
import tarfile

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'openwrt/luci-theme-trackly'
MAKEFILE = (SOURCE / 'Makefile').read_text()
META = dict(re.findall(r'^(PKG_\w+):=(.*)$', MAKEFILE, re.MULTILINE))
EPOCH = int(os.environ.get('SOURCE_DATE_EPOCH', '0'))


def archive(files):
    output = io.BytesIO()
    directories = {parent.as_posix() for name, _, _ in files
                   for parent in Path(name).parents if parent.as_posix() != '.'}
    with gzip.GzipFile(fileobj=output, mode='wb', filename='', mtime=EPOCH) as zipped:
        with tarfile.open(fileobj=zipped, mode='w', format=tarfile.GNU_FORMAT) as tar:
            for name in sorted(directories):
                info = tarfile.TarInfo('./' + name + '/')
                info.type = tarfile.DIRTYPE
                info.mode = 0o755
                info.mtime = EPOCH
                tar.addfile(info)
            for name, data, mode in sorted(files):
                info = tarfile.TarInfo('./' + name)
                info.size = len(data)
                info.mode = mode
                info.mtime = EPOCH
                info.uid = info.gid = 0
                tar.addfile(info, io.BytesIO(data))
    return output.getvalue()


def main():
    payload = []
    for directory, prefix in [('root', ''), ('htdocs', 'www/'), ('ucode', 'usr/share/ucode/luci/')]:
        for path in sorted((SOURCE / directory).rglob('*')):
            if path.is_file():
                name = prefix + path.relative_to(SOURCE / directory).as_posix()
                mode = 0o755 if name.startswith('etc/uci-defaults/') else 0o644
                data = path.read_bytes()
                if path.suffix == '.ut':
                    # Match luci.mk SubstituteVersion, so SDK and standalone
                    # packages invalidate browser assets on version upgrades.
                    data = re.sub(rb'"({{\s*(?:media|resource)\s*}}[^"]*\.(?:js|css))"',
                                  lambda match: b'"' + match[1] + b'?v=' + META['PKG_VERSION'].encode() + b'"', data)
                payload.append((name, data, mode))

    version = META['PKG_VERSION'] + '-' + META['PKG_RELEASE']
    control = '\n'.join([
        'Package: ' + META['PKG_NAME'], 'Version: ' + version,
        'Architecture: all', 'Depends: luci-base', 'Section: luci',
        'Priority: optional', 'Maintainer: Trackly theme contributors',
        'License: ' + META['PKG_LICENSE'],
        'Installed-Size: ' + str(sum(len(data) for _, data, _ in payload)),
        'Description: A neutral light and dark LuCI theme inspired by Trackly.', ''
    ])
    postinst = '''#!/bin/sh
[ -z "${IPKG_INSTROOT:-}" ] || exit 0
rm -f /tmp/luci-indexcache.*
rm -rf /tmp/luci-modulecache /tmp/luci-templatecache
/etc/uci-defaults/30_luci-theme-trackly || exit $?
rm -f /etc/uci-defaults/30_luci-theme-trackly
exit 0
'''
    controls = [('control', control.encode(), 0o644), ('postinst', postinst.encode(), 0o755)]
    for hook in ['prerm', 'postrm']:
        body = re.search(r'define Package/luci-theme-trackly/' + hook + r'\n(.*?)\nendef', MAKEFILE, re.S).group(1)
        controls.append((hook, (body.replace('$$', '$') + '\n').encode(), 0o755))

    output = ROOT / 'dist' / (META['PKG_NAME'] + '_' + version + '_all.ipk')
    output.parent.mkdir(exist_ok=True)
    output.write_bytes(archive([
        ('debian-binary', b'2.0\n', 0o644),
        ('control.tar.gz', archive(controls), 0o644),
        ('data.tar.gz', archive(payload), 0o644)
    ]))
    print(output)


if __name__ == '__main__':
    main()
