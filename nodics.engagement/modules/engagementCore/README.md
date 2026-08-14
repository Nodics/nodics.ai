# engagementCore

Shared customer engagement contracts and governance foundation.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## Capability status

This package implements provider-neutral intake, lifecycle, consent, triage, protection, audit-event descriptors, form definitions, and integration references. Its ten internal schemas are deliberately router-, cache-, event-, and search-disabled; exposure belongs to `engagementApi` and derived projections belong to their owning capabilities.

## Ownership

It owns shared intake envelopes, lifecycle vocabulary, consent, assignment, classification, audit evidence, protection, form-definition contracts, and integration references.

It must not own review, feedback, testimonial, contact, provider-delivery, workflow-runtime, media-binary, or generic publication behavior.

## Dependencies and extension

This capability depends on Nodics Foundation contracts; it integrates with Process, Profile, Publish, WCMS/Media, Search, Cache, and Cron only through their owned boundaries. Customer and project customization belongs in later-loaded modules and layered configuration; archived CRES or gNotify files are reference evidence only.

## Verification

Run the module boundary and behavior tests, generated-artifact checks, structure audit, LLM validation, and repository basic suite. Release qualification requires all applicable checks to pass.
