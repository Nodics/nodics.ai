/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * @module nTest/service/tooling/defaultTestSuiteReportRunnerService
 * @description Runs an arbitrary project test command, streams its output, extracts Nodics test metrics, and writes a structured report under the selected server module.
 * @layer tooling
 * @owner nTest
 * @override Projects may explicitly replace report parsing or command execution while retaining truthful exit status and output traceability.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());


let exportedService;
module.exports = exportedService = {
    /** Implements loadProjectDefaults as an overrideable service operation. */
    loadProjectDefaults: function () {
    let envPath = path.join(rootPath, 'env.js');
    if (!fs.existsSync(envPath)) {
        return {};
    }
    delete require.cache[require.resolve(envPath)];
    let projectEnv = require(envPath);
    return projectEnv && projectEnv.defaultOptions ? projectEnv.defaultOptions : {};
},

    /** Implements findModulePath as an overrideable service operation. */
    findModulePath: function (moduleName, currentPath) {
    if (!moduleName || !fs.existsSync(currentPath)) {
        return undefined;
    }
    let entries = fs.readdirSync(currentPath, { withFileTypes: true });
    let packagePath = path.join(currentPath, 'package.json');
    if (fs.existsSync(packagePath)) {
        let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (packageJson.name === moduleName) {
            return currentPath;
        }
    }
    for (let entry of entries) {
        if (!entry.isDirectory() || ['.git', 'node_modules', 'generated', 'temp'].includes(entry.name)) {
            continue;
        }
        let result = (this.findModulePath || exportedService.findModulePath).call(this, moduleName, path.join(currentPath, entry.name));
        if (result) {
            return result;
        }
    }
    return undefined;
},

    /** Implements resolveServerModulePath as an overrideable service operation. */
    resolveServerModulePath: function (serverName, environmentName) {
    let defaults = (this.loadProjectDefaults || exportedService.loadProjectDefaults).call(this, );
    let selectedServer = serverName || process.env.SERVER || process.env.S || defaults.defaultServer;
    let selectedEnvironment = environmentName || process.env.ENV || process.env.E || defaults.defaultEnvironment;
    if (!selectedServer) {
        throw new Error('A server must be selected with --server, SERVER, S, or defaultOptions.defaultServer');
    }
    if (!selectedEnvironment) {
        throw new Error('An environment must be selected with --environment, ENV, E, or defaultOptions.defaultEnvironment');
    }
    let environmentPath = (this.findModulePath || exportedService.findModulePath).call(this, selectedEnvironment, rootPath);
    if (!environmentPath) {
        throw new Error('Unable to resolve environment module: ' + selectedEnvironment);
    }
    let serverPath = (this.findModulePath || exportedService.findModulePath).call(this, selectedServer, environmentPath);
    if (!serverPath) {
        throw new Error('Unable to resolve server module: ' + selectedServer);
    }
    let packageJson = JSON.parse(fs.readFileSync(path.join(serverPath, 'package.json'), 'utf8'));
    if (!packageJson.nodics || packageJson.nodics.kind !== 'server') {
        throw new Error('Test report owner must be a server module: ' + selectedServer);
    }
    return serverPath;
},

    /** Implements resolveServerReportDir as an overrideable service operation. */
    resolveServerReportDir: function (serverName, environmentName) {
    return path.join((this.resolveServerModulePath || exportedService.resolveServerModulePath).call(this, serverName, environmentName), 'generated', 'test-reports');
},

    /** Implements assertServerOwnedReportDir as an overrideable service operation. */
    assertServerOwnedReportDir: function (reportDir, serverName, environmentName) {
    let serverPath = path.resolve((this.resolveServerModulePath || exportedService.resolveServerModulePath).call(this, serverName, environmentName));
    let resolvedReportDir = path.resolve(reportDir);
    if (resolvedReportDir.indexOf(serverPath + path.sep) !== 0) {
        throw new Error('Test reports must be written under the selected server module: ' + serverPath);
    }
    return resolvedReportDir;
},

    /** Implements runCli as an overrideable service operation. */
    runCli: function () {
    let args = (this.parseArgs || exportedService.parseArgs).call(this, process.argv.slice(2));
    if (!args.command.length) {
        console.error('Usage: npm run test:full:report -- --suite=<name> -- <command> [args...]');
        process.exit(1);
    }

    let startedAt = new Date();
    let output = '';
    let child = spawn(args.command[0], args.command.slice(1), {
        cwd: rootPath,
        env: Object.assign({}, process.env, {
            ENV: args.environmentName,
            SERVER: args.serverName
        }),
        shell: false
    });

    child.stdout.on('data', data => {
        let text = data.toString();
        output += text;
        process.stdout.write(text);
    });
    child.stderr.on('data', data => {
        let text = data.toString();
        output += text;
        process.stderr.write(text);
    });
    child.on('error', error => {
        output += error.stack || error.message;
    });
    child.on('close', code => {
        let endedAt = new Date();
        let report = (this.createReport || exportedService.createReport).call(this, {
            suiteName: args.suiteName,
            command: args.command,
            output: output,
            exitCode: code,
            startedAt: startedAt,
            endedAt: endedAt,
            env: Object.assign({}, process.env, {
                ENV: args.environmentName,
                SERVER: args.serverName
            })
        });
        let reportPath = (this.writeReport || exportedService.writeReport).call(this, report, args.reportDir);
        console.log('\nTest report:', path.relative(rootPath, reportPath));
        process.exit(code || 0);
    });
},

    /** Implements parseArgs as an overrideable service operation. */
    parseArgs: function (argv) {
    let separatorIndex = argv.indexOf('--');
    let optionArgs = separatorIndex >= 0 ? argv.slice(0, separatorIndex) : argv;
    let command = separatorIndex >= 0 ? argv.slice(separatorIndex + 1) : [];
    let suiteName = 'test';
    let reportDir;
    let serverName;
    let environmentName;

    optionArgs.forEach(arg => {
        if (arg.startsWith('--suite=')) {
            suiteName = arg.substring('--suite='.length);
        } else if (arg.startsWith('--server=')) {
            serverName = arg.substring('--server='.length);
        } else if (arg.startsWith('--environment=')) {
            environmentName = arg.substring('--environment='.length);
        } else if (arg.startsWith('--report-dir=')) {
            reportDir = path.resolve(rootPath, arg.substring('--report-dir='.length));
        }
    });

    let defaults = (this.loadProjectDefaults || exportedService.loadProjectDefaults).call(this, );
    serverName = serverName || process.env.SERVER || process.env.S || defaults.defaultServer;
    environmentName = environmentName || process.env.ENV || process.env.E || defaults.defaultEnvironment;
    reportDir = reportDir || process.env.NODICS_TEST_REPORT_DIR || (this.resolveServerReportDir || exportedService.resolveServerReportDir).call(this, serverName, environmentName);
    reportDir = (this.assertServerOwnedReportDir || exportedService.assertServerOwnedReportDir).call(this, reportDir, serverName, environmentName);

    return {
        suiteName: suiteName,
        environmentName: environmentName,
        serverName: serverName,
        reportDir: reportDir,
        command: command
    };
},

    /** Implements createReport as an overrideable service operation. */
    createReport: function (options) {
    let parsed = (this.parseOutput || exportedService.parseOutput).call(this, options.output || '', {
        fallbackModuleName: options.suiteName
    });
    return {
        reportType: 'nodics-test-suite',
        reportVersion: 1,
        suiteName: options.suiteName,
        status: options.exitCode === 0 ? 'PASSED' : 'FAILED',
        exitCode: options.exitCode,
        command: options.command,
        startedAt: options.startedAt.toISOString(),
        endedAt: options.endedAt.toISOString(),
        durationMs: options.endedAt.getTime() - options.startedAt.getTime(),
        environment: (this.createEnvironmentSummary || exportedService.createEnvironmentSummary).call(this, options.env || {}),
        summary: parsed.summary,
        topology: parsed.topology,
        modules: parsed.modules,
        suites: parsed.suites,
        tests: parsed.tests,
        failures: options.exitCode === 0 ? [] : parsed.failures
    };
},

    /** Implements parseOutput as an overrideable service operation. */
    parseOutput: function (output, options) {
    let lines = String(output || '').split(/\r?\n/);
    let suites = [];
    let tests = [];
    let modules = new Set();
    let topology = {
        mode: undefined,
        consolidated: [],
        modular: [],
        communication: []
    };
    let failures = [];

    lines.forEach(line => {
        let npmMatch = line.match(/^> nodics@[^ ]+ ([^ ]+)/);
        if (npmMatch) {
            suites.push({
                name: npmMatch[1],
                source: 'npm'
            });
        }

        let runningMatch = line.match(/^Running (.+\.test\.js)$/);
        if (runningMatch) {
            let testPath = runningMatch[1];
            tests.push({
                name: path.basename(testPath),
                path: testPath,
                moduleName: (this.inferModuleName || exportedService.inferModuleName).call(this, testPath),
                status: 'PASSED'
            });
            let moduleName = (this.inferModuleName || exportedService.inferModuleName).call(this, testPath);
            if (moduleName) {
                modules.add(moduleName);
            }
        }

        (this.collectCountTests || exportedService.collectCountTests).call(this, line, tests, modules);
        (this.collectTopology || exportedService.collectTopology).call(this, line, topology);

        if (/failed|error/i.test(line) && !/0 failed/i.test(line)) {
            failures.push(line);
        }
    });

    topology.communication.forEach(item => {
        let moduleName = (this.inferModuleNameFromUrl || exportedService.inferModuleNameFromUrl).call(this, item);
        tests.push({
            name: 'topology-communication',
            path: item,
            moduleName: moduleName,
            status: 'PASSED',
            aggregate: true
        });
        if (moduleName) {
            modules.add(moduleName);
        }
    });
    if (tests.length === 0 && suites.length > 0) {
        suites.forEach(suite => {
            let moduleName = (options && options.fallbackModuleName) || (this.inferModuleNameFromSuite || exportedService.inferModuleNameFromSuite).call(this, suite.name);
            tests.push({
                name: suite.name,
                path: undefined,
                moduleName: moduleName,
                status: 'PASSED',
                aggregate: true
            });
            if (moduleName) {
                modules.add(moduleName);
            }
        });
    }

    return {
        summary: {
            suiteCount: suites.length,
            testCount: tests.length,
            passedCount: tests.length,
            failedCount: 0,
            skippedCount: 0
        },
        topology: topology,
        modules: Array.from(modules).sort(),
        suites: suites,
        tests: tests,
        failures: failures
    };
},

    /** Implements collectCountTests as an overrideable service operation. */
    collectCountTests: function (line, tests, modules) {
    let generatedMatch = line.match(/^Generated tests passed(?:[^:]*): (\d+)/);
    if (generatedMatch) {
        (this.addAggregatedTests || exportedService.addAggregatedTests).call(this, tests, modules, 'generated', Number(generatedMatch[1]));
    }
    let routeMatch = line.match(/^Route contract tests passed: (\d+)/);
    if (routeMatch) {
        (this.addAggregatedTests || exportedService.addAggregatedTests).call(this, tests, modules, 'route-contract', Number(routeMatch[1]));
    }
    let capabilityMatch = line.match(/^Capability behavior tests passed(?:[^:]*): (\d+)/);
    if (capabilityMatch) {
        (this.addAggregatedTests || exportedService.addAggregatedTests).call(this, tests, modules, 'capability-behavior', Number(capabilityMatch[1]));
    }
},

    /** Implements addAggregatedTests as an overrideable service operation. */
    addAggregatedTests: function (tests, modules, name, count) {
    for (let index = 0; index < count; index++) {
        tests.push({
            name: name,
            path: undefined,
            moduleName: undefined,
            status: 'PASSED',
            aggregate: true
        });
    }
    modules.add(name);
},

    /** Implements collectTopology as an overrideable service operation. */
    collectTopology: function (line, topology) {
    let modeMatch = line.match(/^Mode: (.+)$/);
    if (modeMatch) {
        topology.mode = modeMatch[1];
    }
    let consolidatedMatch = line.match(/^Consolidated: (.+)$/);
    if (consolidatedMatch) {
        topology.consolidated = consolidatedMatch[1].split(',').map(item => item.trim()).filter(Boolean);
    }
    let modularMatch = line.match(/^Modular: (.+)$/);
    if (modularMatch) {
        topology.modular = modularMatch[1].split(',').map(item => item.trim()).filter(Boolean);
    }
    let communicationMatch = line.match(/^(?:Consolidated communication|Communication): (.+)$/);
    if (communicationMatch) {
        topology.communication = topology.communication.concat(
            communicationMatch[1].split(',').map(item => item.trim()).filter(Boolean)
        );
    }
},

    /** Implements createEnvironmentSummary as an overrideable service operation. */
    createEnvironmentSummary: function (env) {
    return {
        nodicsEnv: env.NODICS_ENV || null,
        server: env.SERVER || env.S || null,
        node: (this.getRuntimeNodeName || exportedService.getRuntimeNodeName).call(this, env) || null,
        tenant: env.NODICS_TEST_TENANT || null,
        enterprise: env.NODICS_TEST_ENTERPRISE || null,
        policyTenant: env.NODICS_TEST_POLICY_TENANT || env.NODICS_TEST_CONTROL_TENANT || null,
        topologyMode: env.NODICS_TOPOLOGY_MODE || null
    };
},

    /** Implements getRuntimeNodeName as an overrideable service operation. */
    getRuntimeNodeName: function (env) {
    if (env.NODICS_NODE) {
        return env.NODICS_NODE;
    }
    if (env.NODICS_TEST_NODE) {
        return env.NODICS_TEST_NODE;
    }
    if (env.NODE && !env.NODE.includes('/') && !env.NODE.includes('\\')) {
        return env.NODE;
    }
    return undefined;
},

    /** Implements inferModuleName as an overrideable service operation. */
    inferModuleName: function (testPath) {
    if (!testPath) {
        return undefined;
    }
    let parts = testPath.split(/[\\/]/);
    let testIndex = parts.indexOf('test');
    if (testIndex > 0) {
        return parts[testIndex - 1];
    }
    return undefined;
},

    /** Implements inferModuleNameFromUrl as an overrideable service operation. */
    inferModuleNameFromUrl: function (value) {
    let match = String(value || '').match(/\/nodics\/([^/]+)\//);
    return match ? match[1] : undefined;
},

    /** Implements inferModuleNameFromSuite as an overrideable service operation. */
    inferModuleNameFromSuite: function (suiteName) {
    let value = String(suiteName || '');
    let match = value.match(/^test:([^:\s]+)/);
    return match ? match[1] : undefined;
},

    /** Implements writeReport as an overrideable service operation. */
    writeReport: function (report, reportDir) {
    fs.mkdirSync(reportDir, { recursive: true });
    let safeSuiteName = String(report.suiteName || 'test').replace(/[^a-zA-Z0-9_-]/g, '_');
    let fileName = safeSuiteName + '-' + report.startedAt.replace(/[:.]/g, '-') + '.json';
    let reportPath = path.join(reportDir, fileName);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 4));
    return reportPath;
}
};

if (require.main === module) {
    exportedService.runCli();
}
