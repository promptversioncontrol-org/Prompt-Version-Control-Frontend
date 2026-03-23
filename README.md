---

# 🛡️ Prompt Version Control (PVC)

**Prompt Version Control (PVC)** is a security, auditing, and visibility layer for AI-assisted coding.

It works like a **firewall for AI agents**: it helps prevent sensitive data from being sent out during vibe coding, while also giving you full insight into how tools like **Codex** are being used.

PVC runs through a **local proxy on your laptop**, intercepts AI traffic, tracks conversations, and syncs relevant data to a web app for review and team visibility.

> Control what leaves your machine.
> Review everything your AI agent did.
> Understand where your tokens went.

---

## Why PVC exists

AI coding agents are powerful, but they also create a new class of problems:

* Sensitive data can be sent accidentally
* Large internal code context may be exposed without users realizing it
* Teams often have no visibility into what AI tools are doing
* Token usage becomes expensive and hard to explain
* There is no clear audit trail for prompt history and agent behavior

PVC solves this by adding a layer between your AI tool and the model provider.

---

## How it works

PVC sits between your AI agent and the external model:

```text
Codex / AI Agent → PVC Proxy → External Model
```

Instead of allowing requests to go directly out, PVC routes them through a local proxy that runs on your machine.

That proxy can:

* inspect outgoing requests
* block sensitive data
* track prompt and response history
* measure token usage
* keep a record of the full conversation
* sync project data to the PVC web app

---

## Core workflow

### 1. Install the CLI

Install PVC globally:

```bash
npm install -g @adam903/pvc
```

### 2. Link your CLI to your PVC profile

Authenticate with SSH:

```bash
pvc login --ssh
```

During this step, you provide your **SSH public key** in the PVC app.
Once that is done, the CLI is linked to your PVC profile.

This creates a secure connection between:

* your local CLI
* your PVC account
* the PVC web application

### 3. Initialize PVC in your project

Run:

```bash
pvc init
```

This initializes a `.pvc` folder inside your project.

The `.pvc` directory stores the project data and files needed by PVC so they can later be processed and synced to the web app.

### 4. Run through the proxy

Once configured, your AI workflow runs through the PVC proxy on your laptop.

PVC can then monitor and control what gets sent during interactions with tools such as Codex.

---

## What the `.pvc` folder is for

When you run `pvc init`, PVC creates a local `.pvc` directory in your project.

This folder is used to store the files and metadata that PVC tracks as part of the project lifecycle.

That can include data related to:

* project initialization
* local PVC state
* tracked prompt/conversation context
* files prepared for syncing to the PVC web app

In practice, `.pvc` becomes the local source of truth for what PVC manages in the project.

---

## Features

## AI firewall

PVC acts like a firewall for AI agents.

It helps block the accidental transmission of sensitive data during AI-assisted coding workflows.

Examples of data that may be protected:

* API keys
* access tokens
* secrets
* credentials
* internal project data
* sensitive source code fragments

This is especially useful during vibe coding, where large amounts of context may be passed automatically.

---

## Local proxy on your laptop

PVC works through a proxy that runs locally on your own machine.

That means prompt traffic can be inspected before it leaves your environment.

This local-first approach provides much better control than sending prompts directly from the AI tool to the model provider.

---

## Full conversation review

PVC lets you review the **entire conversation with Codex**.

Instead of only seeing isolated requests, you can inspect the full workflow, including:

* all prompts
* all responses
* how the conversation evolved
* what context was included
* what the agent spent tokens on

This makes PVC useful not just for security, but also for debugging and operational visibility.

---

## Token usage visibility

PVC makes AI usage measurable.

You can review:

* token usage per conversation
* token usage per step
* total usage across a workflow
* what types of actions consumed the most tokens

This helps answer questions like:

* Why was this task expensive?
* Which step generated the most token usage?
* Was the agent spending too much context on irrelevant files?

---

## Team and manager visibility

PVC is also useful at the team level.

Because conversations and usage data are synced to the web app, someone like a team lead or manager can review:

* the full Codex conversation
* how many tokens were used
* what tasks consumed those tokens
* how AI tools are being used across projects

This creates transparency for:

* cost control
* workflow review
* compliance
* internal auditing
* productivity analysis

---

## Web app sync

PVC is not just a CLI tool.

The local project state and tracked files can be sent to the **PVC web application**, where users can inspect and review activity.

This gives you a central place to see:

* project activity
* conversation history
* token usage
* synced files from local projects
* AI interaction logs

The CLI and web app work together as one system.

---

## Current support

PVC currently works with **the latest Codex**.

Support for additional agents and tools can be added over time.

---

## Example workflow

A typical setup looks like this:

```bash
npm install -g @adam903/pvc
pvc login --ssh
pvc init
```

Then:

1. you add your SSH public key in the PVC app
2. the CLI gets linked to your PVC profile
3. PVC initializes the local project state in `.pvc`
4. your AI workflow runs through the local proxy
5. conversations and project data can be reviewed in the web app

---

## Example use cases

PVC is useful for:

* safe vibe coding with Codex
* preventing accidental leakage of sensitive data
* reviewing full AI conversations after a coding session
* tracking token usage and cost drivers
* giving managers visibility into AI usage
* creating an audit trail for AI-assisted development
* understanding what context was actually sent to the model

---

## Security model

PVC is built around a simple idea:

> AI tools should not send data out of your machine without visibility and control.

Instead of treating prompts as invisible background traffic, PVC makes them reviewable, measurable, and enforceable.

---

## Who it is for

PVC is designed for:

* individual developers who want safer AI workflows
* startups using AI agents in production codebases
* engineering teams that need observability
* companies that want more control over data leaving local environments

---

## Installation

```bash
npm install -g @adam903/pvc
```

---

## Authentication

```bash
pvc login --ssh
```

Add your SSH public key in the PVC app to connect your local CLI with your PVC profile.

---

## Project initialization

```bash
pvc init
```

Creates a `.pvc` folder in your project that stores PVC-managed local state and files used for syncing to the web application.

---

## Positioning

PVC is not just logging.
PVC is not just analytics.
PVC is not just a proxy.

It is **Prompt Version Control**:

* a firewall for AI agents
* a review system for AI conversations
* a token visibility layer
* a bridge between local coding workflows and a central web app

---
