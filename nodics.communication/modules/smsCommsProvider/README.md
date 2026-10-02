# SMS Communication Provider

This optional module provides a disabled-by-default, sandbox-capable SMS transport boundary. It resolves credentials at execution time, returns content-free evidence, and is not production-qualified. Communication Core retains intent, suppression, retry, and outcome authority.

The durable adapter consumes frozen text from module-owned resources, checks tenant,
claim and expiry, and invokes a selected injected sandbox service. It does not render
templates or send HTML. See [the contract](llm/contracts/README.md) for deployment
selection, compatibility and the explicit live-delivery qualification boundary.
