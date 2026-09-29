# Cart contracts

Cart owns purchase intent and secured customer operations. Follow
[explicit store context](store-defaults.md), including shared Store validation,
persisted-ID compatibility, owner/tenant boundaries and failure behavior.
Calculations and downstream checkout retain their owning domain contracts.

## Activated Policy Calculation

Calculation ports read each domain's existing `publication.delivery.enabled`
selection. No Cart-owned activation setting, store default or publication
authority is introduced. Domain defaults remain disabled pending installation
and runtime qualification.

When enabled, Pricing reads configured retained books/rows through the Pricing
publication owner before selection; it never pre-reads mutable Price Book/Row
services. Inventory resolves activated warehouse policy before reading current
balances, excludes unactivated warehouses and uses retained sourcing priority.
Balances and coupon-code pools remain live operational data, not release content.
Private negotiated prices keep the existing Negotiated Pricing authority.

Promotion delegates its existing quote owner and rejects a missing owner rather
than falling back to mutable rules when enabled. Tax invokes its existing
decision engine without a mutable Tax Policy pre-read and awaits the configured
asynchronous activated-policy result. Persisted Cart tenant/enterprise and
jurisdiction context are retained; contradictory calculation scope rejects.

Owner readers validate active pointer/receipt bindings. Missing retained content,
receipts, configuration or dependencies propagate as failures; no source-policy
fallback is allowed in configured delivery mode. Disabled mode retains existing
legacy reads and synchronous Tax compatibility through the async Cart port.

`test/cartActivatedPolicyPorts.test.js` exercises ordinary ports with real domain
readers and retained receipt fixtures, missing receipt/scope rejection, live
stock/coupon behavior, private quotes and disabled-mode compatibility. Run it
with `test/cartCustomerApiContract.test.js`. Fixtures do not prove installed
database CAS, runtime grants, Process approval or cross-runtime acceptance.
Later-layer port overrides must preserve these boundaries and owner delegation.
