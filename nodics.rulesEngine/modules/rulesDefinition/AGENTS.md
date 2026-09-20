# rulesDefinition Agent Contract

Follow `../../../AGENTS.md`, the parent `../../AGENTS.md`, and global nSetup guidance.

Own rule-definition persistence and lifecycle only. Keep evaluation in `rulesEvaluation`, HTTP ownership in `rulesApi`, and consumer semantics outside this module. Published versions are immutable.
