---
title: "Android Support Library → AndroidX: What the Old Stack Maps To Today"
excerpt: "appcompat-v7 still appears in old modules. How Support Library maps to AndroidX without a cargo-cult migration."
date: 2022-11-12 11:15:00
tags: [Writing, Android]
draft: false
---

## Why this post still exists

If you open a five-year-old Android module, you will still see `com.android.support:appcompat-v7` in Gradle files and `android.support.v4` in imports. That stack — the **Android Support Library** — was the standard way to ship backward-compatible UI and utilities before **AndroidX** replaced it under Jetpack.

Greenfield projects should start on AndroidX. Maintainers of large codebases need a mental map: what the old libraries did, why Google froze them, and where each concept lives now. Confusing Support Library artifacts with AndroidX coordinates is a common source of duplicate-class build failures and “cannot resolve symbol” churn during upgrades.

## What the Support Library was

The Support Library shipped features **not present** (or not consistent) on older Android releases. Instead of sprinkling `if (Build.VERSION.SDK_INT >= …)` through app code, you called Support Library APIs and let them delegate to the framework when possible or polyfill when not.

<img src="{{ site.baseurl }}/images/posts/android-support-library/support-library-overview.png" alt="Diagram of Android Support Library layering over the platform" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Support Library sat beside the platform and back-ported APIs and UI widgets.*

Broad categories from the original model still matter — only the package names changed:

### Backward-compatible framework pieces

Fragments, loaders, and permission helpers could target older devices with one code path. **Today:** `androidx.fragment`, `androidx.loader`, and core permission APIs in `androidx.core`.

### UI layout patterns

`RecyclerView`, `DrawerLayout`, `CoordinatorLayout`, and Material-ish widgets became the default way to match platform UX without rewriting for every API level. **Today:** `androidx.recyclerview`, `androidx.drawerlayout`, `androidx.coordinatorlayout`, `com.google.android.material`.

### Form factors

Separate artifacts for Leanback (TV), Wear, and related UIs let one repo target multiple device classes. **Today:** `androidx.leanback`, Wear Compose / Wear Material libraries under Jetpack.

### General utilities

Compatibility helpers (permissions, accessibility, animation) hid version splits. **Today:** most live in `androidx.core` and focused Jetpack libraries.

The design goal matched what good platform shims still do: **call one API; let the library choose framework vs polyfill.**

## What changed with AndroidX

With Android 9 (API 28), Google moved development to **[AndroidX](https://developer.android.com/jetpack/androidx)** — same problems, new namespace (`androidx.*`), strict [semantic versioning](https://developer.android.com/jetpack/androidx/versions), and independent library releases decoupled from the annual platform ship.

Key facts for migrations:

| Support Library era | AndroidX today |
|---------------------|----------------|
| `com.android.support:*` artifacts | `androidx.*` Maven coordinates |
| Support Library 28.0.0 | Binary-equivalent AndroidX 1.0.0 baseline |
| Monolithic version lines tied to `compileSdk` | Per-library semver (e.g. `appcompat:1.7.0`) |
| New features frozen on Support Library | All new Jetpack work in AndroidX only |

Google’s [Support Library overview](https://developer.android.com/topic/libraries/support-library) now redirects attention to AndroidX. Historical `android.support.*` artifacts remain on Google Maven for old builds, but **no new development** lands there.

## Migration path (still the standard playbook)

Official guide: [Migrate to AndroidX](https://developer.android.com/jetpack/androidx/migrate).

1. **Upgrade to Support Library 28.0.0 first** if you are on 27.x or below — AndroidX 1.0.0 matches that baseline byte-for-byte.
2. **Enable flags** in `gradle.properties` (defaults vary by AGP version; modern templates ship with AndroidX on):

```properties
android.useAndroidX=true
android.enableJetifier=true
```

`enableJetifier` rewrites third-party JARs/AARs that still reference `android.support.*`. Drop Jetifier once dependencies are clean — it adds build time.

3. **Run Android Studio’s “Migrate to AndroidX”** refactor (package and import rewrites using [class](https://developer.android.com/jetpack/androidx/migrate/class-mappings) and [artifact mappings](https://developer.android.com/jetpack/androidx/migrate/artifact-mappings)).
4. **Update third-party SDKs** — many failures are transitive libraries still on Support artifacts.
5. **Raise compile/target SDK** after migration — without AndroidX, targeting modern API levels with Support Library 28 is a dead end.

Common mappings you will see in diffs:

| Old | New |
|-----|-----|
| `com.android.support:appcompat-v7:28.0.0` | `androidx.appcompat:appcompat:1.x` |
| `com.android.support:recyclerview-v7:28.0.0` | `androidx.recyclerview:recyclerview:1.x` |
| `com.android.support:design:28.0.0` | `com.google.android.material:material:1.x` |
| `android.support.v4.app.Fragment` | `androidx.fragment.app.Fragment` |

## How this connects to SDK versions

Support Library `compileSdk` alignment was a hard rule: mismatch triggered subtle resource and lint failures. AndroidX loosens the “one giant version line” model but **does not remove** the need to keep `compileSdk`, AGP, and library majors in a supported matrix. When you bump `targetSdk` for Play policy, you often bump AndroidX BOM or Material versions in the same release train — plan both, test both.

For SDK field semantics (`compileSdk`, `minSdk`, `targetSdk`), see [Android SDK versions in production]({{ site.baseurl }}/android-sdk-versions).

## What to do now

- **New apps:** AndroidX only; use the [Jetpack BOM](https://developer.android.com/jetpack/androidx/versions#version-table) or a Gradle version catalog to pin compatible sets.
- **Legacy apps:** finish AndroidX migration before adding Compose or raising `targetSdk` — mixing unmigrated Support code with Compose dependencies is painful.
- **Reading old tutorials:** translate Support imports to AndroidX before copy-pasting; half the “mysterious” errors in Stack Overflow answers are stale coordinates.

The Support Library was the compatibility layer that kept Android apps shippable across fragmented OS versions. AndroidX is the same mission with a sustainable release model — understand the old map, migrate once, and stop pinning `27.1.1` because a sample project did.

## References

- [AndroidX overview](https://developer.android.com/jetpack/androidx)
- [Migrate to AndroidX](https://developer.android.com/jetpack/androidx/migrate)
- [Support Library (historical overview)](https://developer.android.com/topic/libraries/support-library)
- [AndroidX stable releases](https://developer.android.com/jetpack/androidx/versions)
