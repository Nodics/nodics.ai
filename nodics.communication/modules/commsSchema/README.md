# commsSchema

Communication schema contracts. This module follows the active `nodics.communication` ownership contract. Read `AGENTS.md` and `llm/contracts/README.md`; verify through focused tests and the effective server build.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

`commsTelegramUpdate` is a private durable transport receipt with unique code and
tenant/bot/update indexes. Generic CRUD, BackOffice, cache, search and events are
disabled. See the [inbound launch contract](../commsCore/llm/contracts/telegram-inbound-launch.md)
before installing or enabling the native receiver. No raw update or credential is stored.
