/**
 * Builds a portable Windows release:
 *
 *   release/PsyDossier/
 *     Demarrer PsyDossier.bat   ← double-click to start
 *     LISEZMOI.txt
 *     app/node.exe              ← official Node.js runtime (win-x64)
 *     app/server.cjs            ← bundled local server
 *     app/dist/                 ← built frontend
 *     data/                     ← created on first start (psydossier.db, backups/)
 *
 *   release/PsyDossier-win-x64.zip
 */
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache');
const RELEASE = path.join(ROOT, 'release');
const OUT = path.join(RELEASE, 'PsyDossier');
const APP = path.join(OUT, 'app');
const NODE_MAJOR = 24;

const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
const crlf = (text) => text.replace(/\r?\n/g, '\r\n');

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement impossible : ${url} (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

async function getWindowsNode() {
  const index = await (await fetch('https://nodejs.org/dist/index.json')).json();
  const release = index.find((r) => r.version.startsWith(`v${NODE_MAJOR}.`) && r.files.includes('win-x64-exe'));
  if (!release) throw new Error(`Aucune version Node ${NODE_MAJOR} pour win-x64`);
  const { version } = release;
  const exePath = path.join(CACHE, `node-${version}-win-x64.exe`);

  fs.mkdirSync(CACHE, { recursive: true });
  if (!fs.existsSync(exePath)) {
    console.log(`→ Téléchargement de Node.js ${version} (win-x64)`);
    const base = `https://nodejs.org/dist/${version}`;
    const sums = (await download(`${base}/SHASUMS256.txt`)).toString();
    const expected = sums.split('\n').find((l) => l.endsWith('  win-x64/node.exe'))?.split(/\s+/)[0];
    if (!expected) throw new Error('Somme de contrôle introuvable pour win-x64/node.exe');

    const exe = await download(`${base}/win-x64/node.exe`);
    const actual = crypto.createHash('sha256').update(exe).digest('hex');
    if (actual !== expected) throw new Error('Somme SHA-256 invalide pour win-x64/node.exe');
    fs.writeFileSync(exePath, exe);
  }
  return { version, exePath };
}

// Minimal ZIP writer (deflate, no zip64), so packaging needs no `zip` tool and runs on Windows too.
function zipDirectory(srcDir, zipPath) {
  const base = path.dirname(srcDir);
  const files = fs
    .readdirSync(srcDir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => path.join(e.parentPath, e.name))
    .sort();

  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();

  const fd = fs.openSync(zipPath, 'w');
  const central = [];
  let offset = 0;
  const write = (buf) => {
    fs.writeSync(fd, buf);
    offset += buf.length;
  };

  for (const file of files) {
    const name = Buffer.from(path.relative(base, file).split(path.sep).join('/'));
    const data = fs.readFileSync(file);
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const stored = deflated.length >= data.length;
    const body = stored ? data : deflated;
    const crc = zlib.crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(stored ? 0 : 8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4); // version made by
    local.copy(header, 6, 4, 30); // shared fields: needed version … name length
    header.writeUInt32LE(offset, 42);
    central.push(header, name);

    write(local);
    write(name);
    write(body);
    if (offset > 0xffffffff) throw new Error('Archive trop volumineuse (> 4 Go)');
  }

  const cdOffset = offset;
  central.forEach(write);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(offset - cdOffset, 12);
  end.writeUInt32LE(cdOffset, 16);
  write(end);
  fs.closeSync(fd);
}

const LAUNCHER = `@echo off
chcp 65001 >nul
title PsyDossier
cd /d "%~dp0"
set "PSYDOSSIER_DATA=%~dp0data"
set "PSYDOSSIER_DIST=%~dp0app\\dist"
set "PSYDOSSIER_OPEN_BROWSER=1"
echo.
echo   Demarrage de PsyDossier...
"%~dp0app\\node.exe" --disable-warning=ExperimentalWarning "%~dp0app\\server.cjs"
echo.
echo   PsyDossier s'est arrete.
pause
`;

const README = (nodeVersion) => `PsyDossier — installation locale (Windows)
===========================================

INSTALLATION
  1. Copier le dossier « PsyDossier » où vous voulez (ex. C:\\PsyDossier).
     Ne le placez pas dans « Program Files » (droits d'écriture requis).
  2. Double-cliquer sur « Demarrer PsyDossier.bat ».
  3. Le navigateur s'ouvre sur http://127.0.0.1:3210

  Astuce : clic droit sur « Demarrer PsyDossier.bat » > Envoyer vers >
  Bureau (créer un raccourci).

PREMIER DÉMARRAGE
  1. Au premier lancement, créer votre compte : nom, identifiant et mot de
     passe (8 caractères minimum). Notez le mot de passe en lieu sûr :
     il ne peut pas être récupéré.
  2. Vous êtes le médecin titulaire : vous gérez aussi les listes (CIM-10,
     religions, ethnies…) et les sauvegardes.
  - La session se verrouille après 2 heures d'inactivité.
  - Plus tard, pour ajouter un(e) collaborateur(trice) (secrétariat,
    psychologue…) : Ctrl+K > « Gérer les comptes ». Un code d'activation
    lui permet de choisir son mot de passe.

SAUVEGARDE SUR CLÉ USB (au moins une fois par semaine)
  1. Brancher la clé USB.
  2. Menu « Sauvegarde » > « Télécharger la sauvegarde ».
  3. Enregistrer le fichier psydossier-sauvegarde-....db sur la clé.
  Un rappel s'affiche sur le tableau de bord si la dernière sauvegarde
  date de plus de 7 jours. Gardez la clé en lieu sûr : elle contient
  des données de santé non chiffrées.

UTILISATION
  - Laisser la fenêtre noire « PsyDossier » ouverte pendant l'utilisation.
  - La fermer arrête l'application. Les données sont déjà enregistrées.
  - Relancer le .bat alors que l'application tourne rouvre simplement le navigateur.

DONNÉES
  - Toutes les données sont dans : data\\psydossier.db
  - Une sauvegarde automatique est créée chaque jour dans data\\backups\\
    (30 derniers jours conservés).
  - Recommandé : copier régulièrement le dossier « data » sur un disque externe.

RESTAURER UNE SAUVEGARDE
  1. Fermer la fenêtre PsyDossier.
  2. Supprimer data\\psydossier.db, data\\psydossier.db-wal et data\\psydossier.db-shm
     s'ils existent.
  3. Copier la sauvegarde voulue (depuis la clé USB, ou depuis data\\backups\\)
     vers data\\ et la renommer en psydossier.db.
  4. Relancer « Demarrer PsyDossier.bat ».

MISE À JOUR
  Remplacer uniquement le dossier « app » et le fichier .bat.
  Ne jamais remplacer le dossier « data ».

SÉCURITÉ
  - L'application n'est accessible que depuis ce PC (127.0.0.1).
  - Chaque accès, modification (avec valeurs avant/après), export et
    connexion est inscrit dans un journal d'audit non modifiable.
  - Activer le chiffrement du disque (BitLocker) : les dossiers
    psychiatriques sont des données de santé sensibles.

Technique : Node.js ${nodeVersion} (inclus), base SQLite, aucun accès Internet requis.
`;

async function main() {
  console.log('→ Build du frontend');
  run('npx vite build');

  console.log('→ Préparation du dossier release');
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(APP, { recursive: true });

  console.log('→ Bundle du serveur');
  await build({
    entryPoints: [path.join(ROOT, 'server/index.ts')],
    outfile: path.join(APP, 'server.cjs'),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: `node${NODE_MAJOR}`,
    minify: true,
    legalComments: 'none',
    logLevel: 'warning',
  });

  fs.cpSync(path.join(ROOT, 'dist'), path.join(APP, 'dist'), { recursive: true });

  const { version, exePath } = await getWindowsNode();
  fs.copyFileSync(exePath, path.join(APP, 'node.exe'));

  fs.writeFileSync(path.join(OUT, 'Demarrer PsyDossier.bat'), crlf(LAUNCHER));
  fs.writeFileSync(path.join(OUT, 'LISEZMOI.txt'), '\ufeff' + crlf(README(version)));

  console.log('→ Archive zip');
  const zipPath = path.join(RELEASE, 'PsyDossier-win-x64.zip');
  fs.rmSync(zipPath, { force: true });
  zipDirectory(OUT, zipPath);

  const mb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
  console.log(`\n✓ ${path.relative(ROOT, zipPath)} (${mb} Mo)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
