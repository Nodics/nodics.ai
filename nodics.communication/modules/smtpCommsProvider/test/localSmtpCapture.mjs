/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module smtpCommsProvider/test/localSmtpCapture @description Explicit private Local fixture session; not a runtime provider or registration qualifier. @owner smtpCommsProvider @layer test */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import capture from './helpers/localSmtpCapture.js';

/** Admits an empty, private, caller-owned canonical directory without following links. */
function privateDirectory(directory) {
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(directory) !== path.resolve(directory) ||
      (stat.mode & 0o777) !== 0o700 || stat.uid !== process.getuid()) throw new Error('CAPTURE_PRIVATE_DIRECTORY_REFUSED');
}

/** Reads only the private fixture binding, never prints or persists it into runtime configuration. */
export function readBinding(directory) {
  privateDirectory(directory);
  const file = path.join(directory, 'binding.json');
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.nlink !== 1 || stat.uid !== process.getuid() ||
        (stat.mode & 0o777) !== 0o600 || stat.size > 4096) throw new Error('CAPTURE_PRIVATE_BINDING_REFUSED');
    const values = JSON.parse(fs.readFileSync(fd, 'utf8'));
    const keys = ['NODICS_EMPLOYEE_SMTP_HOST', 'NODICS_EMPLOYEE_SMTP_PORT', 'NODICS_EMPLOYEE_SMTP_SECURE',
      'NODICS_EMPLOYEE_SMTP_REQUIRE_TLS', 'NODICS_EMPLOYEE_SMTP_ALLOW_INSECURE_LOOPBACK',
      'NODICS_EMPLOYEE_EMAIL_SENDER', 'NODICS_EMPLOYEE_SMTP_PASSWORD'];
    if (!values || Object.keys(values).sort().join() !== keys.sort().join() ||
        keys.some(key => typeof values[key] !== 'string') || values.NODICS_EMPLOYEE_SMTP_HOST !== '127.0.0.1' ||
        !/^[0-9]{1,5}$/.test(values.NODICS_EMPLOYEE_SMTP_PORT) ||
        Number(values.NODICS_EMPLOYEE_SMTP_PORT) < 1 || Number(values.NODICS_EMPLOYEE_SMTP_PORT) > 65535 ||
        values.NODICS_EMPLOYEE_SMTP_SECURE !== 'false' || values.NODICS_EMPLOYEE_SMTP_REQUIRE_TLS !== 'false' ||
        values.NODICS_EMPLOYEE_SMTP_ALLOW_INSECURE_LOOPBACK !== 'true' ||
        !/^[A-Za-z0-9_-]{32,128}$/.test(values.NODICS_EMPLOYEE_SMTP_PASSWORD))
      throw new Error('CAPTURE_PRIVATE_BINDING_REFUSED');
    capture.mailbox(values.NODICS_EMPLOYEE_EMAIL_SENDER);
    return values;
  } catch { throw new Error('CAPTURE_PRIVATE_BINDING_REFUSED'); }
  finally { fs.closeSync(fd); }
}

/** Starts an approved capture session and creates only its private fixture artifacts. */
export async function startSession({ directory, port, sender, recipients, bindingDirectory }) {
  privateDirectory(directory);
  if (fs.readdirSync(directory).length || !Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('CAPTURE_SELECTION_REFUSED');
  const retained = bindingDirectory === undefined ? undefined : readBinding(bindingDirectory);
  if (retained && (retained.NODICS_EMPLOYEE_SMTP_PORT !== String(port) || retained.NODICS_EMPLOYEE_EMAIL_SENDER !== sender))
    throw new Error('CAPTURE_RESTORE_SCOPE_REFUSED');
  const owned = [], password = retained?.NODICS_EMPLOYEE_SMTP_PASSWORD || crypto.randomBytes(48).toString('base64url');
  const write = (name, value) => {
    const file = path.join(directory, name);
    fs.writeFileSync(file, value, { flag: 'wx', mode: 0o600 });
    owned.push(file);
  };
  let server;
  const cleanup = () => { for (const file of owned.reverse()) { try { fs.unlinkSync(file); } catch {} } };
  try {
    server = await capture.createCapture({ port, sender, recipients, password,
      onMessage: (message, metadata) => {
        write('message-' + metadata.sequence + '.eml', message);
        write('message-' + metadata.sequence + '.json', JSON.stringify({ sequence: metadata.sequence,
          observedAt: new Date().toISOString(), bytes: message.length, recipientIndex: recipients.indexOf(metadata.recipient) }));
      } });
    write('binding.json', JSON.stringify({
      NODICS_EMPLOYEE_SMTP_HOST: '127.0.0.1', NODICS_EMPLOYEE_SMTP_PORT: String(server.port),
      NODICS_EMPLOYEE_SMTP_SECURE: 'false', NODICS_EMPLOYEE_SMTP_REQUIRE_TLS: 'false',
      NODICS_EMPLOYEE_SMTP_ALLOW_INSECURE_LOOPBACK: 'true',
      NODICS_EMPLOYEE_EMAIL_SENDER: sender, NODICS_EMPLOYEE_SMTP_PASSWORD: password,
    }));
    const receipt = { code: 'LOCAL_SMTP_CAPTURE_READY', pid: process.pid, host: '127.0.0.1',
      port: server.port, recipientCount: recipients.length, relay: false, privateDirectory: directory,
      qualificationGranted: false };
    write('ready.json', JSON.stringify(receipt));
    return { receipt, status: server.status, close: async () => { await server.close(); cleanup(); } };
  } catch {
    if (server) await server.close();
    cleanup();
    throw new Error('CAPTURE_START_REFUSED');
  }
}

if (!process.env.NODE_TEST_CONTEXT && process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const values = { recipients: [] };
    for (const argument of process.argv.slice(2)) {
      const match = argument.match(/^--(directory|port|sender|recipient|binding-directory)=(.+)$/);
      if (!match) throw new Error();
      if (match[1] === 'recipient') values.recipients.push(match[2]);
      else {
        const key = match[1] === 'binding-directory' ? 'bindingDirectory' : match[1];
        if (values[key] !== undefined) throw new Error();
        values[key] = match[2];
      }
    }
    const session = await startSession({ ...values, port: Number(values.port) });
    let closing = false;
    const close = async () => { if (closing) return; closing = true; await session.close(); };
    process.once('SIGTERM', close);
    process.once('SIGINT', close);
    process.stdout.write(JSON.stringify(session.receipt) + '\n');
  } catch { process.stderr.write('LOCAL_SMTP_CAPTURE_REFUSED\n'); process.exitCode = 1; }
}
