/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/generation/defaultStructureGeneratorService
 * @description Generates contract-driven Nodics project, group, capability, environment, server, and node scaffolds from the canonical structure matrix.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace or wrap generation methods through the standard service merge path while preserving structure-audit compatibility.
 */

const copyrightHeader = `/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
`;

const runtimeFlags = {
    router: false,
    publish: false,
    web: false
};

const rootFiles = [
    'package.json',
    'nodics.js',
    'AGENTS.md',
    'README.md'
];

const configFiles = [
    'config/properties.js',
    'config/prescripts.js',
    'config/postscripts.js'
];

const guidanceFiles = [
    'llm/contracts/README.md',
    'llm/examples/README.md'
];

const registryFiles = {
    'src/event/listeners.js': 'Event listener registry for this boundary.',
    'src/pipelines/pipelines.js': 'Pipeline definition registry for this boundary.',
    'src/router/routers.js': 'Router definition registry for this boundary.',
    'src/router/appConfig.js': 'Router application configuration registry for this boundary.',
    'src/schemas/schemas.js': 'Schema definition registry for this boundary.',
    'src/search/indexes.js': 'Search index definition registry for this boundary.',
    'src/interceptors/interceptors.js': 'Interceptor definition registry for this boundary.',
    'src/utils/utils.js': 'Utility function registry for this boundary.',
    'src/utils/enums.js': 'Enum definition registry for this boundary.',
    'src/utils/statusDefinitions.js': 'Status and error definition registry for this boundary.'
};

const registryOwnership = {
    'src/event/listeners.js': 'event',
    'src/pipelines/pipelines.js': 'pipeline',
    'src/router/routers.js': 'router',
    'src/router/appConfig.js': 'router',
    'src/schemas/schemas.js': 'schema',
    'src/search/indexes.js': 'search',
    'src/interceptors/interceptors.js': 'interceptor',
    'src/utils/utils.js': 'utility',
    'src/utils/enums.js': 'utility',
    'src/utils/statusDefinitions.js': 'utility'
};

const sourceOwns = [
    'event',
    'pipeline',
    'router',
    'schema',
    'search',
    'interceptor',
    'service',
    'utility'
];

const defaultOwnsByKind = {
    project: ['composition', 'configuration', 'llm'],
    group: ['composition', 'configuration', 'llm'],
    capability: ['configuration'].concat(sourceOwns, ['test', 'llm']),
    provider: ['configuration', 'service', 'test', 'llm'],
    environment: ['composition', 'configuration', 'data', 'llm'],
    server: ['composition', 'configuration', 'router', 'service', 'pipeline', 'utility', 'test', 'llm'],
    node: ['configuration', 'router', 'service', 'pipeline', 'interceptor', 'utility', 'test', 'llm']
};

const nodicsKindByGenerationKind = {
    project: 'project',
    group: 'group',
    capability: 'capability',
    provider: 'capability',
    environment: 'group',
    server: 'server',
    node: 'node'
};


/**
 * Creates the aggregate data-pack manifest required by every generated data boundary.
 * @param {string} moduleName Generated module identity.
 * @returns {string} Serialized empty manifest ready for future release sections.
 */


