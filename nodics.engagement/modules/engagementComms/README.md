# engagementComms

Customer engagement communication intent and outcome bridge capability.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## Phase 1C status

This package is the active one-way adapter from Engagement intents to the separately owned `nodics.communication` contract. It builds declared, bounded context and returns content-free delivery correlation. The standard Engagement server loads Communication first.

## Ownership

It owns Engagement communication scenarios, declared variables, safe context builders, provider-neutral intent translation, idempotency mapping, and content-free outcome correlation.

It must not own templates, provider accounts, credentials, transport, retry/fallback, generic preferences, OTP mechanics, inbox persistence, or another domain's state.

## Dependencies and extension

This capability consumes the validated `nodics.communication` contract. If Communication is unavailable, the business record remains accepted and delivery is deferred or failed with correlation evidence. Customer and project customization belongs in later-loaded modules and layered configuration; archived CRES or gNotify files are reference evidence only.

## Verification

Phase 1C verifies one-way dependency, declared context, stable idempotency, content-free outcomes, provider failure isolation, Communication-before-Engagement runtime order, and no domain-state mutation.
