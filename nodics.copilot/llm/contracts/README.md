# nodics.copilot contracts

Copilot is a coordination and governance capability, not a new data authority.

Mandatory detailed contract:

- `copilot-security-governance-contract.md` governs identity, channel profiles,
  source classification, retrieval, tools, tenant and field isolation, exports,
  mutations, provider context, audit, denial behavior, and required security
  tests. Every child module and customer adapter must follow it.

- Retrieval uses Discovery and returns evidence with citations.
- Database and code-folder access occurs only through registered, permissioned,
  tenant-bound capabilities; raw database drivers are prohibited.
- CSV and text rendering is bounded; Excel delegates to `nExport/excelExport`.
- Workbench mutations call the owning secured API after clarification,
  validation, preview, confirmation, and authorization.
- Provider adapters receive secret values only from the runtime secret resolver;
  source, logs, events, and diagnostics contain references, never values.
- Experience and Commerce capabilities remain read-only or proposal-only until
  their owning domain adapter and acceptance tests exist.
