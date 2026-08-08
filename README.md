# Nodics AI

Nodics AI is the backend/framework repository for Nodics standard functional
module groups.

It keeps the framework in one repository while preserving clear module
boundaries:

```text
nodics.ai/
  package.json
  AGENTS.md
  README.md
  nodics.core/
  nodics.platform/
  nodics.cron/
  nodics.wcms/
  nodics.docs/
  docs/
  llm/
```

Customer projects such as Nodics Kickoff live outside this repository and consume the
framework through package dependencies and explicit runtime `extends`
configuration.

Frontend applications such as Axis are separate projects. Axis renders
BackOffice and content-management experiences by consuming Platform/WCMS APIs;
it is not a backend framework module.

Customer customization modules may extend framework modules without changing
the functional module identity. For example, `nodics.kickoff.platform` can customize
`nodics.platform`, while BackOffice and Axis still show the standard `Platform`
capability.

Validate the framework repository contract:

```text
npm test
```
