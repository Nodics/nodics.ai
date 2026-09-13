# discoveryRanking

`discoveryRanking` owns reusable ranking primitives for Discovery result sets,
including pin, boost, bury, scoring, priority, and conflict handling. It keeps
ranking mechanics generic while domains decide which records or campaigns are
eligible.

## Ownership

- Owns generic ranking schemas, services, and conflict mechanics.
- Does not own product merchandising, editorial priority, customer rules, or
  provider-specific scoring APIs.
- Keeps tenant and audit behavior explicit for ranking decisions.

## Extension

Domain modules may contribute ranking eligibility or business rules in their
own layer. Keep shared scoring and conflict behavior here so multiple domains
can reuse it consistently.

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoveryRanking/test/discoveryRankingContract.test.js
```

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
