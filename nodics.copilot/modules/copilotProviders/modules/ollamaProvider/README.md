# ollamaProvider

Local Ollama model provider adapter for Nodics Copilot.

This optional adapter maps the provider-neutral Copilot contract to Ollama. It
owns no prompts, tools, conversations, business policy, or provider selection.
It is disabled in framework defaults and permits loopback endpoints only unless
a later environment explicitly enables remote access.

Activate it in a local environment `config/properties.js` contribution:

```js
module.exports = {
    copilot: {
        providers: {
            enabled: true,
            default: { adapter: 'ollama', profile: 'conversation' },
            adapters: {
                ollama: {
                    enabled: true,
                    model: { name: 'qwen2.5-coder:7b' }
                }
            }
        }
    }
};
```

Switching to another provider changes `copilot.providers.default.adapter` and
activates that adapter's configuration. Copilot call sites remain unchanged.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
