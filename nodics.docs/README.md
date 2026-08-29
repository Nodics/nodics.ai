# Nodics documentation content

This is an independent, content-only project. It does not extend a backend
runtime, register as a functional module, host a documentation application, or
call Platform APIs.

Every document is owned by a canonical functional-module identity such as
`nodics.foundation` or `nodics.platform`. A document may additionally identify the
technical module it explains, but Axis availability is always governed by the
functional owner.

`docs/catalogue.json` is the versioned exchange manifest. Platform imports a
released content package through its governed initialization process; it must
validate the contract version, content hashes, functional owners, and document
IDs before persisting a new catalogue revision. Axis reads the imported
Platform projection and never reads this repository or raw Markdown paths.

`npm run docs:generate` is a preservation step, not a rewrite step. Developers
author durable source documentation in `docs/pages` and metadata in
`docs/catalogue.json`. The generator reads those sources and writes only derived
release records under `data/core-v001` plus `data/manifest.json`. It must never
replace a detailed source page with a generic scaffold, remove authored
sections, or write into `docs/pages`.

This package is for framework documentation. Axis product documentation belongs
to `nodics.platform/modules/axis`; customer/project documentation belongs to the
owning customer or project documentation package.
