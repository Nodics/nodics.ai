# discoveryQuery Contracts

`discoveryQuery` owns provider-neutral query option construction from governed query profiles.


## Ownership evidence

The package declares `sourceOnly`: its bounded query/options builders are local
source helpers without callable endpoints or persisted authority. Any future
callable/schema claim contradicts this declaration and must reject admission.
