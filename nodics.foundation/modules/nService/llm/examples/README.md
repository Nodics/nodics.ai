# nService AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nService` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

For topology customization, override the smallest member of
`DefaultModulesConfigurationService` in a later module. For example, override
`normalizeModuleConfiguration` to enrich provider-derived node metadata while
retaining atomic preparation, then prove the effective override with a focused
project test. Do not create another topology container or mutate `CONFIG`.
