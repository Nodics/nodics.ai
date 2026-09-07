# wasteCore Contracts

Preserve shared Waste source-reference, enum, and lifecycle policy contracts.

`wasteCore` is the Waste business anchor. Common Waste reference data belongs in
`wasteCore/data`, even when the target schema authority is another module such
as Profile `enterprise`. Leaf Waste modules own only capability-specific data.
