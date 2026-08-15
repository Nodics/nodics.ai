# Discovery Contracts

Discovery separates generic index/search mechanics from domain participation.

## Invariants

1. `nodics.discovery` owns generic index configuration, mapping, source mix, query profile, facet profile, ranking profile, publication policy, and runtime execution seams.
2. Domain modules own domain nouns such as Product, Page, Content, Price, Inventory, Media, and their safe source providers.
3. Raw operational schemas are not indexed by default. A domain must expose an approved source provider or projection.
4. `nSearch` remains the engine adapter. Discovery prepares governed documents and requests; it does not own Elasticsearch client behavior.
5. Business ranking primitives are generic, but domain modules decide which entities and source fields are eligible.
