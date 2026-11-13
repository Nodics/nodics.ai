# rulesApi Agent Contract

Follow `../../../AGENTS.md`, the parent `../../AGENTS.md`, and global nSetup guidance.

Expose only secured, permissioned Rules operations. Do not duplicate definition/evaluation logic in controllers or facades. BackOffice metadata must be declarative and non-executable.

Route Workflow by logical module and explicit OPERATIONAL publication through
nService/DMS. Reject retired physical-role selectors and missing credentials.
Preserve exact APIs, signed request/claim scopes and one-use execution evidence;
local service presence never proves selected owner authority. See owner routing
in llm/contracts/README.md; no implicit installation or migration.

The HTTP controller preserves the original transport Authorization for Process
admission. Body/query fields never supply credentials; missing HTTP credentials
remain missing. Direct service calls retain their trusted request context.
