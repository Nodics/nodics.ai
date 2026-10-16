# rulesDefinition Agent Contract

Follow `../../../AGENTS.md`, the parent `../../AGENTS.md`, and global nSetup guidance.

Own rule-definition persistence and lifecycle only. Keep evaluation in `rulesEvaluation`, HTTP ownership in `rulesApi`, and consumer semantics outside this module. Published versions are immutable.

This module owns rulesEngine.limits used by definition validation, including
definition depth. The functional group only composes cross-runtime releases.
Evaluation's per-request depth contract remains separate; no unused simulation
batch setting may imply an implemented batch API.
