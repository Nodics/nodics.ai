# nodics.wcms

`nodics.wcms` is the standard Nodics web content management functional module.

It extends `nodics.foundation` and packages the reusable CMS/WCMS capabilities used to
author, publish, and deliver content-driven applications such as Nodics Axis.

The Platform runtime remains responsible for identity, onboarding, and runtime
module governance. WCMS owns content schemas, page/component data, publication,
and delivery contracts.


Release source selectors now live in ordinary `data.dataReleases.contributions`,
merged by source `moduleName` with explicitly replaced section lists. Role-profile
selection is retired. Discovery remains inert; actual destination owners and
explicit publication context govern admission. See
[release composition](llm/contracts/README.md#explicit-release-contribution-composition).
