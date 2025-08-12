# Taskorator

> Forge the plan. Command the chaos.

Taskorator is a tree‑first task system for people who break problems apart and then put them back together. It runs offline, syncs online, and lets you operate at any altitude—from tiny atoms to overlord projects.

## Why it’s different
- **Tree‑first navigation** – Every task can contain tasks. Move through work like a file system.
- **Split & Crush** – Replace a big task with linked sub‑tasks, or fuse many into one when it’s time to focus.
- **Priority engine** – Focus/Frog/Favorite flags + numeric priority + view heat → smarter default ordering.
- **Smart lists (Taskorator)** – A rotating digest: latest, favorites, random, long‑time‑no‑see, etc.
- **Offline ⇄ Online** – Add, edit, and navigate without a connection. Sync when you’re back.
- **Multiple views & batch ops** – Tree or list, promote/demote, move, add many, complete in bulk.

## Core concepts
- **Overlord** – The parent of a task; the trunk above the branch.
- **Stage** – `todo | seen | completed | archived | deleted`.
- **Type/Subtype** – Shape the task (`project`, `todo`, `checklist`, `code:ts`, etc.).
- **Repeat** – Daily/Weekly/Monthly/Yearly and friends.

## Feature tour
- Navigate like a pro (surface‑level loading keeps it fast).
- Create tasks inside tasks; promote/demote across the tree.
- Priority via flags and numbers; "views" act as a heatmap for discovery.
- Tags connect ideas across projects (mind‑map feel, list discipline).
- Taskorator smart list keeps forgotten work rotating back into view.

## Screens
- **Navigating**
  ![navigating tasks](/readme-resources/navigating.gif)
- **Create & split**
  ![create tasks and subtasks](/readme-resources/create-task-and-children.gif)
- **Move / crush**
  ![move tasks](/readme-resources/move-task.gif)
- **Promote / demote**
  ![promote demote](/readme-resources/promote-demote.gif)
- **Tree view**
  ![tree view](/readme-resources/tree-view.gif)

## Tech (current)
- Angular 17, Tailwind + DaisyUI (custom themes via `theme-*` tokens)
- Simple service state + in‑memory caches
- Storage: local (offline) with optional cloud sync (pluggable)

> Note: Firebase is optional and not required to understand or use the app. Storage adapters are swappable.

## Quick start
```bash
npm i
ng serve
# open http://localhost:4200