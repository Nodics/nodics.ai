# jsonImport AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nData/nImport/jsonImport`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Load `stream-json/streamers/stream-array.js` through dynamic import and construct
`streamArray.withParserAsStream()`. Pipe file bytes to the returned Node stream
itself. Preserve array-only parsing, pause/resume around asynchronous handlers,
file/chunk versioning, diagnostics and rejected parse/read failures.
