# Store

Store, Sales Channel and Point of Service delegate technical `revision` counters
to generated nDatabase CRUD. Core data files omit the counter. Edits retain the
original read token; no-op saves leave it unchanged. This does not change domain
or publication versions. See the Foundation Data Modeling documentation for
project customization and conflict recovery.

Store is its named Commerce capability boundary. Reusable contracts and behavior belong to this named capability boundary. Archived gComm is reference-only.

Points of service may be online or physical. The `locationRef` association is
optional for general records, so Commerce activation does not depend on Location.
Physical-place operations must validate a real reference when they need one.
Projects can strengthen the property through an existing later-loaded schema
overlay; their activation data must satisfy that effective schema.

Run `node --test nodics.commerce/modules/baseCommerce/modules/store/test/coreReferenceLocationContract.test.js`
from the framework root. See the local Store contract and the Base Commerce
documentation for customization and recovery.
