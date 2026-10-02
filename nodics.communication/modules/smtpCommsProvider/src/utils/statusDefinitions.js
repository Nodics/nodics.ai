/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module smtpCommsProvider/utils/statusDefinitions @description Stable redacted SMTP result vocabulary. @owner smtpCommsProvider @layer utils */
module.exports = {
  "ERR_COMMS_SMTP_DISABLED": {
    "code": "503",
    "message": "The email provider is disabled."
  },
  "ERR_COMMS_SMTP_CONFIGURATION": {
    "code": "503",
    "message": "The email provider configuration or credential needs authorised review."
  },
  "ERR_COMMS_SMTP_CONTEXT": {
    "code": "403",
    "message": "The email intent is not permitted in this sending context."
  },
  "ERR_COMMS_SMTP_EXPIRED": {
    "code": "409",
    "message": "The email intent is no longer current."
  },
  "ERR_COMMS_SMTP_RECIPIENT": {
    "code": "403",
    "message": "The selected sender or recipient is not permitted for this controlled test."
  },
  "ERR_COMMS_SMTP_CONTENT": {
    "code": "400",
    "message": "The email content does not satisfy the provider contract."
  },
  "ERR_COMMS_SMTP_REJECTED": {
    "code": "502",
    "message": "The mail server definitively rejected this delivery attempt."
  },
  "ERR_COMMS_SMTP_UNCERTAIN": {
    "code": "409",
    "message": "The email outcome is uncertain; do not resend without reconciliation."
  },
  "SUC_COMMS_SMTP_ACCEPTED": {
    "code": "200",
    "message": "The SMTP server accepted the message; mailbox receipt is separate evidence."
  }
};
