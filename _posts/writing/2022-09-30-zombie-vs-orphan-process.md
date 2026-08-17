---
title: "Zombie vs Orphan Processes: What ps Is Actually Showing"
excerpt: "Zombie vs orphan look similar in ps and are not. What the kernel is actually telling you."
date: 2022-09-30 12:00:00
tags: [Writing, Linux]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>zombie (defunct) processes</strong>, <strong>orphans</strong>, or <strong>fork/wait</strong> are new.</p>
    <ul>
      <li><a href="https://en.wikipedia.org/wiki/Zombie_process">Zombie process</a> — exited, still in the table until the parent waits; <code>kill -9</code> does nothing</li>
      <li><a href="https://en.wikipedia.org/wiki/Orphan_process">Orphan process</a> — child still running after the parent is gone (reparented to init)</li>
      <li><a href="https://man7.org/linux/man-pages/man2/wait.2.html">wait(2)</a> — how a parent reads exit status and reaps the child</li>
      <li><a href="https://man7.org/linux/man-pages/man2/fork.2.html">fork(2)</a> — creating a child; why parent vs child (and PPID) matter</li>
    </ul>
  </div>
</details>

## The ps line that will not die

You run `ps aux | grep my-server` and see `<defunct>` or a state column of `Z`. `kill -9` does nothing. Or the opposite: a worker keeps running after its supervisor crashed, PPID now `1`. Both look like “something is wrong with processes,” but the fix paths diverge completely — one is a **parent that never reaped**, the other is a **child that outlived its parent**.

I taught OS labs long enough to see students reach for `kill -9` on zombies every time. It never works. The process is already dead; the kernel is waiting on the parent.

## Zombie (defunct) — exited, not reaped

A **zombie** (defunct) process has **finished execution** but still occupies a row in the process table. The kernel keeps a minimal `struct task_struct` so the parent can read the **exit status** via `wait()`, `waitpid()`, or `wait4()`.

<img src="{{ site.baseurl }}/images/posts/zombie-vs-orphan-process/zombie-process.png" alt="Diagram of a zombie child process waiting for its parent to call wait" width="360px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Zombie — child exited; parent has not reaped.*

Symptoms:

```bash
ps -eo pid,ppid,stat,cmd | awk '$3 ~ /Z/'
# STAT column shows Z or Z+
```

You **cannot kill a zombie directly** — there is no user code left to signal. Fix the **parent**:

- Restart or patch the parent so it calls `wait()` on SIGCHLD
- Kill the parent (zombie becomes orphaned; see below)
- If the parent is PID 1 and stuck, you may need a reboot — init normally reaps quickly, so persistent zombies under init signal a broken init or driver bug

Zombies use almost no memory (just the process-table slot) but consume a **PID**. Enough of them exhaust the PID space and new processes fail to start — a real production failure on long-lived servers with buggy supervisors.

Minimal bug pattern:

```c
// parent spawns child, never waits — zombie on every exit
pid_t c = fork();
if (c == 0) { _exit(0); }
// missing: wait(&status);
```

Fix in long-running servers — reap on `SIGCHLD`:

```c
void on_sigchld(int sig) {
    (void)sig;
    while (waitpid(-1, NULL, WNOHANG) > 0) { }
}
// signal(SIGCHLD, on_sigchld);  // plus SA_RESTART / sigaction as appropriate
```

The `WNOHANG` loop drains every exited child in one signal delivery — important when several workers finish close together.

## Orphan — parent gone, child still running

An **orphan** is a process whose **parent terminated first** while the child keeps running. The kernel **re-parents** it to **PID 1** (`init` or `systemd`), which eventually reaps it when the child exits.

<img src="{{ site.baseurl }}/images/posts/zombie-vs-orphan-process/orphan-process.png" alt="Diagram of an orphan process adopted by init after its parent exits" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. Orphan — parent died; init adopts the child.*

Unlike zombies, orphans are **live processes** — memory, file descriptors, CPU time. You can `kill -9` them normally:

```bash
kill -9 <orphan-pid>
```

Too many long-lived orphans can stress init’s reap loop, but the usual concern is **resource leak** (open sockets, temp files), not PID table slots. A runaway orphan holding a listening port is a **`kill` problem**; a defunct row in `ps` is a **`wait()` problem**.

## Side-by-side

| | Zombie (defunct) | Orphan |
|---|------------------|--------|
| Process state | Already exited | Still running |
| Who to fix | Parent must `wait()` | Kill child or fix supervisor lifecycle |
| `kill -9` on child | No effect | Works |
| Memory / CPU | Minimal (table entry) | Full process cost |
| Typical PPID | Original parent (not reaping) | `1` after re-parenting |

## Debugging checklist

1. **`ps -eo pid,ppid,stat,cmd`** — `Z` in STAT → zombie; PPID `1` on a long worker → likely orphan
2. **Find parent of zombies:** `ps -o ppid= -p <zombie-pid>` then inspect/kill parent
3. **Server code:** install SIGCHLD handler or reap in a loop; use double-fork daemon pattern only when you understand who owns reap
4. **Containers:** PID 1 in the namespace must reap — minimal images that run app as PID 1 without an init wrapper (`tini`, `dumb-init`) are a common zombie source
5. **Double-fork daemons:** the classic backgrounding pattern can orphan intentionally; know who owns reap before copying boilerplate

When a zombie’s parent is already gone, init usually reaps it within milliseconds — so **a screen full of `<defunct>` almost always means a living parent is ignoring SIGCHLD**, not an init problem.

## References

- `man 2 wait`, `man 2 fork`, `man 7 signal` — Linux programmer’s manual
- Silberschatz, Galvin, Gagne, *Operating System Concepts* — process termination and orphan handling
