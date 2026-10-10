# Content-Pack Header Layout

A selected pack, or its explicit composition, supplies directly discoverable
headers alongside records and assets:

```text
data/docs-v001/
  headers/partnerDocumentationHeader.js
  records/documentation/partnerDocumentationPageData.js
  assets/documentation/guide.png
```

Declare those exact bytes in the owning generated manifest. A child pack can
reuse an explicitly included foundation header; the complete composition must
contain a discoverable header. Do not place it under `headers/documentation/`:
the existing local initializer does not recurse into header directories.
Staging rejects that layout before dispatch and removes incomplete staging.
Correct an already imported pack with a new immutable version and normal import,
then inspect actual owning records before requesting CMS/Media approvals. A
historical completion receipt alone does not prove that ignored records exist.
