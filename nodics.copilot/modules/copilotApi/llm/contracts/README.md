# copilotApi contracts

## Permission Catalogue and Missing History

Every route permission must be recognized in nAuth's canonical permission
catalogue before Profile can assign it. The route coverage regression includes
the independent configuration-administrator and enterprise/user budget owner
grants. Catalogue registration does not grant a role or enable a feature.

The facade translates the Conversation owner's exact not-found codes to
`ERR_CPA_00001` / HTTP 404. Missing, foreign and unavailable conversation/turn
identities receive the same bounded response without record identifiers or
storage details. Other provider, accounting and persistence failures retain
their original handling; never classify failures by parsing message text.
Run `copilotConversationErrorTransport.test.js` and the persistent runtime test.

## Registered Route Identity

Nodics identifies a configured route by module and lowercased route name. Groups
organize declarations but do not namespace runtime identities. Use module-wide
unique names; a repeated `get`, `preview` or `submit` can dispatch an already-bound
URL using a later route's operation and authorization metadata.

Preserve public URL, method, authorization, privacy and controller contracts when
correcting a name. Rebuild each selected runtime after a declaration change.
`test/copilotRegisteredRoutes.test.js` binds the real Copilot declarations through
nRouter and checks HTTP dispatch, including all retirement and erasure endpoints.
The test substitutes only the request pipeline; it does not prove authentication
or persistence. Keep the separate owner and real-provider acceptance suites.
