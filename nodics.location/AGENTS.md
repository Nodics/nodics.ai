# nodics.location Agents

Follow the root Nodics AI agent contract before changing this boundary:

- root `README.md` explains the human/documentation route.
- root `AGENTS.md` governs repository-wide AI and contributor behavior.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This Location group boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Location owns reusable semantic-place identity, coordinate validation, map/search projections, business-user drafts, approval orchestration, and Location-owned runtime contracts. Commerce, Waste, Platform, Process, Loyalty, WCMS, customer projects, and Axis may consume Location or contribute configuration, but they must not become the owner of Location schemas or map/search projection behavior.

Use separate `latitude` and `longitude` fields in business schemas. Do not store comma-separated coordinates or unlabeled coordinate arrays in domain records. Provider-specific coordinate shapes, including GeoJSON coordinate arrays, belong behind Location-owned search, map, or provider adapters.

Profile owns reusable address/contact facts. Location schemas must reference Profile address/contact records and must not duplicate postal fields, reusable landmark/access notes, address geocoding metadata, address verification metadata, or reusable privacy-safe display policy.

Tenant is runtime isolation and data placement, not business ownership. Do not add direct `tenant` fields to Location business schemas, DTOs, imports, events, or APIs unless a documented framework envelope or isolation-index exception applies. Use enterprise association when business ownership, operator ownership, venue scope, or visibility scope is required.

Runtime-capable Location modules must run in both consolidated and standalone micro-service style. The first live target is Kickoff `locationServer`; Location source must not assume Commerce, Waste, Profile, Media, Process, Search, or Notification is loaded in the same process.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.
