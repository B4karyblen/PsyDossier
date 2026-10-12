/**
 * Publisher tool: activation keys for licensed releases. Run it on YOUR computer only.
 *
 *   npm run licence:init
 *     Once. Creates your signing key pair:
 *       ~/.psydossier/licence-private.pem   ← private key, stays on your PC, never in git
 *       licence/public-key.pem              ← public key, committed, built into each release
 *     Run again on a new clone to restore licence/public-key.pem from your private key.
 *
 *   npm run licence:key -- --ref PSD-2026-6K3T --machine ABCD-EFGH-JKLM-NPQR [--jours 30]
 *     Activation key for one client computer. The client reads the machine code on the
 *     activation screen of PsyDossier. --jours N gives a trial key valid N days; without it
 *     the key is permanent. Every key issued is logged in ~/.psydossier/cles-emises.csv.
 *
 * Losing the private key means no new key can be issued for releases already delivered:
 * keep a copy of ~/.psydossier on a USB key stored safely. Anyone holding it can activate
 * PsyDossier anywhere.
 *
 * Set PSYDOSSIER_KEYS to use another folder than ~/.psydossier.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { dayNumber, dayToISO, formatKey, normalizeMachineCode, parseKey, signedMessage } from '../server/activation-format.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const KEYS_DIR = path.resolve(process.env.PSYDOSSIER_KEYS || path.join(os.homedir(), '.psydossier'));
const PRIVATE_KEY = path.join(KEYS_DIR, 'licence-private.pem');
const LEDGER = path.join(KEYS_DIR, 'cles-emises.csv');
const PUBLIC_KEY =path.join(ROOT, 'licence', 'public-key.pem');

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

function init() {
  let privateKey;
  if (fs.existsSync(PRIVATE_KEY)) {
    privateKey = crypto.createPrivateKey(fs.readFileSync(PRIVATE_KEY));
    console.log(`→ Clé privée existante : ${PRIVATE_KEY}`);
  } else {
    const pair = crypto.generateKeyPairSync('ed25519');
    privateKey = pair.privateKey;
    fs.mkdirSync(KEYS_DIR, { recursive: true, mode: 0o700 });
    fs.writeFileSync(PRIVATE_KEY, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
    console.log(`✓ Clé privée créée : ${PRIVATE_KEY}`);
    console.log('  Gardez-en une copie sur une clé USB en lieu sûr. Ne la partagez jamais.');
  }
  const publicPem = crypto.createPublicKey(privateKey).export({ type: 'spki', format: 'pem' });
  fs.mkdirSync(path.dirname(PUBLIC_KEY), { recursive: true });
  fs.writeFileSync(PUBLIC_KEY, publicPem);
  console.log(`✓ Clé publique : ${path.relative(ROOT, PUBLIC_KEY)} (à committer)`);
}

function issue(args) {
  const { values } = parseArgs({
    args,
    options: { ref: { type: 'string' }, machine: { type: 'string' }, jours: { type: 'string' } },
  });
  const ref = values.ref?.trim();
  const machine = normalizeMachineCode(values.machine ?? '');
  if (!ref || !machine) {
    fail('Usage : npm run licence:key -- --ref PSD-2026-XXXX --machine XXXX-XXXX-XXXX-XXXX [--jours 30]');
  }
  let expiryDay = 0;
  if (values.jours !== undefined) {
    const days = Number(values.jours);
    if (!Number.isInteger(days) || days < 1 || days > 3650) fail('--jours doit être un nombre entier entre 1 et 3650.');
    expiryDay = dayNumber(Date.now()) + days;
  }
  if (!fs.existsSync(PRIVATE_KEY)) fail(`Clé privée introuvable (${PRIVATE_KEY}). Lancez d’abord : npm run licence:init`);

  const privateKey = crypto.createPrivateKey(fs.readFileSync(PRIVATE_KEY));
  const message = signedMessage(ref, machine, expiryDay);
  const key = formatKey(expiryDay, crypto.sign(null, message, privateKey));

  // Self-check against the public key shipped in releases.
  if (fs.existsSync(PUBLIC_KEY)) {
    const parsed = parseKey(key);
    const ok = crypto.verify(null, message, crypto.createPublicKey(fs.readFileSync(PUBLIC_KEY)), parsed.signature);
    if (!ok) fail(`${path.relative(ROOT, PUBLIC_KEY)} ne correspond pas à votre clé privée. Relancez npm run licence:init.`);
  }

  const record = path.join(ROOT, 'release', `PsyDossier-${ref}.json`);
  const holder = fs.existsSync(record) ? JSON.parse(fs.readFileSync(record, 'utf8')).holder : '';
  const validity = expiryDay ? `essai jusqu’au ${dayToISO(expiryDay)} inclus` : 'définitive';

  if (!fs.existsSync(LEDGER)) fs.writeFileSync(LEDGER, 'date;reference;titulaire;code machine;validite;cle\n');
  fs.appendFileSync(LEDGER, [new Date().toISOString(), ref, holder, machine, validity, key].join(';') + '\n');

  console.log('');
  console.log(`  Licence      ${ref}${holder ? ` — ${holder}` : ''}`);
  console.log(`  Poste        ${machine}`);
  console.log(`  Validité     ${validity}`);
  console.log('');
  console.log(`  Clé d’activation :`);
  console.log(`  ${key}`);
  console.log('');
}

const [command, ...rest] = process.argv.slice(2);
if (command === 'init') init();
else if (command === 'key') issue(rest);
else fail('Commandes : init | key');
