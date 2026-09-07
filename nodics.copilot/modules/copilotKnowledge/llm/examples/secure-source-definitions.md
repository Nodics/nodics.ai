# Secure Source Definition Examples

Public content must be explicitly published and Online:

```js
{
    code: 'nodics-public-docs',
    repository: 'nodics.docs',
    project: 'nodics',
    module: 'nodics.docs',
    owner: 'nodics.docs',
    version: 'reviewed-commit-or-release',
    sourceType: 'PUBLISHED_DOCUMENTATION',
    classification: 'PUBLIC',
    paths: ['data/online'],
    public: true,
    lifecycle: 'ONLINE',
    allowedChannels: ['NEXUS_PUBLIC', 'NEXUS_CUSTOMER', 'AXIS_EMPLOYEE'],
    secretScanPolicy: 'REQUIRED',
    enabled: true
}
```

Engineering contracts are restricted:

```js
{
    code: 'nodics-agent-contracts',
    repository: 'nodics.ai',
    project: 'nodics',
    module: 'nodics.copilot',
    owner: 'nodics.copilot',
    version: 'reviewed-commit-or-release',
    sourceType: 'AGENTS_CONTRACT',
    classification: 'RESTRICTED',
    paths: ['AGENTS.md', '**/AGENTS.md'],
    excludedPaths: ['**/llm/generated'],
    allowedExtensions: ['.md'],
    limits: {
        maximumFiles: 500,
        maximumFileBytes: 524288,
        maximumSourceBytes: 8388608
    },
    allowedChannels: ['AXIS_EMPLOYEE'],
    requiredPermissions: ['copilot.knowledge.restricted.read'],
    secretScanPolicy: 'REQUIRED',
    enabled: true
}
```

Customer projects require explicit isolation:

```js
{
    code: 'acme-project-docs',
    repository: 'acme.backend',
    project: 'acme',
    module: 'acme.platform',
    owner: 'acme.platform',
    version: 'reviewed-commit-or-release',
    sourceType: 'CUSTOMER_PROJECT',
    classification: 'CUSTOMER',
    paths: ['README.md', 'docs'],
    allowedChannels: ['NEXUS_CUSTOMER', 'AXIS_EMPLOYEE'],
    tenantScopes: ['acmeTenant'],
    customerProjectScopes: ['acme'],
    secretScanPolicy: 'REQUIRED',
    enabled: true
}
```
