# Enterprise Relationship Projection Follow-Up

## Recorded Action

Evaluate whether enterprise relationship traversal should remain a UI-side aggregation or become a backend projection/search capability. Axis can currently traverse from enterprise to collection centres and optional coupon/promotion sources, but a governed backend projection may be needed as relationship volume grows.

## Migration Target

- Keep authoritative associations on owning records such as collection centre, coupon, promotion, location, or asset records.
- Do not duplicate ownership facts into Profile Enterprise unless the duplicated projection has a clear cache/search/read-model purpose.
- If a backend projection is introduced, make it rebuildable from owning module records.
- Support straight travel in both directions: record to enterprise and enterprise to related records.
- Preserve optional module behavior when Promotion, Coupon, Waste, or Location runtimes are inactive.

## Status

Implemented for the current scale as Axis aggregation over owning module records. A backend projection remains a future optimization only if relationship volume or cross-runtime query latency proves that a rebuildable read model is needed.
