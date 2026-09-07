# Profile Address Adoption Follow-Up

## Recorded Action

Review Location Address needs against the existing Profile Address schema before introducing any separate address schema. Properties that are relevant to customers, employees, enterprises, stores, POS, sale channels, or collection centres should move into the shared Profile Address authority instead of being duplicated in a Location-specific address model.

## Migration Target

- Keep reusable address fields in Profile Address.
- Keep geospatial semantics such as latitude, longitude, place type, map provider metadata, radius, geofence, and route visibility in Location.
- Store latitude and longitude as separate numeric properties in Location-owned records when coordinates are needed.
- Avoid comma-separated coordinate strings in schemas and data packs.
- Keep provider coordinate arrays, such as GeoJSON or map SDK `[longitude, latitude]`, inside Location Map adapter/output boundaries only.
- Update store, sale channel, POS, and collection centre references to use shared address records plus role-aware enterprise associations.

## Status

Implemented as a schema guard. Profile Address owns reusable address fields, and Location schema tests now reject a duplicate `locationAddress` schema while keeping geospatial concerns in Location.
