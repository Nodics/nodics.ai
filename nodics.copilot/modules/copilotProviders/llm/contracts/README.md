# copilotProviders contracts

This boundary is a pure provider-family group. It may compose required child
modules but must not own provider services, transports, credentials, selection,
schemas, routes, or runtime registries. Neutral behavior belongs to
`copilotProvider`; vendor behavior belongs to adapter children.
