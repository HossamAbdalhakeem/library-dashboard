---
name: commit
description: >-
  Create a git commit for the current project changes when the user types
  commit in the project chat. Use when the user says commit, "اعمل commit",
  or asks to commit the current work. Do not push unless they also ask to push.
---

# Commit the current work

Run this when the user types `commit` in this project's chat.

1. Look at `git status`, `git diff`, and recent `git log` before committing.
2. Stage the relevant changes. Leave out secrets (`.env`, credentials).
3. Commit with a short message that says why the change exists.
4. Do not push, amend, or force-push unless the user asks for that in the same message.
5. After the commit, show the commit result and `git status`.

If there is nothing to commit, say so and stop.
