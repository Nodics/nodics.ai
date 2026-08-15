# Nodics Discovery

Generic enterprise discovery, indexing, query, and ranking module group.

`nodics.discovery` owns common search-index configuration concepts that can be reused by Product, WCMS content, pages, media, documentation, and future domains. It does not own Product, CMS, WCMS, pricing, inventory, or page-rendering semantics.

## Package map

| Package | Responsibility |
| --- | --- |
| `discoveryConfig` | Index, source-mix, query-profile, facet-profile, ranking-profile, and publication-policy definitions |
| `discoverySource` | Source-provider registration and source eligibility contracts |
| `discoveryMapping` | Field mapping, analyzer mapping, display-field policy, and sensitive-field exclusion |
| `discoveryProjection` | Generic discovery document shape and projection validation |
| `discoveryPublication` | Index publication orchestration, rebuild contracts, alias switch, and rollback descriptors |
| `discoveryQuery` | Provider-neutral query profile resolution and search request preparation |
| `discoveryRanking` | Generic pin, boost, bury, score-adjustment, priority, and conflict mechanics |
| `discoveryRuntime` | Active configuration/profile resolution and nSearch-backed execution facade |

Domain modules specialize Discovery:

```text
baseCommerce/commerceSearch -> Product discovery participation
nodics.wcms/wcmsSearch      -> CMS/WCMS content and page discovery participation
```

`nSearch` remains the low-level Elasticsearch/OpenSearch adapter.
