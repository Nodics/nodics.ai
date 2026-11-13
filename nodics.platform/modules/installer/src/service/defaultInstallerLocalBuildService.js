/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */


'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createHash } = require('node:crypto');
const configOwner = require('./defaultInstallerConfigurationService');
const permissions = require('./defaultInstallerPermissionService');
const boundary = require('./defaultInstallerWorkspaceBoundaryService');
const response = require('./defaultInstallerResponseService');

const idPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;







/** @module installer/service/defaultInstallerLocalBuildService @description Governs one reversible nTooling generation in a private Local runtime directory. @layer service @owner installer */
module.exports = {
    /** Hashes source bytes or a serialized review identity. */
    digest: function (value) { return createHash('sha256').update(value).digest('hex'); },

    /** Creates a bounded typed Builder error. */
    error: function (code) { return Object.assign(new Error(code), { code }); },

    /** Rejects a conflicting or unconfirmed Builder operation. */
    reject: function () { throw this.error('INSTALLER_BUILD_CONFLICT'); },

    /** Rejects an invalid Builder request. */
    invalid: function () { throw this.error('INSTALLER_BUILD_INVALID'); },

    /** Returns the current audit timestamp in ISO format. */
    time: function () { return new Date().toISOString(); },

    /** Inspects a filesystem entry without following symlinks. */
    stat: function (file) { return fs.lstatSync(file, { throwIfNoEntry: false }); },

    /** Reads explicit runtime selection. The generated root is never caller-controlled. */
    selection: function () {
        const config = configOwner.getApplicationBuilderConfig();
        const selected = config.buildExecution;
        if (!config.enabled || !config.apiOperationsEnabled || selected?.enabled !== true ||
            typeof selected.experienceRoot !== 'string' || !path.isAbsolute(selected.experienceRoot) ||
            typeof selected.frontendCode !== 'string' || !Array.isArray(selected.allowedPresets) ||
            !selected.allowedPresets.length) throw this.error('INSTALLER_API_DISABLED');
        return selected;
    },

    /** Declares only the workflow qualified by the current permission and runtime selection. */
    available: function (request) {
        try {
            this.selection();
            permissions.assertPermission(request, 'installer.workspace.build');
            return true;
        } catch { return false; }
    },

    /** Resolves trusted source coordinates, without loading any customer executable modules. */
    source: function (selected) {
        const customer = fs.realpathSync(NODICS.getCustomHome());
        const framework = path.dirname(fs.realpathSync(NODICS.getNodicsHome()));
        const experience = fs.realpathSync(selected.experienceRoot);
        const root = path.join(framework, 'nodics.foundation/modules/nTooling/src/service/applicationBuilder');
        const load = (name) => require(path.join(root, 'defaultApplicationBuilder' + name + 'Service.js'));
        return { customer, framework, experience, catalogueOwner: load('Catalogue'), guided: load('Guided'),
            planner: load('Planning'), generator: load('Generation') };
    },

    /** Keeps receipt and artifacts under a private directory of the selected runtime. */
    receiptRoot: function () {
        const server = fs.realpathSync(NODICS.getServerPath());
        const root = path.join(fs.realpathSync(os.tmpdir()),
            'nodics-installer-build-' + this.digest(server).slice(0, 24));
        try { fs.mkdirSync(root, { mode: 0o700 }); }
        catch (cause) { if (cause.code !== 'EEXIST') throw cause; }
        const info = this.stat(root);
        if (!info?.isDirectory() || (info.mode & 0o077) !== 0 || info.uid !== process.getuid()) this.reject();
        return root;
    },

    /** Rejects unrecognized selectors; owner claims are never accepted as input. */
    input: function (request, command) {
        const body = request.payload || request.body || {};
        const extras = command === 'prepare'
            ? ['workspaceRoot', 'applicationName', 'accelerator', 'environment']
            : command === 'read' ? [] : ['reviewDigest', 'confirmed'];
        if (!body || typeof body !== 'object' || Array.isArray(body) ||
            Object.keys(body).some(key => !['runId', ...extras].includes(key)) ||
            typeof body.runId !== 'string' || !idPattern.test(body.runId)) this.invalid();
        if (command === 'prepare' && (
            typeof body.workspaceRoot !== 'string' || body.workspaceRoot.length > 4096 ||
            typeof body.applicationName !== 'string' || !/^[a-z][a-z0-9.-]{1,79}$/.test(body.applicationName) ||
            typeof body.accelerator !== 'string' || body.environment !== 'local')) this.invalid();
        if (['generate', 'rollback'].includes(command) &&
            (body.confirmed !== true || !/^sha256:[a-f0-9]{64}$/.test(body.reviewDigest || ''))) this.invalid();
        return body;
    },

    /** Stores a low-disclosure actor binding; bearer credentials are never retained. */
    actor: function (request) {
        const auth = request.authData;
        const values = [auth.tenant, auth.entCode || auth.enterpriseCode, auth.loginId];
        if (values.some(value => typeof value !== 'string' || !value.trim() || value.length > 256)) this.invalid();
        return this.digest(JSON.stringify(values));
    },

    /** Reads the bounded durable receipt without following a caller-controlled path. */
    read: function (run, actor) {
        const folder = this.stat(run);
        if (!folder) throw this.error('INSTALLER_BUILD_NOT_FOUND');
        if (!folder.isDirectory() || (folder.mode & 0o077) !== 0 || folder.uid !== process.getuid()) this.reject();
        const file = path.join(run, 'receipt.json');
        const info = this.stat(file);
        if (!info?.isFile() || info.nlink !== 1 || info.size > 2 * 1024 * 1024) this.reject();
        const receipt = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (receipt.actor !== actor || receipt.runId !== path.basename(run)) throw this.error('INSTALLER_BUILD_NOT_FOUND');
        return receipt;
    },

    /** Atomically advances the single owner receipt; the command lock excludes competing transitions. */
    write: function (run, receipt, state) {
        receipt.state = state;
        receipt.audit.push({ state, at: this.time() });
        const tmp = path.join(run, 'receipt.next');
        const fd = fs.openSync(tmp, 'wx', 0o600);
        try {
            fs.writeFileSync(fd, JSON.stringify(receipt) + '\n', 'utf8');
            fs.fsyncSync(fd);
        } finally { fs.closeSync(fd); }
        fs.renameSync(tmp, path.join(run, 'receipt.json'));
        const directory = fs.openSync(run, 'r');
        try { fs.fsyncSync(directory); } finally { fs.closeSync(directory); }
    },

    /** Prevents overlap across runtime workers, including during rollback. */
    locked: function (run, operation) {
        const lock = path.join(run, '.command');
        try { fs.mkdirSync(lock, { mode: 0o700 }); }
        catch (cause) { if (cause.code === 'EEXIST') this.reject(); throw cause; }
        try { return operation(); } finally { fs.rmdirSync(lock); }
    },

    /** Hashes every regular file and directory, rejecting extra links and bounding the scan. */
    tree: function (root) {
        if (!this.stat(root)?.isDirectory()) this.reject();
        const rows = [];
        let bytes = 0;
        const walk = (directory, prefix) => {
            for (const name of fs.readdirSync(directory).sort()) {
                const absolute = path.join(directory, name);
                const relative = prefix + name;
                const item = this.stat(absolute);
                if (!item || rows.length >= 500 || relative.length > 500) this.reject();
                if (item.isDirectory()) {
                    rows.push([relative, 'directory']);
                    walk(absolute, relative + '/');
                } else if (item.isFile() && item.nlink === 1 && item.size <= 2 * 1024 * 1024) {
                    bytes += item.size;
                    if (bytes > 16 * 1024 * 1024) this.reject();
                    rows.push([relative, 'file', this.digest(fs.readFileSync(absolute))]);
                } else this.reject();
            }
        };
        walk(root, '');
        return { digest: this.digest(JSON.stringify(rows)), count: rows.filter(row => row[1] === 'file').length };
    },

    /** Projects review and audit evidence, omitting filesystem locations and private source data. */
    projection: function (receipt) {
        return { runId: receipt.runId, state: receipt.state, applicationName: receipt.applicationName,
            accelerator: receipt.accelerator, environment: 'local', reviewDigest: receipt.reviewDigest,
            capabilities: receipt.plan.resolvedCapabilities.map(item => item.code),
            plannedFiles: receipt.plan.operations.filter(item => item.operation !== 'CREATE_DIRECTORY').length,
            artifactCount: receipt.output?.count ?? 0, artifactDigest: receipt.output?.digest ?? null,
            audit: receipt.audit, qualification: 'GENERATION_ONLY' };
    },

    /** Derives a plan from the current installed Builder catalogue and persists the review receipt. */
    prepare: function (run, body, actor, selected) {
        const source = this.source(selected);
        const workspace = boundary.resolveWorkspace({ payload: body });
        if (workspace.workspaceRoot !== source.customer || !selected.allowedPresets.includes(body.accelerator)) this.invalid();
        const inputs = { applicationName: body.applicationName, accelerator: body.accelerator };
        if (this.stat(run)) {
            const old = this.read(run, actor);
            if (old.applicationName !== inputs.applicationName || old.accelerator !== inputs.accelerator) this.reject();
            return old;
        }
        const catalogue = source.catalogueOwner.discover({ framework: source.framework, customer: source.customer,
            experience: source.experience, frontendCode: selected.frontendCode });
        const answers = source.guided.createAnswersTemplate({ projectCode: inputs.applicationName,
            customerCode: inputs.applicationName, preset: inputs.accelerator, sampleData: false }, catalogue);
        const solution = source.guided.createSolution(answers, catalogue);
        const plan = source.planner.createPlan(solution, catalogue, {});
        const receipt = { runId: body.runId, actor, ...inputs, solution, plan,
            reviewDigest: source.generator.approvalDigest(plan), audit: [] };
        try { fs.mkdirSync(run, { mode: 0o700 }); }
        catch (cause) { if (cause.code === 'EEXIST') this.reject(); throw cause; }
        this.write(run, receipt, 'REVIEWED');
        return receipt;
    },

    /** Executes the exact reviewed canonical plan once, preserving unknown outcomes. */
    generate: function (run, receipt, selected) {
        if (receipt.state === 'GENERATED' || receipt.state === 'ROLLED_BACK') return;
        if (receipt.state !== 'REVIEWED') this.reject();
        const source = this.source(selected);
        const catalogue = source.catalogueOwner.discover({ framework: source.framework, customer: source.customer,
            experience: source.experience, frontendCode: selected.frontendCode });
        const plan = source.generator.approvePlan(receipt.plan, 'local-build:' + receipt.runId);
        if (plan.approval.approvedPlanDigest !== receipt.reviewDigest ||
            !source.generator.validateApprovedPlan(plan, receipt.solution, catalogue).valid) this.reject();
        const output = path.join(run, 'project');
        if (this.stat(output)) this.reject();
        this.write(run, receipt, 'GENERATING');
        source.generator.generate(plan, receipt.solution, catalogue, output, {
            protectedRoots: [source.framework, source.customer, source.experience],
        });
        receipt.output = this.tree(output);
        if (!receipt.output.count) this.reject();
        this.write(run, receipt, 'GENERATED');
    },

    /** Removes only the verified run-owned output, keeping its audit and receipt. */
    rollback: function (run, receipt) {
        if (receipt.state === 'ROLLED_BACK') return;
        if (receipt.state !== 'GENERATED') this.reject();
        const output = path.join(run, 'project');
        const inventory = this.tree(output);
        if (inventory.digest !== receipt.output?.digest || inventory.count !== receipt.output.count) this.reject();
        this.write(run, receipt, 'ROLLING_BACK');
        fs.rmSync(output, { recursive: true });
        if (this.stat(output)) this.reject();
        this.write(run, receipt, 'ROLLED_BACK');
    },

    /** Applies the same authorizer for native Axis, direct service and API invocation. */
    execute: async function (request, command) {
        const selected = this.selection();
        permissions.assertPermission(request, 'installer.workspace.build');
        if (!['prepare', 'read', 'generate', 'rollback'].includes(command)) this.invalid();
        const actor = this.actor(request);
        const body = this.input(request, command);
        const run = path.join(this.receiptRoot(), body.runId);
        let result;
        if (command === 'prepare') result = this.prepare(run, body, actor, selected);
        else {
            result = this.read(run, actor);
            if (command !== 'read') {
                if (body.reviewDigest !== result.reviewDigest) this.reject();
                result = this.locked(run, () => {
                    const current = this.read(run, actor);
                    if (command === 'generate') this.generate(run, current, selected);
                    else this.rollback(run, current);
                    return current;
                });
            }
        }
        return response.success(request, 'build.' + command, this.projection(result));
    },
};
