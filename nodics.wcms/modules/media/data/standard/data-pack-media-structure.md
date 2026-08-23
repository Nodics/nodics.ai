# Standard Data-Pack Media Structure

Media referenced by content, product, documentation, accelerator, import, export, or customer data must travel with the data release as a single importable unit.

Required package layout:

1. `manifest.json` declares business data sections and `mediaManifest` identity.
2. `media/artifacts/<artifactClass>/<ownerModule>/<ownerReference>/` stores physical files or package-safe payload descriptors.
3. `media/artifacts/index.json` maps business records to media codes, checksums, artifact classes, folder codes, and target usage.
4. `media/receipts/` stores target import and publication receipts after deployment.
5. `media/policy/non-publishable.json` declares excluded folders and extensions such as logs, temp files, build outputs, local generated artifacts, and import workspaces.

The import process must fail or remain pending when required media artifacts are missing, checksum mismatched, blocked by policy, or not approved for target usage.
