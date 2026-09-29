# Communication Verification

Communication Verification owns reusable challenge hashing and verification and
an opt-in persisted lifecycle over the existing Communication challenge schema.
It never registers employees, approves memberships, issues login sessions or
sends mail by itself. Profile remains the employee identity and access owner;
Communication Core and its configured provider own message delivery.

## Implemented surface

- `create` and `verify` retain the pure helper interface, with finite-expiry,
  attempt-bound, digest-format and safe-policy validation.
- `issueStored`, `verifyStored`, `consumeStored`, `replaceStored` and
  `cancelStored` use `DefaultCommsVerificationChallengeService`. There is no
  memory-store fallback, duplicate OTP registry or direct database access.
- A challenge is bound to a trusted tenant, purpose owner, subject, channel,
  destination and continuation. Wrong codes persist their attempts. Correct
  codes produce a short-lived proof only after a committed transition and fresh
  readback; consumption is single-use, including under competing commands.
- Replacement invalidates the previous code and proof within the same record.
  Raw codes and proof tokens are transient return values, never persisted by
  this service, logged, published as events or exposed through generic CRUD.

Persisted operations are **disabled by default** under
`communicationVerification.stored.enabled`, with an empty allowed-source list.
Availability of source code does not enable an employee onboarding route. The
caller must already be an authorised internal service; source labels and body
fields cannot manufacture authority. Profile integration, secure dispatch,
approval, recoverable provisioning and the corresponding Axis journey remain
separate implementation/acceptance steps.

## Read and verify

Read [AGENTS](AGENTS.md), the [complete contract](llm/contracts/README.md) and the
[worked integration examples](llm/examples/README.md). The contract explains
state transitions, failure recovery, rollout, API boundaries and limitations.
Examples are internal-call fixtures, not instructions for a business user to
enter technical identifiers in Axis.

From the framework repository root:

```bash
node nodics.communication/modules/commsVerification/test/communicationVerificationContract.test.js
node --test nodics.communication/modules/commsVerification/test/communicationVerificationPersistenceContract.test.js
```

The second suite uses actual verification source and injected generated storage.
Five cases also execute the unchanged Foundation concurrency source with a
simulated atomic provider and three injected plain-record lodash helpers. These
are source-contract tests, not a live database, full generated pipeline,
installed-dependency, provider-durability, email-delivery or browser qualification.
Run the effective server build and applicable framework gates before enabling
this integration. Do not describe this source change as complete registration.
