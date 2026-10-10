# Purpose-Bound Secret Protection

`DefaultSecretProtectionService` supplies encryption only. It does not store
secrets, generate credentials, expose routes, grant access or determine ownership.
The capability caller must authorize the original principal and use the existing
private request/response capture boundary before retaining or revealing values.

Layered `secretProtection.purposes.<PURPOSE>` selects `activeKeyId` and a `keys`
map. Each key entry provides `encryptionKey`: a real 32-byte hexadecimal secret
from deployment-owned secret input, never a source literal, readiness flag,
bootstrap credential or runtime-configuration encryption key. Missing, malformed
or constant-byte keys and unqualified capture controls refuse without diagnostics.
Configuration is resolved for the exact tenant, so later tenant/module overrides
retain their normal authority. Production keys require the deployment secret owner.

`assertReady({tenant,purpose})` returns true only after checking actual key input
and the logger's private-capture qualification. `protect({tenant,purpose,binding,
value})` uses AES-256-GCM, a fresh 12-byte nonce and a 16-byte authentication tag.
Its strict envelope is `{contractVersion:1,keyId,iv,tag,ciphertext}` with hex bytes.
Canonical authenticated data includes key identity, tenant, purpose and complete bounded
JSON binding. Changing any binding or ciphertext refuses decryption. The owner
must bind immutable record identities and intent, not mutable redemption state.

`unprotect({tenant,purpose,binding,envelope})` returns plaintext only to the
authorized private caller. It selects the retained purpose key by envelope key ID.
Rotation adds a new key ID and changes the active ID; old keys must remain until
all retained envelopes have been migrated or retired through their capability
owner. No automatic rotation, alternate-key guessing or plaintext fallback exists.

Generic reads/exports must not expose ciphertext or private issuance evidence.
Those policies belong to the storing capability, not this cryptographic primitive.
Errors contain no key, plaintext, binding or provider diagnostics. JavaScript
strings cannot promise memory zeroization; this service clears temporary key
buffers but does not claim hardened process-memory isolation.
