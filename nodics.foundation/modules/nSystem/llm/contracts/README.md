# nSystem AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nSystem`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Secured service-registry API exposure defaults to enabled for runtime registration/contract retrieval. Exposure never bypasses service-token, grant or route permissions. Standalone deployments can explicitly disable the category.
