# Nodics Repository Governance

This folder holds repository-level governance documents that are important for
external adoption but should not make the framework root visually noisy.

`LICENSE` remains at the repository root because it is the legal anchor.
GitHub-facing community documents live under `.github/` so GitHub can still
discover them. Durable coding, AI, customization, module, and documentation
contracts remain under `nodics.core/modules/nSetup/llm`.

Runtime behavior is still owned by the relevant module. Files in this folder
describe release, compatibility, versioning, deprecation, incident-response,
and repository-governance expectations; they do not create runtime APIs or
module ownership.
