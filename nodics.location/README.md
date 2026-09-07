# nodics.location

`nodics.location` owns reusable Location capability for semantic places,
coordinates, map layers, nearby search, business-user location drafts,
approval, and marker projections.

Location is not owned by Commerce, Waste, Platform, Process, Loyalty, WCMS, or a
customer project. Those modules may reference Location records, contribute
location types, or call Location APIs, but `nodics.location` remains the
framework authority for place identity, coordinate validation, and map/search
projection contracts.

The first implementation targets a standalone `locationServer` runtime while
remaining compatible with consolidated runtimes. Cross-module behavior must use
declared APIs, events, providers, or internal service contracts and preserve
request, runtime tenant, enterprise, permission, correlation, idempotency,
audit, diagnostics, and retry context across process boundaries.

Business schemas must store coordinates as separate `latitude` and `longitude`
fields. Do not add direct `tenant` fields for business ownership; use enterprise
association when ownership, operator, issuer, seller, venue, or visibility scope
is required.

Profile remains the canonical owner for reusable address/contact facts. Location
records reference Profile address/contact records through `addressRef` and
contact references; they do not duplicate postal fields, landmark/access notes,
address geocoding metadata, address verification metadata, or reusable
privacy-safe display policy. Location owns the operational map point for a place
as separate `latitude` and `longitude` fields.

Commerce Store, Sales Channel, POS, Waste Collection Point, and similar business
records should store their own business data and reference Location through
`primaryLocationRef` or `locationRef` when physical-place behavior is required.
Waste Collection Points must also carry an operating enterprise association;
the Location record provides the place, not the business identity of the bin or
collection centre.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf
ancestor `AGENTS.md` chain. For exact contracts and examples, read this module
`llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
