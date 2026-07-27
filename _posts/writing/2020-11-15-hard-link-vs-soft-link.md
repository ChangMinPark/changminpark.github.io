---
title: "Hard Links vs Symbolic Links: Same Inode, Different Contract"
date: 2020-11-15 18:00:00
tags: [Writing, Linux]
---

## When two paths are not two files

`ls` shows two filenames; `stat` tells you whether you are looking at one file or a pointer. Mix them up and you get silent data loss (delete the “original” but the hard link still works), broken deploy scripts (symlink target moved), or inode exhaustion (hard links to a directory — not allowed).

The distinction matters outside textbook examples. This repo’s local Writing preview **hard-links** markdown and images into the public Jekyll checkout so localhost reads the same bytes without copying. That only works because hard links share an inode — the same mechanism as `ln` on a post file.

## Hard links — alternate names, one inode

A hard link is another directory entry for the **same inode**. Same metadata, same data blocks, same link count.

```bash
ln original.txt link.txt
ls -li original.txt link.txt   # identical inode column
```

| Property | Behavior |
|----------|----------|
| Inode | **Same** for every hard link |
| Link count | Increments with each `ln` |
| Edit one name | All names see the change |
| Delete one name | Others remain until link count hits zero |
| Cross filesystem | **No** — inode numbers are per filesystem |
| Directories | **No** (cycles would break traversal) |

<img src="{{ site.baseurl }}/images/posts/hard-link-vs-soft-link/hard-link-diagram.png" alt="Diagram showing one inode referenced by two directory entries for hard links" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Hard links — two names, one inode, one file object.*

Hard links are how Unix keeps a file alive under multiple paths. There is no “master” name — deleting `original.txt` leaves `link.txt` fully usable.

Concrete check:

```bash
echo hello > original.txt
ln original.txt link.txt
stat -c '%i %h %n' original.txt link.txt
# same inode (first column), link count 2, two paths
rm original.txt
cat link.txt    # still prints hello
```

## Symbolic links — path indirection

A symlink (soft link) is a **small file whose contents are a path string**. It has its **own inode**; it points at another path, not another inode directly.

```bash
ln -s original.txt link.txt
ls -li original.txt link.txt   # different inodes
readlink link.txt              # original.txt
```

| Property | Behavior |
|----------|----------|
| Inode | **Different** from the target |
| Link count of target | Unchanged |
| Edit through symlink | Writes go to the resolved target |
| Delete target | Symlink **dangles** (`ELOOP` / “No such file”) |
| Cross filesystem | **Yes** |
| Directories | Allowed (with care — relative vs absolute targets) |

<img src="{{ site.baseurl }}/images/posts/hard-link-vs-soft-link/hard-vs-soft-link.png" alt="Side-by-side comparison of hard link and symbolic link directory structures" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. Hard link vs symlink — inode sharing vs path pointer.*

Symlinks behave like Windows shortcuts: convenient, but fragile when the target moves.

## Choosing in practice

| Need | Prefer |
|------|--------|
| Two names, same file, no extra indirection | Hard link |
| Alias across filesystems or to a directory | Symlink |
| Backup / mirror that survives deleting one path name | Hard link (same fs) |
| Versioned release path (`current → v2.3`) | Symlink |

> **Rule of thumb** - if both paths must always refer to the **same bytes on disk**, hard link. If you need a **redirect** that can be repointed, symlink.

## Hard links in this Writing workflow

The public site repo (`changminpark.github.io`) previews drafts by hard-linking from this private repo:

```bash
# from changminpark.github.io — see serve-local.sh
export PERSONAL_WEBSITE_WRITING="$HOME/Personal/personal-website-writing"
./serve-local.sh    # hard-links _posts/ and images/posts/ into the site tree
```

Edits here appear instantly in the local Jekyll tree because `_posts/2022-09-30-hard-link-vs-soft-link.md` and the linked copy are the **same inode** — not a rsync copy, not a symlink to a folder. Re-run `serve-local.sh` after adding or removing posts so new files get linked; removed posts need their links cleaned up the same way.

Symlinks would also “work” for preview, but hard links avoid an extra indirection layer and keep permissions and tooling behavior closer to a normal file. When something looks stale in localhost, check whether the hard link exists (`ls -li` in both trees) before blaming Jekyll caching.

Hard links also explain why **`images/posts/<permalink>/thumbnail.png` in this repo and the linked copy under the public site share one file** — edit the PNG here and the Writing list thumbnail updates on the next refresh without a separate sync step for drafts.

## References

- `man 1 ln`, `man 2 link`, `man 7 symlink` — Linux programmer’s manual
- [Filesystem Hierarchy Standard (FHS)](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) — where link semantics show up in package layouts
