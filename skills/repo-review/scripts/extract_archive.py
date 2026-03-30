#!/usr/bin/env python3
"""
extract_archive.py — Extract archives before review.
Usage: python3 extract_archive.py <ARCHIVE_PATH> <DEST_DIR>
Supports: .zip, .tar.gz, .tgz, .tar.bz2, .tar.xz, .tar
"""
import os, sys, zipfile, tarfile, shutil

def main():
    if len(sys.argv) < 3:
        print("Usage: extract_archive.py <archive> <dest_dir>", file=sys.stderr)
        sys.exit(1)
    src, dest = sys.argv[1], sys.argv[2]
    if not os.path.exists(src):
        print(f"Error: {src} not found", file=sys.stderr)
        sys.exit(1)
    os.makedirs(dest, exist_ok=True)
    if src.endswith(".zip"):
        with zipfile.ZipFile(src, 'r') as z:
            z.extractall(dest)
    elif any(src.endswith(ext) for ext in [".tar.gz", ".tgz", ".tar.bz2", ".tar.xz", ".tar"]):
        with tarfile.open(src) as t:
            t.extractall(dest)
    else:
        print(f"Unsupported archive format: {src}", file=sys.stderr)
        sys.exit(1)
    # If single top-level dir, use it as the project root
    entries = os.listdir(dest)
    if len(entries) == 1 and os.path.isdir(os.path.join(dest, entries[0])):
        actual_root = os.path.join(dest, entries[0])
        print(actual_root)
    else:
        print(dest)

if __name__ == "__main__":
    main()
