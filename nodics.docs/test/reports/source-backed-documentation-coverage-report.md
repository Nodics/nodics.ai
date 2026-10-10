# Source-Backed Documentation Coverage Report

This generated report maps source boundaries to the authoring catalogue, including drafts. Validated source sections bind anchored content to real module files; other matches are mention-based triage only. Coverage is documentation evidence, not proof of implementation, publication, runtime qualification or browser acceptance.

## Summary

| Metric | Count |
| --- | --- |
| Catalogue documents | 176 |
| Source boundaries scanned | 203 |
| Needs page or owner mapping | 0 |
| Needs deeper section | 0 |
| Covered | 196 |
| Internal-only candidate | 0 |
| Reviewed shared-guide mapping (not depth certification) | 7 |
| Classified backlog items | 22 |
| Source-editorial backlog closed with current evidence | 22 |
| Source-editorial backlog still open | 0 |

## Classified Backlog

| Priority | Status | Item | Classification | Source areas | Action |
| --- | --- | --- | --- | --- | --- |
| P0 | closed-with-evidence | Axis setup and user-safe error contracts | needs-deeper-section | `nodics.platform/modules/backoffice`<br/>`nodics.platform/modules/axis` | Document status states, setup blockers, retry actions, technical evidence, and user-safe message rules. |
| P0 | closed-with-evidence | CMS exact source map | needs-deeper-section | `nodics.wcms/modules/cms` | Split authoring, delivery, publication manifest, migration, cache, and documentation governance coverage. |
| P0 | closed-with-evidence | Media operations runbook | needs-deeper-section | `nodics.wcms/modules/media`<br/>`nodics.foundation/modules/nData/nImport/import/src/service/media` | Document upload, import hydration, storage providers, cleanup lifecycle, replication queue, and delivery failures. |
| P0 | closed-with-evidence | Import/export provider guides | needs-page | `nodics.foundation/modules/nData/nImport`<br/>`nodics.foundation/modules/nData/nExport` | Document JavaScript, JSON, CSV, Excel, generated exports, parser behavior, safety, masking, and customization. |
| P0 | closed-with-evidence | Commerce product, price, inventory, and fulfillment authoring | needs-page-or-deeper-section | `nodics.commerce/modules/baseCommerce`<br/>`nodics.commerce/modules/fulfillment` | Document data dependencies, creation lanes, publication, search projection, fulfillment evidence, and browser proof. |
| P0 | closed-with-evidence | Documentation publishing runbook | needs-deeper-section | `nodics.docs`<br/>`nodics.wcms/modules/cms`<br/>`nodics.foundation/modules/nPublish` | Document canonical CMS data, optional CONTENT_PACK selection, Staged import, review, Online publication, rollback, and rendering. |
| P1 | closed-with-evidence | Module Registry journey | needs-deeper-section | `nodics.platform/modules/backoffice`<br/>`nodics.platform/modules/moduleRegistry` | Document registration, activation, dependencies, required capability checks, status projection, and Axis visibility. |
| P1 | closed-with-evidence | Commerce Search guide | needs-deeper-section | `nodics.commerce/modules/baseCommerce/modules/commerceSearch` | Document ranking rules, projections, publishing, index ownership, and storefront impact. |
| P1 | closed-with-evidence | Localization depth | needs-page-or-deeper-section | `nodics.localization/modules/localizationCore`<br/>`nodics.localization/modules/localizationApi` | Document locale records, fallback behavior, content and product localization, import data, and API boundary. |
| P1 | closed-with-evidence | Payment Core and provider split | needs-page-or-owner-mapping | `nodics.commerce/modules/payment` | Document payment decisions, method/provider separation, reconciliation, and safe customer payloads. |
| P1 | closed-with-evidence | Shopping List Commerce boundary | needs-page-or-owner-mapping | `nodics.commerce/modules/baseCommerce/modules/shoppingList`<br/>`nodics.platform/modules/profile` | Document why shopping-intent lists belong to Base Commerce and what Profile owns. |
| P1 | closed-with-evidence | NMS runtime monitoring | needs-page-or-owner-mapping | `nodics.foundation/modules/nNms` | Document node monitoring, topology, health checks, runtime evidence, and operator recovery. |
| P1 | closed-with-evidence | Service runtime and override precedence | needs-page-or-owner-mapping | `nodics.foundation/modules/nService`<br/>`nodics.foundation/modules/nService/vService` | Document generated services, virtual service behavior, override precedence, and extension safety. |
| P1 | closed-with-evidence | Cache provider runbooks | needs-page-or-owner-mapping | `nodics.foundation/modules/nCache`<br/>`nodics.foundation/modules/nCache/redisCache`<br/>`nodics.foundation/modules/nCache/hazelcastCache` | Document Redis, Hazelcast, Node cache, key strategy, invalidation, and production behavior. |
| P1 | closed-with-evidence | Database provider boundaries | needs-page-or-owner-mapping | `nodics.foundation/modules/nDatabase` | Document MongoDB, virtual DB, Cassandra, Elasticsearch, configuration, provider contracts, and validation. |
| P1 | closed-with-evidence | OTP and security flow | needs-page-or-owner-mapping | `nodics.foundation/modules/nOtp` | Document OTP generation, verification, expiry, retry, throttling, audit, and security controls. |
| P1 | closed-with-evidence | Communication providers | needs-page-or-deeper-section | `nodics.communication/modules/smtpCommsProvider`<br/>`nodics.communication/modules/smsCommsProvider` | Document SMTP/SMS providers, templates, retry, failed delivery evidence, and extension rules. |
| P1 | closed-with-evidence | Engagement and contact submission | needs-deeper-section | `nodics.engagement/modules/contactSubmission` | Document contact forms, moderation, workflow, notification, audit, and recovery. |
| P1 | closed-with-evidence | Workflow and BPM source map | needs-deeper-section | `nodics.foundation/modules/nbpm`<br/>`nodics.process` | Document workflow definitions, transitions, tasks, callbacks, history, and operator visibility. |
| P1 | closed-with-evidence | Cron job data authoring | needs-deeper-section | `nodics.process/modules/cronjob` | Document job records, schedules, execution policy, retry, idempotency, and Process server ownership. |
| P1 | closed-with-evidence | Release and upgrade compatibility | needs-deeper-section | `nodics.docs`<br/>`nodics.foundation/modules/nSetup`<br/>`all module data folders` | Document version freeze, upgrade path, rollback, checksum drift, generated manifest policy, and customer extension compatibility. |
| P2 | closed-with-evidence | Internal-only classification register | needs-owner-decision | `all low-score utility modules` | Decide which technical modules remain internal and which broader page owns their explanation. |

## Top Open Items

| Classification | Score | Source boundary | Current matches | Key signals |
| --- | ---: | --- | --- | --- |

## Verification

Regenerate this report with:

```bash
npm --prefix nodics.docs run audit:source-coverage
npm --prefix nodics.docs run audit:source-coverage:check
```

Use this report with the source-backed documentation coverage CMS article to decide whether each item needs a new page, a deeper section, or an explicit internal-only classification.
