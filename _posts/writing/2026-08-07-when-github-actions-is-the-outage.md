---
title: "When GitHub Actions Is the Outage"
excerpt: "August 6’s Actions degradation left jobs queued, timed out, or assigned to dead work—and self-hosted runners did not escape. Treat status.github.com as step zero when CI suddenly lies."
date: 2026-08-07 10:00:00
tags: [Writing, DevEx]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>GitHub Status</strong>, <strong>Actions runners</strong>, or <strong>required checks as a merge freeze</strong> are new.</p>
    <ul>
      <li><a href="https://www.githubstatus.com/">GitHub Status</a> — step zero when every repo’s Actions lies at once</li>
      <li><a href="https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions">Understanding GitHub Actions</a> — workflows, jobs, and how a runner gets assigned work</li>
      <li><a href="https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners">About self-hosted runners</a> — your VM is not a full escape from GitHub’s scheduler</li>
      <li><a href="https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches">About protected branches</a> — required checks turn an Actions outage into a merge freeze</li>
      <li><a href="{{ site.baseurl }}/github-actions-android-pr-gates">GitHub Actions for Android PR gates</a> — what those required checks are supposed to protect</li>
    </ul>
  </div>
</details>

On August 6, 2026, [GitHub Status](https://www.githubstatus.com/) opened an Actions investigation at **15:22 UTC**. Within an hour, workflow runs were failing to start or dying mid-flight, the Actions REST API was erroring, and some workflows saw unexpected rate limits. Capacity stayed constrained for hours. Hosted runners were hit hard; self-hosted runners still saw registration errors and rate limiting. Webhook delivery slowed. Pages, Copilot code review, and Copilot coding agent degraded alongside Actions. Enterprise Importer migrations were paused to help recovery.

By evening, GitHub’s updates named a concrete failure mode: **runners were being assigned jobs that were no longer valid**. Job success rates for runs that could start climbed from roughly **30–40%** earlier in the incident toward **97–99%** after mitigations. Webhook-triggered workflows stayed throttled while queues burned down. A cold Gradle cache does not look like that. A broken **assignment / scheduling path** does.

If your merge bar is a required Actions check—and for most Android PR gates it is (see [GitHub Actions for Android PR gates]({{ site.baseurl }}/github-actions-android-pr-gates))—then an Actions outage is not a vendor inconvenience. It is a **shipping freeze** with a status-page URL.

## What actually broke (from the public timeline)

You do not need an internal postmortem to act. The public status updates are enough to shape an on-call mental model:

| Symptom teams saw | What it usually means |
|-------------------|------------------------|
| Jobs sit `queued` for a long time, then time out | Assignment / capacity path is stuck |
| Runs fail at start or mid-job with infra errors | Runner got work it cannot finish cleanly |
| Actions API errors / odd rate limits | Control plane under load or shedding |
| Self-hosted runners “online” but idle | Scheduler / registration path, not your VM |
| Pages / Copilot agents / webhooks wobble | Shared dependency blast radius |

> **Rule of thumb** - if *every* repo’s Actions went weird in the same window, open [githubstatus.com](https://www.githubstatus.com/) before you debug `gradle.properties`.

Self-hosted is the wrong comfort blanket here. Your machines still ask GitHub’s scheduling layer for work. When that layer assigns dead jobs or throttles registration, “we run our own runners” does not buy immunity. Hosted vs self-hosted still matters for SDK images and secrets—see [GHEC vs GHES]({{ site.baseurl }}/ghec-vs-ghes)—but it is not a reliability silver bullet for Actions itself.

## Why this hurts Android merge queues specifically

Android PR latency is already expensive: Gradle, emulators optional, module graphs, cache warm-up. Teams design [merge contracts]({{ site.baseurl }}/github-actions-android-pr-gates) so humans wait on a **bounded** green check, not a forty-minute vanity matrix.

When Actions degrades:

1. **Required checks stop meaning “safe to merge.”** They mean “the fleet could not prove anything.” Merging on red because “Actions is down” is a policy decision—not a free pass.
2. **Retry storms make it worse.** Twenty engineers hammering **Re-run all jobs** on a throttled webhook path deepens the backlog. Prefer one coordinated retry after status shows recovery, not N independent panic clicks.
3. **Agent / bot reviewers go quiet too.** Copilot code review and coding agent sat in the same blast radius. If your process assumes a bot comment before human review, that assumption fails with the scheduler.
4. **Release trains that only trust GitHub-hosted proof stall.** Org CI next door (Jenkins, Screwdriver, Buildkite) exists partly for this reason—see [Jenkins to Screwdriver]({{ site.baseurl }}/cicd-jenkins-to-screwdriver)—but day-to-day PR gates usually still live on Actions.

The practical failure mode on a large client monorepo is social as much as technical: Slack fills with screenshots of yellow dots, people ask whether to merge without checks, and someone almost ships a Manifest permission change because “CI has been broken all day.”

## What to do while it is red

Keep a short playbook next to your workflow YAML—not a novel:

1. **Confirm scope.** One repo vs status page. If status is red for Actions, stop local archaeology.
2. **Freeze non-urgent merges** that require Actions proof. Document the exception path (who can waive, for what class of change).
3. **Do not mass re-run.** Re-run after GitHub reports queues draining and webhook throughput restoring—not every fifteen minutes.
4. **Separate “human review done” from “machine proof done.”** Review can continue offline; merge waits for proof unless policy explicitly allows a waive.
5. **After recovery, re-run the critical path once** on `main`/release branches you care about. Queued-before-recovery jobs may still be poisoned.

Optional resilience (months, not during the fire): a thin **org CI shadow** for release branches, or a documented manual assemble cone for emergencies. Dual-running every PR on two fleets is usually cost theater; dual-path for *promotion* is often rational.

## What not to conclude

Do not rewrite your whole DevEx strategy from one bad Thursday. Do conclude:

- Actions reliability is part of your **merge SLA**, not GitHub’s problem alone.
- Status pages belong in the first five minutes of “CI is broken” triage.
- Self-hosted runners optimize for environment control; they do not remove scheduler coupling.
- Cascades matter: the same day can take down Pages deploys and AI review bots that your process silently depends on.

GitHub will publish a fuller RCA when it is ready. Until then, the actionable lesson is operational: when the green check is lying because the **platform** is lying, treat it like an incident—not like a flaky unit test.

## References

- [GitHub Status](https://www.githubstatus.com/) — Aug 6, 2026 Actions / Pages / Copilot updates (public timeline)
- [GitHub Actions docs](https://docs.github.com/en/actions)
- [GitHub Actions for Android PR gates (this site)]({{ site.baseurl }}/github-actions-android-pr-gates)
- [GHEC vs GHES (this site)]({{ site.baseurl }}/ghec-vs-ghes)
- [From Jenkins to Screwdriver (this site)]({{ site.baseurl }}/cicd-jenkins-to-screwdriver)
