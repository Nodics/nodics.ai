# contactSubmission Examples

## Supported customization direction

A project may add a contact reason and routing rule through layered configuration while the original submission and audit evidence remain Engagement-owned.

If no reason rule matches, intake uses the configured fallback queue/team and default SLA. If Process is unavailable, the contact remains accepted and its handoff reference enters `RETRY_PENDING`.

## Rejected shortcut

Do not expose contact schema CRUD, store raw verification secrets, copy authentication headers, leak internal notes, hardcode project queues/providers, or fail accepted intake because an optional provider is unavailable.
