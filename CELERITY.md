# Celerity (appnatomy.com) — Notes & Learnings

## What It Is

Celerity is a project management / AI orchestration platform at appnatomy.com. It lets you define **workflows** with sequential **steps**, assign **AI agents** (Claude Code) to each step, and have tasks flow through the pipeline automatically.

Think of it as a Kanban board where each column can have an AI agent attached that does work when a task lands there.

---

## Core Concepts

### Workflows
A named pipeline of steps that tasks move through. Each workflow has settings for:
- **Workflow Type** — "Development" enables git-based features (worktrees, branches)
- **Max Concurrent Executions** — how many agent runs can happen at once
- **Git Strategy** — `None` (agent works in main directory) or `Worktree` (isolated copy per execution)
- **Base Port** — for dynamic port allocation if running dev servers

### Steps
Each column in the workflow. A step has:
- **Title and color** — for the board UI
- **Assigned Agent** — which AI agent runs when a task enters this step
- **Agent Instructions** — the prompt given to the agent
- **Mode** — `plan` (agent proposes changes, waits for approval) or `execute` (agent acts immediately)
- **Max Turns** — how many agentic turns the agent gets (API round-trips)
- **Allowed Tools** — granular control over what the agent can do (Read, Write, Edit, Bash, etc.)
- **Skip in Automation** — whether to skip this step during automatic advancement
- **Orchestrator Tools** — special actions like `set_task_title`, `attach_file`, `merge_and_cleanup`, `deploy_project`

### Tasks
Individual work items that flow through the workflow steps. Each task has:
- **Title** — shown on the board (agents can update this via `set_task_title`)
- **Priority** — medium, high, etc.
- **Description** — the actual request/instructions
- **Attachments** — files can be attached (agents can do this via `attach_file`)

### Agents
AI agents (Claude Code) that execute when a task enters their step. Key settings:
- **Mode**: `plan` = agent plans and waits for approval; `execute` = agent acts autonomously
- **Max Turns**: limits how long the agent can run
- **Tool permissions**: which CLI and orchestrator tools are available

---

## How a Task Flows

1. You create a task (or it's created via API/automation)
2. Task enters Step 1 — agent runs with that step's prompt and mode
3. Agent completes (or waits for approval in plan mode)
4. Task advances to Step 2 — next agent picks it up
5. Repeat until the task reaches the final step

---

## Git Strategy: Worktree vs None

| Setting | What it does | Best for |
|---------|-------------|----------|
| **None** | Agent works directly in the project directory | Simple projects, single task at a time, static sites |
| **Worktree** | Creates an isolated git worktree per execution | Multiple concurrent tasks, bigger codebases, avoiding conflicts |

For simple static sites with max concurrency of 1, **None** is fine. Use worktrees when you need parallel agent executions that might touch the same files.

When using worktrees, you can configure:
- **Dependency Directories** — dirs copied into each worktree (e.g., `node_modules`)
- **Secret/Config Files** — files copied in (e.g., `.env`)

---

## Recommended Workflow: Static Site Development

A 4-step workflow that works well for static sites like GitHub Pages projects:

### Step 1: Ready for Development
- **Mode**: `plan`
- **Purpose**: Agent analyzes the task and creates an implementation plan without making changes
- **Prompt**:
  > You are a senior developer planning changes for a static website hosted at https://YOUR-SITE.com. Analyze the task, explore the codebase, and create a clear implementation plan. Identify which files need to change and describe each edit precisely. Do NOT make any changes — only plan.

### Step 2: In Development
- **Mode**: `execute`
- **Purpose**: Agent implements the plan, commits, pushes, and creates a PR
- **Prompt**:
  > You are a senior developer implementing changes for a static website hosted at https://YOUR-SITE.com.
  >
  > Execute the approved plan. Make all required edits, then:
  > 1. Create a new git branch named after the task (e.g., `task/lobster-logo`)
  > 2. Stage and commit all changes with a clear commit message
  > 3. Push the branch to origin
  >
  > After pushing, create a PR using `gh pr create` targeting `main`. Then update the task title to include the preview link using the `set_task_title` tool:
  > `[original title] — Preview: https://YOUR-SITE.com/pr-preview/pr-[NUMBER]/`

### Step 3: Review
- **Mode**: `plan`
- **Purpose**: Agent summarizes changes and gives you a preview link, then waits for your approval
- **Prompt**:
  > You are reviewing changes for a static website hosted at https://YOUR-SITE.com.
  >
  > 1. Find the open PR for this task's branch using `gh pr list`
  > 2. Summarize what changed (files modified, what the diff does)
  > 3. Provide the preview link: `https://YOUR-SITE.com/pr-preview/pr-[NUMBER]/`
  > 4. Stop and wait for approval — do NOT merge automatically
  >
  > Once approved, use the `merge_and_cleanup` tool to merge the PR and delete the branch.

### Step 4: Merge & Deploy
- **Mode**: `execute`
- **Purpose**: Merges the PR and deploys
- **Prompt**:
  > Merge the open PR for this task using the `merge_and_cleanup` tool, then deploy using the `deploy_project` tool.

---

## Lessons Learned

### Agents must be told to commit and push
The biggest gotcha: if your agent instructions don't explicitly say to commit and push, the agent will just edit files and stop. The edits exist in the working directory but are never persisted. Always include explicit git instructions in your execute steps.

### Plan mode is your friend for review gates
Use `plan` mode on any step where you want human approval before proceeding. The agent will do its work (analysis, summarizing) and then pause. You approve, and the task advances.

### Agent instructions are just prompts
The "Agent Instructions" field is literally the prompt the AI gets. Be specific about:
- What to do
- What NOT to do
- What tools to use (especially orchestrator tools like `set_task_title`)
- What the expected output is (a branch? a PR? a summary?)

### Use orchestrator tools to surface info
Tools like `set_task_title` and `attach_file` let the agent put information where you can see it on the board — preview URLs in titles, screenshots as attachments, etc. Without these, the agent's output is buried in execution logs.

### Execution logs are your debug tool
When something goes wrong, the execution detail view shows every tool call, message, and error. Check the Activity Logs to see exactly what the agent did (and didn't do).

### Keep max turns reasonable
100 turns is generous. For simple tasks (plan a CSS change, merge a PR), 20-30 turns is usually plenty. Higher turn counts mean the agent can burn through more API calls if it gets stuck in a loop.

---

## Orchestrator Tools Reference

| Tool | What it does |
|------|-------------|
| `set_task_title` | Updates the task title on the board |
| `attach_file` | Attaches a file to the task |
| `send_email` | Sends an email notification |
| `merge_and_cleanup` | Merges a PR and deletes the branch |
| `deploy_project` | Triggers a deployment |
