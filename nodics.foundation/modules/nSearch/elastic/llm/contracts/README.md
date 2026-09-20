# elastic AI Contracts

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
