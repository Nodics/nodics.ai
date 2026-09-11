# Recycling handoff customization

A project owns its recycler provider configuration and protocol adapter. Use the
Waste recycling handoff service to build a provider-neutral request referencing
the approved Waste asset and DONATE event. The project adapter supplies its own
credentials, dispatch and callback mapping; record movement/compliance evidence
through their owning services.

A provider timeout leaves the handoff unconfirmed and retryable using the same
source references. A provider callback must not approve a submission, transfer
wallet value or invent a compliance certificate. Test valid handoff, missing
source evidence, repeated completion and provider failure with the project
adapter; keep generic lifecycle contract tests in their framework owners.
