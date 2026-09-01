# Waste Recycling Agents

Follow the root Nodics AI agent contract before changing this boundary:

- Follow the repository agent contract: `../../../../../AGENTS.md`.
- Follow the Waste accelerator umbrella contract: `../../AGENTS.md`.
- Follow the common Waste framework contract: `../../../../../nodics.waste/AGENTS.md`.
- Follow global AI guidance: `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

`wasteRecycling` owns reusable recycler/logistics handoff contracts over
`nodics.waste`. It may build provider-neutral handoff requests and completion
payloads that reference `wasteMovement`, `wasteCompliance`, Profile, Location,
Media, and partner-owned provider profiles.

Do not create provider-specific adapters, credentials, tracking-number storage,
certificate-number storage, wallet ledger mutation, or customer-project branding
inside this accelerator.
