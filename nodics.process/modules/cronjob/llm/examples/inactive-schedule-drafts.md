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
