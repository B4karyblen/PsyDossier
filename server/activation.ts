/**
 * Activation of a licensed release on one computer.
 *
 * A release (LICENCE set) only opens once a valid activation key is entered. The key is
 * signed with the publisher's private key (scripts/licence.mjs) for this licence reference
 * and this computer's machine code; the release carries only the public key, so it can
 * verify a key but not forge one. A copied folder on another computer, or a key issued for
 * another computer or licence, is refused. Keys may expire (trial), or be permanent.
 *
 * Development builds (no LICENCE) need no activation.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DATA_DIR, db } from './db';
import { LICENCE } from './licence';
import { dayNumber, dayToISO, machineCodeFromRaw, parseKey, signedMessage } from './activation-format.mjs';

declare const __PSYDOSSIER_PUBLIC_KEY__: string | undefined;

const PUBLIC_KEY_PEM = typeof __PSYDOSSIER_PUBLIC_KEY__ === 'undefined' ? null : __PSYDOSSIER_PUBLIC_KEY__;
const KEY_FILE = path.join(DATA_DIR, 'activation.key');

export const ACTIVATION_REQUIRED = LICENCE !== null;

/** Stable per-installation id from the OS (Windows MachineGuid), hashed into the machine code. */
function rawMachineId(): string {
  try {
    if (process.platform === 'win32') {
      const reg = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'reg.exe');
      const out = execFileSync(reg, ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'], {
        encoding: 'utf8',
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const m = /MachineGuid\s+REG_SZ\s+(\S+)/i.exec(out);
      if (m) return m[1];
    } else if (process.platform === 'linux') {
      for (const f of ['/etc/machine-id', '/var/lib/dbus/machine-id']) {
        const id = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : '';
        if (id) return id;
      }
    } else if (process.platform === 'darwin') {
      const out = execFileSync('ioreg', ['-rd1', '-c', 'IOPlatformExpertDevice'], { encoding: 'utf8' });
      const m = /"IOPlatformUUID" = "([^"]+)"/.exec(out);
      if (m) return m[1];
    }
  } catch {
    // fall through
  }
  return `${os.hostname()}|${os.cpus()[0]?.model ?? ''}|${os.totalmem()}`;
}

export const MACHINE_CODE: string = machineCodeFromRaw(rawMachineId());

// The latest day this database has seen: turning the PC clock back does not extend a trial key.
const clock = {
  get: db.prepare("SELECT value FROM settings WHERE key = 'activation_clock'"),
  set: db.prepare(`
    INSERT INTO settings (key, value) VALUES ('activation_clock', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `),
};
let lastSeenDay = Number((clock.get.get() as { value: string } | undefined)?.value) || 0;

function today(): number {
  const day = dayNumber(Date.now());
  if (day > lastSeenDay) {
    lastSeenDay = day;
    clock.set.run(String(day));
  }
  return lastSeenDay;
}

const frenchDate = (day: number) =>
  new Date(`${dayToISO(day)}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

type Verified ={ ok: true; expiryDay: number } | { ok: false; error: string };

function verify(text: string): Verified {
  const parsed = parseKey(text);
  if (!parsed) return { ok: false, error: 'Clé illisible. Copiez-la en entier, sans rien ajouter.' };
  if (!LICENCE || !PUBLIC_KEY_PEM) return { ok: false, error: 'Cette version de PsyDossier ne peut pas être activée.' };
  const valid = crypto.verify(
    null,
    signedMessage(LICENCE.id, MACHINE_CODE, parsed.expiryDay),
    crypto.createPublicKey(PUBLIC_KEY_PEM),
    parsed.signature,
  );
  return valid
    ? { ok: true, expiryDay: parsed.expiryDay }
    : { ok: false, error: 'Cette clé n’a pas été émise pour ce poste ou pour cette licence.' };
}

/** expiryDay of the stored key (0 = permanent), or null if there is no valid key. */
let activeKey: { expiryDay: number } | null = null;
if (ACTIVATION_REQUIRED && fs.existsSync(KEY_FILE)) {
  const v = verify(fs.readFileSync(KEY_FILE, 'utf8'));
  if (v.ok) activeKey = { expiryDay: v.expiryDay };
  else console.warn(`  Clé d’activation refusée : ${v.error}`);
}

export interface ActivationInfo {
  required: boolean;
  /** The app may be used. */
  active: boolean;
  /** A trial key was entered and has expired. */
  expired: boolean;
  machineCode?: string;
  /** Last day of a trial key (YYYY-MM-DD), null for a permanent key. */
  expires?: string | null;
}

export function activationInfo(): ActivationInfo {
  if (!ACTIVATION_REQUIRED) return { required: false, active: true, expired: false };
  const expired = !!activeKey && activeKey.expiryDay !== 0 && today() > activeKey.expiryDay;
  return {
    required: true,
    active: !!activeKey && !expired,
    expired,
    machineCode: MACHINE_CODE,
    expires: activeKey && activeKey.expiryDay !== 0 ? dayToISO(activeKey.expiryDay) : null,
  };
}

export function activate(text: string): { ok: true } | { ok: false; error: string } {
  const v = verify(text);
  if (!v.ok) return v;
  if (v.expiryDay !== 0 && today() > v.expiryDay) {
    return { ok: false, error: `Cette clé d’essai a expiré le ${frenchDate(v.expiryDay)}.` };
  }
  if (activeKey?.expiryDay === 0 && v.expiryDay !== 0) {
    return { ok: false, error: 'PsyDossier est déjà activé définitivement sur ce poste.' };
  }
  fs.writeFileSync(KEY_FILE, text.trim() + '\n');
  activeKey = { expiryDay: v.expiryDay };
  console.log(`  PsyDossier activé${v.expiryDay ? ` jusqu’au ${frenchDate(v.expiryDay)}` : ' (définitif)'}.`);
  return { ok: true };
}
