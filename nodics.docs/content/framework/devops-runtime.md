# Runtime and DevOps operations

Nodics runtime operations are based on explicit server composition and layered
configuration. A runtime server is a process that hosts an effective set of
active modules. The module remains the capability owner; the server is the
runtime grouping.

## Local topology

The reference local setup uses separate servers:

- Platform on `http://localhost:4300`;
- WCMS on `http://localhost:4310`;
- Cron when scheduled behavior is needed;
- Axis on `http://localhost:3100`.

This split keeps module boundaries visible. It also prepares the team for a
future topology where different capabilities may run in different processes,
hosts, containers, or deployment units.

## Configuration layers

Nodics configuration is layered. Framework defaults come first. Project,
environment, server, node, tenant, and governed runtime configuration can refine
behavior later. A developer should place a property in the narrowest owner that
needs it.

Use public browser configuration only for values safe to expose, such as Axis
base URLs and client contract versions. Credentials, private keys, service
tokens, database passwords, and provider secrets belong in protected backend
configuration or deployment secret management.

## Dependencies

MongoDB is the primary local runtime dependency for persisted records.
Elasticsearch is used when search-backed capabilities are enabled. Redis is
used when Redis-backed cache or session behavior is enabled. Enterprise
messaging, external storage, AI providers, or other integrations may be
optional depending on active modules and configuration.

Disabled providers should fail closed or log that they are disabled. A disabled
optional provider is not the same as a broken mandatory provider.

## Deployment mindset

Start simple locally. Keep capability ownership correct. Then distribute only
when scale, resilience, security, or team ownership requires it. The runtime
topology can change without moving business ownership out of the owning module.

For production, define:

- which servers run which functional modules;
- where public and private properties are sourced;
- how credentials are injected and rotated;
- how logs, health, audit events, and runtime diagnostics are collected;
- how content packs, generated artifacts, and database migrations are released;
- how rollback works for code, configuration, and imported content.

## Monitoring and recovery

Platform exposes registry and BackOffice projections for active modules. WCMS
owns content-pack delivery and CMS route resolution. Cron owns scheduled work.
Axis should show recovery states when these backends are unavailable instead of
inventing another control plane.

When something fails, identify the owner first:

- login or BackOffice bootstrap: Platform/Profile/BackOffice;
- CMS page delivery or documentation content: WCMS/CMS/content-pack owner;
- scheduled job execution: Cron;
- frontend rendering or shell interaction: Axis;
- customer-specific behavior: customer project module.

## Common mistakes

- Treating environment or server modules as business capability owners.
- Putting secrets into frontend `.env` files.
- Deploying generated content without a version change.
- Relying on process memory instead of durable registration or import history.
- Ignoring negative tests, recovery states, and rollback behavior.

## Next actions

Before production, write an environment-specific operations runbook that lists
server topology, dependency versions, secrets strategy, health checks,
monitoring, backup, restore, content-pack import process, and rollback steps.
