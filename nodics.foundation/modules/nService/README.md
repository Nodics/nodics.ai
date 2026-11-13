# nService

Selected provisioning prepares a newly created tenant on its first admitted
secured request, using the existing inventory and startup resource owners.
See [tenant startup completion](llm/contracts/README.md#tenant-startup-completion)
for concurrency, refusal, customization and evidence boundaries.

nService owns shared service-layer communication, tenant startup, runtime registration and authentication helpers. Domain services retain their business authority.

Use existing module transport and runtime lifecycle owners. Preserve tenant isolation, secret redaction and mandatory startup completion; unsafe writes require explicit idempotency before retry.

Capability-declared exact HTTP 400/404 domain refusals remain diagnostic failures
without penalizing transport availability; the default declaration map is empty.
See [the circuit policy contract](llm/contracts/README.md#capability-owned-domain-refusals).

Detailed material is preserved in the adjacent [implementation and operations guide](service-runtime-guide.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## When To Use This Module

See [When To Use This Module](service-runtime-guide.md#when-to-use-this-module).

## Service Model

See [Service Model](service-runtime-guide.md#service-model).

## Capability

See [Capability](service-runtime-guide.md#capability).

## Runtime Flow

See [Runtime Flow](service-runtime-guide.md#runtime-flow).

## Configuration And Security

See [Configuration And Security](service-runtime-guide.md#configuration-and-security).

## Override Path

See [Override Path](service-runtime-guide.md#override-path).

## Extension Contract

See [Extension Contract](service-runtime-guide.md#extension-contract).

## Tests

See [Tests](service-runtime-guide.md#tests).

## What To Avoid

See [What To Avoid](service-runtime-guide.md#what-to-avoid).

## Integration And Contract Boundaries

See [Integration And Contract Boundaries](service-runtime-guide.md#integration-and-contract-boundaries).

## Observability, Performance, And Resilience

See [Observability, Performance, And Resilience](service-runtime-guide.md#observability-performance-and-resilience).

## Common Mistakes

See [Common Mistakes](service-runtime-guide.md#common-mistakes).

## Continue

See [Continue](service-runtime-guide.md#continue).

## Tenant startup completion

See [Tenant startup completion](service-runtime-guide.md#tenant-startup-completion).

Registration admission shares installed-source discovery within one bounded
operation, including a complete batch and atomic retries. Subsequent operations
read fresh metadata; signed scope and ownership checks still apply per lease.


Authority-context maps inherit nService's empty baseline; a common context stays
null until explicitly selected. Deployments select actual module/schema contexts
without defining the registry or copying defaults. Selection is placement metadata,
not a permission grant. See [context ownership](llm/contracts/README.md#selected-authority-context-defaults).

## Tenant cleanup completion

`DefaultTenantHandlerService.removeTenants` awaits the existing Cron, database,
model and search owners for every selected module and tenant before removing its
active marker or returning success. Empty input resolves without work. Owner
failures propagate and retain the marker for inspection; prior cleanup effects
are not transactional or rolled back. Business entry remains governed by fresh
Enterprise status and session checks. Later service overrides may add awaited
cleanup but must preserve completion and active-scope validation.
`test/tenantStartupCompletionContract.test.js` composes the actual database
registry validator and covers deferred, failed, empty and multi-tenant cleanup.

BackOffice registration uses the Framework five-second transport deadline, matching ordinary module communication and remaining below the thirty-second lease. Large validated runtime batches may take longer than two seconds. A stored lease is not a client acknowledgement: readiness still requires a fresh successful response, and expired operational state continues to deny protected work.
