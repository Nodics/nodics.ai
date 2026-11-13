# Base Commerce

`baseCommerce` is the reusable Commerce module group for foundational store,
product, pricing, tax, promotion, inventory, and commerce-search capabilities.
It composes the required child modules. Store owns the operational schemas.
Customer projects select their own Store, Sales Channel and Point of Service
records. Extend the concrete child capability for behavior changes.

## Verification

After changing this module, run the framework structure and LLM checks from the
repository root:

```bash
npm run structure:audit -- --fail
npm run llm:generate
npm run llm:validate
```

Read `AGENTS.md`, contracts, examples, and generated context before changes.
