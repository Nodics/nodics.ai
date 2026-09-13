# jsImport AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nData/nImport/jsImport` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

Framework `inventoryData.js` may export
`{ record0: { code: 'stock-default', name: 'Default', tags: ['a', 'b'] } }`.
The corresponding later-layer file can export
`{ record0: { name: 'Partner', tags: ['c'] } }`.
The effective record keeps `code`, changes `name`, and has only tag `c`.
A separate CMS dataset's `record0` is unrelated. The header still chooses whether
and how the effective record is saved; this example performs no database rename.

A base file can export `record0: { code: 'item', name: 'Base' }` and
`record1: { code: 'other', name: 'Other' }`. The matching project delta exports
only `record0: { name: 'Project' }`, with its explicit matching target header.
The composed delta writes `{ code: 'item', name: 'Project' }`; it does not replay
`record1`. A matching running or changed stable baseline blocks the delta.
