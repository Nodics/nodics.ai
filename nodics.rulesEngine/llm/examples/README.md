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
