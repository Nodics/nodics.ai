# ollamaProvider contracts

Ollama configuration belongs under
`copilot.providers.adapters.ollama` in layered `properties.js`. The adapter
must not read environment variables directly, invent endpoints or models, or
be selected by source-code conditionals. Framework defaults are disabled and
loopback-only. Remote access requires an explicit environment override plus
the normal network, TLS, authentication, and tenant-risk review.
