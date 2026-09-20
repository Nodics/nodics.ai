# Waste Submission

`wasteSubmission` captures submitted waste facts, evidence references, advisory
metadata suggestions, and submission lifecycle state.

Photo-first callers may analyze transient bytes and commit a prepared submission
only after recognition succeeds. The same analyzer serves existing saved drafts;
failed replacement preserves prior saved evidence. Empty legacy drafts can be
removed through the owner-authorized, revision-checked discard command.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Metadata changes must preserve the [property coverage and lifecycle contract](llm/contracts/README.md) and its focused persistence/projection regressions.

Photo prompt WASTE_PHOTO_V6 asks for defensible per-item mass bounds independently of unknown brand/model, retaining INFERRED basis and confidence. No scale means no measured weight, not an automatic prohibition on estimation. Non-photo evidence restrictions still apply; quantity is applied once downstream. Never request invented environmental factors.

Photo prompt V7 supports opt-in `allowBundles` (enabled by eWaste): MULTIPLE_ITEMS is advisory for a recognized group; non-domain objects are excluded. A bundle uses the configured generic taxonomy, submittedFacts.submissionUnit=BUNDLE and quantity=1 submission unit; inferred mass covers all eligible contents once. The customer sees one bundle, not a claimed physical item count. WARM input-only bundle assessments omit item-count and unsupported climate metrics. Blur/mismatch and out-of-domain rejection remain enforced. Original photo and review lifecycle remain authoritative.


Required environmental assessment is an opt-in domain policy under
`wasteSubmission.requireEnvironmentalAssessment` (generic default false; eWaste true).
Estimate persistence and confirmation reject absent, failed, mock or empty assessments.
Draft edits/photo replacement invalidate the saved estimate; confirmation replay
remains idempotent. A valid partial assessment may retain supported input metrics
and explicit reasons for unavailable outcomes; this policy does not manufacture
carbon factors or certify credits. Provider failures cannot be treated as success.
