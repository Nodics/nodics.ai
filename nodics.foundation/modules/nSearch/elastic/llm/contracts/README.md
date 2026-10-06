# elastic AI Contracts

## Dedicated Index Retirement

The existing registered model delegates `inspectRetirement` and `retireIndex` to
`DefaultElasticIndexRetirementService`. Require dedicated immutable physical
names, exact UUID, no aliases/data streams, current owner callbacks and modern
promise-based client methods with per-request `maxRetries: 0`. Never reuse an old
physical name during retirement. Positive whole-index and shard acknowledgement
plus same-UUID blocked readback is mandatory. A timeout or metadata-only block
does not prove quiescence. Retirement performs no delete, recreate, unblock or
credential mutation. Discovery owns the durable original receipt; Copilot owns source
authority and replacement qualification. See the canonical Knowledge Progress
and Recovery guide and its integrated migration test for extension examples.

Separate `inspectDecommissioning` and `eraseRetiredIndex` use only this same
registered model. The deployment must declare an exhaustive API-key-only writer
inventory, preserve immutable physical-name ownership and exclude concurrent
administrative recreation. Verify every configured key by exact ID with native
`invalidated: true` evidence and effective `action.auto_create_index: false`.
These checks do not discover unknown historical principals; unqualified/mixed
writer deployments remain unsupported. Never change credentials or cluster policy.
Recheck blocked UUID and owner callback before one exact index delete with
`maxRetries: 0`; require positive acknowledgement and exact native typed 404.
Generic proxy errors, absent evidence, name replacement and negative envelopes
are not completion. Discovery persists the original acknowledged result.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nSearch/elastic`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

- Keep Nodics layered search configuration authoritative. Normalize legacy
  connection keys only inside the Elastic adapter.
- Put request timeout on client transport configuration, never into the ping
  request query.
- Use current Elasticsearch wire parameter names.
- Provider-neutral modules must invoke nSearch models and must not construct an
  Elasticsearch client or refresh an index directly.

The Local Elasticsearch baseline is `http://localhost:9200` in this provider. Local customer properties inherit it. Other environments override only actual differences such as service DNS, TLS or authentication; do not copy the Local address into customer configuration.
