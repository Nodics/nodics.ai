# Commerce Search contracts

- Commerce Search owns business-managed ranking rules for commerce discovery, including pin, boost, and bury actions.
- nSearch owns generic search engine connectivity, index operations, query execution, and provider behavior.
- Product owns product, category, localized product projection, customer-safe price, and availability data.
- Axis manages backoffice rule authoring and approval surfaces; Agora consumes ranked discovery results through Product APIs.
- Ranking must fail open for customer discovery unless a server configuration explicitly changes the behavior.
