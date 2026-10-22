# Enterprise Actor And Owner Acceptance

## Ownership

Profile owns `acceptance:enterprise-actor-owner`. The command composes only the
existing Profile membership, principal-scope, Enterprise-team and explicit
administration-consent APIs. It creates no identity, membership, scope, role,
permission, hierarchy, consent grant or parallel authorization record.

The reusable command registration, routes, limits and refusal-status defaults
belong to Profile `config/properties.js`. A customer project may select existing
fixture codes in a reviewed JSON file and may override a framework-defined value
through normal layering; it must not copy the command, define missing defaults or
store bearer credentials. Owner and disposable-subject tokens are supplied only
through `NODICS_PROFILE_ACCEPTANCE_OWNER_TOKEN` and
`NODICS_PROFILE_ACCEPTANCE_SUBJECT_TOKEN` at execution time.

## Acceptance Boundary

The suite requires one existing administrator membership, current required
scopes, one distinct related Enterprise with a retained active explicit grant,
one unrelated Enterprise, one foreign tenant and one disposable non-administrator
membership. It verifies:

- the authenticated actor sees only its own current membership and effective
  Profile scopes;
- explicit current consent, not hierarchy alone, admits the selected related
  Enterprise;
- an unrelated Enterprise and a forged tenant fail closed;
- the reviewed disposable membership can be revoked through Profile's serialized
  team command, exact replay returns the committed outcome, and its old session
  can no longer read memberships or scopes.

Own-enterprise administration remains legitimate. There is no generic same-owner
denial in Profile. The fixture instead refuses a self-referential related target
and refuses revoking the administrator membership used to execute acceptance.
Parent, subsidiary or sibling relationships never become grants by selection.

Execution requires `--execute` because it performs a real revocation. Use a fresh,
reviewed disposable membership; do not use production staff or the last/default
administrator. Passing source tests proves only the runner contract. A live PASS
proves only the selected installed records and sessions at that time; it does not
enable delegation qualification, repair authority, or grant other modules access.

## Command

```bash
node nodics.foundation/modules/nTooling/bin/nodics-tool.js \
  acceptance:enterprise-actor-owner --execute \
  --selection=/absolute/path/to/reviewed-selection.json
```

The JSON selection contains stable governed record codes and no credentials.
The command emits only hashed owner, grant and assignment references.
