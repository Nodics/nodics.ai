# cms AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.wcms/modules/cms` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

Acceptance consumers read the selected environment through nTooling, then use
`projectRuntime(profile, { role: "WCMS_STAGED" })` (or the capability's own role).
Override an ambiguous role with an explicit server selection; reuse its port and
launch descriptor rather than repeating either in environment acceptance metadata.
