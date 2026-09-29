# nPublish AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nPublish`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

- [Publication authority](publication-authority-contract.md): lifecycle ownership,
  provider selection, fallback and fail-closed approval boundaries.
- [Process approval bridge](process-approval-bridge.md): reuse of existing
  Process authority, required integration prerequisites and validation limits.

`publicationRequest` and `publicationAudit` support secured generic read/search
only. Their `backoffice` read-only contract denies generic HTTP mutations;
authoritative lifecycle/repository services retain internal updates. Never let
generic CRUD manufacture approval, Online state or transition evidence. Verify
the existing authority test and lifecycle/atomicity suites when changing this
boundary; a domain retry must read or reuse the existing publication authority.
