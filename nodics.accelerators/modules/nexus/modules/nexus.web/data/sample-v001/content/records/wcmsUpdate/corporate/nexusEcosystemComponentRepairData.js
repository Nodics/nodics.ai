/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/wcmsUpdate/corporate/nexusEcosystemComponentRepairData
 * @description Restores Nexus ecosystem page components required by immutable site publication.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

/** @description Nexus corporate CMS v1.0.2 component repair for ecosystem page publication graph completeness. */
module.exports = {
    record0: {
        code: 'nexusEcosystemRoles',
        typeCode: 'nexusCardGridType',
        accessMode: 'PUBLIC',
        active: true,
        properties: {
            anchor: 'ecosystem-roles',
            kicker: 'Who it serves',
            heading: 'Different teams, one operating language.',
            body: 'A healthy ecosystem is not only a GitHub repository. It is the agreement between people who evaluate, sell, implement, operate, support, extend, document, and evolve enterprise journeys.',
            items: [
                {
                    symbol: 'CXO',
                    title: 'Customers and business owners',
                    text: 'See what is available, what must be customized, what can be operated in Axis, and what evidence exists before trusting the platform for real delivery.'
                },
                {
                    symbol: 'PART',
                    title: 'Implementation partners',
                    text: 'Use the reference stack to accelerate proposals, demos, discovery, solution shaping, and delivery while keeping customer extensions upgrade-friendly.'
                },
                {
                    symbol: 'DEV',
                    title: 'Developers and architects',
                    text: 'Inspect schemas, APIs, routes, documentation, CMS data, module registration, and ownership boundaries before changing production behavior.'
                },
                {
                    symbol: 'AXIS',
                    title: 'Operators and administrators',
                    text: 'Manage content, records, configuration, API reference, documentation, support evidence, testimonials, and approvals through governed BackOffice flows.'
                }
            ]
        }
    },
    record1: {
        code: 'nexusEcosystemContribution',
        typeCode: 'nexusCardGridType',
        accessMode: 'PUBLIC',
        active: true,
        properties: {
            anchor: 'ecosystem-contribution',
            kicker: 'Partner value',
            heading: 'Make delivery repeatable without making it rigid.',
            body: 'Nodics should help partners protect margin and quality: less repeated foundation work, more visible contracts, better support evidence, and safer AI-assisted delivery.',
            items: [
                {
                    symbol: '01',
                    title: 'Shorter discovery-to-demo cycle',
                    text: 'Show a working local journey quickly, then focus the conversation on customer outcomes instead of rebuilding platform plumbing.'
                },
                {
                    symbol: '02',
                    title: 'Cleaner implementation ownership',
                    text: 'Know which change belongs in the framework, which belongs in Kickoff-style project modules, and which belongs only to the customer.'
                },
                {
                    symbol: '03',
                    title: 'Better support conversations',
                    text: 'Use documentation, API reference, CMS state, release manifests, logs, and Axis visibility to discuss issues with evidence, not guesswork.'
                },
                {
                    symbol: '04',
                    title: 'Governed community signal',
                    text: 'Approved testimonials, implementation notes, partner stories, and reusable patterns can be reviewed in Axis before they appear publicly.'
                }
            ]
        }
    },
    record2: {
        code: 'nexusEcosystemJourney',
        typeCode: 'nexusCardGridType',
        accessMode: 'PUBLIC',
        active: true,
        properties: {
            anchor: 'ecosystem-journey',
            kicker: 'Collaboration path',
            heading: 'From first clone to trusted customer delivery.',
            body: 'The ecosystem journey should feel practical: prove the platform, understand the boundaries, shape the customer solution, then contribute what truly belongs back to the shared foundation.',
            items: [
                {
                    symbol: 'RUN',
                    title: 'Experience',
                    text: 'Run the local reference stack and see the framework, runtime, BackOffice, public site, documentation, and API contract working together.'
                },
                {
                    symbol: 'SEE',
                    title: 'Map',
                    text: 'Identify which capabilities are reusable, which data belongs to the project, and where customer-specific integration or policy must live.'
                },
                {
                    symbol: 'MAKE',
                    title: 'Deliver',
                    text: 'Customize the project boundary, activate the required modules, connect providers, shape the public experience, and manage operations through Axis.'
                },
                {
                    symbol: 'GROW',
                    title: 'Contribute',
                    text: 'Promote reusable improvements, documentation, and partner knowledge without exposing customer data, commercial context, or private implementation detail.'
                }
            ],
            href: '/developers',
            linkLabel: 'Open developer path'
        }
    }
};
