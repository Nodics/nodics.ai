# commsVerification Agent Contract

Follow the root Nodics AI agent contract before changing this boundary:

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI/development guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the Communication group contract: `../../AGENTS.md`.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

Preserve tenant isolation, idempotency, content-free events, provider neutrality, secured callbacks, and domain ownership. Do not use archived Notify code as authority. Update source, tests, documentation, and generated evidence together.

## Persisted verification and identity boundary

Extend the existing `DefaultCommunicationVerificationService` and
`commsSchema.commsVerificationChallenge`; do not add a Profile-local challenge
store, parallel OTP engine, local lock or raw database client. The legacy
Foundation nOtp/nToken flow is not a proof-consumption shortcut.

Persisted methods require explicit rollout, authorised internal caller context
and owner-derived binding fields. They are not public handlers. Never trust a
client's sourceModule, tenant, subject or bindingReference as authorisation.
Profile's future adapter must verify invitation/account policy and rate limits,
retain its limited continuation and own any provisioning recovery journal.

Use the generated service's managed concurrency: input token zero is a new
record assertion; the stored initial revision is one. Updates submit the current
revision, not the next value. Await acknowledgement and verify the exact
per-attempt marker and state through uncached readback before returning a secret,
proof or consumption outcome. A stale write, partial response or lost reply
cannot be converted to success, automatic consumption replay or a second grant.

Never persist plaintext code/proof. Generic routes and BackOffice editors for
private challenges remain disabled. Use schema-valid empty digest/epoch expiry
for invalidation, not null in a string/date field. Retained verifiedAt is the
last verification time, not proof that a replacement generation is verified.

Keep persisted operations disabled until effective schema generation, access,
concurrency, expiry and the composed owner's route/transport are qualified.
Ordinary managed CAS/readback is not a majority-journal durability certificate.
Update this guidance, the existing contract/examples and focused tests together.
