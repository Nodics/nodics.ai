/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

module.exports = {
    activeTarget: {
        activeData: {
            options: {
                enabled: true,
                schemaName: 'activeSchema',
                operation: 'saveAll'
            }
        }
    },
    inactiveTarget: {
        inactiveData: {
            options: {
                enabled: true,
                schemaName: 'inactiveSchema',
                operation: 'saveAll'
            }
        }
    }
};
