# Enterprise Partner And Provider Reference Data Follow-Up

## Recorded Action

Add clearer enterprise examples for platform owner, program operator, service provider, infrastructure owner, and reward marketplace vendor roles. These examples should help demo Waste and Loyalty relationships without importing legacy project identity or implying that tenants are business owners.

## Migration Target

- Model BEAH-style recycle-bin operators as enterprises associated through role-aware references.
- Model coupon redemption destinations as vendor enterprises owned by Loyalty or Commerce sample data, depending on the final capability boundary.
- Keep platform owner, program operator, service provider, infrastructure owner, issuer, and vendor semantics as role associations, not separate tenant shortcuts.
- Place shared or common capability reference data in the business anchor module of the functional module, such as `wasteCore` or `loyaltyCore`.
- Keep Profile as the enterprise schema authority while capability modules own their seed-data intent.

## Status

Implemented for initial demo data. Waste Core now contributes the Waste operator and a BEAH-style recycling service/infrastructure-owner enterprise; Loyalty Core now contributes the rewards marketplace and a separate rewards redemption vendor enterprise.
