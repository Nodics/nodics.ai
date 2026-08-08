# Nodics documentation content

This is an independent, content-only project. It does not extend a backend
runtime, register as a functional module, host a documentation application, or
call Platform APIs.

Every document is owned by a canonical functional-module identity such as
`nodics.core` or `nodics.platform`. A document may additionally identify the
technical module it explains, but Axis availability is always governed by the
functional owner.

`catalogue.json` is the versioned exchange manifest. Platform imports a
released content package through its governed initialization process; it must
validate the contract version, content hashes, functional owners, and document
IDs before persisting a new catalogue revision. Axis reads the imported
Platform projection and never reads this repository or raw Markdown paths.

