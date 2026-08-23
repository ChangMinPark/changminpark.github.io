---
title: "On-Device Agents Without the Mini Fantasy"
excerpt: "On-device and edge agent work is latency, privacy, and offline wiring — not a shopping list for a Mini or a 70B. Harness approvals and evals stay the same."
date: 2026-06-27 09:15:00
tags: [Writing, Agents]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>on-device LLMs</strong>, <strong>edge vs cloud inference</strong>, or <strong>agent harness loops</strong> are new.</p>
    <ul>
      <li><a href="https://arxiv.org/html/2409.00088v1">On-Device Language Models: A Comprehensive Review</a> — why edge-cloud hybrids dominate wish lists (latency, privacy, cost)</li>
      <li><a href="{{ site.baseurl }}/agent-done-but-ci-red">The Agent Said Done — and CI Is Red</a> — stop conditions and verifiers; the loop shape does not change on-device</li>
      <li><a href="{{ site.baseurl }}/agent-trust-boundaries">Agent Trust Boundaries</a> — approvals and least privilege still bound tool blast radius</li>
      <li><a href="{{ site.baseurl }}/agent-eval-not-a-demo">"It Worked Once in Chat" Is Not a Ship Bar</a> — golden tasks beat a single local demo</li>
      <li><a href="https://ollama.com/">Ollama</a> — run a small local model with an OpenAI-compatible API shape (ops literacy, not a 70B goal)</li>
    </ul>
  </div>
</details>

## You do not need a rack to learn agents

Every few months the feed invents a new reason to buy hardware: a Mac Mini forever-on host, a 70B at home, an NPU story that implies your laptop is obsolete. For learning how agents fail — false "done," fat tool menus, rubber-stamp approvals, demo-only evals — that shopping list is a distraction. **On-device and edge are wiring literacy**: latency budgets, what stays on the phone, what works offline. They are not a prerequisite for understanding harnesses.

## What actually changes on the device

Move the weights next to the sensors and three product constraints get louder:

| Constraint | Cloud-shaped habit | On-device / edge habit |
|------------|--------------------|------------------------|
| Latency | Round trip + queue | Local tokens; UI can stay interactive |
| Privacy | Ship context upstream | Keep PII / mailbox-adjacent text local when you can |
| Offline | Spinner or error | Degraded path that still does something honest |

A mail-style assistant that suggests a reply subject while the radio is dead only works if something local can run. That is a real product reason. It is not the same claim as "I cannot study agents until I own a 70B."

```text
  phone / laptop                 cloud (optional)
  ┌─────────────────────┐        ┌──────────────────┐
  │ small model / NPU   │        │ frontier model   │
  │ tools + policy      │───────▶│ heavy tasks      │
  │ approvals + logs    │◀───────│ when policy OK   │
  └─────────────────────┘        └──────────────────┘
         harness loop identical either side
```

*Figure 1. Placement of weights changes; the loop (goal → act → observe → stop) does not.*

## What does not change

Whether the brain is Claude in the cloud or a 7–8B via Ollama on a laptop:

- **Stop conditions** still need exit codes, not chat tone ([CI as done]({{ site.baseurl }}/agent-done-but-ci-red))
- **Approvals** still gate irreversible tools; local does not mean trusted ([trust boundaries]({{ site.baseurl }}/agent-trust-boundaries))
- **Evals** still need golden tasks you can re-run after a model bump ([not a demo]({{ site.baseurl }}/agent-eval-not-a-demo))
- **Tool menus** still punish kitchen-sink defaults

Weaker local models make bad judgment *more* obvious. That is useful for labs. It is a poor excuse to skip the harness and blame parameter count. The day you move a policy check onto the device — "never upload draft body without an explicit toggle" — you will care more about where the gate lives than about whether the next token came from Sonnet or a quantized 8B.

## A sane learning order

1. Cloud API + a hand-rolled loop (fake tools, fake CI) until "done ≠ green" is muscle memory
2. Thin tools and skills; measure thrash when you deliberately add junk
3. Optional: same prompts against a small local model to feel latency and quality cliffs
4. On-device / edge as a **product** topic when you have a latency, privacy, or offline requirement — not as gear acquisition

Step 3 is where people overspend. A 7–8B on a laptop already teaches timeout budgets, context limits, and "the model agreed but the tool never ran." A Mini hosting a 70B teaches thermals and electricity. Only one of those lessons transfers to shipping an Android feature that must not upload draft text.

## Wrap-up

Buy silicon when a product constraint demands it. Learn agents by wiring loops, gates, and evals — on whatever brain you already have. On-device without the Mini fantasy is just honest placement of compute.

## References

- [AgentFlux — privacy-preserving on-device agentic systems](https://agent-flux.github.io/) — local orchestration with selective cloud collaboration
- [Edge-first AI agents (Petronella)](https://petronellatech.com/blog/edge-first-ai-agents-offline-private-frontline-ready/) — offline / private patterns without treating hardware as the curriculum
- [Building effective agents (Anthropic)](https://www.anthropic.com/engineering/building-effective-agents) — start simple; add complexity when measurement demands it
