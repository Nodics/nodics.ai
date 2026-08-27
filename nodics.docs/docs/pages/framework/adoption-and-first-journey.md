# Adoption and First Journey

The first Nodics journey should help a reader move from concept to a running
workspace without getting lost in module internals. A beginner should
understand what Nodics is, start the local reference project, sign in to Axis,
see which capabilities are available, initialize the required data, and open
the public applications only after Online content exists. A business reader
should see how fast the product can be prepared. A developer should see where
customization belongs. An operator should see which services, data packs, and
publication states prove the environment.

This page describes the adoption path, not every implementation detail. The
deep module pages explain specific schemas, APIs, providers, pipelines,
workflows, and project-layer override paths.

## First reader sequence

The documentation should not force a new reader to open every framework module
before seeing the product. The sequence should be practical:

| Step | Reader action | Why it matters |
| --- | --- | --- |
| 1 | Read What is Nodics and Why Nodics Exists. | Understand the business reason before touching code. |
| 2 | Open the Kickoff setup and local runtime pages. | Learn the reference project and server topology. |
| 3 | Start Platform, WCMS, Process, Axis, Nexus, and Agora as required. | See the runtime boundary instead of guessing from folders. |
| 4 | Initialize Axis baseline data. | Axis needs governed content and administration data before full workspace use. |
| 5 | Register required modules and capabilities. | Storefront packs should not pretend to work without their domain owners. |
| 6 | Import Nexus, Agora, documentation, and sample data packs. | Content, media, pages, and routes become Staged records. |
| 7 | Publish approved Online content and verify browsers. | Public apps render Online data only. |

## Business adoption journey

For business users, adoption starts with confidence that the platform can
support fast revenue without becoming fragile. The reference workspace should
show how an administrator can prepare Axis, initialize a corporate site,
prepare storefront accelerators, approve publication, and confirm the public
experience. The journey should make the next action obvious from the screen.

If a pack needs approval, the user should see the pending item and approve or
reject it in the same operational place when their role permits it. If a site
is not Online yet, the public app should show a professional maintenance page,
not hidden framework data. If data is missing, the UI should explain what must
be initialized first.

## Developer adoption journey

Developers should start by running the product and then tracing ownership.
After the fresh environment is visible, they can study how the project points
to `nodics.ai`, how Kickoff declares local topology, how modules register
capabilities, how data packs import Staged records, and how Axis reads
backend-owned metadata.

```mermaid
flowchart LR
  Clone["Open framework and project"] --> Start["Start local servers"]
  Start --> Axis["Sign in to Axis"]
  Axis --> Registry["Register capabilities"]
  Registry --> Import["Import content and sample data"]
  Import --> Publish["Approve and publish Online"]
  Publish --> Customize["Customize from project layer"]
```

The first customization should happen in the project layer or through Axis
managed content, not by editing framework source. That habit keeps the
framework upgradeable.

## Operator adoption journey

Operators adopt Nodics by learning the runtime evidence. They should know how
to check server status, port ownership, logs, data import state, publication
state, task queues, content routes, and public delivery. When a local schema is
fresh, operators should be able to explain why Axis may start in a recovery
workspace, why Nexus or Agora may show a maintenance page, and which import or
publication action unlocks the normal experience.

Operational adoption also includes knowing what can run in parallel.
Documentation imports can happen alongside other setup work because they
publish documentation content. Commerce-dependent Agora data must wait until
commerce capabilities are registered because the storefront data relies on
domain models.

## Documentation entry points

The first navigation level must stay friendly. Business users should see
capabilities and journeys, not raw module package names. Developers and AI
tools still need exact source ownership, so each detailed page should include
source maps, module names, configuration keys, APIs, events, and validation
commands in the page body.

| Entry point | Best for | Continue to |
| --- | --- | --- |
| What is Nodics? | First-time business, developer, and operator readers. | Why Nodics Exists and How Nodics Works. |
| Documentation Roadmap | Readers choosing their route through the docs. | Reader Journey and Coverage. |
| Kickoff setup | Teams starting a local reference environment. | Local runtime, acceptance checklist, and publishing operations. |
| Axis guide | Administrators using the BackOffice workspace. | Module registry, imports, documentation publication, and workflows. |

## Common mistakes

- Trying to understand every package before running the reference environment.
- Importing Agora data before the commerce capability is registered.
- Expecting Nexus or Agora to show full public content before Online
  publication exists.
- Treating documentation import as a one-time exercise instead of a recurring
  content-pack release process.
- Putting customer-specific setup rules only in environment files instead of
  project-owned configuration and installer-generated workspace data.

## Verification

The adoption journey is correct when a new user can start from a clean schema,
follow the setup sequence, and understand each next action from Axis without
asking which page owns it. Verification should include browser checks for Axis,
Nexus, and Agora, plus data evidence that required modules are registered,
content packs are imported, publication tasks can be approved or rejected by
authorized users, and public apps show Online content or a customer-friendly
maintenance page.
