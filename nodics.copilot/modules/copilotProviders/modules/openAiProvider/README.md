# openAiProvider

Disabled-by-default OpenAI Responses API adapter. Activate it only through layered `copilot.providers` configuration and a runtime secret resolver.

User messages may carry provider-neutral `images` arrays containing raw base64 JPEG, PNG or WebP evidence. The adapter identifies the MIME type from the bytes and maps text plus images to Responses input. It does not fetch remote image URLs. Invalid image formats and non-user image messages fail before transport.

Profiles select `maximumOutputTokens`, optional `imageDetail` (`high` by default; `low`, `original`, `auto` supported), and `structuredOutput`. The latter enables JSON object mode; owning business services must still validate their schema, catalogue and confidence. A trusted caller may supply provider-neutral `responseSchema: {name, schema}` to select strict JSON Schema Structured Outputs instead. The owning domain builds that schema; the adapter maps it to `text.format` with `strict: true`. Existing JSON-only and text-only callers retain their behavior. `generation.reasoningEffort` is adapter configuration. Sampling parameters are not forwarded. Response storage stays off unless `model.store` explicitly enables it.

Serialized request size, response size, timeout and external cancellation are bounded. Incomplete or refused responses fail closed so the owning feature can offer its normal manual recovery. Tests cover text/image mapping, custom profiles, malformed evidence, response rejection and timeout.
