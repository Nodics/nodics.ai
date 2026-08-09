# Nodics Governance

This repository is the backend/API framework authority for Nodics. It contains
framework module groups and backend-owned data contracts. It does not make a
local parent directory, customer project, Axis frontend, or archive repository a
runtime authority.

## Authority order

1. Root `AGENTS.md` directs AI and developer behavior.
2. Module `AGENTS.md` files add local ownership rules.
3. Contracts under `modules/nSetup/llm` define durable framework behavior.
4. Module `README.md` files explain the module for humans.
5. Tests enforce contracts.

## External adoption gate

External adoption requires clear licensing, security, contribution, support,
release, versioning, deprecation, compatibility, and incident-response
documents. These governance documents are root-level repository contracts, while
runtime behavior remains owned by the relevant module.
