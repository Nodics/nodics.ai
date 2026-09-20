# wasteReward Agent Contract

Follow `../../AGENTS.md`, repository guidance and global nSetup contracts.

- Own reusable Waste reward-assessment persistence and read models.
- Do not move eWaste-specific property semantics here.
- Do not duplicate `nodics.rulesEngine` evaluation.
- Do not duplicate Loyalty wallet/ledger operations.
- Preserve ESTIMATED and CONFIRMED/RECALCULATED assessments independently.
- Reward assessment records are append-only business evidence; do not overwrite historical calculations.
