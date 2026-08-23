---
title: "Dalvik and ART: What the Runtime Layer Still Explains"
excerpt: "ART replaced Dalvik; DEX and per-process VMs remain. What the old runtime layer still explains in traces."
date: 2019-09-23 11:45:00
tags: [Writing, Systems]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>DEX, ART, Zygote, or AOT/JIT</strong> are new.</p>
    <ul>
      <li><a href="https://source.android.com/docs/core/runtime">Android Runtime (ART) and Dalvik</a> — how Android runs app code (DEX → ART)</li>
      <li><a href="https://source.android.com/docs/core/runtime/dalvik-bytecode">Dalvik Executable format</a> — what a `.dex` contains</li>
      <li><a href="https://source.android.com/docs/core/runtime/app-process">Zygote</a> — how app processes are forked</li>
      <li><a href="https://source.android.com/docs/core/runtime/configure">Configure ART</a> — AOT, JIT, and profile-guided compilation at a glance</li>
    </ul>
  </div>
</details>

## Why Dalvik still shows up in stack traces

Search “Dalvik” in 2026 and you get archaeology — fair enough. **ART replaced Dalvik as the default runtime in Android 5.0 (Lollipop)** and every current device runs ART. But the bytecode format, the per-process VM model, and the Zygote fork path Dalvik established are still how apps start and execute. When cold start regresses or you see DEX/OAT/VDEX in a build artifact, you are looking at that lineage.

The useful question is not “which VM is installed?” but **which runtime contract did I violate** — process isolation, bytecode shape, or compilation timing.

## One app, one process, one runtime instance

Android runs each app in **its own Linux process** with its own runtime instance. That is different from a desktop JVM hosting many threads in one big process. Crash isolation, memory limits, and permission boundaries all assume this model.

When the system boots:

1. The kernel starts `init`, which launches system daemons.
2. **Zygote** starts and preloads core framework classes and resources.
3. When you launch an app, Zygote **forks** a child process; the child becomes your app’s runtime.

Copy-on-write means the child initially shares read-only pages with Zygote. Pages are duplicated only when written, so “load the entire framework” is amortized across every app launch instead of paid in full each time.

<img src="{{ site.baseurl }}/images/posts/dalvik-virtual-machine/zygote-fork.jpg" alt="Zygote process forking to create a new application process with a Dalvik or ART instance" width="560px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Zygote forks a pre-warmed process for each new app.*

If every app feels slow to cold-start after an OS update, think Zygote/ART boot image before micro-optimizing your splash screen. If one app alone misbehaves, stay in that process.

## DEX is not JVM bytecode

Java and Kotlin sources compile to `.class` files, then Android build tools (`d8` / R8) produce **DEX** — Dalvik Executable — packaged as `classes.dex` inside the APK. ART still runs DEX; the name “Dalvik” stuck to the file format even after the interpreter moved on.

DEX is tuned for mobile: shared constant pools, fewer files, and instructions aimed at a **register-based** machine instead of the JVM’s stack-based model.

<img src="{{ site.baseurl }}/images/posts/dalvik-virtual-machine/register-vs-stack.png" alt="Comparison of stack-based JVM bytecode versus register-based Dalvik bytecode" width="540px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. Register-based Dalvik/DEX vs stack-based JVM bytecode (see Mark Faction in References).*

Conceptually:

```text
// JVM-style (stack): push operands, operate, push result
iload_1
iload_2
iadd

// DEX-style (registers): operands live in named registers
add-int v0, v1, v2   // v0 = v1 + v2
```

Register machines can encode fewer memory touches for typical Android methods — useful when register pressure and instruction count both matter on a phone SoC. You rarely hand-write DEX, but you *do* feel it when R8 shrinking changes method counts or when a dex limit forces multidex.

## Dalvik → ART: what actually changed

**Dalvik (historical)** interpreted DEX at runtime with just-in-time compilation added later. Startup was relatively cheap; steady-state performance could lag behind natively compiled code.

**ART (current)** compiles DEX to native code — largely at install or update time via `dex2oat`, with JIT for hot paths at runtime. Startup can cost more disk and install time; execution is faster and GC/accounting evolved with it.

What stayed the same:

- **Per-app process + Zygote fork** — still the launch path.
- **DEX as the portable IR** — still what ships in APKs (plus profiles and verified DEX in modern builds).
- **JNI boundary** — native code still enters through the same managed runtime rules.

What broke when Dalvik-only tricks met ART:

- Reflection and class-loading hacks that “worked on Dalvik” sometimes fail verification or AOT compilation.
- Assumptions about garbage-collection pauses changed — profile ART on real devices, not an old mental model.

Do not build new features assuming an interpreter-only Dalvik world. Do understand **why** install size grew (OAT/VDEX) and why `adb shell cmd package compile` shows up in performance playbooks. On a device you own, compare cold start before and after clearing profile data — if only first launch is slow, you are often paying compilation or profile collection, not bad layout code.

## Failure modes that map to the runtime layer

| Symptom | Runtime-angle check |
|--------|---------------------|
| Slow cold start after OS upgrade | Zygote boot image, ART profile, baseline profiles |
| `ClassNotFoundException` only in release | R8 shrinking vs reflection; verify release build |
| `VerifyError` / dex2oat failure | Invalid bytecode from post-processing tools |
| Native crash after JNI change | JNI pinning / thread attachment across ART GC |
| Multidex / 64K method limit | DEX merge strategy, feature modules |

ART is the engine; DEX is still the fuel format. Dalvik is the name of the path Android took to get here — worth knowing when docs, filenames, and older papers still say “DVM.”

## References

- [Platform architecture (ART section) — Android Developers](https://developer.android.com/guide/platform)
- Mark Faction, *Stack-based vs register-based VM architecture and the Dalvik VM* ([markfaction.wordpress.com](https://markfaction.wordpress.com/2012/07/15/stack-based-vs-register-based-virtual-machine-architecture-and-the-dalvik-vm/)) — register vs stack intuition (figure credit for Figure 2)
- [Stack-based vs register-based VMs (this site)]({{ site.baseurl }}/stack-vs-register-based-vm) — why DEX named registers instead of an operand stack
