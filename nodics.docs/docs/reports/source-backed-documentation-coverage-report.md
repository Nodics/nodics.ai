# Source-Backed Documentation Coverage Report

This generated report maps current source boundaries to published documentation catalogue coverage. Open gaps are triage signals, not proof that a page is absent; a technical module can be intentionally covered by a broader business capability page.

## Summary

| Metric | Count |
| --- | --- |
| Catalogue documents | 102 |
| Source boundaries scanned | 172 |
| Needs page or owner mapping | 11 |
| Needs deeper section | 5 |
| Covered | 131 |
| Internal-only candidate | 25 |
| Classified backlog items | 23 |

## Classified Backlog

| Priority | Status | Item | Classification | Source areas | Action |
| --- | --- | --- | --- | --- | --- |
| P0 | closed-by-p0-docs-batch | Nexus data and content guide | needs-page | `nodics.kickoff/modules/nexus.web` | Document project content data, media assets, publication, Online delivery, and browser validation for Nexus. |
| P0 | closed-by-p0-docs-batch | Axis setup and user-safe error contracts | needs-deeper-section | `nodics.platform/modules/backoffice`<br/>`nodics.platform/modules/axis`<br/>`nodics.exp/nodics.axis` | Document status states, setup blockers, retry actions, technical evidence, and user-safe message rules. |
| P0 | closed-by-p0-docs-batch | CMS exact source map | needs-deeper-section | `nodics.wcms/modules/cms` | Split authoring, delivery, publication manifest, migration, cache, and documentation governance coverage. |
| P0 | closed-by-p0-docs-batch | Media operations runbook | needs-deeper-section | `nodics.wcms/modules/media`<br/>`nodics.foundation/modules/nData/nImport/import/src/service/media` | Document upload, import hydration, storage providers, cleanup lifecycle, replication queue, and delivery failures. |
| P0 | closed-by-p0-docs-batch | Import/export provider guides | needs-page | `nodics.foundation/modules/nData/nImport`<br/>`nodics.foundation/modules/nData/nExport` | Document JavaScript, JSON, CSV, Excel, generated exports, parser behavior, safety, masking, and customization. |
| P0 | closed-by-p0-docs-batch | Commerce product, price, inventory, and fulfillment authoring | needs-page-or-deeper-section | `nodics.commerce/modules/baseCommerce`<br/>`nodics.commerce/modules/fulfillment` | Document data dependencies, creation lanes, publication, search projection, fulfillment evidence, and browser proof. |
| P0 | closed-by-p0-docs-batch | Documentation publishing runbook | needs-deeper-section | `nodics.docs`<br/>`nodics.wcms/modules/cms`<br/>`nodics.process/modules/nPublish` | Document source Markdown to generated data, Staged import, review, Online publication, rollback, and rendering. |
| P1 | open | Module Registry journey | needs-deeper-section | `nodics.platform/modules/backoffice`<br/>`nodics.platform/modules/moduleRegistry` | Document registration, activation, dependencies, required capability checks, status projection, and Axis visibility. |
| P1 | open | Commerce Search guide | needs-deeper-section | `nodics.commerce/modules/baseCommerce/modules/commerceSearch` | Document ranking rules, projections, publishing, index ownership, and storefront impact. |
| P1 | open | Localization depth | needs-page-or-deeper-section | `nodics.localization/modules/localizationCore`<br/>`nodics.localization/modules/localizationApi` | Document locale records, fallback behavior, content and product localization, import data, and API boundary. |
| P1 | open | Payment Core and provider split | needs-page-or-owner-mapping | `nodics.commerce/modules/payment` | Document payment decisions, method/provider separation, reconciliation, and safe customer payloads. |
| P1 | open | Customer List and Profile-Commerce boundary | needs-page-or-owner-mapping | `nodics.commerce/modules/checkout/modules/customerList`<br/>`nodics.platform/modules/profile` | Document why customer list exists in Commerce and what Profile owns. |
| P1 | open | NMS runtime monitoring | needs-page-or-owner-mapping | `nodics.foundation/modules/nNms` | Document node monitoring, topology, health checks, runtime evidence, and operator recovery. |
| P1 | open | Service runtime and override precedence | needs-page-or-owner-mapping | `nodics.foundation/modules/nService`<br/>`nodics.foundation/modules/nService/vService` | Document generated services, virtual service behavior, override precedence, and extension safety. |
| P1 | open | Cache provider runbooks | needs-page-or-owner-mapping | `nodics.foundation/modules/nCache`<br/>`nodics.foundation/modules/nCache/redisCache`<br/>`nodics.foundation/modules/nCache/hazelcastCache` | Document Redis, Hazelcast, Node cache, key strategy, invalidation, and production behavior. |
| P1 | open | Database provider boundaries | needs-page-or-owner-mapping | `nodics.foundation/modules/nDatabase` | Document MongoDB, virtual DB, Cassandra, Elasticsearch, configuration, provider contracts, and validation. |
| P1 | open | OTP and security flow | needs-page-or-owner-mapping | `nodics.foundation/modules/nOtp` | Document OTP generation, verification, expiry, retry, throttling, audit, and security controls. |
| P1 | open | Communication providers | needs-page-or-deeper-section | `nodics.communication/modules/smtpCommsProvider`<br/>`nodics.communication/modules/smsCommsProvider` | Document SMTP/SMS providers, templates, retry, failed delivery evidence, and extension rules. |
| P1 | open | Engagement and contact submission | needs-deeper-section | `nodics.engagement/modules/contactSubmission` | Document contact forms, moderation, workflow, notification, audit, and recovery. |
| P1 | open | Workflow and BPM source map | needs-deeper-section | `nodics.foundation/modules/nbpm`<br/>`nodics.process` | Document workflow definitions, transitions, tasks, callbacks, history, and operator visibility. |
| P1 | open | Cron job data authoring | needs-deeper-section | `nodics.process/modules/cronjob` | Document job records, schedules, execution policy, retry, idempotency, and Process server ownership. |
| P1 | open | Release and upgrade compatibility | needs-deeper-section | `nodics.docs`<br/>`nodics.foundation/modules/nSetup`<br/>`all module data folders` | Document version freeze, upgrade path, rollback, checksum drift, generated manifest policy, and customer extension compatibility. |
| P2 | open | Internal-only classification register | needs-owner-decision | `all low-score utility modules` | Decide which technical modules remain internal and which broader page owns their explanation. |

