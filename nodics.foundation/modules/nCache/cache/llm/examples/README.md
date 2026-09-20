# cache AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nCache/cache` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

Cross-node invalidation defaults to automatic selection from enabled remote event publishing. Explicit true/false remains supported. Shared distributed adapters skip duplicate broadcasts; single-node deployments do not emit unnecessary peer events. Strict authentication channels never gain local fallback.
