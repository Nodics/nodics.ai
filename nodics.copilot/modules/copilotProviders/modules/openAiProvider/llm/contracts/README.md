# OpenAI adapter contract

The adapter uses the Responses API, secret references, bounded responses, and provider-neutral output.

Image requests use raw base64 user-message `images` (JPEG/PNG/WebP), converted to Responses input with profile `imageDetail`. `structuredOutput` enables JSON object mode; business schema validation remains caller-owned. Invalid image messages, incomplete responses and refusals fail closed. Size bounds, timeout and cancellation apply before usable output.

Trusted domain callers can supply `responseSchema: {name, schema}`. The adapter
requires a bounded format name and a closed root object, maps it to Responses
`text.format` with `type: json_schema` and `strict: true`, and leaves semantic
validation to the owner. This takes precedence over profile JSON-object mode.
Schemas and domain catalogues never belong in the transport adapter. Invalid
schemas fail closed; there is no silent downgrade after provider rejection.
