# nbpm AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nbpm`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Workflow owner routing

The schema bridge retains its exact PUT /item/init API, request body, tenant
internal token and optional targetNodeId behavior. This is not Process's human
approval endpoint. nbpm owns workflowModuleName: workflow and
workflowTargetAuthority: { publication: "OPERATIONAL" } defaults. Optional exact
server/environment pins select an owner through nService/DMS. Missing publication,
retired physical-role selectors, foreign module names and absent credentials fail
closed without dispatch. No PROCESS role-code fallback remains.

Local initialization requires nService's local Workflow ownership and matching
publication/server/environment authority; mere module presence is insufficient.
Otherwise use the existing module invocation path with the unchanged token and
exact API. Cohosting or renaming a server does not authorize imports, alter signed
identity or migrate workflow/schema association records. Source-only bridge and
routing tests are offline; they do not qualify runtime workflow installation.
