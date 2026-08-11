# Editorial contracts

- News and Blog are initial `editorialContentType` records, not runtime modules.
- `editorialArticle` is the aggregate root; localized copy lives in `editorialArticleLocalization`.
- Validation and readiness are side-effect free.
- Process executes workflow and task state; Editorial contributes one allow-listed revision-correlated action adapter.
- Cron remains scheduler authority through Process trigger metadata.
- nPublish owns validation, activation, rollback, and withdrawal transitions; Editorial supplies domain and version adapters.
- Online schemas have no generated CRUD router and are exposed only through sanitized Editorial delivery services.
- Axis discovers authoring workspaces from `DefaultEditorialBackofficeCapabilityService`.
- Nexus renderer keys are allow-listed executable frontend contracts; customer/project data packs own CMS composition records.
