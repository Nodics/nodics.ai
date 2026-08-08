# What is Nodics?

Nodics is a modular enterprise application framework for building serious
business platforms without asking every project to reinvent the same
architecture. It gives teams a governed backend foundation for APIs, data,
configuration, authentication, permissions, runtime composition, imports,
exports, content management, scheduled work, events, testing, and operational
contracts.

In plain language, Nodics is an application factory. A factory does not decide
which product your company sells. It gives you repeatable equipment, safety
rules, quality checks, extension points, and production discipline. Your
project still owns its business rules, customer-specific behavior, integrations,
and user experiences.

## The problem Nodics solves

Modern teams can create an MVP very quickly, especially with AI-assisted
development. The hard part starts when that MVP becomes a real product. Code
that was written only to prove an idea often has no strong module boundaries,
no tenant model, no safe customization path, no consistent API contracts, weak
security, duplicated configuration, and limited tests. Every new customer adds
another exception. Every exception makes future releases slower and riskier.

Nodics turns those repeated scaling problems into explicit contracts. A feature
belongs to an owning capability. Configuration has layered scope. Services,
schemas, routes, APIs, and generated artifacts are created in known places.
Customer customizations load after framework behavior instead of editing the
framework directly. Axis renders employee workspaces, but backend modules keep
authority over data and operations.

## Why a business should care

For a business evaluator, the important point is not the folder structure. The
important point is that Nodics helps teams move from idea to production without
throwing away the architecture. It supports faster delivery while keeping
governance, maintainability, tenant isolation, operational visibility, and safe
customer-specific change in view from the beginning.

This matters when an organization wants one platform to support many
enterprises, tenants, brands, websites, internal teams, or partner
customizations. The modular approach reduces the cost of change because a
project can extend or configure the owner of a behavior instead of copying code
into another place. That lowers upgrade risk, reduces duplicate authority, and
helps teams reason about who owns what.

## Beginner mental model

Imagine a company needs employee login, content management, imports, media,
scheduled jobs, and APIs. Without a framework, the first team might build login
one way, the second team might build imports another way, and the third team
might put customer-specific rules directly into shared code. The application
works for a while, then becomes difficult to secure, test, deploy, or extend.

With Nodics, those concerns have named owners. Profile owns employee identity.
WCMS owns CMS content. Media owns media records and lifecycle. Cron owns
scheduled work. BackOffice exposes operational metadata. Axis renders the user
interface by consuming authorized backend contracts. A customer project, such
as Kickoff, composes these capabilities and adds project behavior after the
framework modules.

## What teams can build

Nodics can be used as the backend foundation for multi-tenant business APIs,
employee BackOffice applications, CMS-driven websites, governed content and
media operations, data import/export flows, scheduled jobs, and customer
platforms that need safe extension. The framework supplies reusable capability
contracts; the adopting project supplies the business-specific behavior and
deployment decisions.

The current reference workspace demonstrates this through `nodics.kickoff`,
which starts local Platform, WCMS, and Cron servers, and through `nodics.axis`,
which logs employees in and renders discovered workspaces and documentation.

## What Nodics is not

Nodics is not a finished industry product that removes the need for business
analysis. It is not a frontend repository. It is not permission to access
another module's database directly. It does not make operations automatic:
credentials, infrastructure, monitoring, backup, scaling, and production
security remain deployment responsibilities.

The promise is more practical: Nodics gives a project a governed model for
building and evolving enterprise software without scattering ownership.

## Next actions

- Read modular architecture to understand ownership and runtime composition.
- Follow the local quick start to run Kickoff and Axis.
- Read customization guidance before changing framework behavior.
- Read runtime and DevOps operations before planning production topology.
