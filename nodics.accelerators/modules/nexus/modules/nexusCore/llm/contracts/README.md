# nexusCore contracts

Keep release identities and immutable data bytes stable when moving source ownership. Use declared module-relative media assets; never escape the owning module or add a parallel importer.

Nexus preparation explicitly selects `media:mediaPublicationWorkflow` on the
configured Process connection, role `PROCESS`, before site/content releases.
The workflow is an `EXPLICIT` owner release, not part of generic Process
foundation completion. nImport supplies current version and durable status;
missing discovery or denial blocks the whole preflight before any preparation
write. User-triggered preparation does not assign reviewers, grant permissions,
enable publication providers or approve Media. Existing workflow instances retain
their pinned definition versions. Later layers may override the application
preparation descriptors and Process connection without replacing the owner workflow.
