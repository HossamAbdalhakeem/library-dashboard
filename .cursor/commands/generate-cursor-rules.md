# Generate Cursor Rules

Explore this repository and create or update project Cursor Rules based on what you actually find in the codebase.

## What to do

1. Inspect the project: root structure, `package.json` / lockfiles, config (`nuxt.config`, `tsconfig`, eslint, etc.), main app folders, shared components, enums, composables, API layer, tests if any.
2. Infer real conventions: stack, folder layout, naming, component patterns, state/data fetching, i18n, error handling, security notes if present.
3. Create focused rule files under `.cursor/rules/` (create the folder if needed). Prefer several small rules over one huge file.
4. If useful rules already exist, update them instead of duplicating.

## Rule format

- Path: `.cursor/rules/<name>.mdc`
- Use YAML frontmatter with one primary activation style:
  - `alwaysApply: true` for core project-wide guidance
  - `globs: pattern` for file-type / folder-specific rules (gitignore-style; comma-separated if multiple)
  - `description: "..."` so the agent can fetch the rule when relevant (`alwaysApply: false`)
- Body: concise Markdown, actionable, ideally under ~50 lines per rule
- One concern per rule (structure, Vue/Nuxt, enums, API, UI dialogs, etc.)
- Include concrete ✅/❌ examples drawn from this repo when possible
- To reference a workspace file: `[path](mdc:path)` relative to workspace root

### Example always-on rule

```mdc
---
alwaysApply: true
---
# Project Structure
...
```

### Example glob rule

```mdc
---
description: Vue/Nuxt component conventions
globs: app/components/**/*.vue,**/*.vue
alwaysApply: false
---
# Components
...
```

## Output

- Write the `.mdc` files
- Briefly list what you created and why each rule applies
- Do not invent conventions that are not evidenced in the project
