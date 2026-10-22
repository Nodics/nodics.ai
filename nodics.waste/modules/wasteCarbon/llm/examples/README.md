# Carbon Examples

A configured test provider returns a REALIZED lot with issuedQuantity '10.000', scale 3 and a contributor allocation of '4.000'. The contributor can reserve '1.250' using an explicit manifest and operation key. A transfer atomically changes beneficial ownership by exactly '1.250', retaining the source allocation. Later issuance allocating another '2.000' to the original contributor remains theirs after certificate transfer.

A PROSPECTIVE lot cannot reserve. A provider timeout leaves an existing reservation held. After an uncertain write, getOperation with the original key determines the result; retry transfer with the same recipient. Release after TRANSFERRED rejects.

After transferring 1.250, the recipient has 1.250 realized and 1.250 reserved, with zero available from that operation. If another certificate component fails, keep this destination hold intact. Once Digital retains every transfer receipt, finalize the same lot, sender, recipient, quantity, unit, key and manifest revision. The recipient then has 1.250 available. A duplicate or lost-response retry never credits additional quantity.

Customize only providerService, qualificationRef and intentional limits in later properties. Implement readLot/eligibility as registered services. Tests use a synthetic qualified adapter and restart service objects against the same mocked generated repository to prove no process-local owner state.

A signed customer posts {} to /carbon/holdings; Profile resolves their customer code even when it differs from loginId. An employee in the represented Enterprise posts the same body and sees only that Enterprise's lots after current scope admission. Posting another ownerRef rejects. Missing grants or an explicit deny rejects before domain reads. A returned available quantity is not a listing-eligibility promise: reserve and transfer still require current qualified evidence. To inspect an uncertain component, post its lotCode and operationKey to /carbon/operations/lookup with the same originating owner context.
