# Rules Engine Contracts

## Core contract

Rules Engine owns generic, deterministic business-rule mechanics. A consumer contributes properties; Rules Engine evaluates configured conditions and returns generic outcomes plus explanation evidence.

### Rule structure

```text
RuleSet
  RuleGroup (ALL | ANY)
    Condition*
    RuleGroup*
    Outcome
```

### Missing values

- `REQUIRED`: unavailable input prevents the condition from matching.
- `OPTIONAL`: unavailable input is ignored.
- `FALLBACK_ALLOWED`: consumer provider resolves the next eligible value.

### Input quality

A condition may require minimum normalized quality and confidence. Values below the requirement are treated as unavailable before missing-value behavior is applied.

### Provider boundary

Consumer modules own property definition, allowed values, fallback semantics, value resolution and quality normalization. Provider identity is server-owned and registered; request payloads cannot select arbitrary implementations.

### Evaluation

Evaluation is deterministic and version-bound. It may not call an LLM, run arbitrary code, mutate consumer state, or perform wallet settlement.

Evaluation evidence includes the exact policy, property-catalogue and score-band
versions, matched and skipped rule groups, bounded normalized inputs, fallback
and quality exclusions, and a deterministic source hash. Consumers persist that
evidence in their own immutable assessment record before performing a domain
side effect.

### Definition lifecycle

- Only a `DRAFT` may be edited.
- Validation and simulation are server operations and do not publish a version.
- Submission delegates maker-checker state to Process.
- Approval publishes a new immutable version; rejection preserves the prior
  effective version.
- Retry keys bind lifecycle commands and consumer effects to the same evidence.

### Workflow and UI

Process owns maker-checker tasks. Axis renders the backend-declared
`rules.policy` workspace and invokes the discovered `rulesApi` connection; it
is never the rules authority. Loyalty owns wallet creation and append-only
ledger settlement. A consumer such as eWaste may settle only a persisted,
confirmed assessment and must reuse one stable idempotency key on replay.
