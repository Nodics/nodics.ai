# Native Telegram Inbound Launch

## Ownership And Protocol

Communication owns native transport intake and replay evidence. `commsCore`
authenticates and selects a launch reply, `commsSchema` owns the private
`commsTelegramUpdate` repository, and `commsApi` declares the native route and
selectable pre-body parser. No scheduler, identity store, domain command,
login grant or outbound provider invocation is added. Existing Communication
callbacks, source-scoped internal APIs and delivery behavior retain their contracts.

Official protocol sources:

- [Webhook secret_token](https://core.telegram.org/bots/api#setwebhook)
- [Update identity](https://core.telegram.org/bots/api#update)
- [Webhook method replies](https://core.telegram.org/bots/api#making-requests-when-getting-updates)
- [Private web_app buttons](https://core.telegram.org/bots/api#inlinekeyboardbutton)
- [HTTPS WebAppInfo](https://core.telegram.org/bots/api#webappinfo)
- [Mini App identity validation](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)

The normal module/version-prefixed route is
`POST /integrations/telegram/:receiverCode/start`. It uses existing `publicAccess`
route metadata because Telegram has no Nodics JWT or enterprise header. The
required `accessGroups: ['userGroup']` is route-definition metadata, not webhook
authentication or a newly issued user grant. The owner validates Telegram's
`X-Telegram-Bot-Api-Secret-Token` independently before parsing native JSON and
again before controller-side body access. All other route authentication stays
unchanged. An absent/invalid secret is a fixed 403; malformed bounded JSON is
a private parser 400; payload-binding conflicts are 409; unconfirmed storage is
503. Private-capture qualification failures remain the nRouter refusal.

## Inert Deployment Configuration

Framework defaults have both `communication.telegramInbound.enabled` and
`apiExposure.categories.communicationTelegramInbound.enabled` false, and no
receiver entries, URL, tenant, bot subject or secret references. Later authorized
project/environment/server/runtime configuration must deliberately supply both
enablements and a receiver entry under
`communication.telegramInbound.receivers[receiverCode]`:

| Field | Authority |
| --- | --- |
| enabled | Explicit receiver activation; exact boolean true required |
| tenant | Installed active runtime tenant, never body/query/header-selected |
| applicationSubject | Stable numeric Telegram bot id; keep stable across secret/path rotation |
| botUsername | Configured bot username for explicitly addressed /start commands |
| miniAppUrl | Trusted HTTPS Mini App URL; credentials and fragments refused |
| webhookSecretReferences | One current logical reference, optionally one previous reference during rotation |

The existing Telegram credential resolver reads deployed runtime/secure/generic
credential stores by logical reference. These are webhook secrets, independent
of delivery bot tokens and Profile Mini App verification credentials. Values
must satisfy Telegram's 1-256 character alphabet. Each configured rotation slot
must resolve; incomplete configuration fails closed. Hashes of equal length are
compared with `crypto.timingSafeEqual`; all configured slots are compared.
Remove the previous reference to revoke it. No credential values belong in
properties, permanent module data, fixtures used as adoption data, logs or docs.
Synthetic values in isolated tests are never deployed credentials.

Bounds are module-owned configuration: 65536 bytes, depth 16 and 4096 JSON nodes
by default, with finite implementation caps. Unknown receiver names, inactive
tenants, authority-bearing headers, query strings, duplicate secret headers,
non-JSON requests and pre-parsed native bodies refuse. Receiver selection can
only choose a trusted configured binding; it cannot name services or operations.

## Admission And HTTP Response

nRouter binds `requestPrivacy.sensitive: true` before the selected parser and
requires qualified early capture suppression. The native parser is selected
through `bodyParserHandler.telegramInboundBodyParserHandler`; it authenticates
before calling the existing Foundation JSON parser. Installed upstream capture
and parsers must preserve this ordering. In particular, no earlier JSON parser
may consume this route: `_body` refuses such a native request. Non-JSON traffic
is unsupported; Foundation's general app URL-encoded parser is not a Telegram
authentication boundary. Qualify any proxy/app parser and capture integration
before exposing the route. Caller privacy flags never qualify admission.

The ordinary nRouter request handler inherits exact-object capture protection
to the controller. The service inherits it into storage context and each
generated repository request. Success and authenticated failures are no-store.
The controller returns `{ data, metadata: { rawResponse: true,
contentType: 'application/json' } }`; the existing JSON response handler writes
`data` directly. Telegram receives a top-level `method: 'sendMessage'`, `chat_id`,
`text` and inline keyboard with `web_app: { url }`, without a Nodics envelope.
No fetch, bot provisioning or send operation occurs in this implementation.

## Supported Launch And Durable Replay

Only a native `message` /start command in a private chat, with a positive bounded
user id equal to chat id and `from.is_bot` false, can reserve a launch reply.
The bot-command entity must start at offset zero and match the command length.
An optional configured bot mention and 1-64 character Telegram start payload
are accepted. The payload never changes the URL, tenant, authority or dispatch.
Business, forwarded, sender-chat, edited, guest, callback and other unsupported
updates receive an empty JSON acknowledgment and perform no business action.

The receipt binds tenant, stable bot subject and `update_id` to a SHA-256 digest
of the entire bounded canonical JSON update. Object key ordering is immaterial;
any changed value under an existing key conflicts, including ignored fields.
Update ids are not treated as a monotonic watermark. The source schema generates
unique code and compound tenant/bot/update indexes, with generic routes,
BackOffice, cache, events and search disabled. Tenant is a transport isolation
key, not business ownership. Only the Communication service storage group is
admitted by the dedicated schema policy. Raw updates, chat/user identity,
secrets and delivery outcomes are not stored.

Generated save uses `insertOnly: true` and `internalPersistence: 'DURABLE_JOURNAL'`.
The existing provider qualification requires journaled majority writes and primary
majority readback. A random claim marker distinguishes concurrent writers.
Only an acknowledged insertion followed by matching readback may return a method
reply. Existing receipts and race losers return `{}`; a changed binding refuses.
Missing, inconsistent, unsupported or unreadable persistence never grants launch.
No process-local map or lock supplies replay authority.

This intentionally favors at-most-once response authorization. A crash, lost
acknowledgment or dropped HTTP response after reservation can lose the launch
reply. Retries do not resend it; a fresh /start creates a new update. Telegram
cannot report the result of a webhook method reply, so `LAUNCH_REPLY_RESERVED`
never means SENT or DELIVERED and never qualifies outcome notifications.
Do not purge/reset receipts while their update ids can replay; no automatic
expiry or reset job is added. Governed Local reset inventory includes this schema
but remains separately disabled and authorized.

## Identity, Overrides And Validation

Launching a URL proves neither customer identity nor account linking. Profile's
signed Mini App initData validation and existing linking/registration flow remain
mandatory. Communication must never mint sessions or treat a chat id as a linked
customer. Delivery consent, source grants and outcome delivery remain separate.

Later modules may override mergeable service members through the existing loader.
Presentation overrides delegate to `launchReply` and retain its private-chat,
command and trusted URL checks; parser/controller overrides retain exact route
admission and raw response metadata. Repository overrides must retain insert-only
uniqueness, durable acknowledgment, majority readback and immutable payload binding.
Never configure arbitrary service/operation dispatch from an update.

Focused local verification:

```sh
node --test nodics.communication/modules/commsCore/test/telegramInboundContract.test.js nodics.communication/modules/commsApi/test/telegramInboundHttpContract.test.js nodics.communication/modules/commsSchema/test/telegramInboundSchemaContract.test.js
npm test --workspace nodics.communication
```

The tests use actual nRouter/parser/controller/JSON-response owners, schema policy
and index generation, and generated persistence owners with an isolated driver.
HTTP input is a synthetic stream with no listener or network. They prove native
JSON ordering, safe errors, raw response, rotation, bounds, private capture,
override dispatch, replay/races and tenant/bot isolation. The OpenAPI regression
executes the owner route validator and complete document generation. Parent
selected-server builds separately validate actual installed module composition.
Neither source tests nor build output prove deployed HTTPS, upstream capture,
installed unique indexes, replicated storage durability, actual Telegram delivery,
native client launch or Profile-signed identity acceptance. No native demo is
claimed or required by this implementation.
