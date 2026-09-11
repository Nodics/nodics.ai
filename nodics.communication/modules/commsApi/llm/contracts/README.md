# commsApi contracts

Status: active Phase 1C. Secured Communication HTTP contract. Later-loaded projects may override implementation while retaining Communication ownership, security, audit, retry, and recovery invariants.


Customer inbox projections may include `source: { module, type, code }`, resolved
from the existing intent only when its recipient and IN_APP channel match the
authenticated inbox owner. No template variables, recipient addresses or internal
intent payloads are returned. This selector conveys no permission; a client must
use the owning domain's authorized detail operation to display the referenced
item. Existing immutable messages and delivery records are not rewritten.
