# Reviewed Inactive Schedule Example

Follow the [contract](../contracts/inactive-schedule-drafts.md). The caller supplies
only a job identity, name and one advertised target/timing. Nodes and business
context never come from the browser.

```javascript
const draft = {
    code: 'documentationRefreshDraft',
    name: 'Documentation refresh',
    targetCode: 'approvedDocumentationRefresh',
    expression: '0 0 * * * *'
};
const review = await SERVICE.DefaultCronJobScheduleDraftService.preview({
    tenant: request.tenant, authData: request.authData, body: draft
});
// Only after the employee explicitly confirms the displayed review:
const saved = await SERVICE.DefaultCronJobScheduleDraftService.create({
    tenant: request.tenant,
    authData: request.authData,
    body: { ...draft, confirmed: true, reviewDigest: review.data.reviewDigest }
});
```

This code does not grant access or configure a target. `ERR_JOB_00011` requires
original-code/digest inspection, never automatic retry. A saved inactive draft
does not prove that the Process trigger exists, is published or can access a
Copilot source. The canonical guide supplies deployment and recovery steps.

## Execution failure and overlap

On one execution node, manual runs and natural ticks use the same tenant/job pool wrapper. A second manual run is rejected while the full target pipeline is pending; natural ticks during work are skipped and never replayed. There is no catch-up queue or automatic scheduler retry. Stop prevents new ticks and preserves admitted completion; refresh/removal cannot replace a running wrapper. Persisted start/end times and terminal status establish completion, not a command acknowledgement. Safe failure attribution contains only a stable error code and target kind; provider payloads, credentials, URLs and stacks are not business evidence. Last skipped tick is a bounded observation, not a complete run history. A stopped or paused timer remains stopped or paused when its admitted execution ends. This is single-process exclusion, not distributed exactly-once delivery or crash-recovery certification.
