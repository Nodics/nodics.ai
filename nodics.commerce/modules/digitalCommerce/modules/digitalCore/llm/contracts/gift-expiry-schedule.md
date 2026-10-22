# Gift Expiry Schedule

`bundles.validation` owns the positive capacity range (up to 100000), transport
timeout range (up to 60000ms) and gift duration range (1..31536000 seconds).
The retained duration default stays 259200 seconds. Gift creation validates
computed Date representability even when a deployment expands the range;
original operations retain their saved deadline. Sweep and Cron binding consume
the same capacity contract, and the binding pins validation policy across awaits.
There are no service-local default bounds. `digitalPolicyBounds.test.js` covers
source defaults, explicit range overrides and arithmetic/Date overflow.

Digital contributes inactive `digitalGiftExpiryJob` through the explicit
`giftExpirySchedule` data-manifest section. The existing `CRON_JOB` installer
owns persistence; Cron owns scheduling, operational admission and execution.
There is no timer, automatic import or activation. The reference cadence is once
per minute, with active false, runOnInit false and one selected node. Operators
review the tenant, node and cadence as governed job selections before activation.

The job selects `DefaultDigitalGiftExpirySchedulerService.sweep`. The existing
Cron `jobDetail.startNode` dispatcher supplies its freshly verified operational
principal. The binding compares that principal with another
`DefaultCronJobService.assertOperational` read and forwards the original runtime
credential through existing module transport to Digital's secured
`POST /internal/bundles/gifts/expire` endpoint on Commerce. It never fabricates
identity, adds groups or chooses a body-supplied Enterprise. The endpoint
independently requires Digital runtime scope and `commerce.digital.bundle.expire`
and processes only the signed tenant/Enterprise partition. Cron activation grants
neither those permissions nor cross-Enterprise scanning authority.

Complete defaults live in `config/properties.js` under
`digitalCore.bundles.giftExpiryScheduler`: enabled false, exact startNode, ten
batches and the Digital/Commerce target with v0, 60000ms timeout and one transport
attempt. Existing `giftExpirySweep` bounds each batch to 100 operations and
generated read pages of 50. Later layers override defined values only; job/node/
schedule selections remain Cron records. The Cron runtime must load this Digital
callable and existing transport. Discovery is not installation or qualification.

Each batch invokes the original persisted expiry path. Its fixed cutoff and
keyset cursor process expired undecided gifts or interrupted EXPIRE releases,
never accepted/declined/cancelled transfers. The binding rechecks configuration,
definition, principal and credential around every transport await and validates
ordered bounded result codes/statuses and an exact advancing cursor. `complete`
means scan exhaustion; `recoveryRequired` separately counts unconfirmed releases.
Hitting the batch bound returns a cursor. A later scheduled run starts from the
beginning so failed releases are not abandoned. Original receipts make repeated
and late runs safe. Lost acknowledgement never implies rollback; the next run
reads persisted state and uses original keys. Acceptance races use the original
revision, not scheduler priority.

Unit tests compose the actual Cron trigger, binding, Digital controller and
persisted gift service over isolated transport/storage. Cases include disabled
policy, changed authority/configuration/credential, bounded work, partial release
and lost acknowledgement. No job or provider is run live. Installed routing,
permissions, persistence and multi-node acceptance remain final-stage checks.

Expiry uses the same postcommit `EXPIRED` notification handoff as an individual
expiry command, only after complete persisted release receipts. Recipient
resolution remains the current Profile source-only contract described in
[whole-gift notifications](bundle-gift-notifications.md), including independent
owner/employee opt-in and explicit Enterprise selections. Scheduler admission
does not grant recipient access or enable delivery. Run Profile's
`profileNotificationRecipients.test.js` with Digital's lifecycle suite to cover
the real recipient/source/Communication composition alongside Cron dispatch.
