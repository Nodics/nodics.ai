# database AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nDatabase/database` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

The focused `test/localResetManagedRemoveContract.test.js` example verifies a
configured Local reset against a managed schema, then rejects a normal bulk
request and forged authority objects. Use the provider and coordinator APIs;
never construct an authority in project code or remove data through a driver.
