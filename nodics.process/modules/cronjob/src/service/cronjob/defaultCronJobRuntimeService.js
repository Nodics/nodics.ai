/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module cronjob/service/cronjob/DefaultCronJobRuntimeService
 * @description Owns the process-local tenant/job pool that creates, updates,
 * runs, starts, stops, pauses, resumes, and removes cronjob wrappers.
 * @layer service
 * @owner cronjob
 * @override Later modules may override individual scheduler pool operations
 * while preserving tenant isolation, node ownership, and lifecycle semantics.
 */
module.exports = {
    /** Process-local runtime jobs keyed by tenant and job code. */
    jobPool: {},

    /** Returns a read-only summary of scheduler ownership for diagnostics. */
    getPoolSummary: function () {
        let tenants = Object.keys(this.jobPool);
        return {
            tenants: tenants.length,
            jobs: tenants.reduce((count, tenant) => count + Object.keys(this.jobPool[tenant] || {}).length, 0)
        };
    },

    /** Stops acquisition for every process-owned scheduled job. */
    stopAllJobs: function (tenants) {
        tenants = (tenants || Object.keys(this.jobPool)).slice();
        return Promise.all(tenants.map(tenant => this.stopJobs(tenant, Object.keys(this.jobPool[tenant] || {}))));
    },

    /**
     * Creates runtime jobs recursively and aggregates successes and failures.
     */
    createJobs: function (input, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (input.definitions && input.definitions.length > 0) {
                let definition = input.definitions.shift();
                _self.createJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.createJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.createJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    result: result,
                    failed: failed
                });
            }
        });
    },

    /**
     * Creates one node-owned runtime job for its tenant.
     */
    createJob: function (authToken, definition) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let currentDate = new Date();
                if (UTILS.isBlank(definition)) {
                    reject(new CLASSES.CronJobError('ERR_JOB_00003', 'job definition can not be null or empty'));
                } else if (UTILS.isBlank(definition.tenant)) {
                    reject(new CLASSES.CronJobError('ERR_JOB_00003', 'job definition contain invalid tenant'));
                } else if (UTILS.isBlank(definition.trigger)) {
                    reject(new CLASSES.CronJobError('ERR_JOB_00003', 'job definition contain invalid trigger'));
                } else if (definition.start > currentDate) {
                    reject(new CLASSES.CronJobError('ERR_JOB_00003', 'job definition contain invalid start date'));
                } else if (definition.end && definition.end < currentDate) {
                    reject(new CLASSES.CronJobError('ERR_JOB_00003', 'job definition contain invalid end date'));
                } else {
                    if (!this.jobPool[definition.tenant]) {
                        this.jobPool[definition.tenant] = {};
                    }
                    if (!this.jobPool[definition.tenant][definition.code]) {
                        if (CONFIG.get('nodeId') === definition.runOnNode || (definition.tempNode && CONFIG.get('nodeId') === definition.tempNode)) {
                            let tmpCronJob = new CLASSES.CronJob(definition, definition.trigger);
                            tmpCronJob.LOG = SERVICE.DefaultLoggerService.createLogger('CronJob-' + definition.code);
                            tmpCronJob.validate();
                            tmpCronJob.init();
                            tmpCronJob.setAuthToken(authToken);
                            tmpCronJob.setJobPool(this.jobPool);
                            this.jobPool[definition.tenant][definition.code] = tmpCronJob;
                            SERVICE.DefaultCronJobService.update({
                                tenant: definition.tenant,
                                query: {
                                    code: definition.code
                                },
                                model: {
                                    state: ENUMS.CronJobState.CREATED.key
                                }
                            }).then(success => {
                                _self.LOG.debug('Job: ' + definition.code + ' has been successfully added in ready to run pool on tenant: ' + definition.tenant);
                                resolve('Job: ' + definition.code + ' has been successfully added in ready to run pool on tenant: ' + definition.tenant);
                            }).catch(error => {
                                delete this.jobPool[definition.code];
                                _self.LOG.error('Job: ' + definition.code + ' failed on updating state on tenant: ' + definition.tenant);
                                reject(new CLASSES.NodicsError(error, 'Job: ' + definition.code + ' failed on updating state on tenant: ' + definition.tenant, 'ERR_JOB_00000'));
                            });
                        } else {
                            _self.LOG.debug('Job: ' + definition.code + ' not set to run on this node on tenant: ' + definition.tenant);
                            reject(new CLASSES.NodicsError('ERR_JOB_00000', 'Job: ' + definition.code + ' not set to run on this node on tenant: ' + definition.tenant));
                        }
                    } else {
                        _self.LOG.warn('Job: ' + definition.code, ' is already available on tenant: ' + definition.tenant);
                        resolve('Job: ' + definition.code + ' is already available in ready to run pool on tenant: ' + definition.tenant);
                    }
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_JOB_00000'));
            }
        });
    },

    /**
     * Updates runtime jobs recursively and aggregates outcomes.
     */
    updateJobs: function (input, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(input.definitions)) {
                let definition = input.definitions.shift();
                definition.tenant = input.tenant;
                _self.updateJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.updateJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.updateJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    result: result,
                    failed: failed
                });
            }
        });
    },

    /**
     * Replaces or creates one runtime job while preserving active state.
     */
    updateJob: function (authToken, definition) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(definition)) {
                reject(new CLASSES.NodicsError('ERR_JOB_00002'));
            } else if (UTILS.isBlank(definition.tenant)) {
                reject(new CLASSES.NodicsError('ERR_JOB_00007'));
            } else if (UTILS.isBlank(definition.trigger)) {
                reject(new CLASSES.NodicsError('ERR_JOB_00003'));
            } else if (UTILS.isBlank(definition.trigger)) {
                reject(new CLASSES.NodicsError('ERR_JOB_00003'));
            } else if (!this.jobPool[definition.tenant] || !this.jobPool[definition.tenant][definition.code]) {
                _self.LOG.debug('Could not found job, so creating new : ' + definition.code);
                this.createJob(authToken, definition).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                let cronJob = this.jobPool[definition.tenant][definition.code];
                let active = cronJob.isActive();
                cronJob.stopJob().then(success => {
                    delete this.jobPool[definition.tenant][definition.code];
                    this.createJob(authToken, definition).then(success => {
                        if (active) {
                            this.jobPool[definition.tenant][definition.code].startJob().then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            resolve(success);
                        }
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    _self.LOG.error(error);
                    reject(new CLASSES.NodicsError(error, 'Job: ' + definition.code + ' failed to stop it to update on tenant: ' + definition.tenant, 'ERR_JOB_00000'));
                });
            }
        });
    },

    /**
     * Runs runtime jobs recursively and aggregates outcomes.
     */
    runJobs: function (input, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(input.definitions)) {
                let definition = input.definitions.shift();
                definition.tenant = input.tenant;
                _self.runJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.runJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.runJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    result: result,
                    failed: failed
                });
            }
        });
    },

    /**
     * Schedules one eligible runtime job for immediate execution.
     */
    runJob: function (authToken, definition) {
        return new Promise((resolve, reject) => {
            try {
                let currentDate = new Date();
                if (UTILS.isBlank(definition)) {
                    reject(new CLASSES.NodicsError('ERR_JOB_00002'));
                } else if (UTILS.isBlank(definition.tenant)) {
                    reject(new CLASSES.NodicsError('ERR_JOB_00007'));
                } else if (UTILS.isBlank(definition.trigger)) {
                    reject(new CLASSES.NodicsError('ERR_JOB_00003'));
                } else if (definition.start > currentDate) {
                    reject(new CLASSES.NodicsError('ERR_JOB_00004'));
                } else if (definition.end && definition.end < currentDate) {
                    reject(new CLASSES.NodicsError('ERR_JOB_00005'));
                } else if (definition.end && definition.end < currentDate) {
                    reject(new CLASSES.NodicsError('ERR_JOB_00005'));
                } else if (this.jobPool[definition.tenant] &&
                    this.jobPool[definition.tenant][definition.code] &&
                    this.jobPool[definition.tenant][definition.code].isRunning()) {
                    reject(new CLASSES.NodicsError('ERR_JOB_00006'));
                } else {
                    let _active = false;
                    if (this.jobPool[definition.tenant] &&
                        this.jobPool[definition.tenant][definition.code] &&
                        this.jobPool[definition.tenant][definition.code].isActive()) {
                        _active = this.jobPool[definition.tenant][definition.code].isActive();
                        this.jobPool[definition.tenant][definition.code].pauseJob(true);
                    }
                    if (!definition.runOnNode || CONFIG.get('nodeId') === definition.runOnNode) {
                        let tmpCronJob = new CLASSES.CronJob(definition, definition.trigger);
                        tmpCronJob.LOG = SERVICE.DefaultLoggerService.createLogger('CronJob-' + definition.code);
                        tmpCronJob.validate();
                        tmpCronJob.setAuthToken(authToken);
                        tmpCronJob.setJobPool(this.jobPool);
                        tmpCronJob.init(true);
                        if (_active) {
                            this.jobPool[definition.tenant][definition.code].resumeJob(true);
                        }
                    }
                    resolve('Job: ' + definition.code + ' run successfully on tenant: ' + definition.tenant);
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_JOB_00000'));
            }
        });
    },

    /**
     * Starts all selected process-owned runtime jobs.
     */
    startAllJobs: function (jobCodes, tenants = NODICS.getActiveTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                if (this.jobPool[tenant] && !UTILS.isBlank(this.jobPool[tenant])) {
                    let jobs = Object.keys(this.jobPool[tenant]);
                    if (jobCodes && jobCodes.length > 0) {
                        jobs = [];
                        Object.keys(this.jobPool[tenant]).forEach(jobCode => {
                            if (jobCodes.includes(jobCode)) {
                                jobs.push(jobCode);
                            }
                        });
                    }
                    this.startJobs(tenant, jobs).then(success => {
                        _self.startAllJobs(jobCodes, tenants).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.startAllJobs(jobCodes, tenants).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Starts selected jobs for one tenant and aggregates outcomes.
     */
    startJobs: function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.startJob(tenant, code).then(success => {
                    result.push(success);
                    _self.startJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.startJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                let code = 'SUC_JOB_00000';
                if (result.length > 0 && failed.length > 0) {
                    code = 'SUC_JOB_00001';
                } else if (result.length <= 0 && failed.length > 0) {
                    code = 'ERR_JOB_00000';
                }
                resolve({
                    code: code,
                    result: result,
                    failed: failed
                });
            }
        });
    },

    /**
     * Starts one tenant-scoped runtime job.
     */
    startJob: function (tenant, jobCode) {
        return new Promise((resolve, reject) => {
            if (!this.jobPool[tenant] || !this.jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job on tenant: ' + tenant);
            } else {
                this.jobPool[tenant][jobCode].startJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    /**
     * Stops selected jobs for one tenant and aggregates outcomes.
     */
    stopJobs: function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.stopJob(tenant, code).then(success => {
                    result.push(success);
                    _self.stopJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.stopJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                let code = 'SUC_JOB_00000';
                if (result.length > 0 && failed.length > 0) {
                    code = 'SUC_JOB_00001';
                } else if (result.length <= 0 && failed.length > 0) {
                    code = 'ERR_JOB_00000';
                }
                resolve({
                    code: code,
                    result: result,
                    failed: failed
                });
            }
        });
    },

    /**
     * Stops one tenant-scoped runtime job.
     */
    stopJob: function (tenant, jobCode) {
        return new Promise((resolve, reject) => {
            if (!this.jobPool[tenant] || !this.jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job on tenant: ' + tenant);
            } else {
                this.jobPool[tenant][jobCode].stopJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    /**
     * Removes all selected process-owned runtime jobs.
     */
    removeAllJobs: function (tenants = NODICS.getActiveTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                if (this.jobPool[tenant] && !UTILS.isBlank(this.jobPool[tenant])) {
                    this.removeJobs(tenant, Object.keys(this.jobPool[tenant])).then(success => {
                        _self.removeAllJobs(tenants).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.removeAllJobs(tenants).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve({
                    code: 'SUC_JOB_00002'
                });
            }
        });
    },

    /**
     * Removes selected jobs for one tenant and aggregates outcomes.
     */
    removeJobs: function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.removeJob(tenant, code).then(success => {
                    result.push(success);
                    _self.removeJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.removeJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                let code = 'SUC_JOB_00000';
                if (result.length > 0 && failed.length > 0) {
                    code = 'SUC_JOB_00001';
                } else if (result.length <= 0 && failed.length > 0) {
                    code = 'ERR_JOB_00000';
                }
                resolve({
                    code: code,
                    result: result,
                    failed: failed
                });
            }
        });
    },

    /**
     * Stops and removes one tenant-scoped runtime job.
     */
    removeJob: function (tenant, jobCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!this.jobPool[tenant] || !this.jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job');
            } else {
                this.jobPool[tenant][jobCode].stopJob().then(success => {
                    let definition = this.jobPool[tenant][jobCode].getDefinition();
                    SERVICE.DefaultPipelineService.start('defaultCronJobRemovedHandlerPipeline', {
                        job: this.jobPool[tenant][jobCode],
                        definition: definition
                    }, {}).then(success => {
                        delete this.jobPool[tenant][jobCode];
                        resolve('Job: ' + definition.code + ' removed successfully');
                    }).catch(error => {
                        reject(new CLASSES.NodicsError(error, 'Job: ' + definition.code + ' has issue while removing', 'ERR_JOB_00000'));
                    });
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    /**
     * Pauses selected jobs for one tenant and aggregates outcomes.
     */
    pauseJobs: function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.pauseJob(tenant, code).then(success => {
                    result.push(success);
                    _self.pauseJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.pauseJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                let code = 'SUC_JOB_00000';
                if (result.length > 0 && failed.length > 0) {
                    code = 'SUC_JOB_00001';
                } else if (result.length <= 0 && failed.length > 0) {
                    code = 'ERR_JOB_00000';
                }
                resolve({
                    code: code,
                    result: result,
                    failed: failed
                });
            }
        });
    },

    /**
     * Pauses one tenant-scoped runtime job.
     */
    pauseJob: function (tenant, jobCode) {
        return new Promise((resolve, reject) => {
            if (!this.jobPool[tenant] || !this.jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job on tenant: ' + tenant);
            } else {
                this.jobPool[tenant][jobCode].pauseJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    /**
     * Resumes selected jobs for one tenant and aggregates outcomes.
     */
    resumeJobs: function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.resumeJob(tenant, code).then(success => {
                    result.push(success);
                    _self.resumeJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.resumeJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                let code = 'SUC_JOB_00000';
                if (result.length > 0 && failed.length > 0) {
                    code = 'SUC_JOB_00001';
                } else if (result.length <= 0 && failed.length > 0) {
                    code = 'ERR_JOB_00000';
                }
                resolve({
                    code: code,
                    result: result,
                    failed: failed
                });
            }
        });
    },

    /**
     * Resumes one tenant-scoped runtime job.
     */
    resumeJob: function (tenant, jobCode) {
        return new Promise((resolve, reject) => {
            if (!this.jobPool[tenant] || !this.jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job on tenant: ' + tenant);
            } else {
                this.jobPool[tenant][jobCode].resumeJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },
};
