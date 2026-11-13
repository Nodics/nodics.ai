# rulesDefinition Contracts

Own draft/edit/version persistence and validation-ready definitions. Published versions are immutable and consumers remain domain owners.

Draft changes invalidate simulation and approval with `$unset`, not null object values. Preparing a successor also unsets validation; immutable published versions remain unchanged. Caller-supplied approval and simulation never survive a draft edit.

## Structured authoring and review

Draft edits compare the current draft revision and require an acknowledged single-record update; an explicit expectedDraftRevision rejects stale user observations. Caller-supplied approval/simulation is discarded, and an edit invalidates previous evidence. Operand validation rejects incompatible types, malformed lists/ranges and values outside declared choices. Incomplete drafts remain saveable with validation issues, while validation/publication refuse them. Score-band successors unset object validation rather than storing null. Definition limits remain Framework defaults; project overrides contain only real exceptions.
