---
title: "Stack-Based vs Register-Based VMs: Why Dalvik Chose Registers"
excerpt: "Stack and register VMs fake CPUs differently. Why Dalvik chose registers and what that still explains."
date: 2022-04-01 09:45:00
tags: [Writing, Systems]
draft: false
---

## Two ways to fake a CPU

A **process virtual machine** is not VMware — it is a runtime that executes bytecode for one app process. Java's JVM, Python's CPython, and Android's DEX/ART pipeline all compile source to an intermediate form, then interpret or compile that IR on the host CPU.

Implementers pick one of two operand models:

1. **Stack-based** — operands live on an evaluation stack; instructions push and pop (classic JVM).
2. **Register-based** — operands live in named virtual registers; instructions name sources and destinations (Dalvik/DEX, Lua, some WASM lowering paths).

The choice affects instruction count, code size, dispatch-loop cost, and how easily a compiler can reuse subexpressions. On a phone SoC, those details showed up in install size and cold-start time — which is why Android's lineage matters beyond trivia.

For how DEX fits into process startup and ART today, see [Dalvik and ART]({{ site.baseurl }}/dalvik-virtual-machine).

## Stack-based VMs — implicit addresses via the stack pointer

In a stack VM, arithmetic is expressed as a sequence of pushes, an operation, and a push of the result. Adding 20 and 7 might look like:

```text
PUSH 20
PUSH 7
ADD          ; pop two operands, push sum
```

Four conceptual steps for one addition. The upside: **operand addresses are implicit**. The stack pointer tells the interpreter what to pop next; compact opcodes, simple compiler back ends.

<img src="{{ site.baseurl }}/images/posts/stack-vs-register-based-vm/stack-vm.png" alt="Stack-based virtual machine with stack pointer and evaluation stack for operands" width="560px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Stack-based VM — the stack pointer selects operands implicitly.*

<img src="{{ site.baseurl }}/images/posts/stack-vs-register-based-vm/stack-addition.png" alt="Stack operations to add two numbers: push, push, add, push result" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. Adding two values on a stack machine takes multiple push/pop steps.*

Every arithmetic and logic operation flows through that push/pop cycle. Dispatch loops spend work moving data on the stack even when the "registers" of the algorithm are really just deep stack slots.

**Pro:** small instructions, no explicit register fields, straightforward bytecode verification.

**Con:** more instructions per operation; harder for the optimizer to keep a computed value live without reloading from the stack.

## Register-based VMs — explicit operands, fewer moves

Register VMs map operands to virtual registers (fixed-size slots in a frame, not physical CPU registers). The same addition is often one instruction:

```text
ADD R1, R2, R3    ; R3 = R1 + R2
```

<img src="{{ site.baseurl }}/images/posts/stack-vs-register-based-vm/register-vm.png" alt="Register-based virtual machine with named registers R1 R2 R3 for operands" width="560px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 3. Register-based VM — operands and results are named explicitly.*

No push/pop traffic for that add. The interpreter's inner loop can dispatch fewer times for the same source-level expression.

**Pros:**

- Less stack traffic in the dispatch loop — often faster per opcode on register-starved mobile cores of the Dalvik era.
- **Common subexpression reuse:** if `(a + b)` appears twice, a register VM can compute once, keep the result in `v4`, and reuse it. Stack code may recompute and push again.

**Con:** instructions are wider — you must encode register numbers. Average DEX instructions are larger than stack-JVM opcodes, which affects `.dex` file size (the multidex era made that tradeoff visible).

## How this connects to Android

Java/Kotlin still compile through `.class` files, but Android's `d8`/R8 output is **DEX — a register-based IR**. ART (successor to Dalvik) compiles DEX to native code; the register shape of the bytecode is still the contract your APK ships.

Conceptually:

```text
// JVM-style (stack)
iload_1
iload_2
iadd

// DEX-style (registers)
add-int v0, v1, v2
```

You do not hand-write DEX, but you feel the model when R8 changes live ranges, when method count pushes you toward multidex, or when a verifier error mentions register width. The [Dalvik/ART post]({{ site.baseurl }}/dalvik-virtual-machine) walks the runtime side — Zygote fork, OAT compilation — this post is the **instruction-set** half of the same picture.

## Tradeoffs at a glance

| | Stack (JVM) | Register (DEX/Dalvik) |
|---|-------------|------------------------|
| Operand location | Evaluation stack | Named virtual registers |
| Typical add | Multiple push/pop ops | Often one `add-int`-style op |
| Instruction size | Smaller opcodes | Larger (register fields) |
| CSE / keeping temps | Reload from stack | Hold in a register slot |
| Android relevance | Desktop/server Java | APK bytecode ART runs |

Neither design is "better" in the abstract — JVM stack bytecode dominates server Java; Android picked registers for mobile bytecode density and interpreter performance tradeoffs that made sense when Dalvik shipped. If you are comparing stack traces from JNI or reading smali/dexdump output, you are looking at register names (`v0`, `v1`, …) — the same model [DEX and ART]({{ site.baseurl }}/dalvik-virtual-machine) still execute today.

## References

- [Dalvik bytecode format — AOSP](https://source.android.com/docs/core/runtime/dalvik-bytecode)
- [Android runtime and Dalvik — AOSP](https://source.android.com/docs/core/runtime)
- Mark Faction, *Stack-based vs register-based VM architecture and the Dalvik VM* ([markfaction.wordpress.com](https://markfaction.wordpress.com/2012/07/15/stack-based-vs-register-based-virtual-machine-architecture-and-the-dalvik-vm/))
- Ertl & Gregg, *The Structure and Performance of Efficient Interpreters* ([dl.acm.org](https://dl.acm.org/doi/10.1145/362066.362073)) — empirical stack vs register dispatch costs
