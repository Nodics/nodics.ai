# Circa architecture diagram sources

These editable Graphviz sources accompany the framework Circa product guide.
They describe reviewed source ownership and lifecycle boundaries, not evidence
that a runtime has imported data or passed acceptance.

| Source | Purpose | Guide placement |
| --- | --- | --- |
| circa-architecture.dot | Application, reusable accelerator and authoritative domains | Overview |
| circa-submission.dot | Customer preparation, confirmation, review and independent outcomes | Submission journey |
| circa-coupon.dot | Reservation, purchase, entitlement, redemption and refund gates | Coupon commerce |
| circa-layers.dot | Framework/project/runtime extension and separate publication | Customization |
| circa-record-network.dot | Current authored point ownership, locations and scope caveat | Collection and enterprise references |

PNG files are embedded in articles. Matching SVG files support scalable inspection.
Use Graphviz to regenerate an edited source from the owning eWaste module:

```sh
dot -Tpng data/docs-v001/assets/documentation/files/diagrams/circa-submission.dot -o data/docs-v001/assets/documentation/files/images/circa-submission.png
dot -Tsvg data/docs-v001/assets/documentation/files/diagrams/circa-submission.dot -o data/docs-v001/assets/documentation/files/images/circa-submission.svg
```

Review labels and connections against the adjacent article's source evidence
before regeneration. Green/teal marks entry or owner outcomes; yellow marks
distinct facts or qualification gates; red marks failures or allocation caveats.
Dashed edges indicate conditional paths or boundaries, not unconditional writes.
Generated diagrams contain no credentials, customer identities or raw coupon codes.
Last source review: 2026-09-30. Future accelerators should use the same editable
source plus embedded image approach with their own verified owners and journeys.
