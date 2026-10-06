# Collection-Centre Preparation And Execution

## Ownership And Availability

Copilot Workbench prepares a review, not Waste records. Waste Collection owns
collection-point creation and validation. Location and Profile remain canonical
references. This implementation creates up to 20 new collection points for the
employee's **current enterprise**; it does not update existing points, create
locations, infer coordinates, transfer ownership or provision enterprises.

The deployment must select `copilot.workbench.collectionCentreTarget` through
normal nConfig layering: `enabled: true`, `moduleName: 'wasteCollection'`, an
existing nService `connectionName`, and any required `targetAuthority`. Defaults
are disabled; no hostname, credential or customer-specific connection is shipped.
Copilot requires `copilot.mutation.prepare` and, at execution, separately
`copilot.mutation.execute`. The Waste API independently enforces its effective
employee, record, field and operation authorization. A Copilot grant never
replaces that authorization.

## Business-User Journey

1. Select the enterprise that operates the collection centres in Axis.
2. Obtain the existing Location codes and collection-point type from the owning
   workspaces. Do not substitute an address string for a Location reference.
3. In conversation, submit the explicit command below. With the optional
   [natural-language preparer](../../../copilotCore/llm/examples/natural-language-preparation.md)
   enabled, the same values may be expressed in prose.
4. Supply any missing required values. Clarification creates no action or record.
5. Review every field in the confirmation, including each localized name,
   Location reference, operator reference, operating status, visibility,
   lifecycle status and initial revision. References are displayed as separate
   inert fields; no nested value is hidden behind a summary.
6. Explicitly approve the reviewed plan, then execute it through the existing
   confirmation workflow. Preparation and approval do not create records.
7. Inspect the per-record outcomes. `COMPLETED` means an exact owner
   acknowledgement; `OUTCOME_UNKNOWN` means inspection is required, not failure
   and not permission to retry. Later rows remain `NOT_STARTED`.

```json
{
  "operation": "waste.collectionCentre.create",
  "centres": [{
    "code": "CENTRE_ONE",
    "name": {"en": "Central collection centre"},
    "collectionPointType": "COLLECTION_CENTRE",
    "locationRef": {"module": "locationCore", "schema": "location", "code": "LOCATION_ONE"},
    "operatorEnterpriseRef": {"module": "profile", "schema": "enterprise", "code": "ACME"},
    "operatingStatus": "ACTIVE",
    "publicVisibility": "BACKOFFICE",
    "status": "DRAFT"
  }]
}
```

Names and identifiers above are synthetic. `ACME` must equal the authenticated
enterprise for this example; no administrator bypass is inferred. Supported
status/visibility choices are validated against the current explicit adapter
contract and then by Waste. Revision defaults to zero and is included in review.

## API And State Flow

```text
Human command -> Core -> Workbench input validation
                           |
                     complete review
                           |
                 private action persistence
                           |
                 explicit approve + execute
                           |
                 CAS claim / row journal
                           |
           Waste PUT /wastecollectionpoint
           original employee bearer, one attempt
                           |
           COMPLETED or OUTCOME_UNKNOWN
```

The secured preparation route is `POST /collection-centres/prepare` beneath the
Copilot API prefix. It accepts the same object as the conversation command.
Existing confirmation routes bind actor, tenant, enterprise, revision, expiry
and the full argument digest. Domain submission uses the existing generated
owner create transport; caller-provided routes, credentials and endpoints are
not accepted.

## Denial And Recovery

- Another operator enterprise, incorrect reference module/schema, duplicate
  codes, extra fields, empty lists, more than 20 centres, invalid enums and
  nonzero initial revisions are rejected before any Waste call.
- A changed deployment target, altered reference, expired confirmation or stale
  revision cannot execute the old plan. Prepare and review a new plan.
- After a transport timeout or contradictory owner response, inspect the Waste
  workspace and owning runtime's request/audit evidence using the action's
  idempotency identity. Never infer a successful create solely from a similar
  record or automatically resubmit `OUTCOME_UNKNOWN` rows.
- With the native Waste command journal and independent
  `copilot.workbench.receiptRecovery.enabled` gate configured, use **Inspect original
  results** to read the exact original receipt. This is explicit inspection, not
  automatic replay or compensation. Completed rows remain immutable; only
  `NOT_STARTED` rows can receive a fresh continuation approval. An incomplete
  receipt remains unknown. See
  [Original Business Results](../../../../../nodics.docs/docs/pages/nodics.copilot/original-business-results.md).

## Customization And Verification

Native collection-point HTTP creation declares insert-only semantics. An
existing centre code cannot be overwritten by a new Copilot plan, even with a
different command key, and disabling receipt recording does not weaken this
rule. Review the existing centre through native authorized reads; use its owning
update journey for deliberate edits. Do not change the create action into an
implicit update or retry an uncertain action. The runtime normal case explicitly
approves a changed duplicate, verifies unchanged native content and verifies
that original inspection does not adopt the earlier record as this command's
completion. Schema-owned versioned or managed lifecycles are not bypassed by
insert-only options.

Administrators select the existing Waste connection; partners may override the
focused preparer for additional Waste-supported fields. Such an override must
validate every nested value, show every executed field in review, retain current
enterprise binding and use the owner API. Never copy Waste validation, Location
storage or Profile identity into Copilot or Axis.

Maintainers run `node --test
nodics.copilot/modules/copilotWorkbench/test/copilotCollectionCentreAction.test.js`
and action/enterprise regression tests. Tests cover preparation, complete review,
denial, missing values, stale targets, field tampering, partial execution and
uncertain persistence. Isolated tests are not signed-in Waste acceptance.

### Disposable Native Acceptance

`test/copilotCollectionRuntime.live.test.js` authenticates real Profile employees
and starts separate owned Waste and Location runtimes. It creates a synthetic
Profile address and Location through their own APIs before preparing any centre.
The existing default enterprise is a bootstrap fixture anchor, not a suggested
business operator for real collection centres.

1. Configure the local replica-set URI in `NODICS_ERASURE_MONGO_URI` and installed
   Elasticsearch home in `NODICS_ERASURE_ES_HOME`, using the shared fixture guide.
   Local Ollama and its selected model must already be available.
2. From the framework root run:

   ```sh
   NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 node --test nodics.copilot/modules/copilotWorkbench/test/copilotCollectionRuntime.live.test.js
   ```

3. Require direct, response-loss and natural-language cases to pass. Without
   opt-in they skip. No UI is started by these backend tests.
4. The test verifies reader/native-query refusal, foreign operator refusal,
   invalid enums, missing fields, no centre creation at approval, stale revision,
   exact native fields and current-enterprise operator references.
5. In the response-loss case the first native create succeeds but its response is
   discarded. Restart preserves uncertainty. Original inspection proves the first
   completion without writing; fresh approval creates only the second centre.
6. Final native counts and action receipts survive Waste, Location and Copilot
   restart. The initial Location record is unchanged. Duplicate conversation
   submission makes no additional charged model call. Owned resources close even
   after assertions fail; shared runtime databases remain outside this fixture.

This qualifies local creation/recovery, not existing-centre updates, public map
projection, location approval, geocoding, enterprise provisioning or notification
delivery. Native schema operations do not themselves prove the physical place
exists or that every referenced business record is eligible for operational use.
