# Scoped customer guidance

`DefaultCopilotCustomerGuidanceService` uses the existing conversation store with a customer/enterprise/project principal namespace, NEXUS_CUSTOMER channel and project definition. Caller authorization supplies canonical Profile customer code. Ownership, channel and definition are validated before retrieval/provider calls. The browser supplies a conversation reference, never authoritative history. Existing trusted Waste conversation pairs migrate once; Waste retains a reference plus a derived history projection.

Each model turn retrieves policy-filtered evidence through Copilot Knowledge and Discovery. Customer sources require classification, explicit project/tenant/enterprise/channel/permission scope, a versioned registered root and ingestion scans. A CUSTOMER repository partition is authenticated content, not public Online publication; public channels need their separate publication proof. Never index internal project plans, source, AGENTS or credentials for customer access.

Only allowlisted item facts and coarse journey state enter the dedicated conversation profile. Coordinates, centre identifiers and credentials are omitted. Responses are bounded JSON advice with no executable tools, commands or model-controlled corrections. Missing evidence/provider failure saves a bounded unavailable answer and preserves domain state. Trusted fixed domain guidance bypasses the provider but uses the same canonical conversation. Retired knowledge is not restored from earlier model answers.

Pre-draft help uses the same protected conversation reference on the first subsequent draft help request. Waste owns explicit corrections, fresh acceptance/impact assessment and the final confirmed command. Reusing a turn key for another message fails.
