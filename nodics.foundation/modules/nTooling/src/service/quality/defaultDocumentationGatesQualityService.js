/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const defaultProperties = require('../../../config/properties');
const documentationCoverage = require('./defaultDocumentationCoverageQualityService');
const documentationNavigation = require('./defaultDocumentationNavigationQualityService');

/**
 * @module nTooling/service/quality/defaultDocumentationGatesQualityService
 * @description Applies project-overridable documentation governance configuration to enforced and report-only coverage gates.
 * @layer tooling
 * @owner nTooling
 * @override Projects may override `tooling.documentationGovernance` through properties or supply an explicit `--governance` file for temporary external checks.
 */




let exportedService;
module.exports = exportedService = {
    /** Implements readOption as an overrideable service operation. */
    readOption: function (args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
},

    /** Implements resolveRootDir as an overrideable service operation. */
    resolveRootDir: function (args) {
    const configuredHome = (this.readOption || exportedService.readOption).call(this, args, '--home', process.env.NODICS_HOME || '');
    return configuredHome ? path.resolve(configuredHome) : process.cwd();
},

    /** Implements resolveGovernancePath as an overrideable service operation. */
    resolveGovernancePath: function (args, rootDir) {
    const configuredPath = (this.readOption || exportedService.readOption).call(this, args, '--governance', process.env.NODICS_DOCUMENTATION_GOVERNANCE || '');
    return configuredPath ? path.resolve(rootDir, configuredPath) : null;
},

    /** Implements loadGovernance as an overrideable service operation. */
    loadGovernance: function (args, rootDir) {
    const governancePath = (this.resolveGovernancePath || exportedService.resolveGovernancePath).call(this, args, rootDir);
    if (governancePath) {
        return {
            source: path.relative(rootDir, governancePath),
            governance: JSON.parse(fs.readFileSync(governancePath, 'utf8'))
        };
    }
    return {
        source: 'nodics.foundation/modules/nTooling/config/properties.js#tooling.documentationGovernance',
        governance: _.get(defaultProperties, 'tooling.documentationGovernance', {})
    };
},

    /** Implements toArgs as an overrideable service operation. */
    toArgs: function (gate, fail, rootDir) {
    const args = [
        '--home=' + rootDir,
        '--scope=' + (gate.scope || 'all'),
        '--limit=' + (gate.limit || 30)
    ];
    if (gate.module) {
        args.push('--module=' + gate.module);
    }
    if (gate.layer) {
        args.push('--layer=' + gate.layer);
    }
    if (gate.includeTests) {
        args.push('--include-tests');
    }
    if (fail) {
        args.push('--fail');
    }
    return args;
},

    /** Implements printGateHeader as an overrideable service operation. */
    printGateHeader: function (type, gate) {
    console.log('\n' + type + ': ' + gate.name);
    if (gate.description) {
        console.log(gate.description);
    }
},

    /** Implements runGate as an overrideable service operation. */
    runGate: function (type, gate, fail, rootDir) {
    (this.printGateHeader || exportedService.printGateHeader).call(this, type, gate);
    const options = documentationCoverage.createOptions((this.toArgs || exportedService.toArgs).call(this, gate, fail, rootDir));
    const report = documentationCoverage.collectCoverage(options);
    documentationCoverage.printReport(report, options.reportLimit);
    return documentationCoverage.hasMissingDocumentation(report);
},

    /** Implements run as an overrideable service operation. */
    run: function (args) {
    const rootDir = (this.resolveRootDir || exportedService.resolveRootDir).call(this, args || []);
    const governanceContext = (this.loadGovernance || exportedService.loadGovernance).call(this, args || [], rootDir);
    const governance = governanceContext.governance;
    const enforcedGates = governance.enforcedGates || [];
    const reportOnlyGates = governance.reportOnlyGates || [];
    let hasFailure = false;

    console.log('Nodics documentation governance');
    console.log('Governance source          : ' + governanceContext.source);

    enforcedGates.forEach(gate => {
        if ((this.runGate || exportedService.runGate).call(this, 'ENFORCED', gate, true, rootDir)) {
            hasFailure = true;
        }
    });

    reportOnlyGates.forEach(gate => {
        (this.runGate || exportedService.runGate).call(this, 'REPORT ONLY', gate, false, rootDir);
    });

    const navigationReport = documentationNavigation.collectNavigationReport(rootDir, governance.navigation || {});
    documentationNavigation.printReport(navigationReport);
    if (documentationNavigation.hasFailures(navigationReport)) {
        hasFailure = true;
    }

    if (hasFailure) {
        console.error('\nDocumentation governance failed. Fix the enforced gate regressions before building.');
        process.exitCode = 1;
    } else {
        console.log('\nDocumentation governance passed.');
    }
}
};

if (require.main === module) {
    exportedService.run(process.argv.slice(2));
}
