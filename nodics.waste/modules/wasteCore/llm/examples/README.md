# wasteCore Examples

Examples should show common source references and lifecycle policies reused by
Waste child modules.

Acceptance consumers read the selected environment through nTooling, then use
`projectRuntime(profile, { role: "WCMS_STAGED" })` (or the capability's own role).
Override an ambiguous role with an explicit server selection; reuse its port and
launch descriptor rather than repeating either in environment acceptance metadata.
