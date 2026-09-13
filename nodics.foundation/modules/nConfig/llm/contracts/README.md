# nConfig AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nConfig`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

The existing infrastructure owner serializes selected-server output writers with an atomic filesystem directory lock adjacent to the build manifest. Hold it throughout cleanup, generation, module hooks and manifest publication. Competing build/clean operations and startup reject while it exists. A normal failure preserves its original error and releases its owned lock; an interrupted process leaves recovery evidence. Operators must verify no writer remains before removing that exact lock and rebuilding. This does not coordinate independent callers sharing JavaScript global runtime state; each CLI target runs in its own process.

Common-template generation serializes function source and data as JavaScript
expressions. It preserves quotes, escaped newlines, regular expressions, dates
and nested values; never serialize functions into JSON and then strip quotes.
Source-package dependency bindings and later authored method precedence remain
unchanged. Rebuild selected server output after adopting serializer changes.
