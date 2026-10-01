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
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache');
const RELEASE = path.join(ROOT, 'release');
const OUT = path.join(RELEASE, 'PsyDossier');
const APP = path.join(OUT, 'app');
const NODE_MAJOR = 24;

const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
const crlf = (text) => text.replace(/\r?\n/g, '\r\n');

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement impossible : ${url} (${res.status})`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function getWindowsNode() {
  const index = await (await fetch('https://nodejs.org/dist/index.json')).json();
  const release = index.find((r) => r.version.startsWith(`v${NODE_MAJOR}.`) && r.files.includes('win-x64-zip'));
  if (!release) throw new Error(`Aucune version Node ${NODE_MAJOR} pour win-x64`);
  const { version } = release;
  const zipName = `node-${version}-win-x64.zip`;
  const zipPath = path.join(CACHE, zipName);
  const exePath = path.join(CACHE, `node-${version}-win-x64.exe`);

  fs.mkdirSync(CACHE, { recursive: true });
  if (!fs.existsSync(exePath)) {
    console.log(`→ Téléchargement de Node.js ${version} (win-x64)`);
    const base = `https://nodejs.org/dist/${version}`;
    const sums = await (await fetch(`${base}/SHASUMS256.txt`)).text();
    const expected = sums.split('\n').find((l) => l.endsWith(`  ${zipName}`))?.split(/\s+/)[0];
    if (!expected) throw new Error(`Somme de contrôle introuvable pour ${zipName}`);

    await download(`${base}/${zipName}`, zipPath);
    const actual = crypto.createHash('sha256').update(fs.readFileSync(zipPath)).digest('hex');
    if (actual !== expected) throw new Error(`Somme SHA-256 invalide pour ${zipName}`);

    execSync(`unzip -p "${zipPath}" "node-${version}-win-x64/node.exe" > "${exePath}"`);
    fs.rmSync(zipPath);
  }
  return { version, exePath };
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

PREMIER DÉMARRAGE — COMPTES
  1. Au premier lancement, créer le compte ADMINISTRATEUR (nom, identifiant,
     mot de passe de 8 caractères minimum).
  2. Menu « Utilisateurs & rôles » > « Nouveau compte » pour chaque membre
     du personnel (psychiatre, psychologue, infirmier, assistant social,
     secrétariat, lecteur). Un code d'activation est affiché : le remettre
     à la personne (valable 7 jours).
  3. La personne clique « Activer avec mon code » sur l'écran de connexion
     et choisit son mot de passe.
  - Un compte n'est jamais supprimé : il est désactivé (traçabilité).
  - Mot de passe oublié : l'administrateur clique sur la clé (« Nouveau code
    d'activation ») à côté du compte.
  - Les sessions se ferment après 30 minutes d'inactivité.

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
  3. Copier la sauvegarde voulue depuis data\\backups\\ vers data\\
     et la renommer en psydossier.db.
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
  execSync(`zip -qr "${zipPath}" PsyDossier`, { cwd: RELEASE });

  const mb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
  console.log(`\n✓ ${path.relative(ROOT, zipPath)} (${mb} Mo)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
