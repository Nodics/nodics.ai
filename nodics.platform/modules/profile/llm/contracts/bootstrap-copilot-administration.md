# Bootstrap Copilot Administration

Profile owns employee groups and effective permissions; Copilot owns its API
contracts. The unreleased `profile:init-v001` baseline `0.0.1` uses `init-v001`.
Historical group snapshots are test fixtures, not additional importable releases.
Human, guest, service identity and tenant placement records are preserved. No
credential is reset by importing this data and no new identity store is introduced.
nImport installs Profile’s base groups through `profile:accessGroups` and the
runtime configuration groups through `config:accessGroups` before creating the
bootstrap identities. Those are the only group packs in the default plan.
The nConfig release pins its Profile parent group dependency. Domain groups
and enterprise roles require explicit capability setup.

The following Copilot permissions belong to `runtimeConfigAdminUserGroup`.

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
2. Run the existing governed Init owner. A fresh install selects `0.0.1`.
   Existing pre-rebase local installations require an approved fresh reset and
   re-import, not a downgrade, receipt edit or direct userGroup write. Future
   frozen releases advance through the normal forward-release contract.
3. Verify installation history and refresh the employee session through Profile.
   A stale signed session is not proof that new permissions are effective.
4. Refresh BackOffice discovery and open Copilot Settings and Knowledge Studio.
   Missing source/index or quota configuration still blocks the relevant action.
5. Configure bounded provider accounting in the deployment layer and use local
   Ollama for acceptance. Permission alone never enables paid-provider calls.

Bootstrap identity assessment pins `profile:init-v001` `0.0.1`. Its exact installed
provenance and review rules remain mandatory; advancing that selector does not
qualify identity migration or customer onboarding.

Customize groups through forward layered data and existing Profile governance.
Do not edit historical snapshots or add permissions in Axis. Run
`node --test nodics.platform/modules/profile/test/copilotBootstrapPermissions.test.js nodics.platform/modules/profile/test/bootstrapIdentityAssessmentContract.test.js nodics.platform/modules/profile/test/consolidatedBootstrapGroupOrder.test.js`.
These source tests do not prove an installed migration or signed-in acceptance.
