/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const CronJob = require('cron').CronJob;

/**
 * @module cronjob/lib/CronJob
 * @description Runtime wrapper around the `cron` package that controls one tenant-scoped scheduled job and its lifecycle pipelines.
 * @layer lib
 * @owner cronjob
 * @override Project modules may replace this wrapper only when scheduler lifecycle semantics are intentionally changed.
 */
module.exports = function (definition, trigger, context, timeZone) {
    let _definition = definition;
    let _tenant = definition.tenant;
    let _trigger = trigger;
    let _context = context;
    let _timeZone = timeZone;
    let _cronJob = '';
    let _active = false;
    let _running = false;
    let _paused = false;
    let _authToken = '';
    let _jobPool;
    const _self = this;

    this.getCronJob = function () {
        return _cronJob;
    };

    this.getDefinition = function () {
        return _definition;
    };

    this.getTrigger = function () {
        return _trigger;
    };

    this.setJobPool = function (jobPool) {
        _jobPool = jobPool;
    };

    this.setAuthToken = function (authToken) {
        _authToken = authToken;
    };

    this.getAuthToken = function () {
        return _authToken;
    };

    this.getTenant = function () {
        return _tenant;
    };

    this.validate = function () {
        if (!_trigger.expression) {
            throw new Error('Invalid expression for given trigger');
        }
        if (!_definition.jobDetail) {
            throw new Error('Invalid job detail within cronJob definition');
        }
    };

    /** Returns whether this timer is paused; independent of an admitted execution. */
    this.isPaused = function () { return _paused; };

    /** Returns actual timer state after an execution, including stop/pause during work. */
    this.getIdleState = function () {
        return !_active ? ENUMS.CronJobState.STOPED.key :
            _paused ? ENUMS.CronJobState.PAUSED.key : ENUMS.CronJobState.ACTIVE.key;
    };

    /** Claims the same pooled wrapper used by natural ticks, synchronously. */
    this.runOnce = function (currentDefinition) {
        if (_running) throw new CLASSES.NodicsError('ERR_JOB_00006');
        if (!execute(currentDefinition || _definition))
            throw new CLASSES.NodicsError('ERR_JOB_00000', 'Execution node is not ready or the schedule has expired');
    };

    // There is no catch-up queue: a busy natural tick is skipped, never replayed.
    // The running flag remains held until the full owner trigger pipeline settles.
    function execute(executionDefinition) {
        if (_running) return false;
        if (executionDefinition.end && new Date(executionDefinition.end) < new Date()) return false;
        if (NODICS.getServerState() !== 'started' ||
            (CONFIG.get('nodeId') !== executionDefinition.runOnNode && CONFIG.get('nodeId') !== executionDefinition.tempNode)) return false;
        _running = true;
        executionDefinition.startTime = new Date();
        const record = status => {
            if (!executionDefinition.logResult) return;
            SERVICE.DefaultCronJobLogService.save({ tenant: executionDefinition.tenant, model: {
                jobCode: executionDefinition.code, startTime: executionDefinition.startTime,
                endTime: new Date(), result: { status }
            }}).catch(() => _self.LOG.error('Failed recording Cron execution log'));
        };
        try {
            Promise.resolve(SERVICE.DefaultPipelineService.start('defaultCronJobTriggerHandlerPipeline', {
                tenant: executionDefinition.tenant, job: _self,
                cronJob: _self.getCronJob(), definition: executionDefinition
            }, {})).then(() => { _running = false; record('SUCCESS'); }, error => {
                _running = false;
                record('ERROR');
                _self.LOG.error('Cron execution failed', { code: error?.code, jobCode: executionDefinition.code });
            });
        } catch (error) {
            _running = false;
            throw error;
        }
        return true;
    }

    this.init = function (oneTime) {
        // Manual execution uses runOnce on the owner pool; no second temporary timer.
        if (oneTime) throw new Error('Use the pooled runOnce admission for manual execution');
        _cronJob = new CronJob({
            cronTime: this.getCronTime(false),
            /** Admits one natural tick on the pooled wrapper; busy executions are skipped without replay. */
            onTick: function () {
                if (!_active || _paused) return;
                if (_definition.end && new Date(_definition.end) < new Date()) { _self.stopJob(true); return; }
                if (_running) {
                    SERVICE.DefaultCronJobRuntimeService.persistRuntimeState(_self, { lastSkippedAt: new Date() })
                        .catch(() => _self.LOG.error('Failed recording skipped Cron tick'));
                    return;
                }
                try { execute(_definition); } catch (error) { _self.handleError(error); }
            },
            /** Records timer completion without cancelling a target execution already admitted by the owner. */
            onComplete: function () {
                _active = false;
                // A stopped timer does not complete or cancel its already-admitted target.
                if (_running || NODICS.getServerState() !== 'started') return;
                try {
                    SERVICE.DefaultPipelineService.start('defaultCronJobCompleteHandlerPipeline', {
                        tenant: _definition.tenant, job: _self, cronJob: _self.getCronJob(), definition: _definition
                    }, {}).catch(error => _self.handleError(error));
                } catch (error) { _self.handleError(error); }
            },
            start: false,
            context: _context,
            timeZone: _timeZone
        });
        _active = false;
    };

    this.startJob = function (disablePipeline) {
        let _self = this;
        if (disablePipeline) {
            if (!_active) {
                _active = true;
                _paused = false;
                _cronJob.start();
            }
        } else {
            return new Promise((resolve, reject) => {
                if (!_active) {
                    _active = true;
                    _paused = false;
                    SERVICE.DefaultPipelineService.start('defaultCronJobStartHandlerPipeline', {
                        tenant: _definition.tenant,
                        job: _self,
                        definition: _definition
                    }, {}).then(success => {
                        _cronJob.start();
                        resolve('Job: ' + _definition.code + ' started successfully');
                    }).catch(error => {
                        _active = false;
                        reject(new CLASSES.CronJobError(error, 'Job: ' + _definition.code + ' has issue while starting'));
                    });
                } else {
                    resolve('Job: ' + _definition.code + ' is already running');
                }
            });
        }
    };

    this.stopJob = function (disablePipeline) {
        let _self = this;
        if (disablePipeline) {
            if (_active) {
                _active = false;
                _cronJob.stop();
            }
        } else {
            return new Promise((resolve, reject) => {
                if (_active) {
                    _active = false;
                    _cronJob.stop();
                    SERVICE.DefaultPipelineService.start('defaultCronJobStopHandlerPipeline', {
                        tenant: _definition.tenant,
                        job: _self,
                        definition: _definition
                    }, {}).then(success => {
                        resolve('Job: ' + _definition.code + ' stoped successfully');
                    }).catch(error => {
                        reject(new CLASSES.CronJobError(error, 'Job: ' + _definition.code + ' has issue while stoping'));
                    });
                } else {
                    resolve('Job: ' + _definition.code + ' is already stoped');
                }
            });
        }
    };

    this.pauseJob = function (disablePipeline) {
        let _self = this;
        if (disablePipeline) {
            if (_active && !_paused) {
                _paused = true;
            }
        } else {
            return new Promise((resolve, reject) => {
                if (_active && !_paused) {
                    _paused = true;
                    SERVICE.DefaultPipelineService.start('defaultCronJobPauseHandlerPipeline', {
                        tenant: _definition.tenant,
                        job: _self,
                        definition: _definition
                    }, {}).then(success => {
                        resolve('Job: ' + _definition.code + ' paused successfully');
                    }).catch(error => {
                        reject(new CLASSES.CronJobError(error, 'Job: ' + _definition.code + ' has issue while stoping'));
                    });
                } else {
                    resolve('Job: ' + _definition.code + ' is already paused');
                }
            });
        }
    };

    this.resumeJob = function (disablePipeline) {
        let _self = this;
        if (disablePipeline) {
            if (_active && _paused) {
                _paused = false;
            }
        } else {
            return new Promise((resolve, reject) => {
                if (_active && _paused) {
                    _paused = false;
                    SERVICE.DefaultPipelineService.start('defaultCronJobResumedHandlerPipeline', {
                        tenant: _definition.tenant,
                        job: _self,
                        definition: _definition
                    }, {}).then(success => {
                        resolve('Job: ' + _definition.code + ' resumed successfully');
                    }).catch(error => {
                        reject(new CLASSES.CronJobError(error, 'Job: ' + _definition.code + ' has issue while resuming'));
                    });
                } else {
                    resolve('Job: ' + _definition.code + ' is already resumed');
                }
            });
        }
    };

    this.isActive = function () {
        return _active;
    };

    this.isRunning = function () {
        return _running;
    };

    this.getCronTime = function (oneTime) {
        if (oneTime) {
            return '* * * * * *';
        } else if (_trigger.expression) {
            return _trigger.expression;
        }
        return _trigger.second || '*' +
            ' ' +
            _trigger.minute || '*' +
            ' ' +
            _trigger.hour || '*' +
            ' ' +
            _trigger.year || '*' +
            ' ' +
            _trigger.month || '*' +
            ' ' +
            _trigger.day || '*';
    };

    this.handleError = function (error) {
        _self.LOG.error('Job: ' + _definition.code + ' has issue while running: ', error);
        SERVICE.DefaultPipelineService.start('defaultCronJobErrorHandlerPipeline', {
            tenant: _definition.tenant,
            job: _self,
            definition: _definition,
            error: error
        }, {}).then(success => {
            _self.LOG.warn('Error for Job: ' + _definition.code + ' has been handled successfully');
        }).catch(error => {
            _self.LOG.warn('Failed to handle rror for Job: ' + _definition.code);
            _self.LOG.error(error);
        });
    };
};
