# wasteCollection Contracts

Collection-point create receipts use private `wasteCollectionCommandReceipt`
storage under default-disabled `commandReceipts` admission. The existing native
generated create retains location/reference and current schema authority.
Inspection never infers original success from an existing centre. See
[original business results](../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js).

`wasteCollectionPoint.commandReceipt.insertOnly: true` narrows the existing
generated HTTP create to insertion. nDatabase sets the generated save option;
Waste adds no driver or duplicate persistence path. Preserve the unique primary
identity index. A fresh command key or approval cannot update an existing centre.
Receipt recording remains independently default-disabled; creation stays
insert-only in either mode. Existing PATCH and internal import contracts remain
unchanged. Failed/unconfirmed creation does not prove original success merely
because the centre exists. Current Copilot receipt recovery keeps that case
unknown and prohibits replay.

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
