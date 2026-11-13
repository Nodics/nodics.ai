# Release Descriptor Example

An undeclared conventional folder containing only empty subdirectories is not a
release. Add intentional owner headers and records before relying on discovery.
A `release.descriptor.json` declares source intent; placing only that file in an
otherwise empty folder keeps normal invalid-release evidence. Explicitly declared
manifest sections must also retain valid files. Never repair either case by
replaying an installed release or editing its receipt.

Use `release.descriptor.json` only when nImport cannot derive a business-friendly capability name, grouping, or outcome from the owning module and release manifest. The descriptor is source-side metadata. It is not imported, not checksummed as payload, and must not contain secrets, environment values, runtime URLs, or operator credentials.

For an aggregate `data/manifest.json`, place the descriptor beside the versioned release root:

```text
data/sample-v001/release.descriptor.json
```

Then map each aggregate section that needs business readiness metadata:

```json
{
  "sections": {
    "commerce": {
      "capability": {
        "code": "circa.ewaste",
        "displayName": "Circa eWaste",
        "type": "ACCELERATOR",
        "group": "PROJECT_ACCELERATOR",
        "extendsCapability": "ewaste",
        "businessOutcome": "Prepare Circa circular assets, offers, pricing, and storefront records."
      }
    }
  }
}
```

For a non-aggregate release folder, place the same file directly inside that release folder and use top-level `capability`.

Allowed capability fields are `code`, `displayName`, `type`, `group`, `extendsCapability`, and `businessOutcome`. Keep project-specific outcomes in the owning project/accelerator release descriptor; keep generic projection, validation, and Axis presentation in framework modules.
