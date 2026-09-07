# loyaltyCore Contracts

Preserve shared Loyalty definitions without taking ownership of child module state.

`loyaltyCore` is the Loyalty business anchor. Common Loyalty reference data
belongs in `loyaltyCore/data`, even when the target schema authority is another
module such as Profile `enterprise`. Leaf Loyalty modules own only
capability-specific data.
