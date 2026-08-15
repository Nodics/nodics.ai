# Nodics Discovery Agent Contract

- Follow the repository agent contract: `../AGENTS.md`.
- Follow global AI guidance: `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every ancestor `AGENTS.md`, this README, contracts, examples, and generated context.
- Keep this group generic. Product, CMS, WCMS, order, customer, or media-specific authority belongs in the owning domain module.
- `nodics.discovery` owns reusable index configuration, mapping, source-provider contracts, publication, query profile, ranking mechanics, and runtime execution seams.
- `nSearch` owns provider/engine adapter behavior. Do not duplicate Elasticsearch/OpenSearch client logic here.
- Axis may render Discovery configuration metadata, but backend schemas, validation, permission, publication, and runtime authority remain here or in the domain participant module.
- Domain source providers must expose customer/public-safe projections. Do not index raw operational records unless the owning domain explicitly provides a safe source provider.