let exportedService;
module.exports = exportedService = {
    /** Implements readOption as an overrideable service operation. */
    readOption: function (args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
},

    /** Implements toPosix as an overrideable service operation. */
    toPosix: function (filePath) {
    return filePath.split(path.sep).join('/');
},

    /** Implements ensureDirectory as an overrideable service operation. */
    ensureDirectory: function (directory) {
    fs.mkdirSync(directory, { recursive: true });
},

    /** Implements writeFile as an overrideable service operation. */
    writeFile: function (filePath, content) {
    (this.ensureDirectory || exportedService.ensureDirectory).call(this, path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
},

    /** Implements blankObjectFile as an overrideable service operation. */
    blankObjectFile: function (modulePath, description) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + modulePath + '\n' +
        ' * @description ' + description + '\n' +
        ' * @layer definition\n' +
        ' * @owner generated\n' +
        ' * @override Later active modules may extend or replace this registry through Nodics layering.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '\n' +
        '};\n';
},

    /** Implements lifecycleFile as an overrideable service operation. */
    lifecycleFile: function (moduleName, layer) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + moduleName + '/' + layer + '\n' +
        ' * @description Defines generated ' + layer + ' startup extension declarations for ' + moduleName + '.\n' +
        ' * @layer config\n' +
        ' * @owner generated\n' +
        ' * @override Later active modules may override these declarations through configuration layering.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '\n' +
        '};\n';
},

    /** Implements propertiesFile as an overrideable service operation. */
    propertiesFile: function (moduleName) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + moduleName + '/config/properties\n' +
        ' * @description Defines generated configurable defaults for ' + moduleName + '.\n' +
        ' * @layer config\n' +
        ' * @owner generated\n' +
        ' * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '\n' +
        '};\n';
},

    /** Implements dataManifest as an overrideable service operation. */
    dataManifest: function (moduleName) {
    return JSON.stringify({
        contractVersion: 0,
        module: moduleName,
        sections: {}
    }, null, 4) + '\n';
},

    /** Implements nodicsFile as an overrideable service operation. */
    nodicsFile: function (moduleName) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + moduleName + '\n' +
        ' * @description Generated Nodics lifecycle entrypoint for ' + moduleName + '.\n' +
        ' * @layer module\n' +
        ' * @owner generated\n' +
        ' * @override Later active modules may override lifecycle behavior without modifying this generated boundary.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '    /**\n' +
        '     * Initializes this module boundary.\n' +
        '     * @param {Object} options Startup options.\n' +
        '     * @returns {Promise<boolean>} Resolves when initialization completes.\n' +
        '     */\n' +
        '    init: function (options) {\n' +
        '        return Promise.resolve(true);\n' +
        '    },\n' +
        '\n' +
        '    /**\n' +
        '     * Finalizes this module boundary.\n' +
        '     * @param {Object} options Startup options.\n' +
        '     * @returns {Promise<boolean>} Resolves when post-initialization completes.\n' +
        '     */\n' +
        '    postInit: function (options) {\n' +
        '        return Promise.resolve(true);\n' +
        '    }\n' +
        '};\n';
},

    /** Implements defaultSampleService as an overrideable service operation. */
    defaultSampleService: function (moduleName) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + moduleName + '/src/service/defaultSampleService\n' +
        ' * @description Empty module-creation placeholder that demonstrates the service lifecycle shape until concrete services are added.\n' +
        ' * @layer service\n' +
        ' * @owner generated\n' +
        ' * @override Later active modules may override these methods through the standard service merge path.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '    /**\n' +
        '     * Initializes the empty sample placeholder.\n' +
        '     * @param {Object} options Startup options.\n' +
        '     * @returns {Promise<boolean>} Resolves when initialization completes.\n' +
        '     */\n' +
        '    init: function (options) {\n' +
        '        return Promise.resolve(true);\n' +
        '    },\n' +
        '\n' +
        '    /**\n' +
        '     * Finalizes the empty sample placeholder.\n' +
        '     * @param {Object} options Startup options.\n' +
        '     * @returns {Promise<boolean>} Resolves when post-initialization completes.\n' +
        '     */\n' +
        '    postInit: function (options) {\n' +
        '        return Promise.resolve(true);\n' +
        '    }\n' +
        '};\n';
},

    /** Implements readme as an overrideable service operation. */
    readme: function (title, description) {
    return '# ' + title + '\n\n' + description + '\n';
},

    /** Implements agentsReadme as an overrideable service operation. */
    agentsReadme: function (moduleName, kind) {
    return [
        '# ' + moduleName + ' Agents',
        '',
        'Follow the root Nodics AI agent contract before changing this boundary:',
        '',
        '- root `README.md` explains the human/documentation route.',
        '- root `AGENTS.md` governs repository-wide AI and contributor behavior.',
        '- Read every applicable ancestor `AGENTS.md` from root to this module before editing.',
        '- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.',
        '',
        'This generated ' + kind + ' boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.',
        '',
        'Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.',
        ''
    ].join('\n');
},

    /** Implements moduleReadme as an overrideable service operation. */
    moduleReadme: function (moduleName, kind, description) {
    return [
        '# ' + moduleName,
        '',
        description || 'Generated Nodics ' + kind + ' boundary.',
        '',
        'Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.',
        '',
        'For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.',
        ''
    ].join('\n');
},

    /** Implements parseList as an overrideable service operation. */
    parseList: function (value, defaultValue) {
    if (!value) {
        return defaultValue;
    }
    return value.split(',').map(item => item.trim()).filter(Boolean);
},

    /**
     * Parses command-line arguments into generator options.
     * @param {string[]} args Command arguments.
     * @returns {Object} Generator options.
     */
    createOptions: function (args) {
        const kind = (this.readOption || exportedService.readOption).call(this, args, '--kind', 'capability');
        const name = (this.readOption || exportedService.readOption).call(this, args, '--name', '');
        const targetPath = (this.readOption || exportedService.readOption).call(this, args, '--path', name);
        return {
            kind: kind,
            name: name,
            targetPath: targetPath ? path.resolve(process.cwd(), targetPath) : '',
            index: (this.readOption || exportedService.readOption).call(this, args, '--index', ''),
            groupName: (this.readOption || exportedService.readOption).call(this, args, '--groupName', ''),
            description: (this.readOption || exportedService.readOption).call(this, args, '--description', ''),
            owns: (this.parseList || exportedService.parseList).call(this, this.readOption(args, '--owns', ''), defaultOwnsByKind[kind] || defaultOwnsByKind.capability),
            withSource: !args.includes('--no-src') && ['capability', 'provider', 'server', 'node'].includes(kind),
            withData: args.includes('--with-data') || ['environment'].includes(kind),
            withTest: !args.includes('--no-test') && ['capability', 'provider', 'server', 'node'].includes(kind)
        };
    },

    /**
     * Validates generator options before writing files.
     * @param {Object} options Generator options.
     * @returns {boolean} True when options are valid.
     */
    validateOptions: function (options) {
        const namePattern = options.kind === 'group' ?
            /^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*$/ :
            /^[A-Za-z][A-Za-z0-9]*$/;
        if (!options.name || !namePattern.test(options.name)) {
            throw new Error('A valid --name=<RuntimeName> is required.');
        }
        if (!nodicsKindByGenerationKind[options.kind]) {
            throw new Error('Unsupported --kind=' + options.kind);
        }
        if (!options.targetPath) {
            throw new Error('A target --path=<directory> is required.');
        }
        if (!/^\d+(?:\.\d+)+$/.test(options.index || '')) {
            throw new Error('A unique ordered --index=<number.number> is required.');
        }
        if (fs.existsSync(path.join(options.targetPath, 'package.json')) ||
            fs.existsSync(path.join(options.targetPath, 'nodics.js'))) {
            throw new Error('Target path already exists: ' + options.targetPath);
        }
        if (fs.existsSync(options.targetPath) && fs.readdirSync(options.targetPath).length > 0) {
            throw new Error('Target path is not empty: ' + options.targetPath);
        }
        if (options.kind === 'project' && !options.groupName) {
            throw new Error('Project generation requires --groupName=<companyOrProjectGroup>.');
        }
        return true;
    },

    /**
     * Builds package metadata for a generated boundary.
     * @param {Object} options Generator options.
     * @returns {Object} package.json content.
     */
    createPackageJson: function (options) {
        const packageJson = {
            name: options.name,
            index: options.index,
            description: options.description || 'Generated Nodics ' + options.kind + ' boundary.',
            main: 'nodics.js',
            version: '0.0.0',
            private: true,
            license: 'SEE LICENSE IN LICENSE',
            nodics: {
                kind: nodicsKindByGenerationKind[options.kind],
                displayName: options.displayName || options.name
                    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
                    .replace(/[-_]+/g, ' ')
                    .replace(/\b\w/g, character => character.toUpperCase()),
                runtimeModule: true,
                loadableByNodicsModuleLoader: true,
                owns: options.owns,
                runtime: Object.assign({}, runtimeFlags)
            },
            scripts: {}
        };
        if (options.kind === 'project') {
            packageJson.groupName = options.groupName;
        }
        return packageJson;
    },

    /**
     * Writes standard root, configuration, LLM, source, data, and test files.
     * @param {Object} options Generator options.
     * @returns {Object} Generation summary.
     */
    generate: function (options) {
        (this.validateOptions || exportedService.validateOptions).call(this, options);
        (this.ensureDirectory || exportedService.ensureDirectory).call(this, options.targetPath);
        (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, 'package.json'), JSON.stringify(this.createPackageJson(options), null, 4) + '\n');
        (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, 'nodics.js'), this.nodicsFile(options.name));
        (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, 'AGENTS.md'), this.agentsReadme(options.name, options.kind));
        (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, 'README.md'), this.moduleReadme(options.name, options.kind, options.description));
        configFiles.forEach(relativePath => {
            const content = relativePath.endsWith('properties.js') ?
                (this.propertiesFile || exportedService.propertiesFile).call(this, options.name) :
                (this.lifecycleFile || exportedService.lifecycleFile).call(this, options.name, relativePath.replace('.js', ''));
            (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, relativePath), content);
        });
        guidanceFiles.forEach(relativePath => {
            (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, relativePath),
                (this.readme || exportedService.readme).call(this, options.name + ' ' + path.basename(path.dirname(relativePath)), 'Generated documentation entry for ' + options.name + '.'));
        });
        (this.ensureDirectory || exportedService.ensureDirectory).call(this, path.join(options.targetPath, 'llm/generated'));
        if (options.kind === 'project') {
            (this.ensureDirectory || exportedService.ensureDirectory).call(this, path.join(options.targetPath, 'modules'));
            (this.ensureDirectory || exportedService.ensureDirectory).call(this, path.join(options.targetPath, 'envs'));
        }
        if (options.withSource) {
            const owns = new Set(options.owns);
            Object.keys(registryFiles).forEach(relativePath => {
                if (!owns.has(registryOwnership[relativePath])) {
                    return;
                }
                (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, relativePath),
                    (this.blankObjectFile || exportedService.blankObjectFile).call(this, options.name + '/' + this.toPosix(relativePath).replace(/\.js$/, ''), registryFiles[relativePath]));
            });
            if (owns.has('service')) {
                (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, 'src/service/defaultSampleService.js'), this.defaultSampleService(options.name));
            }
        }
        if (options.withData) {
            (this.ensureDirectory || exportedService.ensureDirectory).call(this, path.join(options.targetPath, 'data/init'));
            (this.ensureDirectory || exportedService.ensureDirectory).call(this, path.join(options.targetPath, 'data/core'));
            (this.ensureDirectory || exportedService.ensureDirectory).call(this, path.join(options.targetPath, 'data/sample'));
            (this.writeFile || exportedService.writeFile).call(this, path.join(options.targetPath, 'data/manifest.json'), this.dataManifest(options.name));
        }
        if (options.withTest) {
            (this.ensureDirectory || exportedService.ensureDirectory).call(this, path.join(options.targetPath, 'test'));
        }
        return {
            name: options.name,
            kind: options.kind,
            path: options.targetPath,
            files: rootFiles.concat(configFiles, guidanceFiles)
        };
    },

    /**
     * Runs the generator from command-line arguments.
     * @param {string[]} args Command arguments.
     * @returns {void}
     */
    runCli: function (args) {
        const options = (this.createOptions || exportedService.createOptions).call(this, args || []);
        const result = (this.generate || exportedService.generate).call(this, options);
        console.log('Generated Nodics ' + result.kind + ' boundary: ' + result.name);
        console.log('Path: ' + result.path);
    }
};

if (require.main === module) {
    exportedService.runCli(process.argv.slice(2));
}
