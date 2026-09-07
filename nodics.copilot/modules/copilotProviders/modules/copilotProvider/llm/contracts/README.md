# copilotProvider contracts

`DefaultCopilotProviderService` is the canonical model-provider entrypoint.
Layered properties select adapters by handler metadata. Adapter names must not
appear in provider-neutral branching logic. Disabled providers are not probed;
credential requirements come from adapter metadata and fail closed.
