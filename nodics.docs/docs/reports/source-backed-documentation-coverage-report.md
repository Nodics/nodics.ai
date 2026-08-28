# Source-Backed Documentation Coverage Report

This generated report maps current source boundaries to published documentation catalogue coverage. Open gaps are triage signals, not proof that a page is absent; a technical module can be intentionally covered by a broader business capability page.

## Summary

| Metric | Count |
| --- | --- |
| Catalogue documents | 94 |
| Source boundaries scanned | 172 |
| Needs page or owner mapping | 22 |
| Needs deeper section | 6 |
| Covered | 116 |
| Internal-only candidate | 28 |

## Top Open Items

| Classification | Score | Source boundary | Current matches | Key signals |
| --- | ---: | --- | --- | --- |
| needs-page-or-owner-mapping | 151 | `nodics.kickoff/modules/nexus.web` | None | dataHeaders:8, dataRecords:25, assets:25, tests:1 |
| needs-page-or-owner-mapping | 46 | `nodics.ai/nodics.commerce/modules/fulfillment/modules/fulfillmentCore` | None | schemas:1, services:7, controllers:1, routers:2, tests:3 |
| needs-page-or-owner-mapping | 41 | `nodics.ai/nodics.foundation/modules/nNms` | None | schemas:1, services:6, controllers:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 39 | `nodics.ai/nodics.foundation/modules/nService/vService` | None | schemas:1, services:6, routers:2, tests:3 |
| needs-page-or-owner-mapping | 37 | `nodics.ai/nodics.foundation/modules/nCache/redisCache` | None | schemas:1, services:4, routers:2, tests:5 |
| needs-page-or-owner-mapping | 34 | `nodics.ai/nodics.accelerators/modules/electronics/modules/electronicsProduct` | None | schemas:1, services:3, routers:2, tests:5 |
| needs-page-or-owner-mapping | 34 | `nodics.ai/nodics.foundation/modules/nOtp` | None | schemas:1, services:3, controllers:1, routers:2, tests:3 |
| needs-page-or-owner-mapping | 30 | `nodics.ai/nodics.foundation/modules/nCache/hazelcastCache` | None | schemas:1, services:3, routers:2, tests:3 |
| needs-page-or-owner-mapping | 28 | `nodics.ai/nodics.localization/modules/localizationApi` | None | schemas:1, services:1, controllers:1, routers:2, tests:3 |
| needs-page-or-owner-mapping | 27 | `nodics.ai/nodics.accelerators/modules/telco/modules/telcoCatalog` | None | schemas:1, services:2, routers:2, tests:3 |
| needs-page-or-owner-mapping | 27 | `nodics.ai/nodics.foundation/modules/nDatabase/database/vDatabase` | None | schemas:1, services:2, routers:2, tests:3 |
| needs-page-or-owner-mapping | 24 | `nodics.ai/nodics.commerce/modules/checkout/modules/customerList` | None | schemas:1, services:1, controllers:1, routers:2, tests:1 |
| needs-page-or-owner-mapping | 24 | `nodics.ai/nodics.foundation/modules/nDatabase/mongodb/vMongodb` | None | schemas:1, services:1, routers:2, tests:3 |
| needs-page-or-owner-mapping | 23 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentCore` | None | schemas:1, services:4, tests:2 |
| needs-page-or-owner-mapping | 22 | `nodics.ai/nodics.accelerators/modules/domainCommerceCore` | None | schemas:1, services:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 22 | `nodics.ai/nodics.accelerators/modules/telco/modules/telcoSubscription` | None | schemas:1, services:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 19 | `nodics.ai/nodics.foundation/modules/nData/nExport/csvExport` | None | schemas:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 19 | `nodics.ai/nodics.foundation/modules/nData/nExport/excelExport` | None | schemas:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 19 | `nodics.ai/nodics.foundation/modules/nData/nExport/jsExport` | None | schemas:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 19 | `nodics.ai/nodics.foundation/modules/nData/nExport/jsonExport` | None | schemas:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 19 | `nodics.ai/nodics.foundation/modules/nDatabase/cassandradb` | None | schemas:1, routers:2, tests:2 |
| needs-page-or-owner-mapping | 19 | `nodics.ai/nodics.foundation/modules/nDatabase/elasticdb` | None | schemas:1, routers:2, tests:2 |
| needs-deeper-section | 238 | `nodics.ai/nodics.foundation/modules/nTooling` | foundation.overview, tooling.ai-developer-enablement | services:48, tests:47 |
| needs-deeper-section | 117 | `nodics.ai/nodics.foundation/modules/nEms` | foundation.overview, events.messaging-cluster-coordination | schemas:3, services:12, controllers:1, routers:6, tests:16 |
| needs-deeper-section | 79 | `nodics.ai/nodics.localization/modules/localizationCore` | reference.source-backed-documentation-coverage-audit | schemas:1, services:15, routers:2, dataHeaders:1, dataRecords:4, tests:2 |
| needs-deeper-section | 65 | `nodics.ai/nodics.foundation/modules/nEms/emsClient` | runtime.governed-change, events.messaging-cluster-coordination | schemas:1, services:8, controllers:1, routers:2, tests:11 |
| needs-deeper-section | 63 | `nodics.ai/nodics.foundation/modules/nDatabase/mongodb` | solutions.data-engineering-analytics-platform, persistence.provider-data-access-layer | schemas:2, services:5, routers:4, tests:9 |
| needs-deeper-section | 57 | `nodics.ai/nodics.engagement/modules/contactSubmission` | engagement.unified-operations, communication.overview | schemas:1, services:14, tests:4 |
| internal-only-candidate | 12 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods` | None | services:4 |
| internal-only-candidate | 12 | `nodics.ai/nodics.discovery/modules/discoveryMapping` | None | schemas:1, services:1, tests:1 |
| internal-only-candidate | 12 | `nodics.kickoff/envs` | None | dataHeaders:2, dataRecords:2 |
| internal-only-candidate | 5 | `nodics.ai/nodics.communication/modules/smsCommsProvider` | None | services:1, tests:1 |
| internal-only-candidate | 5 | `nodics.ai/nodics.communication/modules/smtpCommsProvider` | None | services:1, tests:1 |
| internal-only-candidate | 5 | `nodics.ai/nodics.discovery/modules/discoveryQuery` | None | services:1, tests:1 |
| internal-only-candidate | 5 | `nodics.ai/nodics.discovery/modules/discoveryRuntime` | None | services:1, tests:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods/modules/bankTransferPayment` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods/modules/cardPayment` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods/modules/cashOnDeliveryPayment` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentMethods/modules/walletPayment` | None | services:1 |
| internal-only-candidate | 3 | `nodics.ai/nodics.commerce/modules/payment/modules/paymentProviders/modules/paymentProviderCore` | None | services:1 |

## Verification

Regenerate this report with:

```bash
npm --prefix nodics.docs run audit:source-coverage
npm --prefix nodics.docs run audit:source-coverage:check
```

Use this report with `docs/pages/reference/source-backed-documentation-coverage-audit.md` to decide whether each item needs a new page, a deeper section, or an explicit internal-only classification.
