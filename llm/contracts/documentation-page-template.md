# Documentation Page Template and Rubric

Use this template for framework, product, and customer-project documentation
that becomes public guidance or CMS-importable content. Do not copy the
headings mechanically when another order reads better, but do cover the same
reader needs before considering the page complete.

## Page metadata

- Owner repository:
- Owner module or project:
- Functional module:
- Technical module, if applicable:
- Primary audience:
- Secondary audiences:
- Runtime surface:
- Verification evidence:
- Last checked:

## What this is

Define the topic in plain language. Assume the reader is new to Nodics and may
also be new to the enterprise application domain.

## Why it exists

Explain the problem this capability, project, or concept solves. Include the
business pain that appears when teams build the same concern without a platform
contract.

## Who uses it

Describe business users, administrators, developers, operators, architects,
security reviewers, and AI tools separately when their responsibilities differ.

## Business value

Explain adoption value: delivery speed, governance, cost reduction, safer
customization, multi-enterprise or multi-tenant operation, scalability,
maintainability, auditability, and predictable upgrades.

## Beginner mental model

Use a short analogy or simple scenario before internal vocabulary. A reader
should understand the concept before seeing repository paths or service names.

## How it works

Describe the runtime sequence, ownership boundaries, configuration layers, data
flow, authority checks, and generated artifacts. Use a diagram when three or
more steps or actors interact.

## Step-by-step usage

Provide exact commands, UI steps, API calls, or configuration edits. Explain
what each step does and how to know it worked.

## Configuration and source map

List the important files, properties, schemas, routes, services, generated
artifacts, tests, and documentation sources. Separate authored source from
generated output.

## Customization and extension

Explain the smallest safe customization path:

1. configure existing behavior;
2. add project or customer module behavior;
3. extend a functional module through a later-loaded module;
4. create a new implementation only when the existing contract cannot satisfy
   the requirement.

State what must not be customized in this owner.

## DevOps and production notes

Cover runtime topology, environment/server/node configuration, public versus
private properties, dependencies, deployment, release, health, logs,
monitoring, backup, recovery, scaling, and rollback.

## Security, tenant, and governance notes

Describe authentication, authorization, tenant context, audit, approval,
runtime change control, data ownership, and sensitive configuration rules.

## Troubleshooting

List common symptoms, likely causes, safe checks, and recovery steps. Include
how to tell whether the issue is Platform, WCMS, Axis, a customer project, or
an external dependency.

## Common mistakes

Call out unsafe shortcuts, misplaced files, copied framework source, frontend
data ownership, duplicate authorities, hard-coded customers, unversioned
generated content, and skipped tests.

## Verification

List the commands, tests, runtime checks, browser checks, or import checks used
to prove the content and behavior.

## Related pages

Link to the next useful pages. A search visitor should know where to continue.
