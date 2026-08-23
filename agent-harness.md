---
layout: agent_lab
title: Agent Harness Lab
permalink: /agent-harness/
robots: noindex, nofollow
excerpt: A private workshop for learning agent loops, tools, guardrails, eval, and RAG — paired with the Writing essays on this site. Checkboxes save in this browser.
---

## How to run this lab
{: #how-to-run}

Work top-down. Each phase has **prerequisites → learn links → checkable todos** (todos save in this browser).

1. Create a local folder `agent-lab/` for practice code (not a required GitHub repo).
2. Skim **Learn before you build** for that phase.
3. Check off subtasks as you finish them (items marked *Optional* do not block a phase).
4. Demo the failure mode before you “fix” it.
5. Re-read the linked Writing post with the lab still open.
6. Pass the phase bar out loud without notes.

Hardware: MacBook Pro with 24 GB is enough. Cloud Claude is the primary brain. Optional Ollama 7B is wiring literacy only.

<div class="lab-progress" id="lab-progress" hidden>
  <div class="lab-progress__track" aria-hidden="true">
    <div class="lab-progress__fill" id="lab-progress-fill"></div>
  </div>
  <p class="lab-progress__text" id="lab-progress-text"></p>
</div>
<p class="lab-reset-wrap"><button type="button" class="lab-reset" id="lab-reset-progress">Reset all checkboxes</button></p>

---

## Stack
{: #stack}

Think in layers. Don’t confuse a chat UI with a harness.

| Layer | Options | Use here |
| --- | --- | --- |
| **Brain** | Claude API · Ollama 7B | Claude for real failure modes; Ollama optional |
| **Runtime** | Hand-rolled loop · LangGraph · OpenClaw | Start hand-rolled; graphs later |
| **Channels** | OpenClaw · Open WebUI | Capstone / RAG UX compare |
| **Observe** | JSONL logs · Langfuse | Required once you hit eval |

<div class="lab-diagram" aria-label="Agent harness loop">
<pre class="lab-diagram__pre">
┌──────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐
│   goal   │────▶│  model  │────▶│  tools  │────▶│ observe  │
└──────────┘     └────┬────┘     └────┬────┘     └────┬─────┘
                      │               │               │
                      └───────────────┴───────◀───────┘
                                    stop?
</pre>
<p class="lab-diagram__cap">The harness owns the loop. The model proposes; tools act; observe decides whether to stop.</p>
</div>

LangChain/LangGraph sit in **runtime** — same tier as a loop you wrote yourself, not a Claude replacement.

---

## Phase 0 — Setup
{: #phase-0}

<div class="lab-card" markdown="1">

**Topic** Environment · **Essay** — · **Prior phases** none · **~4–6 hr**

Get a working Claude path and a place to put labs. No site post yet.

</div>

### Learn before you build
{: #phase-0-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Terminal / env vars | Run scripts | [macOS Terminal](https://support.apple.com/guide/terminal/welcome/mac) |
| Git basics | Version lab code | [Git handbook](https://docs.github.com/en/get-started/using-git) |
| Python 3 + venv | SDK | [venv docs](https://docs.python.org/3/tutorial/venv.html) |
| HTTP API → JSON | LLM calls | [MDN web APIs intro](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Introduction) |
| Tokens ≈ cost | Budget | [Anthropic pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) |

**References:** [Anthropic docs](https://docs.anthropic.com/) · [Messages API](https://docs.anthropic.com/en/api/messages) · [Ollama](https://ollama.com) · [Artificial Analysis](https://artificialanalysis.ai/)

### Todos
{: #phase-0-todos .lab-todos-h}

<ul class="lab-todos" data-phase="0">
  <li><label><input type="checkbox" data-todo="p0-1"> Create local folder <code>agent-lab/</code> + Python 3.11 venv</label></li>
  <li><label><input type="checkbox" data-todo="p0-2"> Anthropic API key + small credits; hello-world Messages call works</label></li>
  <li><label><input type="checkbox" data-todo="p0-3"> Explain tokens ≈ cost (one sentence in <code>NOTES.md</code>)</label></li>
  <li><label><input type="checkbox" data-todo="p0-4"> Skim OpenAI-compatible API idea (why Ollama can mimic it)</label></li>
  <li><label><input type="checkbox" data-todo="p0-5"> <em>Optional:</em> Ollama + 7–8B model; same prompt offline</label></li>
  <li><label><input type="checkbox" data-todo="p0-6"> 1-page notes: local vs cloud vs harness</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> chat turn from a script works, and you can explain tokens ≈ cost.</p>

---

## Phase 1 — Agent loop
{: #phase-1}

<div class="lab-card" markdown="1">

**Topic** Harness / “done” · **Essay** [The Agent Said Done — and CI Is Red](/agent-done-but-ci-red) · **Prior** 0 · **~9–12 hr**

Chat “done” and merge-ready are different signals. The **harness** must observe CI (or an equivalent gate) before stop.

</div>

<div class="lab-diagram" aria-label="Done vs CI">
<pre class="lab-diagram__pre">
  agent says "done" ──▶ harness checks fake CI
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           CI green        CI red         max steps
              │               │               │
           allow stop      keep looping    force stop
</pre>
<p class="lab-diagram__cap">Without the CI gate, “done” is just another chat token.</p>
</div>

### Learn before you build
{: #phase-1-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phase 0 done | Working Claude path | — |
| Message roles (system / user / assistant) | Loop state | [Messages API](https://docs.anthropic.com/en/api/messages) |
| JSON in Python | Tool args | [json module](https://docs.python.org/3/library/json.html) |
| ReAct (high level) | Loop shape | [ReAct paper](https://arxiv.org/abs/2210.03629) (skim) |
| CI / PR gates | Done ≠ merge | [GH Actions quickstart](https://docs.github.com/en/actions/writing-workflows/quickstart) · essay Prerequisites |

**References:** [Anthropic tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) · [Building effective agents](https://www.anthropic.com/research/building-effective-agents) · [Essay](/agent-done-but-ci-red)

### Todos
{: #phase-1-todos .lab-todos-h}

<ul class="lab-todos" data-phase="1">
  <li><label><input type="checkbox" data-todo="p1-1"> Hand-roll loop: messages → Claude → tool → observe (1–2 fake tools)</label></li>
  <li><label><input type="checkbox" data-todo="p1-2"> Stop rules: <code>done</code>, max steps, budget (no infinite loop)</label></li>
  <li><label><input type="checkbox" data-todo="p1-3"> Fake CI red/green; block false “done” until green</label></li>
  <li><label><input type="checkbox" data-todo="p1-4"> JSONL step log; replay one failure</label></li>
  <li><label><input type="checkbox" data-todo="p1-5"> Re-read <a href="/agent-done-but-ci-red">the essay</a>; teach claim + failure mode + fix without notes</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> agent may only claim done when CI is green — and you can teach why chat “done” ≠ merge.</p>

---

## Phase 2 — Tools
{: #phase-2}

<div class="lab-card" markdown="1">

**Topic** Tool surface · **Essay** [Your Agent Has Too Many Tools](/agent-too-many-tools) · **Prior** 0–1 · **~6–7 hr**

The model only sees schemas. A bloated catalog is a harness bug: access ≠ expertise.

</div>

<div class="lab-diagram" aria-label="Tool surface comparison">
<pre class="lab-diagram__pre">
  allowlist (5)          flood (20)
  ┌─────────────┐        ┌─────────────┐
  │ read_file   │        │ read_file   │
  │ write_file  │        │ write_file  │
  │ run_tests   │   vs   │ + 15 junk   │
  │ git_status  │        │   schemas   │
  │ search      │        │   (noise)   │
  └─────────────┘        └─────────────┘
       fewer steps            more tokens / thrash
</pre>
</div>

### Learn before you build
{: #phase-2-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phase 1 loop | Tools plug into harness | — |
| Tool schema (name, description, JSON params) | Model only sees schema | [Tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) |
| Filesystem paths / cwd | Coding tools | — |
| Prompt bloat / token cost | Too many tools hurts | [Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) |

**References:** [Anthropic tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) · [LangChain tools](https://python.langchain.com/docs/concepts/tools/) (opt.) · [Essay](/agent-too-many-tools)

### Todos
{: #phase-2-todos .lab-todos-h}

<ul class="lab-todos" data-phase="2">
  <li><label><input type="checkbox" data-todo="p2-1"> Allowlist ~5 tools; small coding task succeeds</label></li>
  <li><label><input type="checkbox" data-todo="p2-2"> Add ~15 junk tools; compare quality + thrash</label></li>
  <li><label><input type="checkbox" data-todo="p2-3"> Write step/token table in <code>NOTES.md</code> (access ≠ expertise)</label></li>
  <li><label><input type="checkbox" data-todo="p2-4"> Decide what you’d cut first on a real Android monorepo agent</label></li>
  <li><label><input type="checkbox" data-todo="p2-5"> Re-read <a href="/agent-too-many-tools">the essay</a>; teach it without notes</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> you have a measured comparison and can explain why tool bloat is a harness problem.</p>

---

## Phase 3 — Skills & memory
{: #phase-3}

<div class="lab-card" markdown="1">

**Topic** Rules that survive chat amnesia · **Essays** [Forgot the Constraint](/agent-forgot-the-constraint) · [Monorepo Navigable to Agents](/monorepo-navigable-to-agents) · **Prior** 0–2 · **~6–8 hr**

Durable rules live in files / system prompt — not in yesterday’s chat scrollback.

</div>

<div class="lab-diagram" aria-label="Cold start with AGENTS.md">
<pre class="lab-diagram__pre">
  cold session
       │
       ▼
  ┌────────────┐     ┌──────────────┐
  │ AGENTS.md  │────▶│ toy monorepo │
  │ + repo map │     │   agent run  │
  └────────────┘     └──────┬───────┘
                            │
              stale memory.json (lies) ──▶ rules must win
</pre>
</div>

### Learn before you build
{: #phase-3-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phase 1–2 | Rules constrain tools | — |
| System vs user messages | Durable rules live in system / files | [Messages API](https://docs.anthropic.com/en/api/messages) |
| Finite context | Can’t paste whole repo | [Context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows) |
| Monorepo layout | Navigability | Your day job |

**References:** [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code) · [AGENTS.md](https://agents.md/) · [Constraint essay](/agent-forgot-the-constraint) · [Monorepo essay](/monorepo-navigable-to-agents)

### Todos
{: #phase-3-todos .lab-todos-h}

<ul class="lab-todos" data-phase="3">
  <li><label><input type="checkbox" data-todo="p3-1"> Write <code>AGENTS.md</code> + stack map + “never touch secrets/”</label></li>
  <li><label><input type="checkbox" data-todo="p3-2"> Add a stale memory file that gaslights the model; prove rules win</label></li>
  <li><label><input type="checkbox" data-todo="p3-3"> 1-page monorepo map; cold start works with only the map</label></li>
  <li><label><input type="checkbox" data-todo="p3-4"> Re-read <a href="/agent-forgot-the-constraint">constraint</a> then <a href="/monorepo-navigable-to-agents">monorepo</a>; teach both</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> cold start with only the map holds constraints — no paste of prior chat.</p>

---

## Phase 4 — Guardrails
{: #phase-4}

<div class="lab-card" markdown="1">

**Topic** Trust boundaries · **Essay** [Agent Trust Boundaries](/agent-trust-boundaries) · **Prior** 0–2 (3 recommended) · **~6–9 hr**

Side-effects need real approvals. Tool return values can lie — verify after write.

</div>

<div class="lab-diagram" aria-label="Tool trust tiers">
<pre class="lab-diagram__pre">
  tool call
     │
     ├─ read ──────────────▶ auto-allow (still log)
     ├─ write ─────────────▶ allow + verify-after
     └─ side-effect ───────▶ human “yes” required
                              (deploy, push, delete, …)
</pre>
</div>

### Learn before you build
{: #phase-4-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phase 2 allowlists | Guardrails wrap tools | — |
| Least privilege | Side-effect blast radius | [OWASP authz cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) (skim) |
| Human-in-the-loop | Approvals that matter | [Building effective agents](https://www.anthropic.com/research/building-effective-agents) |
| Verify-after-write | Lying tools | — |
| Prompt injection / secrets | Don’t leak keys | [Anthropic guardrails](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/overview) |

**References:** [Strengthen guardrails](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/overview) · [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) · [Essay](/agent-trust-boundaries)

### Todos
{: #phase-4-todos .lab-todos-h}

<ul class="lab-todos" data-phase="4">
  <li><label><input type="checkbox" data-todo="p4-1"> Classify tools: read / write / side-effect (matrix in NOTES)</label></li>
  <li><label><input type="checkbox" data-todo="p4-2"> Approval gate for side-effects (blocked until “yes”)</label></li>
  <li><label><input type="checkbox" data-todo="p4-3"> Lying tool + verify-after-write catches the lie</label></li>
  <li><label><input type="checkbox" data-todo="p4-4"> Name one thing you’d never auto-approve on a production Android pipeline</label></li>
  <li><label><input type="checkbox" data-todo="p4-5"> Re-read <a href="/agent-trust-boundaries">the essay</a>; teach theater vs real approvals</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> side-effects need a real “yes”, and verify-after-write catches a lying tool.</p>

---

## Phase 5 — Planning
{: #phase-5}

<div class="lab-card" markdown="1">

**Topic** Plan vs theater · **Essay** [Planning Theater vs a Real Plan](/planning-theater-vs-real-plan) · **Prior** 0–1 (2 recommended) · **~4–11 hr**

A plan is useful only if the harness updates it when blocked. A stale plan is theater.

</div>

<div class="lab-diagram" aria-label="React vs plan-then-act">
<pre class="lab-diagram__pre">
  react-only                    plan-then-act
  goal → act → act → …          goal → plan.md → act → update plan
                                      │                │
                                   (ignored?)      (live state)
</pre>
</div>

### Learn before you build
{: #phase-5-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phase 1 stop conditions | Plan is loop state | — |
| ReAct vs plan-and-execute | Two strategies | [ReAct](https://arxiv.org/abs/2210.03629) · [Effective agents](https://www.anthropic.com/research/building-effective-agents) |
| Good eng plan (AC, risks) | Avoid theater | Your design docs |
| *(Opt.)* Graphs | LangGraph | [LangGraph concepts](https://langchain-ai.github.io/langgraph/concepts/) |

**References:** [LangGraph](https://langchain-ai.github.io/langgraph/) · [Essay](/planning-theater-vs-real-plan)

### Todos
{: #phase-5-todos .lab-todos-h}

<ul class="lab-todos" data-phase="5">
  <li><label><input type="checkbox" data-todo="p5-1"> Same bug twice: react-only vs plan-then-act (two transcripts)</label></li>
  <li><label><input type="checkbox" data-todo="p5-2"> Persist <code>plan.md</code>; update when blocked; avoid one rewrite</label></li>
  <li><label><input type="checkbox" data-todo="p5-3"> <em>Optional:</em> sketch same flow in LangGraph</label></li>
  <li><label><input type="checkbox" data-todo="p5-4"> Re-read <a href="/planning-theater-vs-real-plan">the essay</a>; teach what makes a plan theater</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> updating the plan once prevents a rewrite — and you can spot a stale plan.</p>

---

## Phase 6 — Subagents
{: #phase-6}

<div class="lab-card" markdown="1">

**Topic** Orchestrator + workers · **Essay** [Subagents That Argue](/subagents-that-argue) · **Prior** 0–2 (5 recommended) · **~5–13 hr**

Two agents can burn tokens arguing. Log dual cost and add a skip rule.

</div>

<div class="lab-diagram" aria-label="Orchestrator and workers">
<pre class="lab-diagram__pre">
                 ┌──────────────┐
                 │ orchestrator │
                 └──────┬───────┘
            ┌───────────┼───────────┐
            ▼                       ▼
     ┌────────────┐          ┌────────────┐
     │ researcher │          │   coder    │
     └────────────┘          └────────────┘
            │                       │
            └──────────┬────────────┘
                       ▼
              cost(A) + cost(B)  →  skip rule?
</pre>
</div>

### Learn before you build
{: #phase-6-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phase 1–2 | Multiple harnesses | — |
| Orchestrator / worker | Delegation | [Building effective agents](https://www.anthropic.com/research/building-effective-agents) |
| Dual token cost | “Pay for both” | [Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) |
| *(Opt.)* Chat bots | OpenClaw | [OpenClaw channels](https://docs.openclaw.ai/channels) |

**References:** [OpenClaw multi-agent](https://docs.openclaw.ai/concepts/multi-agent) · [LangGraph multi-agent](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/multi_agent_collaboration/) (opt.) · [Essay](/subagents-that-argue)

### Todos
{: #phase-6-todos .lab-todos-h}

<ul class="lab-todos" data-phase="6">
  <li><label><input type="checkbox" data-todo="p6-1"> Orchestrator + researcher + coder; one task uses both</label></li>
  <li><label><input type="checkbox" data-todo="p6-2"> Dual-cost log + a skip rule when second agent adds no value</label></li>
  <li><label><input type="checkbox" data-todo="p6-3"> <em>Optional:</em> two OpenClaw personas with clear bindings</label></li>
  <li><label><input type="checkbox" data-todo="p6-4"> Re-read <a href="/subagents-that-argue">the essay</a>; show when two agents create cost without value</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> you can show dual-cost numbers and a skip rule you’d actually ship.</p>

---

## Phase 7 — Eval
{: #phase-7}

<div class="lab-card" markdown="1">

**Topic** Ship bar · **Essay** [“It Worked Once in Chat” Is Not a Ship Bar](/agent-eval-not-a-demo) · **Prior** 0–2 (4 recommended) · **~6–13 hr**

One lucky chat is a demo. A ship bar is a fixed suite with intentional fails.

</div>

<div class="lab-diagram" aria-label="Eval loop">
<pre class="lab-diagram__pre">
  evals/cases.json ──▶ runner ──▶ pass/fail report
         │                           │
    ≥10 fixed cases            ≥1 intentional fail
         │                           │
         └──────────▶ PR gate metric ┘
</pre>
</div>

### Learn before you build
{: #phase-7-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Headless Phase 1 harness | Many automated runs | — |
| Test / CI mindset | Pass/fail | Your Android CI |
| Golden fixtures | Fixed cases | [Langfuse eval overview](https://langfuse.com/docs/evaluation/overview) (skim) |
| Traces | Debug runs | [Langfuse tracing](https://langfuse.com/docs/tracing) |

**References:** [Langfuse docs](https://langfuse.com/docs) · [Essay](/agent-eval-not-a-demo)

### Todos
{: #phase-7-todos .lab-todos-h}

<ul class="lab-todos" data-phase="7">
  <li><label><input type="checkbox" data-todo="p7-1"> Write ≥10 fixed cases in <code>evals/cases.json</code></label></li>
  <li><label><input type="checkbox" data-todo="p7-2"> Runner prints pass/fail (CI-able script)</label></li>
  <li><label><input type="checkbox" data-todo="p7-3"> Include at least one intentional fail in the suite</label></li>
  <li><label><input type="checkbox" data-todo="p7-4"> Pick a metric you’d put on a PR gate for an agent change</label></li>
  <li><label><input type="checkbox" data-todo="p7-5"> <em>Optional:</em> Langfuse traces for a handful of runs</label></li>
  <li><label><input type="checkbox" data-todo="p7-6"> Re-read <a href="/agent-eval-not-a-demo">the essay</a>; teach why chat ≠ ship bar</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> report has ≥10 cases, ≥1 intentional fail, and a PR-gate metric you’d stand behind.</p>

---

## Phase 8 — Judgment & ops
{: #phase-8}

<div class="lab-card" markdown="1">

**Topic** When agents make you slower · **Essays** [Makes You Slower](/when-agents-make-you-slower) · [Overnight PR Fantasy](/overnight-agent-pr-fantasy) · [Bot on PR](/bot-commented-on-pr-nobody-owns) · **Prior** 0–1, 4, 7 · **~6–10 hr**

Overnight **draft** can be fine. Overnight **merge** is fantasy. Someone must own bot comments.

</div>

<div class="lab-diagram" aria-label="Overnight draft vs merge">
<pre class="lab-diagram__pre">
  night job
     │
     ▼
  draft PR / ticket ──▶ morning checklist ──▶ human merge?
     │
     ✗ auto-merge        (don’t)
</pre>
</div>

### Learn before you build
{: #phase-8-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phases 1, 4, 7 | Judgment uses loop + safety + eval | — |
| Babysitting / opportunity cost | Agents can slow you | — |
| Cron / n8n | Overnight jobs | [crontab.guru](https://crontab.guru/) · [n8n docs](https://docs.n8n.io/) |
| Draft PR ≠ merge | Fantasy check | GitHub PR flow |

**References:** [n8n docs](https://docs.n8n.io/) · [Slower](/when-agents-make-you-slower) · [Overnight](/overnight-agent-pr-fantasy) · [Bot ownership](/bot-commented-on-pr-nobody-owns)

### Todos
{: #phase-8-todos .lab-todos-h}

<ul class="lab-todos" data-phase="8">
  <li><label><input type="checkbox" data-todo="p8-1"> Rubric: 5 tasks agents should <em>not</em> own yet</label></li>
  <li><label><input type="checkbox" data-todo="p8-2"> Overnight job → <strong>draft</strong> PR or ticket only (no auto-merge)</label></li>
  <li><label><input type="checkbox" data-todo="p8-3"> Morning checklist written; postmortem: time saved vs babysitting</label></li>
  <li><label><input type="checkbox" data-todo="p8-4"> Re-read <a href="/when-agents-make-you-slower">slower</a> + <a href="/overnight-agent-pr-fantasy">overnight</a></label></li>
  <li><label><input type="checkbox" data-todo="p8-5"> Skim <a href="/bot-commented-on-pr-nobody-owns">bot ownership</a>; name who owns a bad bot comment</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> you can name tickets where the agent babysits you — and who owns a bad bot comment.</p>

---

## Phase 9 — Context & RAG
{: #phase-9}

<div class="lab-card" markdown="1">

**Topic** Wrong chunk, confident answer · **Essay** [Wrong Chunk, Confident Answer](/wrong-chunk-confident-answer) · **Prior** 0–1 (3 recommended) · **~6–14 hr**

Bad retrieval + high confidence is worse than “I don’t know.” Hooks set session context; RAG is optional.

</div>

<div class="lab-diagram" aria-label="RAG failure mode">
<pre class="lab-diagram__pre">
  query ──▶ retrieve chunks ──▶ model answers
                  │
            wrong chunk
                  │
                  ▼
           confident wrong answer
                  │
                  ▼
           refuse / re-retrieve / cite
</pre>
</div>

### Learn before you build
{: #phase-9-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phase 1 system inject | Hooks mutate context | — |
| Embeddings / vectors | Retrieval | [HF embeddings chapter](https://huggingface.co/learn/nlp-course/chapter5/1) |
| Chunking tradeoffs | Wrong chunk | [LangChain RAG tutorial](https://python.langchain.com/docs/tutorials/rag/) · essay Prerequisites |
| Hallucination vs bad retrieval | Diagnose confidence | [Reduce hallucinations](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |

**References:** [LangChain RAG](https://python.langchain.com/docs/tutorials/rag/) · [Open WebUI](https://openwebui.com) · [Essay](/wrong-chunk-confident-answer) · [Bot ownership](/bot-commented-on-pr-nobody-owns) (hooks in CI)

### Todos
{: #phase-9-todos .lab-todos-h}

<ul class="lab-todos" data-phase="9">
  <li><label><input type="checkbox" data-todo="p9-1"> Session-start hook: repo map + date + policy (same preamble every run)</label></li>
  <li><label><input type="checkbox" data-todo="p9-2"> Minimal RAG over NOTES + one PDF; answers cite chunks</label></li>
  <li><label><input type="checkbox" data-todo="p9-3"> Poison retrieval once; observe confident wrong answer; note mitigation</label></li>
  <li><label><input type="checkbox" data-todo="p9-4"> Write when repo search is enough and RAG is the wrong tool</label></li>
  <li><label><input type="checkbox" data-todo="p9-5"> <em>Optional:</em> Open WebUI RAG vs code RAG comparison</label></li>
  <li><label><input type="checkbox" data-todo="p9-6"> Re-read <a href="/wrong-chunk-confident-answer">the essay</a>; demo refuse / re-retrieve</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> you can demo wrong chunk → confident wrong → refuse / re-retrieve.</p>

---

## Phase 10 — Capstone (optional)
{: #phase-10}

<div class="lab-card" markdown="1">

**Topic** Always-on team · **Essay** — (synthesis) · **Prior** 1–2, 4, 6–7 · **~7–17 hr**

Optional. Convenience must not delete approvals (phase 4) or eval (phase 7).

</div>

### Learn before you build
{: #phase-10-learn .lab-learn-h}

| Knowledge | Why | Refresh |
| --- | --- | --- |
| Phases 1–2, 4, 6–7 | Capstone reuses them | — |
| Agent gateway / channels | Always-on team | [OpenClaw docs](https://docs.openclaw.ai/) |
| Claude as provider | Auth + models | [OpenClaw Anthropic](https://docs.openclaw.ai/providers/anthropic) |
| *(Opt.)* Remote access | Phone → gateway | [Tailscale KB](https://tailscale.com/kb) |

**References:** [OpenClaw](https://docs.openclaw.ai/) · [Tailscale](https://tailscale.com/kb) · Essays reading map below

### Todos
{: #phase-10-todos .lab-todos-h}

<ul class="lab-todos" data-phase="10">
  <li><label><input type="checkbox" data-todo="p10-1"> Small multi-agent setup (OpenClaw or LangGraph) reusing phases 4 + 7</label></li>
  <li><label><input type="checkbox" data-todo="p10-2"> Approvals still required for side-effects</label></li>
  <li><label><input type="checkbox" data-todo="p10-3"> Eval bar still runs before you trust a change</label></li>
  <li><label><input type="checkbox" data-todo="p10-4"> Walk all essay URLs; mark teach-back pass/fail in NOTES</label></li>
  <li><label><input type="checkbox" data-todo="p10-5"> <em>Optional:</em> touch up one Writing post from a lab insight</label></li>
</ul>

<p class="lab-pass"><strong>Pass when:</strong> approvals and eval still exist — or you skip this phase because 1–9 already feel solid.</p>

---

## Essays (reading map)
{: #essays}

Open **after** the matching lab, not before.

| Phase | Essay |
| --- | --- |
| 1 | [The Agent Said Done — and CI Is Red](/agent-done-but-ci-red) |
| 2 | [Your Agent Has Too Many Tools](/agent-too-many-tools) |
| 3 | [Forgot the Constraint](/agent-forgot-the-constraint) · [Monorepo Navigable to Agents](/monorepo-navigable-to-agents) |
| 4 | [Agent Trust Boundaries](/agent-trust-boundaries) |
| 5 | [Planning Theater vs a Real Plan](/planning-theater-vs-real-plan) |
| 6 | [Subagents That Argue](/subagents-that-argue) |
| 7 | [Eval Is Not a Demo](/agent-eval-not-a-demo) |
| 8 | [Makes You Slower](/when-agents-make-you-slower) · [Overnight PR Fantasy](/overnight-agent-pr-fantasy) · [Bot on PR](/bot-commented-on-pr-nobody-owns) |
| 9 | [Wrong Chunk, Confident Answer](/wrong-chunk-confident-answer) |

---

## Finish line
{: #finish}

You’re done with this lab when you can:

- Rebuild a **harness** (goal → model → tools → observe → stop) without a template paste.
- Teach each linked essay’s claim, failure mode, and fix.
- Defend **tool surface**, **guardrails**, **eval bar**, and when *not* to use an agent.
- Optionally run the same loop shape against a local 7B — knowing quality isn’t the point.

Not a goal: matching Claude with a local 70B.
