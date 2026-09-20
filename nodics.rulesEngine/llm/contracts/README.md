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

### Workflow and UI

Process owns maker-checker tasks. Axis renders backend-declared workspaces and invokes backend APIs; it is never the rules authority.
