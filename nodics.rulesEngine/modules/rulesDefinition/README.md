# rulesDefinition

Owns governed Rules Engine definitions, editable drafts and immutable published-version contracts.

## Structured authoring contract

Draft edits compare the current draft revision and require an acknowledged single-record update; an explicit expectedDraftRevision rejects stale user observations. Caller-supplied approval/simulation is discarded, and an edit invalidates previous evidence. Operand validation rejects incompatible types, malformed lists/ranges and values outside declared choices. Incomplete drafts remain saveable with validation issues, while validation/publication refuse them. Score-band successors unset object validation rather than storing null. Definition limits remain Framework defaults; project overrides contain only real exceptions.
