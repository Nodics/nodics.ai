# jsImport AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nData/nImport/jsImport`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Stable source record identity

JavaScript data files export keyed objects of record objects. Within the matching
logical data-file dataset and owning target, a later layer merges by the exported
key. Omitted fields inherit, supplied fields override and arrays replace. A
partial partner record does not repeat `code` just to select its source record.
Different keys remain distinct even when their `code` values match. Keep keys
stable across releases and reject malformed/prototype-affecting keys.

Dataset grouping precedes record merging. The ordinary system importer passes
the ordered layer list for each matching file separately; unrelated datasets
may each use `record0`. Header operation/query rules retain persistence identity,
validation and deletion authority. A source `code` change does not rename or
delete a stored record automatically. Immutable release selection/checksums
remain with nImport; source merging does not authorize unselected release files.

When `selectionFiles` identifies an executing release, merge its ordered source
list and then return only exported keys present in those selected files. Earlier
files supply inherited fields without replaying unrelated baseline records.
The system importer owns file/target selection; this processor does not discover
additional sources, infer releases, or change database identity.
