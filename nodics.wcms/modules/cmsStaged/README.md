# CMS Staged Versioning

`cmsStaged` is the opt-in WCMS deployment layer that makes publishable CMS
authoring schemas immutable and version-aware. Activate it only in a Staged
runtime together with `vDatabase`, `vMongodb`, and `vService`.

Online runtimes must not activate this module. They receive explicit published
projections through the CMS publication target contract instead of maintaining
authoring history.
