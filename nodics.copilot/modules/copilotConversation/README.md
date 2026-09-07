# copilotConversation

Durable conversational sessions, turns, messages, streaming, and recovery.

Production composition uses the generated `copilotConversationRecord`,
`copilotTurn`, `copilotMessage`, `copilotEvent`, and `copilotAction` services.
Every read is constrained by tenant and authenticated principal. Conversation
titles are derived from the first user request so Axis never presents an
internal conversation identifier as the primary label. `VOLATILE_LOCAL` exists
only as an explicitly enabled test seam and is disabled in Kickoff runtime
configuration.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
