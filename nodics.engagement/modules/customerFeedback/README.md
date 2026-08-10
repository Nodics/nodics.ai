# customerFeedback

Customer feedback, complaint, survey, resolution, and insight capability.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## Phase 9 status

The feedback foundation is implemented with suggestions, complaints, experience feedback, survey responses, anonymous or identified intake, classification, assignment fields, optimistic lifecycle transitions, closed-loop follow-up, resolution versions, downstream owner handoffs, and source-traceable insights with correction and deletion propagation.

## Ownership

It owns suggestions, complaints, experience feedback, survey responses, classification, follow-up, resolution, and derived insight records.

It must not own review ratings, testimonial editorial records, contact correspondence, universal forms-platform behavior, or communication delivery.

## Dependencies and extension

This capability depends on engagementCore and the provider-neutral engagementComms bridge; operational APIs remain engagementApi-owned. Customer and project customization belongs in later-loaded modules and layered configuration; archived CRES or gNotify files are reference evidence only.

## Verification

Phase 1 verifies metadata, folder ownership, deterministic index order, documentation discovery, and absence of premature source behavior. Later phases must update this README when real contracts are implemented.
