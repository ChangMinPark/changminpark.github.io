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
3. Open each todo’s **How** link for step-by-step instructions and external guides.
4. Check off subtasks as you finish them (items marked *Optional* do not block a phase).
5. Demo the failure mode before you “fix” it.
6. Re-read the linked Writing post with the lab still open.
7. Pass the phase bar out loud without notes.

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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p0-1"> Create local folder <code>agent-lab/</code> + Python 3.11 venv</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p0-1" data-guide="guide-p0-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p0-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>In Terminal: <code>mkdir -p ~/agent-lab && cd ~/agent-lab</code> (or another path you prefer).</li>
        <li>Create a venv: <code>python3.11 -m venv .venv</code> (or <code>python3 -m venv .venv</code> if 3.11+).</li>
        <li>Activate: <code>source .venv/bin/activate</code>. Confirm with <code>python --version</code>.</li>
        <li>Init git optionally: <code>git init</code>. Add a <code>.gitignore</code> with <code>.venv/</code>, <code>.env</code>, <code>__pycache__/</code>.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.python.org/3/tutorial/venv.html">venv docs</a> · <a href="https://support.apple.com/guide/terminal/welcome/mac">macOS Terminal</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Folder exists, venv activates, and <code>python</code> points at the venv.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p0-2"> Anthropic API key + small credits; hello-world Messages call works</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p0-2" data-guide="guide-p0-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p0-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Create an API key in the Anthropic Console and add ~$5–20 credits.</li>
        <li>Store it outside git: <code>echo 'export ANTHROPIC_API_KEY=sk-…' >> ~/.zshrc</code> or a local <code>.env</code> loaded by your script (never commit the key).</li>
        <li>Install the SDK: <code>pip install anthropic</code>.</li>
        <li>Write <code>00-setup/hello.py</code> that calls the Messages API with a one-line prompt and prints the text reply.</li>
        <li>Run it; fix auth/model errors until you get a normal assistant string.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.anthropic.com/en/api/messages">Messages API</a> · <a href="https://docs.anthropic.com/en/api/getting-started">Getting started</a> · <a href="https://docs.anthropic.com/en/api/client-sdks">Client SDKs</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> A script prints a Claude reply without pasting the key into chat history.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p0-3"> Explain tokens ≈ cost (one sentence in <code>NOTES.md</code>)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p0-3" data-guide="guide-p0-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p0-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Skim Anthropic pricing: input vs output tokens, and that tools/long context multiply cost.</li>
        <li>In <code>NOTES.md</code>, write one sentence you could say out loud (e.g. “tokens are the billable units; more prompt + more tool thrash = higher $”).</li>
        <li>Optional: log <code>usage</code> from one API response and note input/output counts.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.anthropic.com/en/docs/about-claude/pricing">Anthropic pricing</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> <code>NOTES.md</code> has that sentence, and you can explain it without opening the page.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p0-4"> Skim OpenAI-compatible API idea (why Ollama can mimic it)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p0-4" data-guide="guide-p0-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p0-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Read that many local servers expose a Chat Completions-shaped HTTP API (OpenAI-compatible).</li>
        <li>Note the difference: Anthropic Messages vs OpenAI chat/completions — same “HTTP JSON in, JSON out” idea, different schemas.</li>
        <li>Write 2–3 lines in <code>NOTES.md</code>: why pointing a client at <code>localhost</code> Ollama can “look like” cloud if the client speaks the compatible shape.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://github.com/ollama/ollama/blob/main/docs/openai.md">Ollama OpenAI compatibility</a> · <a href="https://platform.openai.com/docs/api-reference/chat">OpenAI Chat Completions</a> (shape only)</p>
      <p class="lab-guide__done"><strong>Done when:</strong> You can explain “compatible API” without claiming the models are equal.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p0-5"> <em>Optional:</em> Ollama + 7–8B model; same prompt offline</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p0-5" data-guide="guide-p0-5">How</button>
    </div>
    <div class="lab-guide" id="guide-p0-5" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Install Ollama from the site; pull a small model (e.g. <code>ollama pull llama3.1:8b</code> or <code>qwen2.5:7b</code>).</li>
        <li>Run the same prompt via <code>ollama run …</code> and via HTTP if you want.</li>
        <li>In <code>NOTES.md</code>: one line on quality vs Claude — purpose is wiring literacy, not matching quality.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://ollama.com">Ollama</a> · <a href="https://github.com/ollama/ollama/blob/main/docs/api.md">Ollama API</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Offline reply works; you know this is ops practice, not the primary brain.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p0-6"> 1-page notes: local vs cloud vs harness</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p0-6" data-guide="guide-p0-6">How</button>
    </div>
    <div class="lab-guide" id="guide-p0-6" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Create/extend <code>NOTES.md</code> with three short sections: <strong>local model</strong>, <strong>cloud model</strong>, <strong>harness</strong>.</li>
        <li>Harness = loop you own (goal → model → tools → observe → stop), not the chat UI.</li>
        <li>One example of confusing a chat app with a harness (e.g. “Claude said done” with no CI check).</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong> Stack diagram on this page · <a href="https://www.anthropic.com/research/building-effective-agents">Building effective agents</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> A stranger could read the page and tell those three apart.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p1-1"> Hand-roll loop: messages → Claude → tool → observe (1–2 fake tools)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p1-1" data-guide="guide-p1-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p1-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Create <code>01-loop/agent.py</code>: a list of messages (system + user).</li>
        <li>Call Claude with <strong>tools</strong> defined (start with 1–2 fakes, e.g. <code>get_time</code>, <code>echo</code>).</li>
        <li>When the model returns a tool_use block, run your Python function, append a tool_result message, call again.</li>
        <li>Repeat until the model returns plain text (or you hit a stop rule in the next todo).</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview">Tool use overview</a> · <a href="https://docs.anthropic.com/en/api/messages">Messages API</a> · <a href="https://www.anthropic.com/research/building-effective-agents">Building effective agents</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> You can watch 1–2 fake tools fire in a real multi-turn loop.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p1-2"> Stop rules: <code>done</code>, max steps, budget (no infinite loop)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p1-2" data-guide="guide-p1-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p1-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Add a hard <code>max_steps</code> (e.g. 8). Exit with a clear “stopped: max steps” message.</li>
        <li>Add a budget guard: stop if estimated tokens or $ exceeds a tiny cap you set in config.</li>
        <li>Define a <code>done</code> signal the harness understands (tool or structured flag) — model text alone is not enough yet.</li>
        <li>Force a case that would loop forever without the cap; prove the harness stops.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://www.anthropic.com/research/building-effective-agents">Effective agents (stop / orchestration)</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> A runaway prompt cannot spin forever; logs show which stop rule fired.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p1-3"> Fake CI red/green; block false “done” until green</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p1-3" data-guide="guide-p1-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p1-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Add a fake CI tool or file flag: <code>ci_status.json</code> with <code>{"status":"red"}</code> / <code>green</code>.</li>
        <li>Harness rule: refuse to accept “done” while status is red (keep looping or fail closed).</li>
        <li>Demo: agent claims done → harness checks CI → still red → continues or reports blocked.</li>
        <li>Flip to green; only then allow stop. Match the essay’s thesis in a 30-second demo.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-done-but-ci-red">Essay: Agent Said Done</a> · <a href="https://docs.github.com/en/actions/writing-workflows/quickstart">GH Actions quickstart</a> (real CI mental model)</p>
      <p class="lab-guide__done"><strong>Done when:</strong> You can demo false “done” blocked until fake CI is green.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p1-4"> JSONL step log; replay one failure</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p1-4" data-guide="guide-p1-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p1-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>After every step, append one JSON object to <code>runs/run-….jsonl</code>: step #, role, tool name, summary, stop reason.</li>
        <li>Reproduce a failure once (bad tool result or red CI).</li>
        <li>Write a tiny <code>replay.py</code> that prints the JSONL chronologically so you can narrate the failure without re-calling the API.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://jsonlines.org/">JSON Lines</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> You can replay one failed run from the log alone.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p1-5"> Re-read <a href="/agent-done-but-ci-red">the essay</a>; teach claim + failure mode + fix without notes</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p1-5" data-guide="guide-p1-5">How</button>
    </div>
    <div class="lab-guide" id="guide-p1-5" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Re-read with your lab open; skim on-page Prerequisites if present.</li>
        <li>Out loud (no notes): claim, failure mode, harness fix.</li>
        <li>Point at your demo for the fix. Check yourself against the essay once.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-done-but-ci-red">The Agent Said Done — and CI Is Red</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Teach-back works cold; demo backs it up.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p2-1"> Allowlist ~5 tools; small coding task succeeds</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p2-1" data-guide="guide-p2-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p2-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Pick ~5 tools only (e.g. read_file, write_file, list_dir, run_tests, git_status) — delete the rest from the schema list.</li>
        <li>Give a small coding task in a toy folder (fix a function + run a test).</li>
        <li>Log steps and whether the task completed. Keep this as your baseline run.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview">Tool use</a> · <a href="/agent-too-many-tools">Essay: Too Many Tools</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Baseline succeed with ~5 tools; save transcript/metrics.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p2-2"> Add ~15 junk tools; compare quality + thrash</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p2-2" data-guide="guide-p2-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p2-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Add ~15 useless or overlapping tool schemas (noise names/descriptions) without removing the good five.</li>
        <li>Re-run the <strong>same</strong> coding task.</li>
        <li>Compare: steps, tool thrash, tokens/$, success. Save both runs.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-too-many-tools">Essay</a> · <a href="https://docs.anthropic.com/en/docs/about-claude/pricing">Pricing</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Side-by-side numbers show more tools ≠ more expertise.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p2-3"> Write step/token table in <code>NOTES.md</code> (access ≠ expertise)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p2-3" data-guide="guide-p2-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p2-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>From both runs, fill a table in <code>NOTES.md</code>: columns for steps, distinct tools called, input/output tokens (or $), success Y/N.</li>
        <li>Add one row for allowlist (~5) and one for flood (~20).</li>
        <li>Write 3–5 sentences: the model only sees schemas — a bloated catalog is a <em>harness</em> bug (access ≠ expertise).</li>
        <li>Optional: paste one thrashy tool-call sequence from the flood run as evidence.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-too-many-tools">Essay</a> · <a href="https://docs.anthropic.com/en/docs/about-claude/pricing">Pricing</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> NOTES has the table + a clear “access ≠ expertise” takeaway.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p2-4"> Decide what you’d cut first on a real Android monorepo agent</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p2-4" data-guide="guide-p2-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p2-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>List tools you’d expose on a real Android monorepo agent (gradle, adb, git, search, …).</li>
        <li>Mark what you’d cut first and why (blast radius, rarity, schema noise).</li>
        <li>Write 5–8 lines in NOTES — no need to build the monorepo agent yet.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-too-many-tools">Essay</a> · your day-job mental model</p>
      <p class="lab-guide__done"><strong>Done when:</strong> A cut-first list you’d defend in a design review.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p2-5"> Re-read <a href="/agent-too-many-tools">the essay</a>; teach it without notes</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p2-5" data-guide="guide-p2-5">How</button>
    </div>
    <div class="lab-guide" id="guide-p2-5" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Re-read with your comparison table open.</li>
        <li>Teach: claim, failure mode (flooded schemas), fix (allowlist / stage tools).</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-too-many-tools">Your Agent Has Too Many Tools</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold teach-back using your measured runs.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p3-1"> Write <code>AGENTS.md</code> + stack map + “never touch secrets/”</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p3-1" data-guide="guide-p3-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p3-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>In a toy monorepo (or <code>03-skills/toy/</code>), write <code>AGENTS.md</code>: stack, layout, commands, non-negotiables.</li>
        <li>Include an explicit rule: never read/write <code>secrets/</code> (create a dummy secrets folder).</li>
        <li>Inject AGENTS.md (or a short summary) into the system prompt / first tool read every cold start.</li>
        <li>Run a task that would tempt reading secrets; harness/rules must block or refuse.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://agents.md/">AGENTS.md</a> · <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code docs</a> · <a href="/agent-forgot-the-constraint">Constraint essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold run holds “never touch secrets/” without chat history.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p3-2"> Add a stale memory file that gaslights the model; prove rules win</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p3-2" data-guide="guide-p3-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p3-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Add <code>memory.json</code> (or similar) with a stale lie (e.g. “secrets/ is safe to open”).</li>
        <li>Load memory into context <em>after</em> / beneath durable rules — rules must win.</li>
        <li>Demo: model or tool path tries the lie; harness/system rules prevent the bad action.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-forgot-the-constraint">Forgot the Constraint</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> You can show rules beating stale memory in one demo.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p3-3"> 1-page monorepo map; cold start works with only the map</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p3-3" data-guide="guide-p3-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p3-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Write a 1-page map: modules, where tests live, how to build, where not to go.</li>
        <li>New terminal / new session: only map + AGENTS.md — no paste of prior chat.</li>
        <li>Agent completes a navigation-heavy task without thrashing the whole tree.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/monorepo-navigable-to-agents">Monorepo essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold start succeeds with only the map + rules files.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p3-4"> Re-read <a href="/agent-forgot-the-constraint">constraint</a> then <a href="/monorepo-navigable-to-agents">monorepo</a>; teach both</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p3-4" data-guide="guide-p3-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p3-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Read constraint essay first, then monorepo, with lab open.</li>
        <li>Teach both: chat amnesia false-fix story; what a navigable map must include.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong> Both essays linked above</p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold teach-back for both posts.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p4-1"> Classify tools: read / write / side-effect (matrix in NOTES)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p4-1" data-guide="guide-p4-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p4-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>List every tool in your harness.</li>
        <li>Classify each: <strong>read</strong>, <strong>write</strong>, <strong>side-effect</strong> (deploy, push, delete, pay, message users…).</li>
        <li>Put the matrix in NOTES. Side-effects need human approval later.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-trust-boundaries">Trust boundaries essay</a> · <a href="https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html">OWASP authz (skim)</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> NOTES matrix covers all tools with no ambiguous “misc” bucket.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p4-2"> Approval gate for side-effects (blocked until “yes”)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p4-2" data-guide="guide-p4-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p4-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Wrap side-effect tools: print what would happen; require typing <code>yes</code> (or a CLI confirm) before executing.</li>
        <li>Prove a deploy/push/delete-style fake tool stays blocked without approval.</li>
        <li>Log approvals (who/when/what) in JSONL.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://www.anthropic.com/research/building-effective-agents">Effective agents</a> · <a href="/agent-trust-boundaries">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Side-effect cannot run without an explicit yes.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p4-3"> Lying tool + verify-after-write catches the lie</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p4-3" data-guide="guide-p4-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p4-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Implement a write tool that returns success but does not write (or writes wrong content).</li>
        <li>After write tools: harness re-reads the file / checks hash / runs a test — don’t trust the tool return alone.</li>
        <li>Demo: lie caught; agent must not claim success.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-trust-boundaries">Essay</a> · <a href="https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/overview">Strengthen guardrails</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Verify-after-write catches the lying tool in a demo.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p4-4"> Name one thing you’d never auto-approve on a production Android pipeline</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p4-4" data-guide="guide-p4-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p4-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Pick one real production Android/CI action (Play upload, prod flag flip, force-push to main, secret rotate, mass device wipe…).</li>
        <li>In NOTES: blast radius, irreversibility, and who must say yes today.</li>
        <li>Map it to your phase-4 matrix as <strong>side-effect → never auto</strong>.</li>
        <li>Write the one-liner you’d put in an approval policy doc.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-trust-boundaries">Essay</a> · your release/CI runbook</p>
      <p class="lab-guide__done"><strong>Done when:</strong> One concrete never-auto-approve item with rationale in NOTES.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p4-5"> Re-read <a href="/agent-trust-boundaries">the essay</a>; teach theater vs real approvals</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p4-5" data-guide="guide-p4-5">How</button>
    </div>
    <div class="lab-guide" id="guide-p4-5" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Re-read; contrast checkbox theater vs approvals that gate real side-effects.</li>
        <li>Teach with your lying-tool demo.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-trust-boundaries">Agent Trust Boundaries</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold teach-back of theater vs real approvals.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p5-1"> Same bug twice: react-only vs plan-then-act (two transcripts)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p5-1" data-guide="guide-p5-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p5-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Pick one small bug (failing unit test in a toy repo).</li>
        <li>Run A: react-only — no plan file; act until done or max steps. Save transcript.</li>
        <li>Run B: plan-then-act — model writes a short plan first, then acts. Save transcript.</li>
        <li>Compare thrash / wrong turns in NOTES (not “which is always better”).</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://arxiv.org/abs/2210.03629">ReAct paper</a> · <a href="https://www.anthropic.com/research/building-effective-agents">Effective agents</a> · <a href="/planning-theater-vs-real-plan">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Two saved transcripts for the same bug.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p5-2"> Persist <code>plan.md</code>; update when blocked; avoid one rewrite</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p5-2" data-guide="guide-p5-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p5-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Require the harness to read/write <code>plan.md</code> (goal, steps, status, blockers).</li>
        <li>When blocked, update the plan (mark step failed, add next attempt) — don’t silently ignore it.</li>
        <li>Arrange a scenario where updating the plan once avoids rewriting the same broken approach.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/planning-theater-vs-real-plan">Planning theater essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> One run where a live plan update prevents a rewrite.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p5-3"> <em>Optional:</em> sketch same flow in LangGraph</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p5-3" data-guide="guide-p5-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p5-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Sketch nodes: plan → act → critique (or update_plan) in a diagram in NOTES.</li>
        <li>Optionally implement a minimal LangGraph that mirrors your file-based plan loop.</li>
        <li>Don’t chase framework completeness — prove the same control points exist.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://langchain-ai.github.io/langgraph/concepts/">LangGraph concepts</a> · <a href="https://langchain-ai.github.io/langgraph/">LangGraph docs</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Diagram (and optional tiny graph) maps to your plan loop.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p5-4"> Re-read <a href="/planning-theater-vs-real-plan">the essay</a>; teach what makes a plan theater</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p5-4" data-guide="guide-p5-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p5-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Re-read; define theater: ignored, stale, or never updated when blocked.</li>
        <li>Teach minimum useful plan fields using your <code>plan.md</code>.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/planning-theater-vs-real-plan">Planning Theater vs a Real Plan</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold teach-back with your plan demo.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p6-1"> Orchestrator + researcher + coder; one task uses both</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p6-1" data-guide="guide-p6-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p6-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Build a thin orchestrator that can call two workers (separate system prompts or separate loops).</li>
        <li>Researcher: read-only gather. Coder: edit/test. Orchestrator assigns and merges.</li>
        <li>One end-to-end task must use both (e.g. research API shape → implement stub).</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://www.anthropic.com/research/building-effective-agents">Effective agents</a> · <a href="/subagents-that-argue">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> One task transcript shows both workers used.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p6-2"> Dual-cost log + a skip rule when second agent adds no value</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p6-2" data-guide="guide-p6-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p6-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Log tokens/$ for orchestrator + each worker separately; sum “pay for both.”</li>
        <li>Add a skip rule (e.g. skip researcher if context already has the doc; or skip coder if research says no code needed).</li>
        <li>Show a run where the skip rule fires and saves the second bill.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.anthropic.com/en/docs/about-claude/pricing">Pricing</a> · <a href="/subagents-that-argue">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cost table + a skip rule you’d actually ship.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p6-3"> <em>Optional:</em> two OpenClaw personas with clear bindings</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p6-3" data-guide="guide-p6-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p6-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Follow OpenClaw multi-agent docs; create two personas with explicit channel/bindings.</li>
        <li>Prove they don’t both reply to every message (clear routing).</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.openclaw.ai/concepts/multi-agent">OpenClaw multi-agent</a> · <a href="https://docs.openclaw.ai/channels">Channels</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Two personas with bindings you can explain.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p6-4"> Re-read <a href="/subagents-that-argue">the essay</a>; show when two agents create cost without value</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p6-4" data-guide="guide-p6-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p6-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Re-read with your dual-cost log open.</li>
        <li>Teach: argue/duplicate work → pay twice; when orchestration helps vs hurts.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/subagents-that-argue">Subagents That Argue</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold teach-back + your cost numbers.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p7-1"> Write ≥10 fixed cases in <code>evals/cases.json</code></label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p7-1" data-guide="guide-p7-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p7-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Create <code>evals/cases.json</code>: array of objects with id, prompt/input, expected check (string match, tool sequence, or CI green flag).</li>
        <li>At least 10 cases; mix easy wins and traps (false done, bad tool choice).</li>
        <li>Cases must be fixed fixtures — no “whatever the model felt like.”</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://langfuse.com/docs/evaluation/overview">Langfuse eval overview</a> · <a href="/agent-eval-not-a-demo">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> File exists with ≥10 stable cases.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p7-2"> Runner prints pass/fail (CI-able script)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p7-2" data-guide="guide-p7-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p7-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Write <code>evals/run.py</code>: load <code>cases.json</code>, run each case through the harness headlessly (no interactive chat).</li>
        <li>For each case print <code>PASS</code>/<code>FAIL</code> + a one-line reason; end with a summary count.</li>
        <li><code>sys.exit(1)</code> if any required case fails (CI-shaped).</li>
        <li>Run once locally: <code>python evals/run.py</code>. Optional: sketch a GH Actions step that runs the same command.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.github.com/en/actions/writing-workflows/quickstart">GH Actions quickstart</a> · <a href="/agent-eval-not-a-demo">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> One command prints a report and returns a usable exit code.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p7-3"> Include at least one intentional fail in the suite</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p7-3" data-guide="guide-p7-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p7-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Add a case you expect to fail today (documents a known gap).</li>
        <li>Runner must show it as fail — suite honesty &gt; green vanity.</li>
        <li>Note in NOTES why that fail exists.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-eval-not-a-demo">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Report shows ≥1 intentional fail.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p7-4"> Pick a metric you’d put on a PR gate for an agent change</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p7-4" data-guide="guide-p7-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p7-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Choose one gate metric you’d put on an agent-harness PR (suite pass rate, false-done rate, max $/task, max steps).</li>
        <li>Write the threshold (e.g. “pass rate ≥ 90% on required cases”).</li>
        <li>Write how CI fails the PR (exit code / check name) and what humans still review.</li>
        <li>Record this as “PR gate” in NOTES — treat it as a policy, not a vibe.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-eval-not-a-demo">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> PR-gate metric + threshold written in NOTES.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p7-5"> <em>Optional:</em> Langfuse traces for a handful of runs</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p7-5" data-guide="guide-p7-5">How</button>
    </div>
    <div class="lab-guide" id="guide-p7-5" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Sign up / run Langfuse locally; send traces from a few eval or manual runs.</li>
        <li>Open the UI and find one failed step via the trace.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://langfuse.com/docs/tracing">Langfuse tracing</a> · <a href="https://langfuse.com/docs">Langfuse docs</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> You can point at a trace for a failed run.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p7-6"> Re-read <a href="/agent-eval-not-a-demo">the essay</a>; teach why chat ≠ ship bar</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p7-6" data-guide="guide-p7-6">How</button>
    </div>
    <div class="lab-guide" id="guide-p7-6" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Re-read with your report open.</li>
        <li>Teach: one lucky chat ≠ ship; suite + intentional fails + gate metric.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/agent-eval-not-a-demo">Eval Is Not a Demo</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold teach-back against your suite.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p8-1"> Rubric: 5 tasks agents should <em>not</em> own yet</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p8-1" data-guide="guide-p8-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p8-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>List 5 task types from your work (or realistic Android/CI work) where agents make you the babysitter.</li>
        <li>For each: why (ambiguity, blast radius, review cost).</li>
        <li>Save as a short rubric in NOTES.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/when-agents-make-you-slower">Makes You Slower</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Five no-own-yet tasks with reasons.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p8-2"> Overnight job → <strong>draft</strong> PR or ticket only (no auto-merge)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p8-2" data-guide="guide-p8-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p8-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Automate a night job (cron or n8n) that opens a <strong>draft</strong> PR or creates a ticket — never merge.</li>
        <li>Hard-code: no auto-merge, no prod deploy.</li>
        <li>Document how the job is triggered and what artifact you get in the morning.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://crontab.guru/">crontab.guru</a> · <a href="https://docs.n8n.io/">n8n docs</a> · <a href="/overnight-agent-pr-fantasy">Overnight essay</a> · <a href="https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests">GitHub PRs</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Draft-only overnight artifact; merge remains human.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p8-3"> Morning checklist written; postmortem: time saved vs babysitting</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p8-3" data-guide="guide-p8-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p8-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Write a morning checklist (diff skim, tests, secrets, ownership).</li>
        <li>Run one overnight cycle; record minutes saved vs minutes babysitting.</li>
        <li>Honest postmortem in NOTES — greenwashing not allowed.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/when-agents-make-you-slower">Slower</a> · <a href="/overnight-agent-pr-fantasy">Overnight</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Checklist + honest time numbers.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p8-4"> Re-read <a href="/when-agents-make-you-slower">slower</a> + <a href="/overnight-agent-pr-fantasy">overnight</a></label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p8-4" data-guide="guide-p8-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p8-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Re-read both with your checklist/postmortem open.</li>
        <li>Teach: when agents slow you; why overnight merge is fantasy even if draft is fine.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong> Both essays</p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold teach-back for both.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p8-5"> Skim <a href="/bot-commented-on-pr-nobody-owns">bot ownership</a>; name who owns a bad bot comment</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p8-5" data-guide="guide-p8-5">How</button>
    </div>
    <div class="lab-guide" id="guide-p8-5" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Skim the bot essay for ownership / severity gates.</li>
        <li>Name a human or role who owns a bad bot comment on a PR in your world.</li>
        <li>Write that owner in NOTES next to the overnight job.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/bot-commented-on-pr-nobody-owns">Bot on PR</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Named owner for bad bot comments.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p9-1"> Session-start hook: repo map + date + policy (same preamble every run)</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p9-1" data-guide="guide-p9-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p9-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>On every run start, inject the same preamble: date/UTC, short repo map, policy lines (from AGENTS.md).</li>
        <li>Implement as a function the harness always calls before the first model turn (a “hook”).</li>
        <li>Prove two cold runs get the same structural preamble.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/wrong-chunk-confident-answer">Essay</a> · Messages API system prompt patterns</p>
      <p class="lab-guide__done"><strong>Done when:</strong> Same preamble every cold start.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p9-2"> Minimal RAG over NOTES + one PDF; answers cite chunks</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p9-2" data-guide="guide-p9-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p9-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Chunk <code>NOTES.md</code> + one PDF; embed and store (even a naive local store is fine).</li>
        <li>Retrieve top-k chunks; put them in context; require the answer to cite chunk ids/snippets.</li>
        <li>Follow a RAG tutorial if needed — keep the pipeline tiny.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://python.langchain.com/docs/tutorials/rag/">LangChain RAG tutorial</a> · <a href="https://huggingface.co/learn/nlp-course/chapter5/1">HF embeddings chapter</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Answers cite retrieved chunks.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p9-3"> Poison retrieval once; observe confident wrong answer; note mitigation</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p9-3" data-guide="guide-p9-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p9-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Insert a wrong/poisoned chunk that ranks high for a query.</li>
        <li>Observe a confident wrong answer.</li>
        <li>Implement one mitigation: refuse if low confidence, re-retrieve, or require citation check — demo it.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/wrong-chunk-confident-answer">Essay</a> · <a href="https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations">Reduce hallucinations</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Demo: wrong chunk → confident wrong → refuse/re-retrieve.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p9-4"> Write when repo search is enough and RAG is the wrong tool</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p9-4" data-guide="guide-p9-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p9-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>In NOTES: 2–3 bullets when <strong>repo search / grep / ripgrep</strong> is enough (exact symbols, file paths, “where is X defined?”).</li>
        <li>2–3 bullets when <strong>RAG</strong> helps (prose docs, PDFs, sticky policy text).</li>
        <li>1 bullet for a false friend: embedding search over a monorepo when you needed a precise symbol.</li>
        <li>Write a decision line: “default to repo tools; add RAG only when …”.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/wrong-chunk-confident-answer">Essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Clear when-not-RAG note you’d show a teammate.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p9-5"> <em>Optional:</em> Open WebUI RAG vs code RAG comparison</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p9-5" data-guide="guide-p9-5">How</button>
    </div>
    <div class="lab-guide" id="guide-p9-5" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Load the same docs into Open WebUI RAG (or equivalent) and ask the same poisoned query.</li>
        <li>Compare UX + failure modes vs your code RAG in a short NOTES table.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://openwebui.com">Open WebUI</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Short comparison writeup.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p9-6"> Re-read <a href="/wrong-chunk-confident-answer">the essay</a>; demo refuse / re-retrieve</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p9-6" data-guide="guide-p9-6">How</button>
    </div>
    <div class="lab-guide" id="guide-p9-6" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Re-read; rehearse the demo path end-to-end.</li>
        <li>Teach claim + failure mode + fix without notes.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="/wrong-chunk-confident-answer">Wrong Chunk, Confident Answer</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Cold teach-back + live demo.</p>
    </div>
  </li>
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
  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p10-1"> Small multi-agent setup (OpenClaw or LangGraph) reusing phases 4 + 7</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p10-1" data-guide="guide-p10-1">How</button>
    </div>
    <div class="lab-guide" id="guide-p10-1" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Stand up a small always-on-ish team (OpenClaw + Claude, or LangGraph) with ≤3 roles.</li>
        <li>Reuse phase 4 approvals and phase 7 eval mindset — convenience must not delete them.</li>
        <li>One phone/chat or scripted path that reaches a useful reply.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  <a href="https://docs.openclaw.ai/">OpenClaw docs</a> · <a href="https://docs.openclaw.ai/providers/anthropic">Anthropic provider</a> · <a href="https://langchain-ai.github.io/langgraph/">LangGraph</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Working small team that still has approvals + eval hooks.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p10-2"> Approvals still required for side-effects</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p10-2" data-guide="guide-p10-2">How</button>
    </div>
    <div class="lab-guide" id="guide-p10-2" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Pick one side-effect in the capstone (send message, open PR, write outside sandbox, deploy hook).</li>
        <li>Trace the code path: where approval is checked; prove a missing “yes” blocks execution.</li>
        <li>If the framework auto-allows, wrap the tool — don’t trust defaults.</li>
        <li>Demo once: attempt without approval → blocked; with approval → runs + logged.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  Phase 4 How guides · <a href="/agent-trust-boundaries">Trust essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> Capstone cannot side-effect without an explicit approval.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p10-3"> Eval bar still runs before you trust a change</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p10-3" data-guide="guide-p10-3">How</button>
    </div>
    <div class="lab-guide" id="guide-p10-3" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Before you “trust” a capstone harness change, run phase-7 <code>evals/run.py</code> (or a documented slim subset).</li>
        <li>Save the report (stdout or <code>evals/last-report.txt</code>).</li>
        <li>In NOTES: date, commit/hash if any, pass/fail counts, whether you’d ship.</li>
        <li>If the suite is red, fix or consciously waive — don’t skip silently.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  Phase 7 How guides · <a href="/agent-eval-not-a-demo">Eval essay</a></p>
      <p class="lab-guide__done"><strong>Done when:</strong> An eval run is attached to the capstone milestone in NOTES.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p10-4"> Walk all essay URLs; mark teach-back pass/fail in NOTES</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p10-4" data-guide="guide-p10-4">How</button>
    </div>
    <div class="lab-guide" id="guide-p10-4" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Open every URL in the Essays reading map on this page.</li>
        <li>For each: mark Lab ✓ / Can teach ✓ in NOTES (use the curriculum tracker if you want).</li>
        <li>Re-do any fail with the matching phase lab open.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  Essays map below · curriculum tracker in learning-path notes</p>
      <p class="lab-guide__done"><strong>Done when:</strong> Full teach-back checklist filled.</p>
    </div>
  </li>

  <li class="lab-todo">
    <div class="lab-todo__head">
      <label><input type="checkbox" data-todo="p10-5"> <em>Optional:</em> touch up one Writing post from a lab insight</label>
      <button type="button" class="lab-todo__how" aria-expanded="false" aria-controls="guide-p10-5" data-guide="guide-p10-5">How</button>
    </div>
    <div class="lab-guide" id="guide-p10-5" hidden>
      <p class="lab-guide__title">What to do &amp; how</p>
      <ol class="lab-guide__steps">
        <li>Pick one essay where the lab changed how you’d explain a failure mode.</li>
        <li>Make a small clarity edit in the writing repo; optional PR.</li>
      </ol>
      <p class="lab-guide__refs"><strong>Guides:</strong>  Your writing workflow · linked essay</p>
      <p class="lab-guide__done"><strong>Done when:</strong> One insight landed in a post (or a drafted edit).</p>
    </div>
  </li>
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
