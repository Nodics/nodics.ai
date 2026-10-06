# Provider Setup and Verification

## Scope and Ownership

This guide covers provider invocation. Governed administration now has its own
[Policy guide](../../../../../copilotPolicy/llm/examples/governed-administration.md),
while [budgets](usage-and-budgets.md), [allocation changes](allocation-administration.md)
and [explicit probes](historical-usage-and-provider-checks.md) have separate owner
contracts. Workspace's `describeConfiguration` snapshot remains configured
metadata, not a health check; only an explicit successful probe establishes
that probe's outcome. Local tests do not establish deployed activation.

`copilotProvider` selects and validates the configured adapter. The child adapter
owns vendor transport. `copilotPolicy` and the owning business API control data
and operation access. Axis renders API results and never contacts Ollama or an
external model directly. No customer module contains a copy of these services.

Request flow:

```text
Authorized owning service
  -> selected effective provider configuration
  -> explicit profile and adapter preflight
  -> vendor adapter (bounded request, cancellation)
  -> normalized content and nullable token measurements
  -> conversation event
  -> Axis validated usage presentation
```

The business benefit is reliable failure reporting: an unavailable measurement
does not look like a free request, and an interrupted answer does not look like
a completed operation. A completed model answer is still not proof of a
business mutation; canonical operation results remain authoritative.

## Configure Local Ollama

1. Ensure the selected runtime loads the neutral provider and Ollama adapter.
2. Check that Ollama is running on the configured loopback endpoint and the
   selected model is already installed. Health never downloads a model.
3. In the approved later environment configuration, enable only the required
   adapter and choose an existing profile. Apply configuration deltas, not a
   copied framework service or a second provider registry.
4. Keep the configured endpoint loopback-only unless remote use has undergone
   the normal deployment security review. Do not assume local model execution
   grants access to all source code or business records.
5. Reload effective runtime configuration using the normal deployment lifecycle.
   Source edits alone do not prove the running server has reloaded them.

```js
module.exports = {
    copilot: {
        providers: {
            enabled: true,
            default: { adapter: 'ollama', profile: 'conversation' },
            adapters: { ollama: { enabled: true } }
        }
    }
};
```

Provider enablement is independent of `copilot.api.enabled`. The conversation
API still requires its opt-in and the current employee's route permissions.
No API exposure is activated merely by enabling a provider.

## Verify in Order

1. Call the adapter's `health(adapter, dependencies)` through a trusted operator
   context. `UP` means the configured model is listed. It is not an answer-quality
   test, permission check, or budget approval.
2. Invoke `DefaultCopilotProviderService.invoke(request, options)` using the
   effective provider configuration, a small output limit, and a harmless prompt.
3. Verify `provider`, `model`, answer content, finish reason, and token measurement.
   Standard Ollama chat must have an explicit terminal `done: true` response.
4. Invoke `invokeStream(request, listener, options)` with the same configuration.
   Intermediate chunks may have unknown usage; terminal usage supplies the
   measured totals when the server reports them.
5. Verify the authorized Axis conversation separately. Open AI & Copilot, then
   Copilot Conversation. The existing conversation route is `/assistant`.
6. Check that missing measurements display as `-` and actual zero remains `0`.
   Neither the placeholder nor measured tokens imply a monetary charge or a
   settled reservation. The UI does not calculate an Ollama price.

Both invocation methods receive `options.configuration` for the effective
`copilot.providers` object. Optional `options.adapter` and `options.profile`
are trusted service selections, not model-generated overrides. Adapter dependencies
such as `fetch` and `signal` are injectable for testing. Production handlers are
resolved from the normal loader-visible service registry.

## Usage Contract

```json
{
  "inputTokens": null,
  "outputTokens": null,
  "totalTokens": null,
  "state": "UNKNOWN"
}
```

The normalizer accepts non-negative safe integers, including zero. Missing,
negative, nonnumeric, fractional, and unsafe counts are unknown. A missing total
can be derived when both input and output are measured. The state becomes
`MEASURED` when all three counts are known. No reservation is released, balance
credited, or billing record created by this normalizer.

Axis independently validates supplied counts. Null or absent counts remain null;
invalid supplied values reject the event. Optional cached, reasoning, and embedding
counts stay unknown when the provider did not supply them.

## Failures and Recovery

| Condition | Result | Operator action |
| --- | --- | --- |
| Misspelled or missing profile | `COPILOT_PROVIDER_PROFILE_UNAVAILABLE`, no adapter call | Correct the trusted profile selector or define the intended profile. |
| Disabled provider/adapter | Preflight rejection | Check approved effective configuration; never activate another adapter silently. |
| Tools on an adapter without tool calling | `COPILOT_PROVIDER_TOOLS_UNSUPPORTED`, no transport | Use an actually supported governed path; do not merely change the capability flag. |
| Oversized request | `COPILOT_PROVIDER_REQUEST_LIMIT_EXCEEDED` | Reduce authorized context/output inputs within owning policy. |
| Cancellation before transport | Abort rejection, no fetch | Preserve the user cancellation; do not automatically retry. |
| Ollama body stalls | Configured deadline aborts body consumption | Check model/runtime health, then explicitly retry a read-only prompt if appropriate. |
| Stream ends without terminal completion | `COPILOT_OLLAMA_RESPONSE_INCOMPLETE` | Treat partial text as incomplete, not a final operation result. |
| Provider error event | Stable `COPILOT_OLLAMA_RESPONSE_ERROR` | Diagnose privately; raw provider error text is not returned as answer content. |
| Model not installed | Health `DEGRADED` | Select an approved installed model or separately authorize installation. |

Do not retry a business operation because a provider answer was interrupted.
An uncertain operation result must be reconciled with its canonical owner.
No automatic provider retry/fallback has been introduced by these changes.

## Customize and Extend Safely

To create a low-output profile, add only a configuration delta:

```js
module.exports = {
    copilot: { providers: {
        profiles: { concise: { temperature: 0, maximumOutputTokens: 128 } },
        default: { profile: 'concise' }
    } }
};
```

Keep provider selection in the neutral owner, transport in the adapter, data
authorization in policy, and mutations in domain APIs. Later service merging
may override a focused mapping method, but must retain preflight checks,
unknown usage, bounded transport, cancellation, and secret-safe diagnostics.
Never place reusable fixes in a customer kickoff hook. Never put secret values
into this configuration example or frontend properties.

## Regression Commands

From the backend repository:

```sh
npm test --workspace=nodics.copilot
```

This runs syntax and contract tests, not live external providers. The focused
neutral tests are under `copilotProvider/test/providerValidation.test.js`; local
transport tests are under `ollamaProvider/test/ollamaTransport.test.js`.

From Axis, run its assistant tests and `npm run typecheck`. Visual acceptance
must use a running, authenticated backend and published module-owned navigation;
component tests do not prove the deployed navigation has refreshed.
