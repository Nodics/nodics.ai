# OpenAI adapter examples

Select `openai` only in a later runtime layer and configure a secret reference.

For photo metadata, create a dedicated profile with `structuredOutput: true`, `maximumOutputTokens: 1200`, and `imageDetail: "high"`; select it only in the owning feature. Preserve unrelated assistant selectors. Supply a backend-only secret reference. Test malformed photos and provider failures through the feature recovery path.
