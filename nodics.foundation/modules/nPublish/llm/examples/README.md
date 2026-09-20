# nPublish AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nPublish` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

`publicationRequest` and `publicationAudit` support secured generic read/search
only. Their `backoffice` read-only contract denies generic HTTP mutations;
authoritative lifecycle/repository services retain internal updates. Never let
generic CRUD manufacture approval, Online state or transition evidence. Verify
the existing authority test and lifecycle/atomicity suites when changing this
boundary; a domain retry must read or reuse the existing publication authority.
