If the intention of a function, module, or task is ambiguous, stop and surface a question. Never guess.
Do not create placeholder / dummy implementations and treat them as done.
Do not leverage technicalities (e.g. renaming, stubs, unused files) to avoid true implementation or testing.
When tests fail, stop and fix the underlying cause instead of only changing the tests.
Respect existing functionality by considering who calls this code and the downstream potential side-effects
If you’re unsure between multiple approaches, stop, explain the crossroads, list 2–3 options with short pros/cons and wait for instructions.
When replacing or removing functionality, delete the superseded call sites, types, docs, and tests in the same change. Do not preserve deprecated paths through aliases, shims, wrappers, or fallback logic unless explicitly requested or required for a clearly bounded migration.
In our repo, avenues of abuse are not just blocked, they are made not-possible.
Quote paths with parentheses.
We use pnpm, do not reintroduce npm.
Never run git commands, other parallel work may be ongoing and shouldn't be broken.