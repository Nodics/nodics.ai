# workflow AI Examples

This folder is reserved for workflow capability examples.

Examples should show how schemas, lifecycle services, APIs, and Axis projections cooperate while keeping the backend as the process authority.

## Remote decision example

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
