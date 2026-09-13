# Waste Verification

`wasteVerification` records generic operator/admin review decisions for waste
submissions.

Axis consumes the shared review workspace as a paginated submission listing with
read-only summaries and a governed detail dialog. Generic and accelerator views
use the same renderer; the publishing module contributes its view identity and
fixed family through the existing authorized view contract. Listing, dialog and
CSV column labels are configurable under `waste.reviewWorkspace.labels`. A later
module can override those labels without copying the generic defaults or creating
a frontend catalogue. Review permissions, image holds and exact-revision decisions
remain enforced by their existing owner services.

The Axis CSV action reads all matching authorized pages, with the same filters and
scope as the listing. It excludes private photo content, aborts on page errors,
changed totals or duplicate records, and is not a database snapshot. Existing page
limits remain authoritative; large background exports need a separate owner-backed
export contract. `test/wasteReviewWorkspace.test.js` protects scoped family/query
behavior; Axis `test/wasteManagement` covers reusable clothing presentation,
review interactions, dirty close, export escaping and failed-page recovery.

Submission search combines text, status and advanced fields in one shared Axis
search panel. The same domain fields also serve Waste dashboards. Applied chips
are removable only for optional criteria; Clear all cannot remove a contributed
view's fixed family or review-queue restriction. Text search, advanced criteria
and export all use the existing owner query. The labels `advancedSearch`,
`clearAll` and `resultsUnavailable` are configured through the existing
`waste.reviewWorkspace.labels` map. Query errors keep authorized search controls
available for correction while context/owner failures still hide the workspace.

Review details require an explicit claim before any new verification or final decision. Axis shows a persistent assignment header and keeps properties/feedback read-only until the owner confirms assignment. Queue release and verification handoff restore read-only mode. Claim does not grant additional permissions or waive a separate-approver policy. See [review workspace contract](llm/contracts/review-workspace.md) for enforcement, recovery, labels and tests.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
