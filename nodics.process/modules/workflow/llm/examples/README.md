# workflow AI Examples

## Missing CMS Approval Definition

On fresh startup, the existing CMS approval owner selects
`cms:cmsPublicationApproval` from nImport's init catalogue and executes with that
observed version. An already installed definition is unchanged. A release change
between selection and execution fails closed; inspect current publication and
release evidence before explicitly retrying the same owner approval request.
Never substitute a fixed historical pin or copy CMS workflow data into Process.

This folder is reserved for workflow capability examples.

Examples should show how schemas, lifecycle services, APIs, and Axis projections cooperate while keeping the backend as the process authority.

## Permission-Based Approval Example

An employee submits a Media publication, then opens Axis > My Tasks & Approvals.
If that employee has the task claim/completion permissions and the pinned
`publish.lifecycle.approve` permission in the same tenant and enterprise, the
employee may claim and approve the request. The name `admin` is not itself a
grant. An ordinary authorized employee follows exactly the same path.

Refresh task evidence after upgrading an existing pending task. Inspect its
Media identity and retained version, claim it, enter a reason and select Approve.
Confirm the task completes and Media becomes Online before checking image delivery.
Missing permissions or mismatched scope must reject; do not change the stored
requester or use a service token to work around those failures. Rejection requires
a nonblank reason. If the callback fails after the decision is saved, inspect the
Process incident and retry the original action, not the approval decision.

Later modules can select the required review permission and enterprise/requester
context fields through the existing published actorPolicy contract. They must
retain authenticated scope and provenance. No same-user prohibition is inferred
from requester metadata, and no project-specific exception is needed.

## Remote Decision Transport

Select a registered protocol name in the existing action allowlist and configure
its domain connection under `process.remoteActions.targets`. A published ACTION
node references the capability and operation; it cannot supply a URL or service.
After the preceding task passes its approval policy, Process stores the action
and sends an opaque handle. The receiving capability authenticates the Workflow
runtime and claims that handle using its own runtime credential.

Reject a human access token, an unknown or stale handle, an action without its
required completed task, or a claimant from another tenant/environment. If the
domain commits and the response is lost, use the governed incident retry: it
receives a fresh handle and the domain reuses its existing committed receipt.
Do not copy the transport into a customer module or create another token issuer.
