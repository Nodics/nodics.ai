# Nexus Data Lifecycle

This matrix is an executable design constraint for the reusable Nexus accelerator. Concrete server names below describe the reference deployment; destination-role enforcement remains canonical.

| Release | Physical source | Lifecycle | Import runtime | Online visibility |
| --- | --- | --- | --- | --- |
| `nexusCorporateSite` | `data/sample-v001/content/{headers,records}/wcms` | `PUBLISHABLE` | `wcmsStagedServer` | Atomic CMS Site publication through `nPublish` |
| `nexusEditorialSource` | `data/sample-v001/content/{headers,records}/editorial` | `PUBLISHABLE` | `wcmsStagedServer` | Editorial publication through `nPublish` |
| `nexusEngagementOperational` | `data/sample-v001/content/{headers,records}/engagement` | `OPERATIONAL_VERSIONED` | `engagementServer` | Engagement-owned public APIs expose eligible projections; no WCMS copy |
| `nexusCorporateMediaReferences` | `data/sample-v001/content/{headers,records}/media` plus `data/sample-v001/content/assets/nexus-cms-media` | `PUBLISHABLE` | `wcmsStagedServer` | Media references publish through `nPublish`; physical media is transferred by nMedia policy |
| Expected Online projections | `test/expectedOnlineProjections` | `TEST_ONLY` | Never imported | Acceptance comparison only |

Rules:

1. `wcmsOnlineServer` never imports a Nexus source release.
2. Nexus and other public applications discover only Online CMS endpoints.
3. Axis authors against Staged and initiates governed publication; it does not
   select arbitrary releases, runtime targets, or approval outcomes.
4. Operational customer records such as submissions, consent, and orders must
   never enter a publishable release.
5. Removing a file from a later release does not delete records. Publishable
   removal uses unpublish/retire; operational data follows its owning service's
   retention contract.
6. Repository tooling and AI agents use Nodics APIs or services for all data
   operations and never perform direct database CRUD or database inspection.
