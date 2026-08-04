---
title: "Interrupt Handling in OP-TEE: IRQ, FIQ, and World Switches"
excerpt: "Secure IRQs in the wrong world hang SMCs. IRQ/FIQ and world-switch rules in OP-TEE."
date: 2020-03-20 12:45:00
tags: [Writing, Security]
draft: false
---

## When a secure interrupt lands in the wrong world

On a TrustZone phone, most of your debugging happens in normal world — logcat, gdb, perf. Secure world is a black box until something goes wrong: a TA hangs mid-call, an SMC never returns, or a non-secure driver IRQ fires while OP-TEE still holds the CPU in secure state. The failure mode is rarely “bad crypto”; it is **interrupt routing across worlds** — who saves context, who unmasks exceptions, and whether the Monitor gets involved at all.

I spent a lot of Ph.D. time on ARM secure display work ([Rushmore]({{ site.baseurl }}/rushmore)), where display and crypto paths cross the normal/secure boundary constantly. OP-TEE’s interrupt story is the plumbing underneath that boundary: SMC entry, GIC delivery, and the IRQ vs FIQ split that changed again in GICv3.

## Worlds, SMC, and the GIC contract

OP-TEE runs in **secure world (SW)**; Linux and Android run in **normal world (NW)**. They do not share one interrupt vector table. World switches go through the **Secure Monitor Call (SMC)** interface — the Monitor saves the outgoing world’s registers and restores the incoming world’s saved state.

The **Generic Interrupt Controller (GIC)** decides which interrupt line fires. On classic GICv2 setups OP-TEE targets:

- **IRQ** — *foreign* (non-secure) interrupt
- **FIQ** — *native* (secure) interrupt

Each world has its own exception vector base (`VBAR`). Same-world interrupts are handled locally. Cross-world interrupts require a context switch through the Monitor first, then delivery in the target world.

## Standard SMC entry from normal world

Normal world invokes `optee_os` with an SMC. On every switch the Monitor **saves the current world and restores the other** (NW ↔ SW).

Two SMC flavors matter for interrupts:

| SMC kind | Interrupt behavior while in secure world |
|----------|------------------------------------------|
| **Fast SMC** | IRQ and FIQ stay masked until return to NW |
| **Standard SMC** | After assigning a trusted thread (`core/arch/arm/kernel/thread.c`), entry still ends on the **entry stack with IRQ/FIQ blocked** |

Both paths block exceptions at the secure entry point — a deliberate invariant so half-finished trusted work is not preempted by the wrong interrupt class.

<img src="{{ site.baseurl }}/images/posts/interrupt-handling-in-op-tee/smc-entry-secure-world.png" alt="Flow from normal world SMC into OP-TEE secure world entry with interrupts blocked" width="680px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. SMC entry into secure world — IRQ/FIQ blocked on the entry stack.*

## IRQ and FIQ cases (GICv2)

The following matches **GICv2** routing (FIQ = secure, IRQ = non-secure). GICv3 re-labels some lines — see below.

### Non-secure IRQ while secure (`SCR_NS = 0`)

A foreign interrupt cannot be handled inside secure world. OP-TEE:

1. Saves the trusted-thread context
2. Masks all interrupts (IRQ and FIQ)
3. Switches to the entry stack
4. Restores **normal world** with a return code meaning “IRQ pending”
5. After NW handles the IRQ, it issues a **new SMC** to resume and finish the original call

<img src="{{ site.baseurl }}/images/posts/interrupt-handling-in-op-tee/irq-secure-world-forward.png" alt="Sequence when a non-secure IRQ arrives in secure world and is forwarded to normal world" width="67%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. IRQ in secure world — forward to normal world, then SMC back.*

### Non-secure IRQ while normal (`SCR_NS = 1`)

IRQ goes straight to NW’s `VBAR`. **Monitor and OP-TEE are not involved.** This is the common Android timer/network-interrupt path.

### Secure FIQ while normal (`SCR_NS = 1`)

Secure interrupts while NW runs require a full world switch:

1. Monitor saves NW, restores previous SW context
2. Clears `SCR_FIQ` when clearing `SCR_NS`
3. Passes an **FIQ** parameter into secure entry
4. SW unmasks FIQs, handles the exception vector, then SMCs back
5. Monitor saves SW, restores NW; execution resumes in NW

<img src="{{ site.baseurl }}/images/posts/interrupt-handling-in-op-tee/fiq-normal-world.png" alt="Sequence when a secure FIQ arrives in normal world and OP-TEE handles it in secure world" width="67%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 3. FIQ in normal world — Monitor switches into secure world to handle it.*

### Secure FIQ while secure (`SCR_NS = 0`)

FIQ is delivered through **secure world’s** `VBAR`. The Monitor stays out of the path — same-world handling again.

### FIQ while NW is finishing a forwarded IRQ

**FIQ beats IRQ in priority.** If a secure FIQ arrives while NW is still processing an IRQ that was forwarded from SW, context switches back to secure world for the FIQ, then returns to NW to complete the IRQ.

<img src="{{ site.baseurl }}/images/posts/interrupt-handling-in-op-tee/fiq-irq-nested.png" alt="Nested case where secure FIQ preempts normal world handling a forwarded IRQ" width="67%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 4. FIQ during forwarded IRQ — secure work preempts, then NW resumes.*

## GICv2 vs GICv3

| | GICv2 | GICv3 / v4 |
|---|-------|------------|
| Typical platform | ARMv7 boards | ARMv8-A (e.g. HiKey960) |
| Scale | Up to 8 PEs in classic layout | Affinity routing, **Redistributor** per core |
| Secure vs non-secure lines | FIQ = native, IRQ = foreign | Non-secure interrupt may arrive as **FIQ**, handled in EL3 Monitor (aarch64) or either world depending on config |
| OP-TEE knob | default GICv2 path | `CFG_ARM_GICV3=y` enables GICv3 mode |

If you port a TA from an older GICv2 board to aarch64, **do not assume IRQ always means “normal world only.”** Re-read the platform’s GIC config before blaming OP-TEE for “missing” secure interrupts.

On boards where I ran secure-display experiments, a “stuck” NW thread during an SMC often traced back to **IRQ forwarded out of SW** — the fix was understanding the second SMC resume, not rewriting the TA crypto path.

## References

- [OP-TEE OS documentation — interrupt handling](https://optee.readthedocs.io/en/latest/architecture/core.html#interrupt-handling)
- [OP-TEE OS source (GitHub)](https://github.com/OP-TEE/optee_os)
- ARM, *Generic Interrupt Controller Architecture Specification* — [GICv2](https://developer.arm.com/documentation/ihi0048/latest), [GICv3 and GICv4](https://developer.arm.com/documentation/ihi0069/latest)
