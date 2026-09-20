# Rules Engine Examples

## Generic scoring example

```text
ALL:
  asset.category EQUALS SMARTPHONE
  environmental.carbonImpact GREATER_THAN_OR_EQUAL 10
Outcome:
  ADD_SCORE { score: 25 }
```

The property names above are examples contributed by a consumer. They are not built into Rules Engine.

The score outcome is still generic. A consumer-owned score-band set may map it
to a fixed domain outcome such as `{ rewardTypeCode, rewardAmount, scale }`.
Rules Engine returns that outcome and its versioned evidence; it does not open a
wallet or append a ledger entry.

## Optional example

If a condition for `brand` is OPTIONAL and brand is unavailable, that condition is ignored rather than treated as false.

## Nested example

```text
ALL:
  category = SMARTPHONE
  ANY:
    brand = APPLE
    brand = SAMSUNG
    brand = GOOGLE
```

## Business-user flow

1. Prepare the next draft from an existing definition.
2. Edit its JSON definition in the Axis Rules workspace.
3. Save, validate, and simulate with representative consumer input.
4. Submit the draft to Process for maker-checker approval.
5. After approval, consumers evaluate the immutable published version.

Simulation is diagnostic only. It cannot create a consumer assessment, approve
a Waste submission, or settle Loyalty value.
