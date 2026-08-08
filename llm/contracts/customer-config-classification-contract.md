# Customer Configuration Classification Contract

Customer projects should keep only customer-owned configuration. Do not use a
reference project such as Nodics Kickoff as a dumping ground for framework defaults.

## Classification

| Class | Owner | Examples | Placement |
| --- | --- | --- | --- |
| Framework default | Nodics framework module | generic router defaults, reusable security defaults, default service policies | owning `nodics.*` module |
| Functional module default | Specific functional module | Profile browser-session defaults, WCMS authoring defaults, CronJob defaults | owning functional module group |
| Project default | Customer project | project code, customer composition defaults, customer module choices | customer project `config/` |
| Environment default | Customer environment | local database baseline, local credentials, local CORS, local cache/event behavior | `envs/<environment>/config/` |
| Server topology | Runtime server | active module list, ports, server-specific database name, peer endpoints | `envs/<environment>/<server>/config/` |
| Generated/runtime state | Runtime | import success/error files, logs, temp artifacts | generated folders, ignored from source |

## Rules

- Move repeated same-environment values up to the environment config.
- Keep server-specific ports, database names, active modules, and peer endpoint
  topology in server config.
- Move reusable product behavior down into the owning framework/functional
  module only after proving it is not sample/customer-specific.
- Never move local sample credentials or local development secrets into the
  framework.
- Generated runtime files under server `temp/` are not authored configuration.
