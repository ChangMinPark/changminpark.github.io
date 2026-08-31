---
title: "GitHub Actions for Android: PR Gates That Protect Merges"
excerpt: "Green checks that only assembleDebug protect nothing. PR gates that catch module graphs, Manifest, and real risk."
date: 2025-02-11 10:15:00
tags: [Writing, DevEx]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>branch protection, required checks, R8, or Gradle modules</strong> are new.</p>
    <ul>
      <li><a href="https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches">About protected branches</a> — required status checks before merge</li>
      <li><a href="https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions">GitHub Actions</a> — workflows as PR gates</li>
      <li><a href="https://developer.android.com/topic/performance/app-optimization/enable-app-optimization">Shrink, obfuscate, and optimize (R8)</a> — release-time code shrinking</li>
      <li><a href="https://developer.android.com/studio/projects/android-library">Configure build variants / modules</a> — library modules in a Gradle graph</li>
    </ul>
  </div>
</details>

## Green checks that mean nothing

On GitHub, Android teams often land in one of two traps: a required check that only runs `assembleDebug`, or a forty-minute matrix nobody trusts. PRs still merge with broken module graphs, Manifest surprises, and “LGTM” from humans who never opened the Gradle diff. Org platforms like Jenkins or Screwdriver matter at release scale — see [Jenkins to Screwdriver]({{ site.baseurl }}/cicd-jenkins-to-screwdriver) — but **day-to-day merge safety** is usually a developer-owned Actions workflow.

This post is about designing that **merge contract**: what must be true before `main` moves, without turning every PR into a release rehearsal.

## The merge contract (mobile-shaped)

A useful PR gate answers three questions fast:

1. **Will this compile the cone it touches?** Prefer affected-module assemble over whole-monorepo when possible.
2. **Did we introduce a graph or Manifest footgun?** Cycles, forbidden edges (`feature`→`feature`), unexpected `api` exports, dangerous permissions.
3. **Is the diff reviewable?** Formatters and linters as required checks — ktlint/detekt/Spotless — so humans review behavior, not spaces. Which tool owns which complaint is the subject of [formatter vs linter]({{ site.baseurl }}/formatter-vs-linter); here the point is **required status**.

Optional but high leverage: mapping-file / R8 smoke on release-track PRs, unit tests for touched modules, and cache (Gradle + dependencies) so the latency budget stays under “I’ll wait.”

## Branch protection that matches reality

Required status checks only help if they are the **same jobs** developers run locally (or a documented subset). No self-approve. Path filters for docs-only PRs so README typo fixes do not wait on emulator farms. Secrets for signing stay on protected branches — PR forks get unsigned assemble.

```yaml
# Sketch — not a full production workflow
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup JDK
        uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: "17" }
      - name: Style
        run: ./gradlew ktlintCheck detekt
      - name: Unit (affected)
        run: ./gradlew testDebugUnitTest
      - name: Assemble (affected)
        run: ./gradlew assembleDebug
```

Wire flake policy explicitly: quarantine flaky instrumentation; do not train the team to re-run until green.

## Latency budget for PR feedback

If the gate routinely exceeds ~10–15 minutes for ordinary app PRs, developers will work around it — force-pushing, marking checks optional, or merging with “I’ll fix CI later.” Prefer a **fast required path** (style + unit + assembleDebug cone) and a **slower non-blocking** or nightly path (full instrumentation, size analysis). Document which jobs are merge-blocking. Flakes belong in quarantine with an owner, not in tribal knowledge about which “re-run” button to mash.

## Bots as signal, not authority

Automated reviewers on raised PRs can catch API/`impl` leaks, Manifest merges, missing tests, and “this PR edits generated/.” They cannot own **product risk** or rollout judgment. Treat bot review as a noisy sensor that runs alongside the required checks, never as one of them:

| Bot checks | Human keeps |
|------------|-------------|
| Graph / style / obvious API misuse | Product risk, rollout, privacy |
| Missing tests for pure functions | Experiment design |
| Dangerous permission diffs | “Should we ship Friday?” |

If the bot is wrong in public, a person still owns the thread.

## Wrap-up

GitHub Actions for Android should encode a **merge contract**, not a green vanity check. Combine style gates, graph/Manifest sanity, and compile cones with branch protection — and keep bot review as signal. Leave org-scale promotion and store signing theater to platforms like Screwdriver; keep PR feedback inside a latency budget humans will actually wait for.

## References

- [GitHub Docs — Actions](https://docs.github.com/en/actions)
- [GitHub Docs — Protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Android — Configure CI](https://developer.android.com/studio/build/building-cmdline)
