# Nodics Platform

`nodics.platform` is an independently versioned backend runtime group extending
`nodics.foundation`. It hosts authenticated platform APIs, Profile integration,
BackOffice registration/discovery, Axis backend metadata, the installed-runtime
Application Builder capability, documentation import/delivery, and other
explicitly approved platform capabilities.

It does not contain frontend source or authored documentation content. Those
belong to independent projects and communicate through governed contracts.

The platform group composes `profile`, `backoffice`, `axis`, and `installer`.
The `installer` child module is not the public first-machine bootstrap package;
that remains in the standalone `nodics.installer` repository for beginner
`npx` usage before `nodics.ai` exists locally.
