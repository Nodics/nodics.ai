# wasteCollection Contracts

Waste Collection owns collection point semantics and accepted material rules.
Location owns map, coordinates, search, and materialization workflow.

## Collection centre API

Waste Collection owns collection-centre business filtering by collection type,
operator enterprise, operating status, visibility, and Waste status. API
exposure should be routed through Waste API, but behavior remains in
Waste Collection services.

Collection-centre records must carry `operatorEnterpriseRef`; tenant remains
runtime context only. Location coordinates and Profile address/contact facts
stay referenced through `locationRef` and the Location/Profile APIs.

Collection-centre search accepts a boolean `active` filter. Public discovery
requires `active: true` in addition to public visibility and operating status.
Authorized operational searches may explicitly request `active: false`.
