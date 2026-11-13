# discoveryRuntime Contracts

`discoveryRuntime` owns generic active-profile resolution and nSearch-backed execution seams.


## Ownership evidence

The package declares `sourceOnly` after stateful operations moved behind the
Discovery Configuration and Projection DMS APIs. It transforms queries and
responses without accessing local persistence or provider models. This is a
source-based classification, not an exemption for modules without HTTP routes.
Do not add local state or claims without revisiting ownership. Trusted callers
may select explicit publication context; no runtime role or endpoint inference.
