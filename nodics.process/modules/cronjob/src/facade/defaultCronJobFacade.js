/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/facade/DefaultCronJobFacade
 * @description Facade boundary that delegates cronjob lifecycle commands from controllers to the scheduler service.
 * @layer facade
 * @owner cronjob
 * @override Project modules may override this facade to add lifecycle authorization or orchestration behavior.
 */
module.exports = {
    /** Reviews a draft lifecycle command. @param {Object} request Trusted input. @returns {Promise<Object>} Review. */
    previewScheduleLifecycle: function (request) { return SERVICE.DefaultCronJobScheduleLifecycleService.preview(request); },
    /** Executes a confirmed draft lifecycle command. @param {Object} request Trusted input. @returns {Promise<Object>} Receipt. */
    executeScheduleLifecycle: function (request) { return SERVICE.DefaultCronJobScheduleLifecycleService.execute(request); },
    /** Inspects original lifecycle evidence. @param {Object} request Trusted input. @returns {Promise<Object>} Receipt. */
    inspectScheduleLifecycle: function (request) { return SERVICE.DefaultCronJobScheduleLifecycleService.inspect(request); },
    /** Reconciles existing runtime evidence without execution. @param {Object} request Trusted input. @returns {Promise<Object>} Receipt. */
    reconcileScheduleLifecycle: function (request) { return SERVICE.DefaultCronJobScheduleLifecycleService.reconcile(request); },

    /** Lists scoped inactive schedule choices. @param {Object} request Trusted request. @returns {Promise<Object>} Capability. */
    scheduleDraftCapabilities: function (request) {
        return SERVICE.DefaultCronJobScheduleDraftService.capabilities(request);
    },
    /** Reviews an inactive schedule. @param {Object} request Trusted request. @returns {Promise<Object>} Review. */
    previewScheduleDraft: function (request) {
        return SERVICE.DefaultCronJobScheduleDraftService.preview(request);
    },
    /** Inserts an inactive schedule once. @param {Object} request Trusted request. @returns {Promise<Object>} Receipt. */
    createScheduleDraft: function (request) {
        return SERVICE.DefaultCronJobScheduleDraftService.create(request);
    },
    /** Inspects the original schedule save. @param {Object} request Trusted request. @returns {Promise<Object>} Inspection. */
    inspectScheduleDraft: function (request) {
        return SERVICE.DefaultCronJobScheduleDraftService.inspect(request);
    },

    /**
     * Delegates job creation to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    createJob: function (request) {
        return SERVICE.DefaultCronJobService.createJob(request);
    },

    /**
     * Delegates job refresh/update to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    updateJob: function (request) {
        return SERVICE.DefaultCronJobService.updateJob(request);
    },

    /**
     * Delegates one-time job execution to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    runJob: function (request) {
        return SERVICE.DefaultCronJobService.runJob(request);
    },

    /**
     * Delegates job start to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    startJob: function (request) {
        return SERVICE.DefaultCronJobService.startJob(request);
    },

    /**
     * Delegates job stop to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    stopJob: function (request) {
        return SERVICE.DefaultCronJobService.stopJob(request);
    },

    /**
     * Delegates job removal to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    removeJob: function (request) {
        return SERVICE.DefaultCronJobService.removeJob(request);
    },

    /**
     * Delegates job pause to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    pauseJob: function (request) {
        return SERVICE.DefaultCronJobService.pauseJob(request);
    },

    /**
     * Delegates job resume to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    resumeJob: function (request) {
        return SERVICE.DefaultCronJobService.resumeJob(request);
    }
};
