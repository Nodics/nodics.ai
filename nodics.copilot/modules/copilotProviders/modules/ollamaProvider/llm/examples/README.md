# ollamaProvider examples

Use `conversation` for normal answers and `structuredTool` for JSON planning.
Model and generation overrides are configuration deltas:

```js
module.exports = {
    copilot: { providers: {
        default: { adapter: 'ollama', profile: 'structuredTool' },
        adapters: { ollama: {
            enabled: true,
            model: { name: 'qwen2.5-coder:7b', contextWindow: 4096 },
            generation: { temperature: 0, seed: 42 }
        } }
    } }
};
```