## Top Open Items

| Classification | Score | Source boundary | Current matches | Key signals |
| --- | ---: | --- | --- | --- |
| needs-page-or-owner-mapping | 46 | `nodics.ai/nodics.commerce/modules/fulfillment/modules/fulfillmentCore` | None | schemas:1, services:7, controllers:1, routers:2, tests:3 |
| needs-page-or-owner-mapping | 37 | `nodics.ai/nodics.foundation/modules/nCache/redisCache` | None | schemas:1, services:4, routers:2, tests:5 |
| needs-page-or-owner-mapping | 34 | `nodics.ai/nodics.accelerators/modules/electronics/modules/electronicsProduct` | None | schemas:1, services:3, routers:2, tests:5 |
| needs-page-or-owner-mapping | 30 | `nodics.ai/nodics.foundation/modules/nCache/hazelcastCache` | None | schemas:1, services:3, routers:2, tests:3 |
| needs-page-or-owner-mapping | 27 | `nodics.ai/nodics.accelerators/modules/telco/modules/telcoCatalog` | None | schemas:1, services:2, routers:2, tests:3 |
| needs-page-or-owner-mapping | 27 | `nodics.ai/nodics.foundation/modules/nDatabase/database/vDatabase` | None | schemas:1, services:2, routers:2, tests:3 |
| needs-page-or-owner-mapping | 24 | `nodics.ai/nodics.foundation/modules/nDatabase/mongodb/vMongodb` | None | schemas:1, services:1, routers:2, tests:3 |
| needs-page-or-owner-mapping | 22 | `nodics.ai/nodics.accelerators/modules/domainCommerceCore` | None | schemas:1, services:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 22 | `nodics.ai/nodics.accelerators/modules/telco/modules/telcoSubscription` | None | schemas:1, services:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 19 | `nodics.ai/nodics.foundation/modules/nDatabase/cassandradb` | None | schemas:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 19 | `nodics.ai/nodics.foundation/modules/nDatabase/elasticdb` | None | schemas:1, routers:2, tests:2 |
| needs-deeper-section | 238 | `nodics.ai/nodics.foundation/modules/nTooling` | foundation.overview, tooling.ai-developer-enablement | services:48, tests:47 |
| needs-deeper-section | 117 | `nodics.ai/nodics.foundation/modules/nEms` | foundation.overview, events.messaging-cluster-coordination | schemas:3, services:12, controllers:1, routers:6, tests:16 |
| needs-deeper-section | 79 | `nodics.ai/nodics.localization/modules/localizationCore` | reference.source-backed-documentation-coverage-audit, reference.documentation-gap-backlog | schemas:1, services:15, routers:2, dataHeaders:1, dataRecords:4, tests:2 |
| needs-deeper-section | 65 | `nodics.ai/nodics.foundation/modules/nEms/emsClient` | runtime.governed-change, events.messaging-cluster-coordination | schemas:1, services:8, controllers:1, routers:2, tests:11 |
| needs-deeper-section | 41 | `nodics.ai/nodics.foundation/modules/nNms` | reference.documentation-gap-backlog | schemas:1, services:6, controllers:1, routers:2, tests:2 |
| internal-only-candidate | 12 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods` | None | services:4 |
| internal-only-candidate | 12 | `nodics.ai/nodics.discovery/modules/discoveryMapping` | None | schemas:1, services:1, tests:1 |
| internal-only-candidate | 5 | `nodics.ai/nodics.discovery/modules/discoveryQuery` | None | services:1, tests:1 |
| internal-only-candidate | 5 | `nodics.ai/nodics.discovery/modules/discoveryRuntime` | None | services:1, tests:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods/modules/bankTransferPayment` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods/modules/cardPayment` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods/modules/cashOnDeliveryPayment` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods/modules/walletPayment` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentProviders/modules/paymentProviderCore` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentProviders/modules/stripeProvider` | None | services:1 |
| internal-only-candidate | 3 | `nodics.kickoff/modules/kickoffInt` | None | services:1 |
| internal-only-candidate | 0 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentProviders/modules/cyberSourceProvider` | None | package only |
| internal-only-candidate | 0 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentProviders/modules/paypalProvider` | None | package only |
| internal-only-candidate | 0 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentProviders/modules/visaProvider` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffDockerLocal` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffDockerLocal/commerceServer` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffDockerLocal/commerceStagedServer` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffDockerLocal/wcmsOnlineServer` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffDockerLocal/wcmsStagedServer` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffLocal/commerceServer` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffLocal/commerceStagedServer` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffLocal/wcmsOnlineServer` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/envs/kickoffLocal/wcmsStagedServer` | None | package only |
| internal-only-candidate | 0 | `nodics.kickoff/modules/kickoffApi` | None | package only |

## Verification

Regenerate this report with:

```bash
npm --prefix nodics.docs run audit:source-coverage
npm --prefix nodics.docs run audit:source-coverage:check
```

Use this report with `docs/pages/reference/source-backed-documentation-coverage-audit.md` to decide whether each item needs a new page, a deeper section, or an explicit internal-only classification.
