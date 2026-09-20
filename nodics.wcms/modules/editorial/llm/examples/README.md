# Editorial examples

An article becomes workflow-ready only when its master fields, site and author assignments, publication window, and required ready localizations pass validation. Phase 2 readiness is evidence only and never starts a Process workflow.

A separate Workflow runtime selects `editorial.applyDecision` and connects `process.remoteActions.targets.editorial.connectionName` to its Staged content peer. The Editorial callback correlates the stored article revision and workflow instance; a mismatched instance fails before writing.

## Internal callback and retry

A reviewer uses the normal review API. Process completes the task only after its
approval policy passes, then sends `{ instanceCode, executionCode }` with its
runtime credential. Editorial claims that execution using its own service
identity and applies the exact stored decision. Sending an access token and an
`APPROVE` body directly to the callback is rejected before persistence.

If approval committed but the HTTP response was lost, retry the Process incident.
The fresh claim resolves the same domain decision receipt without a second
article mutation. A repeated old handle, different workflow/revision or an
unapproved publication fails. Later configuration may change connection aliases;
it cannot replace Process approval with customer-supplied callback fields.

After the Process claim succeeds and its source context is valid, the callback uses nAuth's existing internal system auth data for the bounded domain persistence request. Preserve the original principal metadata and keep this request local; never grant those groups to the incoming runtime token or acquire persistence authority before a successful claim. The existing schema policy, exact revision/instance checks and nPublish owner still apply.

The existing Online publication target likewise requires a scoped Editorial runtime principal and the Online role before using internal auth data for its target-local persistence. Incoming runtime claims remain unchanged.
