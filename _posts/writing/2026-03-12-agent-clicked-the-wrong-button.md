---
title: "The Agent Clicked the Wrong Button"
excerpt: "Browser and computer-use agents are a different tool class. Selector drift and page-borne injection beat chat-tone caution — multimodal observation does not fix that."
date: 2026-03-12 11:00:00
tags: [Writing, Agents]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>computer use</strong>, <strong>browser automation</strong>, <strong>selectors</strong>, or <strong>page-borne prompt injection</strong> are new.</p>
    <ul>
      <li><a href="https://docs.anthropic.com/en/docs/agents-and-tools/computer-use">Anthropic — Computer use</a> — screenshot, mouse, and keyboard as model tools in an environment you control</li>
      <li><a href="https://playwright.dev/docs/intro">Playwright docs</a> — browser automation, locators, and why brittle selectors fail</li>
      <li><a href="https://www.anthropic.com/research/prompt-injection-defenses">Mitigating prompt injections in browser use (Anthropic)</a> — page content as an adversarial channel</li>
      <li><a href="https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/overview">Strengthen guardrails (Anthropic)</a> — approvals that matter; treat tool/page output as untrusted</li>
      <li><a href="https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview">Tool use (Anthropic)</a> — design a small, clear tool surface; fat browser MCP is rarely the default</li>
    </ul>
  </div>
</details>

## Fifteen pixels to the left

The task was simple: open the staging console, dismiss the cookie banner, click **Export**. The agent took a screenshot, aimed, and hit **Delete draft** instead — same row, shifted layout, slightly different density on the laptop profile. Chat sounded careful. The click was not.

That is not "the model is bad at UI." It is a reminder that **computer-use and browser agents are a different tool class** than repo read/edit/shell. They act in a visual, adversarial, constantly rearranging world. Multimodal observation (screenshot + voice narration of the screen) helps the model *see*; it does not invent a trustworthy click contract.

## Two observation channels, same failure modes

Roughly two ways agents drive a UI:

| Channel | What the model sees | Typical break |
|---------|---------------------|---------------|
| DOM / accessibility tree + locators | Roles, text, test ids | Renamed copy, nested iframes, shadow DOM, A/B layout |
| Pixels (screenshot → click x,y) | Bitmap of the viewport | Density, animation, overlays, "close enough" wrong target |
| Hybrid | Both, or Playwright + vision fallback | Still inherits page content as untrusted context |

Voice or caption layers ("I see a blue Export button top-right") are useful for humans watching the loop. They do not harden the action. The model can narrate Export and still emit coordinates for Delete.

```text
  [page HTML / pixels] ──untrusted──► model context
           │
           ▼
     click / type / navigate
           │
           ▼
   side effects (submit, pay, export, wipe)
```

*Figure 1. Observation enters context like any other tool result. The page is the attack surface and the UI is the actuator.*

## Selector brittleness is not a prompt bug

Playwright (and every locator stack) already taught this: `text=Export` breaks when marketing renames the button; `nth=3` breaks when a banner inserts a row; CSS paths break when Compose migrates a dialog. Agents amplify the cost because they **retry with confidence** — click again, dismiss a modal they opened, wander into a settings page to "find Export."

Practical mitigations look like test engineering, not cleverer system prompts:

1. Prefer **stable test ids** on surfaces you own; do not scrape marketing copy
2. Scope the agent to a **narrow allowlisted URL set** and a disposable profile
3. Prefer **API or deep links** when the goal is data movement, not "prove we can click"
4. Cap steps; on ambiguity, **stop for a human** instead of exploring
5. Record trajectories; treat flake as a harness bug, not a model insult

A kitchen-sink Playwright MCP with fifteen browser tools in every coding session is usually the wrong default — same lesson as [too many tools]({{ site.baseurl }}/agent-too-many-tools). Turn browser hands on for a bounded task, then turn them off.

## Page-borne injection dominates the threat model

Repo tools mostly see code you already trust (with caveats). Browser agents read **arbitrary pages**. Instructions painted in the DOM, hidden text, deceptive buttons, and poisoned images all compete with your original task. Anthropic's own browser-use research treats prompt injection as an active problem even as models get more robust — defenses stack classifiers and action gates; they do not declare victory.

This is the same confused-deputy pattern as [trust boundaries]({{ site.baseurl }}/agent-trust-boundaries), with a louder actuator:

- Private data in the profile (SSO cookies, saved cards)
- Untrusted content in the viewport
- Exfil or irreversible actions via click/type

If those three coexist, you are running a demo in a minefield. Design for blast radius: dedicated browser profile, no banking sessions, human approval for submit / purchase / export / credential fields, and never "the model promised it only clicked Export."

> **Rule of thumb** - treat every screenshot and DOM dump as untrusted tool output. Gate the click, not the caption.

## Multimodal, lightly

Screenshots let the model ground on what a user would see — overlays, toast copy, a modal that accessibility trees sometimes under-describe. Audio or spoken status helps operators. Neither replaces:

- Structured locators where you control the app
- Least privilege on the profile
- Step-up approvals on high-blast actions
- Eval tasks that include **adversarial pages**, not only happy paths

If your golden demo is a clean docs site with a single obvious button, you measured sightseeing. Real evals include cookie walls, lookalike CTAs, and injected "ignore previous instructions" banners.

## When computer-use is still worth it

Use it when the work *is* the UI: reproducing a staging bug, walking a vendor console with no API, checking that a Compose dialog survived a theme change. A personal example that keeps paying rent: an agent with a disposable profile opens a debug build's deep link, screenshots the empty-state dialog, and compares against a golden crop — no SSO, no production mailbox, one allowlisted host. That is computer-use as a **scoped sensor**, not as a general employee.

Skip it when a `curl`, a Gradle task, or a deep link already moves the state you care about. The wrong tool class burns tokens and creates irreversible side effects for the privilege of looking autonomous. If the ticket is "export CSV of flags," prefer the export API over teaching the model to hunt through a console that can also wipe the project.

## Wrap-up

Wrong-button clicks and page-borne injections are the signature failures of browser / computer-use agents. Treat them as a separate tool class with selector discipline, tiny profiles, and approvals on the click — multimodal sight is input, not a safety boundary.

## References

- [Agentic browser prompt injection (Systems Hardening)](https://www.systemshardening.com/articles/ai-landscape/agentic-browser-prompt-injection-defence/) — web content as attack surface for computer-use loops
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — LLM01 prompt injection in plain language
- [Playwright — locators](https://playwright.dev/docs/locators) — resilient locator strategies vs brittle CSS
