# copilotProviders examples

Follow the `nCache/cache + provider adapters` pattern:

```text
copilotProviders
├── copilotProvider
├── mockProvider
└── ollamaProvider
```

Add future providers beside existing adapters. Never add a vendor conditional
to `copilotProvider` or a transport service to this group.
