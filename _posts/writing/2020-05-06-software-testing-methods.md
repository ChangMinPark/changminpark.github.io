---
title: "Software Testing Methods"
date: 2020-05-06 16:45:00
tags: [Writing, Testing]
---

## Why method choice is a budget decision

A green CI badge does not mean your Android build is safe to ship. I have seen fuzz passes and hundred-case UI suites miss production failures — vendor-specific rotation bugs, concolic-path-level logic errors, boundary values at `Integer.MAX_VALUE` — because the team used one cheap method everywhere. Each testing technique buys a different kind of confidence at a different cost. The engineering question is not "did we test?" but **which failure class earns the next hour of automation**.

Below is a map of methods I reach for in mobile and UI work, with Android-flavored examples and honest tradeoffs.

## Fuzz testing — cheap chaos, crash-shaped signal

**Fuzz testing** feeds massive volumes of invalid, unexpected, or random inputs into a program to surface crashes, assertion failures, or security holes. It shines in **black-box** settings where you do not need a formal model — point a fuzzer at a native parser, a JNI boundary, or an intent handler and let it hammer.

**Pros:** Simple to stand up; finds gross memory corruption and unhandled exceptions with little manual case authoring.

**Cons:** Crashes are only one oracle. A layout that renders wrong but does not throw looks like success. Highly conditional bugs — "only when locale is `ar` and night mode toggles mid-animation" — may never appear in random input.

On Android, fuzzing intent extras, malformed content URIs, or protobuf payloads in a sync pipeline is high leverage. It is a poor sole strategy for Compose visual regressions.

## Stochastic testing — random sequences, model optional

**Stochastic testing** drives **random sequences** of operations: tap here, rotate, press back, grant permission, repeat. Without a behavioral model it is fuzz for UI state machines.

It helped stress-test [Mimic]({{ site.baseurl }}/mimic)-style replay infrastructure: random event orderings exposed ordering assumptions in our recorder. Alone, it is weak on oracles — you still need a way to decide "UI is wrong."

## Model-based testing — oracles from intended behavior

**Model-based testing** derives cases from an explicit model of allowed states and transitions — a navigation graph, a protocol state machine, a Compose screen contract. The model is the oracle: illegal transitions or unreachable states flag defects.

Cost is front-loaded in model maintenance. Payoff is high for flows with combinatorial explosion (onboarding × permissions × deep links) where hand-written cases duplicate structure.

## Symbolic testing — paths as constraints

**Symbolic execution** replaces concrete inputs with symbolic variables and tracks constraints along each branch. When paths diverge, the engine forks and accumulates path conditions. The goal is to explore feasibility of paths and generate inputs that force rare branches.

```java
x = read();
if (x > 3) {
  y = 1;
  if (x < 0) y = 2;
} else y = 3;
```

After symbolic substitution, the assignment `y = 2` sits under contradictory constraints (`x > 3` and `x < 0`) — provably unreachable. Symbolic tools excel at detecting **infeasible paths** and generating targeted inputs, not at clicking through a RecyclerView.

**Challenges**

- **Path explosion** — branching grows exponentially; loops over symbolic indices blow up state space.
- **Environment complexity** — system calls, opaque library calls, and recursion stall precise analysis.

**Mitigations:** random path exploration with coverage feedback, concolic hybrid (below), stubbing syscalls, running libraries concretely with summarized loop effects.

Applications: security analysis, equivalence checking (e.g., Code Hunt-style puzzles), generating unit-test inputs for pure logic modules — not full-system UI.

## Concolic testing — concrete execution, symbolic steering

**Concolic (concrete + symbolic) testing** runs the program on real inputs, then solves path constraints to **mutate inputs** that flip the next branch. It is typically cheaper than full symbolic exploration because it follows one concrete trace at a time.

Useful for tight algorithms (parsers, diff engines) embedded in an app. Rarely the first tool for end-to-end Mail UI — but valuable for attachment metadata parsers or migration utilities with deep branches.

## A/B (split) testing — production comparison with statistics

**A/B testing** exposes cohorts to two implementations and compares metrics — tap-through, retention, crash rate, revenue — with statistical testing.

<img src="{{ site.baseurl }}/images/posts/software-testing-methods/figure-1.png" alt="A/B test comparing two UI variants with a statistical significance threshold" width="467px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Split traffic between variants; significance gates promotion.*

Compose rollouts at scale fit here: lazy-list architecture vs baseline, ad slot placement experiments. The oracle is a **product metric**, not pass/fail. Requires traffic, ethical bucketing, and guardrails so a losing variant does not silently harm core flows.

## Boundary testing — edges of valid input

**Boundary testing** targets extremes and just-inside/just-outside edges of valid ranges: min, max, zero, empty string, last pixel, `API_LEVEL` boundaries.

<img src="{{ site.baseurl }}/images/posts/software-testing-methods/figure-2.jpg" alt="Boundary values at the edges of a valid input range" width="460px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. Test at min, just above min, nominal, just below max, and max.*

Android examples: list with exactly one item vs empty vs max adapter count; font scale at accessibility maximum; process death at the last moment before `onSaveInstanceState`. Bugs love fence posts.

Boundary testing usually follows **equivalence class partitioning** — first divide inputs into classes that should behave the same, then probe each class edge.

## Equivalence class partitioning (ECP)

**ECP** splits input space into partitions where all members should follow identical behavior. One representative per partition reduces case count while preserving coverage intent.

<img src="{{ site.baseurl }}/images/posts/software-testing-methods/figure-3.png" alt="Input domain divided into equivalence classes with one test per class" width="67%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 3. Cover each equivalence class at least once.*

Example for a Compose message list: {empty inbox, single thread, paginated history} × {portrait, landscape} × {light, dark} — pick one case per cell instead of enumerating every message id.

**Pros:** Cuts redundant tests. **Cons:** Wrong partitions hide bugs — if you lump "all tablets" together, a foldable-specific bug survives.

## When each method earns its cost

| Method | Best oracle | Android / UI fit | Cost |
|--------|-------------|------------------|------|
| Fuzz | Crash / exception | Native parsers, intents, IPC | Low run cost, low precision |
| Stochastic | Custom diff / replay | Stress event ordering | Medium |
| Model-based | State machine | Navigation, protocols | High model upkeep |
| Symbolic | Path feasibility | Pure logic modules | High analysis cost |
| Concolic | Branch coverage | Parsers, utilities | Medium–high |
| A/B | Product metrics | Compose/feature rollout | Needs traffic + stats |
| Boundary / ECP | Spec edges | Input validation, configs | Low per case |

No single row replaces the others. Production Android work stacks them: ECP + boundary for unit specs, replay + stochastic for compatibility, A/B for user-visible experiments, fuzz for native attack surface.

## References

- [Mimic — UI compatibility testing]({{ site.baseurl }}/mimic)
- [An Introduction to Fuzzing](https://owasp.org/www-community/Fuzzing) — OWASP
- [Model-based testing — Android Developers testing guide](https://developer.android.com/training/testing/fundamentals)
- Cadar, Dunbar, Engler, *KLEE: Unassisted and Automatic Generation of High-Coverage Tests for Systems Programs* — symbolic execution foundations
- Kohavi, Longbotham, Sommerfield, Henne, *Controlled experiments on the web* — A/B methodology
