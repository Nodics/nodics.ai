# Circa Enterprise, Staff and Scope Reference

![Enterprise associations and explicit staff scope](../assets/images/circa-record-network.png)

This source-backed diagram explains ownership and boundaries; it is not live
deployment or acceptance evidence. Qualification notes remain part of the flow.

This page explains the actual enterprise references beneath Circa's sample network,
not only the intended operating model. Beginners should separate an enterprise's
business roles, its parent relationship, an employee's permission groups and a
resource scope assignment. The business value is controlled multi-organization
participation without duplicating credentials or silently granting operational access.

## Which enterprises are referenced?

| Code | Authored name and source | Business roles | Reference use |
| --- | --- | --- | --- |
| default | Default; Profile init-v001 enterprise initializer | PLATFORM_OWNER | Original three Circa points, optional Sunmarke and Circa Commerce store reference |
| NODICS_WASTE_MANAGEMENT_CO | Nodics Waste Management Co.; Waste Core core-v001 contribution to Profile | PROGRAM_OPERATOR, SERVICE_PROVIDER | Operator of shared 17-point network |
| BEAH_RECYCLING_SERVICES | BEAH Recycling Services; Waste Core core-v001 contribution to Profile | SERVICE_PROVIDER, ASSET_OWNER, BUSINESS_PARTNER | Shared network infrastructure-owner reference |

The Circa module's profile sample itself contains three customers and three centre
addresses, not three new enterprises. Across the reviewed point/store templates,
three distinct enterprise codes are referenced. This is not a count of all enterprise
records installed on Platform. The separately discussed seven-enterprise network
is a preparation plan, not these persisted source records or an approved import.

The initializer enterprise `default` declares `tenant: default:true`, description
Default platform owner enterprise, address `defaultEntAddress` and contact
`defaultEntContact`. Its capability scope is Profile PLATFORM_OWNER/GLOBAL. The
colon-bearing tenant initializer representation is an import-layer value; it must
not be copied into a customer HTTP tenant parameter or treated as another company.

## Operator and infrastructure-owner capabilities

NODICS_WASTE_MANAGEMENT_CO declares Waste Core PROGRAM_OPERATOR/WASTE_MANAGEMENT
and SERVICE_PROVIDER/COLLECTION_CENTRE_OPERATION capability scopes. The BEAH
reference declares SERVICE_PROVIDER/RECYCLING_SERVICE_OPERATION,
ASSET_OWNER/COLLECTION_BIN_OWNERSHIP and BUSINESS_PARTNER/WASTE_MANAGEMENT_PARTNERSHIP.
Both authored enterprise records are active with empty addresses/contacts.

This demonstrates multi-role enterprises. It does not prove a real BEAH partnership,
actual recycling capacity or current contract. A centre's operator reference identifies
who operates it; a separately supplied owner reference identifies infrastructure
ownership. Neither creates an employee membership or a data-access permission.
The original Circa points provide an operator but no independent bin-owner field;
that missing information must not be silently filled from shared sample assumptions.

## Seven operational sample employees

The `circa.ewaste:operations` release contains seven employee records and eight
scope records. This public guide deliberately omits passwords, credential material
and login details. It records stable sample employee codes and permission groups:

| Employee code | userGroups contribution | Scope sample |
| --- | --- | --- |
| circa-administrator | wasteEnterpriseAdministratorUserGroup | ENTERPRISE/default |
| circa-centre-operator | wasteCentreOperatorUserGroup | BUSINESS_UNIT/You&Co shared point code |
| circa-verifier | wasteVerifierUserGroup | BUSINESS_UNIT/You&Co shared point code |
| circa-approver | wasteApproverUserGroup | BUSINESS_UNIT/You&Co shared point code |
| circa-coupon-manager | wasteCouponManagerUserGroup | ENTERPRISE/default |
| circa-marketplace-moderator | wasteMarketplaceModeratorUserGroup | ENTERPRISE/default |
| circa-auditor | wasteAuditorUserGroup | ENTERPRISE/default |

The eighth assignment is `circa-scope-platform-admin`, targeting the existing
platform admin principal with GLOBAL/* scope. It is not an eighth employee record.
Each authored assignment uses principalType human, tenantCode/enterpriseCode
default, ALLOW, DIRECT inheritance and ACTIVE status. The centre scopes explicitly
target `WCP_SAMPLE_COLLECTION_CENTRE_YOU_AND_CO`; they do not target cc-dxb-01,
cc-dxb-02 or cc-dxb-03. An operator should expect a scope mismatch to reject and
review intended allocation, not add unrestricted permissions to make a demo pass.

## Scope and enterprise alignment checks

Employee record codes, login/principal identifiers and enterprise memberships are
not interchangeable. Scope principalCode must resolve through Profile's canonical
principal semantics. Role groups describe permitted actions; operational scope
limits where those actions apply. Profile admission, account freshness and route
permissions remain independently required.

The shared You&Co point references NODICS_WASTE_MANAGEMENT_CO, while these scope
templates declare enterpriseCode default. Documenting both facts is not qualification
of that cross-reference. Reconcile current installed memberships, target-owner scope
semantics and approved staff allocation before operational acceptance. Do not
rewrite source or extend access merely because the source records coexist.

Circa sets requireScopes and requireVerification true and requireDifferentApprover
false. A person with both explicitly authorized permissions may perform both review
stages; the false flag does not give an operator the approver group. An enterprise
administrator is not automatically a merchant operator at every outlet.

## Hierarchy and platform authority

Profile already models superEnterprise/subEnterprises. None of the three enterprise
initializer records reviewed here establishes the proposed GreenPerks parent/child
network. Consent-based ancestor administration remains an accepted but incompletely
enforced framework policy in the current batch. Default-false creation consent
must not be assumed to exist as an activated configuration API.

Authorized platform super administrators can have independent platform authority;
ordinary PLATFORM_OWNER membership/business role cannot manufacture it. Enterprise
super administration, employee membership, operational scopes and coupon commercial
relationships must remain separate. Session permissions resolve for the selected
enterprise, not a union of every membership. Last-super-admin and dependency
invalidation improvements still require complete source/installed qualification.

## Customize and extend safely

A custom project contributes approved enterprise records through Profile-owned
data releases, then creates employee identities/memberships through lifecycle owners
and assigns bounded operational scopes. A worked example assigns a verifier to a
new centre: retain one canonical human identity, select the target enterprise,
grant only verification permission and that centre's scope, and confirm approval
remains denied. Do not clone an existing password, insert a generic admin or copy
the platform GLOBAL scope.

Developers test wrong enterprise, wrong centre, missing membership, inactive actor,
revoked permission, DENY precedence, stale session and independent valid memberships.
Recovery uses the qualified Profile access lifecycle with audit, not direct data
editing. Operators inspect effective rights and saved assignments; DevOps preserves
the actor and grant history through upgrades.

## Common mistakes

Counting customers as enterprises; counting the extra scope as an employee; deriving
rights from enterprise roleCodes; assuming the shared operator owns every bin;
confusing sample principal login with record code; and granting all descendants
because a hierarchy exists violate owner boundaries.

## Verification

Counts and fields come from Profile default initialization, Waste Core enterprise
contribution and Circa operations records. No installed principal/membership inventory
or credential validation was performed. Confirm actual mappings through approved
owner APIs during joint acceptance. See [collection references](circa-collection-reference.md),
[operations/rewards](circa-operations-rewards.md) and [customization](circa-customization.md).
