---
title: "Levenshtein Distance: Edit Cost for Typos and Fuzzy Match"
date: 2019-08-21 09:45:00
tags: [Writing, Systems]
draft: false
---

## When exact match is too strict

Search fields, contact pickers, and command palettes break on one typo: `"Gamboll"` does not match `"Gambol"`, even though a human sees the intent. **Levenshtein distance (LD)** scores that gap: the minimum number of single-character **insertions, deletions, and substitutions** needed to turn string A into string B. Lower distance means more similar strings.

That metric powers fuzzy contact lookup, spell-check suggestions, diff-ish UX copy ("Did you mean…?"), and lightweight dedup before hitting a server index. The naive table fill is **O(m × n)** time and space — fine for short UI strings, not for megabyte logs without trimming.

## The dynamic-programming table

Build a matrix with `(m+1) × (n+1)` cells for strings of length `m` and `n`. Row 0 and column 0 hold the base cost of inserting every prefix character from empty:

```text
        ""  G  A  M  B  O
    ""   0  1  2  3  4  5
    G    1
    A    2
    M    3
    B    4
    O    5
    L    6
```

<img src="{{ site.baseurl }}/images/posts/levenshtein-distance/algorithm-steps.png" alt="Levenshtein distance matrix showing initialization and fill rules for edit cost" width="560px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Initialize first row/column with 0…n and 0…m; fill each cell from neighbors.*

For cell `(i, j)` comparing `s[i-1]` to `t[j-1]`:

- If characters **match**, take the diagonal: `cost[i-1][j-1]`.
- Else take **1 + minimum** of:
  - **Left** — insertion into `s`
  - **Above** — deletion from `s`
  - **Diagonal** — substitution

The answer is **`cost[m][n]`** — bottom-right corner.

## Worked example: GUMBO → GAMBOL

Compare `"GUMBO"` and `"GAMBOL"`:

<img src="{{ site.baseurl }}/images/posts/levenshtein-distance/gumbo-gambol-example.png" alt="Completed Levenshtein matrix for GUMBO and GAMBOL with final distance 2" width="420px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. Final distance is 2 (lower-right cell): substitute U→A, insert L.*

Tracing one path: align `G`, `A`, `M`, `B`, `O`, then pay for changing `U` to `A` and inserting `L`. Different optimal edit scripts can yield the same distance; the corner cell is what ranking uses.

## Kotlin sketch (UI-scale strings)

```kotlin
fun levenshtein(a: String, b: String): Int {
    if (a == b) return 0
    if (a.isEmpty()) return b.length
    if (b.isEmpty()) return a.length

    val prev = IntArray(b.length + 1) { it }
    val curr = IntArray(b.length + 1)

    for (i in 1..a.length) {
        curr[0] = i
        for (j in 1..b.length) {
            val cost = if (a[i - 1] == b[j - 1]) 0 else 1
            curr[j] = minOf(
                curr[j - 1] + 1,      // insert
                prev[j] + 1,          // delete
                prev[j - 1] + cost    // substitute or match
            )
        }
        prev.indices.forEach { prev[it] = curr[it] }
    }
    return prev[b.length]
}
```

Two rolling rows keep memory **O(n)** instead of materializing the full table — enough for typeahead on a few hundred contacts.

Rank a local list by distance on each keystroke (debounced):

```kotlin
fun fuzzyFilter(items: List<String>, query: String, maxEdits: Int = 2): List<String> {
    if (query.isBlank()) return items
    val q = query.lowercase()
    return items
        .map { it to levenshtein(it.lowercase(), q) }
        .filter { (_, d) -> d <= maxEdits }
        .sortedBy { (_, d) -> d }
        .map { (label, _) -> label }
}
```

For a Mail-style contact row or settings search, cap `maxEdits` at 2 for queries under six characters and widen slowly for longer input so `"john"` still matches `"jon"` without flooding results.

## Real uses on mobile and tooling

| Use | How LD helps |
|-----|----------------|
| **Typo-tolerant search** | Rank local results by distance to query; show matches under threshold 2–3 |
| **"Did you mean"** | If top hit distance is small but non-zero, suggest correction before empty state |
| **Fuzzy command match** | Map `"archve"` → `"archive"` in debug menus or internal CLI wrappers |
| **UI / snapshot tests** | Compare rendered label text with expected copy allowing minor OCR or font diffs (use sparingly — prefer stable IDs) |
| **Dedup / merge** | Cluster near-duplicate folder or tag names before sync |

Practical guardrails:

- **Normalize first** — lowercase, trim, fold accents (`Normalizer`) so distance reflects intent not locale quirks.
- **Set a max threshold** — distance 1–2 for short tokens; scale with length (`distance <= max(1, len/4)`).
- **Pre-filter** — prefix index or length window so you do not LD every row in a 10k database on each keystroke. Even a cheap length check (`abs(a.length - b.length) <= maxEdits`) skips impossible pairs before touching the DP loop.

For longer text, consider **Jaro-Winkler** (better on names) or a server-side index (Levenshtein automata, BK-trees). LD remains the right default when you need an explainable edit count in a few lines of code.

## References

- Levenshtein, *Binary codes capable of correcting deletions, insertions, and reversals* (1966) — original edit-distance formulation
- [Wagner–Fischer algorithm — Wikipedia](https://en.wikipedia.org/wiki/Wagner%E2%80%93Fischer_algorithm)
- [Unicode normalization — Java `Normalizer`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/Normalizer.html)
