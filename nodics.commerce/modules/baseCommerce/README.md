# Base Commerce

`baseCommerce` is the reusable Commerce module group for foundational store,
product, pricing, tax, promotion, inventory, and commerce-search capabilities.
It composes the required child modules and provides the governed core-reference
data needed before customer-facing Commerce APIs and storefront journeys are
activated.

## Ownership

- Owns Base Commerce composition, configuration, LLM guidance, tests, and the
  `data/core-v001` Commerce core-reference release declared in `data/manifest.json`.
- Does not own child capability schemas, services, routers, source behavior, or
  feature-specific business rules.
- Keeps operational store, sales-channel, and point-of-service defaults as
  internal reference data for local and customer-project initialization.

## Extension

Customer or accelerator modules should extend the concrete child capability
that owns the behavior being changed. Use this group only for composition-level
changes or shared core-reference data that must exist before child Commerce
capabilities are activated.

## Verification

After changing this module, run the framework structure and LLM checks from the
repository root:

```bash
npm run structure:audit -- --fail
npm run llm:generate
npm run llm:validate
```

Read `AGENTS.md`, contracts, examples, and generated context before changes.
