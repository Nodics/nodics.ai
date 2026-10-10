# Coordinated Publication Setup

Secured human/access-token `POST /publications/setup/status` and `/submit`
operate on Staged only. Input is `{contractVersion:1,items}`; each item declares
`code`, `domain`, `rootType`, `rootCode`, `sourceVersion` and domain-owned `input`
whose `publicationCode` matches `code`. Layered limits bound count and bytes.
Tenant, enterprise and original actor remain authenticated, not body-selected.

The human setup status/submit and lifecycle create/get/validate/requestApproval
routes admit `commerceSetupPublisherUserGroup` alongside the existing runtime
administrator group. Each retains its original granular lifecycle permission,
access-token requirement, Staged admission and domain/enterprise checks. Profile
owns installation, assignment and the `COMMERCE_SETUP_PUBLISHER` role; route
metadata neither creates that role nor grants its permissions. The coupon issuer
group alone does not admit publication routes. Service approve/reject/activate
and operator retry/rollback/withdraw retain their previous group/token boundaries.

The configured version provider implements `prepareSetup(request,item)` through
existing capture and `validateSetup(publication,request,item)` against exact
retained sources. Product verifies sealed root, source revision and Store;
financial owners verify retained policy and the exact schema/code/revision set.
`isSetupReceiptCommitted(publication,request,receipt)` retains each owner's real
commit semantics: Product checks committed target evidence; financial policy
owners check applied receipts, exact scope, fingerprint and predecessor. Neither
flag can substitute for the other domain's contract. The generic coordinator also
checks operation, publication, source and target identities against current target.
Providers remain replaceable through the normal module hierarchy. Existing domain
publication and lifecycle view/create/validate/requestApproval grants apply.

Status is read-only. Exact prior Online requests can satisfy an intent even when
their original publication code differs. Ambiguous roots, failed reads and foreign
scope refuse. CURRENT requires the exact approved Online request, owner-qualified
source, current target version and committed activation receipt bound to the
retained operation. One successful root never qualifies the whole catalogue.

Submit captures missing roots, resumes original STAGED/VALIDATED requests and
requests ordinary Process approvals. It never approves, activates, retries FAILED
requests, restores targets or persists another bundle lifecycle. Pending requests
return workflow references. Operator approval and normal callbacks remain required
before operational setup. Partial submission remains visible per root.

## Read Authority Boundary

Read-only does not mean cross-enterprise authorized. Both current setup routes
accept only access tokens. `DefaultPublicationSetupService.context` independently
requires a human principal, signed tenant/enterprise consistency and Staged role.
`provider` requires lifecycle view and the existing domain publication grant even
for status. A signed runtime service token cannot satisfy this contract by adding
permissions, supplying a foreign enterprise or reusing another operator's result.
Generic publication read permission does not replace domain source qualification.

`candidates` performs a fresh generated-owner read with `skipItemCache: true` and
checks returned tenant, enterprise and exact root/source identity. Each status
invocation then calls the domain's retained-source validator, current Online target
read and committed-receipt predicate. A changed source revision, superseded target
or activation operation cannot be qualified from a prior CURRENT response.
These owner reads do not establish a shared transactional snapshot across domains.

The separate [exact-plan observation contract](setup-observation.md) implements
service-only `/publications/setup/observe`, disabled by default. It requires a
recognized explicit permission, exact signed deployment allowlist and confined
checksummed current profile/source plan. It does not widen these human routes,
rewrite a human/system identity or grant financial actions. Final publication
revision/operation pins are optional; fresh canonical source and target receipt
reads derive and cross-check current identities. Native adoption remains explicit.

BackOffice's [aggregate read authority boundary](../../../../../nodics.platform/modules/backoffice/llm/contracts/governed-application-setup.md#aggregate-read-authority-boundary)
retains execution isolation. Local tests are `test/publicationSetup.test.js`,
`test/publicationSetupOwners.test.js` and `test/publicationSetupObservation.test.js`.
