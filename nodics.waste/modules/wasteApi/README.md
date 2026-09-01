# Waste API

`wasteApi` exposes secured, generic Waste capability routes for framework and
partner integrations.

The current API surface is intentionally internal and resource-oriented. It
proves the generic Waste contract without creating customer/public journey
routes inside the framework layer.

| Operation | Method | Route key | Purpose |
| --- | --- | --- | --- |
| `collectionAcceptanceCheck` | `POST` | `/waste/collection-points/:collectionPointCode/acceptance-check` | Check submitted waste facts against schema-driven acceptance rules. |
| `submitWaste` | `POST` | `/waste/submissions` | Create or submit a generic waste submission. |
| `transitionSubmission` | `POST` | `/waste/submissions/:submissionCode/transitions` | Apply the generic submission lifecycle. |
| `calculateImpact` | `POST` | `/waste/impact-results` | Calculate impact metrics from a versioned profile and source facts. |

Project-facing APIs, branded mobile journeys, recycler integrations, logistics
callbacks, public collection discovery, and reward-trigger endpoints belong in
later project or integration modules that extend this route set. They should
reference Waste records by stable code or source reference instead of changing
the framework API owner.
