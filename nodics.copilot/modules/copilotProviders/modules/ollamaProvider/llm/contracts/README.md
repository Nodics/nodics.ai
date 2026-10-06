# ollamaProvider contracts

Ollama configuration belongs under
`copilot.providers.adapters.ollama` in layered `properties.js`. The adapter
must not read environment variables directly, invent endpoints or models, or
be selected by source-code conditionals. Framework defaults are disabled and
loopback-only. Remote access requires an explicit environment override plus
the normal network, TLS, authentication, and tenant-risk review.

The request deadline covers response-body consumption, not only headers.
Pre-aborted calls never fetch; linked abort listeners and timers are removed on
all settlement paths. Standard responses and streams require explicit terminal
completion. Provider error messages remain private and become stable reason
codes. Missing token measurements, including intermediate stream usage, are null.
