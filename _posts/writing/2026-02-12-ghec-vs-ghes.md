---
title: "GHEC vs GHES: What Actually Changes for Your Team"
excerpt: "Enterprise Cloud and Enterprise Server share a license — not an ops model. What breaks for Actions, identity, and upgrades when you pick wrong."
date: 2026-02-12 11:20:00
tags: [Writing, DevEx]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>GitHub Enterprise Cloud vs Server</strong>, <strong>Actions on an appliance</strong>, or <strong>GitHub Connect</strong> are new.</p>
    <ul>
      <li><a href="https://docs.github.com/en/enterprise-server@latest/admin/overview/about-github-for-enterprises">About GitHub for enterprises</a> — Cloud vs Server as two deployments of one plan</li>
      <li><a href="https://docs.github.com/en/enterprise-server@latest/admin/overview/about-github-enterprise-server">About GitHub Enterprise Server</a> — self-hosted appliance, upgrade train, feature lag</li>
      <li><a href="https://docs.github.com/en/enterprise-server@latest/admin/configuring-settings/configuring-github-connect/about-github-connect">About GitHub Connect</a> — hybrid: GHES talking to github.com for Actions/Dependabot</li>
      <li><a href="https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions">Understanding GitHub Actions</a> — workflows and runners; what breaks when the control plane is yours</li>
    </ul>
  </div>
</details>

## The workflow that “worked on GitHub”

You’ve got a tidy Actions workflow: Gradle cache, a matrix, maybe a few marketplace actions pinned by SHA. It runs green on a personal fork. Then someone points the same repo at the company instance and half the jobs never start — no hosted runners, an Actions version lag, or a Dependabot feature that only exists when the appliance can talk to `github.com`.

That gap is usually **GHEC vs GHES**.

