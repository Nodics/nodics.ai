# Bootstrap Copilot Administration

Profile owns employee groups and effective permissions; Copilot owns its API
contracts. The forward `profile:init-v001` release `0.0.3` uses `init-v009` and
retains `init-v008` version `0.0.2` unchanged. Human, guest, service identity and
tenant placement records remain byte-identical. No credential is reset by this
change and no new group or identity store is introduced.

Only the existing `runtimeConfigAdminUserGroup` gains:

- `copilot.knowledge.internal.read` and `copilot.knowledge.restricted.read`;
- `copilot.knowledge.source.manage`;
- `copilot.configuration.read`, `.manage`, and `.admin`;
- `copilot.provider.check` and `copilot.usage.read`.

Legacy grants remain for compatibility with their independent APIs. Ordinary
employee groups are unchanged. Customer-content access, transcript access,
physical erasure, mutation execution and native business permissions are not
implicitly granted. Source policy, enterprise assignments, accounting and each
domain's own authorization remain additional checks.

## First Start And Upgrade

1. Compose Profile and Copilot through the normal module hierarchy.
2. Run the existing governed Init owner. A fresh install selects `0.0.3`; an
   existing installation must advance to that exact manifest/checksum rather
   than edit the installed release or write userGroup records directly.
3. Verify installation history and refresh the employee session through Profile.
   A stale signed session is not proof that new permissions are effective.
4. Refresh BackOffice discovery and open Copilot Settings and Knowledge Studio.
   Missing source/index or quota configuration still blocks the relevant action.
5. Configure bounded provider accounting in the deployment layer and use local
   Ollama for acceptance. Permission alone never enables paid-provider calls.

Bootstrap identity assessment pins `profile:init-v001` `0.0.3`. Its exact installed
provenance and review rules remain mandatory; advancing that selector does not
qualify identity migration or customer onboarding.

Customize groups through forward layered data and existing Profile governance.
Do not edit historical snapshots or add permissions in Axis. Run
`node --test nodics.platform/modules/profile/test/copilotBootstrapPermissions.test.js nodics.platform/modules/profile/test/bootstrapIdentityAssessmentContract.test.js`.
These source tests do not prove an installed migration or signed-in acceptance.
