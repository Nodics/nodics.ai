# Waste Carbon

The canonical capability article is `waste.carbon-holdings`, maintained directly
in `data/docs-v001/records/documentation` and independently selected through the
documentation section of `data/manifest.json`. Its draft CMS records do not
activate the carbon owner or qualify a registry/provider.

Canonical owner for waste-derived carbon lots, prospective allocations, realized holdings, reservations and transfers. Impact assessments, Waste certificates and Loyalty units are distinct. Existing candidates were inspected: Waste Impact persists calculations, Waste Core emits unresolved carbonSettlementIntent references, Loyalty accounts for reward units, and Digital coordinates transactions. None owns realized lot provenance. This narrowly scoped child adds that missing authority without a second checkout, wallet or identity owner.

Read [the exact provider, component and participant-read contract](llm/contracts/README.md). Services use generated wasteCarbonLot persistence via Waste Core's repository adapter. POST /carbon/holdings and /carbon/operations/lookup admit customer and represented Enterprise reads through current Profile identity/scopes; body owner references never grant authority. Mutations remain service-only. Digital authorizes customer/Enterprise actors before invoking the component API with its service identity. Profile owns permission assignments.

All defaults are in config/properties.js. Provider service and qualification reference default to null; synthetic evidence defaults to disabled. No provider or real issuance is asserted. A selected adapter must prove authoritative issuance, cumulative allocations and current eligibility under its governed qualification. Unit/scale and program decisions come from evidence. The bounded lot document uses compare-and-set revisions; full lots reject further commands rather than evicting replay evidence.

Consolidated and standalone runtimes select wasteCarbon, wasteCore and wasteSubmission. Waste group composition includes wasteCarbon; deployed activeModules remain deployment-owned and source presence is not activation. Remote callers use the secured APIs; direct local service use has the same admission. Import the explicit permissionCatalogue section from data/manifest.json; assignments remain Profile-owned. Backup/restore each lot and its allocation claims together. Retry uncertain mutations by the original operation key and inspect the recorded result; never release a possibly completed transfer.

Ordinary unit validation performs no database import, live provider, server, end-to-end or release action. The opt-in
`wasteCarbonNativePersistenceAcceptance.test.js` gate uses only an explicit credential-free loopback replica set and a
fresh random database to prove owner schemas, allocation/holding persistence, one-winner CAS, uncertain acknowledgement
and reconnect recovery. Its provider evidence is synthetic and is not registry issuance or external-transfer evidence.
`carbonPermissionImportAcceptance.test.js` executes the actual permission records through Foundation's admitted
identity-authority import dispatch; it defines no assignments and does not perform a live installation.

Transfers retain recipient quantity as reserved until the original operation is explicitly finalized by Digital after all component transfers. POST /carbon/transfers/finalize supports mixed certificate/carbon bundles and multiple lots without onward availability during partial transfer. Select the forward transferFinalizationPermission definition and coordinator grant separately; no shared runtime configuration or live import is implied.