GitHub Enterprise is one **plan**. [Deployment is two products](https://docs.github.com/en/enterprise-server@latest/admin/overview/about-github-for-enterprises): **GitHub Enterprise Cloud (GHEC)** — GitHub hosts it — and **GitHub Enterprise Server (GHES)** — you run an appliance on your metal or a public cloud. Purchase often entitles you to **both**; you can run cloud-only, server-only, or a hybrid with [GitHub Connect](https://docs.github.com/en/enterprise-server@latest/admin/configuring-settings/configuring-github-connect/about-github-connect). The license is shared. The **ops model** is not.

## Related reading

- **Internal:** [GitHub Actions for Android PR gates]({{ site.baseurl }}/github-actions-android-pr-gates) — merge contracts that still assume a working Actions fleet
- **Internal:** [Jenkins to Screwdriver]({{ site.baseurl }}/cicd-jenkins-to-screwdriver) — when org CI sits beside GitHub
- **Docs:** [About GitHub for enterprises](https://docs.github.com/en/enterprise-server@latest/admin/overview/about-github-for-enterprises), [Getting started with Enterprise Cloud](https://docs.github.com/en/get-started/onboarding/getting-started-with-github-enterprise-cloud)

## Two products, one decision surface

**GHEC** keeps repositories and enterprise policy on GitHub’s side. Updates and bugfixes land without your weekend patch train. You can stay on `github.com` or use a dedicated subdomain on **GHE.com** when data residency / tenancy control matters more than “just SaaS.” Identity is either personal accounts + SAML SSO, or **Enterprise Managed Users** provisioned from your IdP.

**GHES** is your instance: you own TLS, backups, HA, disk, and upgrade windows. Auth can be built-in, LDAP, or SAML. Network isolation and air-gaps are real options — and so is the cost of being weeks or versions behind the public product surface.

For an Android or mobile team, the interesting question is rarely “which logo is on the login page.” It’s which of these you just bought:

| Dimension | GHEC (hosted) | GHES (appliance) |
|-----------|---------------|------------------|
| Who patches GitHub | GitHub | Your admins |
| Feature lag | Near-zero for GA features | Tied to appliance version + upgrade cadence |
| Actions compute | GitHub-hosted runners available; self-hosted optional | **You** supply runners (no GitHub-hosted fleet) |
| Marketplace / public Actions | First-class | Often needs Connect, allowlists, or vendoring |
| Dependabot / some security signals | Built into the hosted path | Frequently needs Connect or local substitutes |
| Data plane | GitHub / GHE.com regions | Wherever you put the VM |
| Air-gap | Not the product’s job | Possible — and expensive to keep current |

Treat that table as a **decision aid**, not a vendor scorecard. Regulated or air-gapped orgs pick GHES for reasons that outrank “latest Copilot UI.” Everyone else often underestimates how much of modern GitHub is **cloud-shaped** (hosted runners, continuous feature drop, Codespaces-class surfaces).

## What breaks first for app teams

**Runners.** On GHEC you can start with GitHub-hosted Linux/macOS/Windows and graduate to self-hosted when secrets, private Maven, or Android SDK images demand it. On GHES there is no hosted fleet — your platform team must size, patch, and scale runners before “add a workflow” means anything. PR gates that look like [Actions merge contracts]({{ site.baseurl }}/github-actions-android-pr-gates) still apply; the fleet is just yours.

**Action provenance.** Pinning `actions/checkout@v4` by SHA is hygiene everywhere. On GHES, the harder problem is **availability**: can the instance reach the public action, do you mirror it, or do you rewrite workflows to internal composites? Teams that copy-paste cloud examples discover this on Monday morning.

**Identity friction.** EMU on GHEC can feel strict (no random personal forks into the enterprise) but onboarding is predictable. GHES account creation and LDAP/SAML quirks show up as “I can’t open a PR from my laptop” tickets that look like git problems and are actually directory problems.

**Upgrade weekends.** GHES major/minor bumps are change-management events: maintenance mode, migrations, runner compatibility, and “Actions started failing after the upgrade.” GHEC still has incidents — you just don’t schedule the binary upgrade yourself.

**Org CI next door.** Large shops often keep Jenkins / Screwdriver / Buildkite for release trains and use GitHub for PRs. That split works on either deployment; GHES makes the “is this runner pool healthy?” question louder because GitHub won’t absorb burst load for you. See [Jenkins to Screwdriver]({{ site.baseurl }}/cicd-jenkins-to-screwdriver) for the org-CI side of that story.

## Hybrid is a product, not a compromise

GitHub’s own framing: buy Enterprise, use **one or both**. Connect bridges a GHES instance toward `github.com` for things that need the public plane (certain Dependabot paths, consuming actions hosted on GitHub.com, unified contribution graphs in some setups). Hybrid done well means **policy and identity stay coherent** across planes. Hybrid done badly means two permission models, two runner stories, and a wiki page nobody updates.

If leadership says “we need GHES for compliance” and eng says “we need hosted Actions for mobile CI,” the honest answer is often **both** — with a written boundary: which repos live where, which checks are authoritative, and who owns Connect outages.

## How I’d choose

Pick **GHEC** when SaaS is allowed, you want feature velocity, and you do not want to staff a GitHub appliance team. Prefer GHE.com tenancy when residency is the constraint, not “we must own the VM.”

Pick **GHES** when network isolation, air-gap, or “code never leaves our boundary” is non-negotiable — and budget the runner/upgrade tax explicitly.

Pick **hybrid** when compliance repos and product repos have different gravity, and you can afford Connect + dual runbooks.

What I would not do: choose GHES because it “feels more enterprise,” then expect cloud-shaped Actions tutorials to work unchanged. The product name is the same; the failure mode is different. Write down where code lives, who patches GitHub, and where Actions compute comes from before the next “it worked on my fork” incident.

## References

- [About GitHub for enterprises](https://docs.github.com/en/enterprise-server@latest/admin/overview/about-github-for-enterprises) — official GHEC / GHES deployment split; Connect note
- [Getting started with GitHub Enterprise Cloud](https://docs.github.com/en/get-started/onboarding/getting-started-with-github-enterprise-cloud) — hosted vs self-hosted one-liner
- [Combined enterprise use / licensing](https://docs.github.com/en/billing/concepts/enterprise-billing/combined-enterprise-use) — one license covering Cloud + Server
- [About GitHub Connect](https://docs.github.com/en/enterprise-server@latest/admin/configuring-settings/configuring-github-connect/about-github-connect) — bridging Server toward github.com features
