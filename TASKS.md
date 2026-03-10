# Файл задач по проекту

> **Note:** Before executing any task, you MUST read AGENTS.md first. It contains mandatory guidelines for task execution, branching strategy, commit workflow, and documentation updates. Project details can be read from README.md.

---

## AI Assistant: Task and Checkbox Execution Rules

1. **Execute top to bottom** — never skip ahead
2. **One checkbox at a time** — a task = all checkboxes under one `## Task:` header
3. **Before starting a task** — ask: "Task: [title]. Shall I start?"
4. **Branch per task** — AI auto-generates: `task/<kebab-case-name>` and commits uncommitted TASKS.md changes
5. **Mark completed checkbox** - as soon as checkbox goal has achieved mark it as completed
6. **Commit per checkbox** — no approval needed for checkbox commits
7. **Run E2E tests** - all tests should pass successfully
8. **Merge requires approval** — ask: "Task complete. Merge to main and delete branch?"
9. **Cleanup on merge** — remove completed task from this file and commit TASKS.md after merge approval and stright before merge operation, keep incompleted tasks and checkboxes; squash commits and merge to main

---
