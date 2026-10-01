/**
 * Demo data, only when PSYDOSSIER_DEMO=1 (development). A real install starts empty
 * and asks for the first administrator account.
 */
import { CLINICAL_USERS, INITIAL_AUDIT_LOGS, INITIAL_DOSSIERS, INITIAL_REFERENCE_LISTS } from '../src/data/initialData';
import { db, transaction } from './db';
import { importAudit } from './audit';
import { createUserWithPassword, setOwner, usersExist } from './auth';
import { allDossiers, saveDossier } from './dossiers';

export const DEMO_PASSWORD = 'demo1234';

export function seedDemo() {
  transaction(() => {
    if (!usersExist()) {
      for (const u of CLINICAL_USERS) {
        createUserWithPassword({
          id: u.id,
          login: u.email.split('@')[0],
          name: u.name,
          role: u.role,
          title: u.title,
          service: u.service,
          password: DEMO_PASSWORD,
        });
      }
      setOwner('user-psy-1'); // Dr. Oumar Diallo: the doctor running this demo install
      console.log(`[demo] comptes créés (identifiant = partie locale de l’e-mail, mot de passe « ${DEMO_PASSWORD} »)`);
      for (const u of CLINICAL_USERS) console.log(`        ${u.role.padEnd(16)} ${u.email.split('@')[0]}`);
    }
    if (allDossiers().length === 0) {
      INITIAL_DOSSIERS.forEach(saveDossier);
      const hasAudit = (db.prepare('SELECT COUNT(*) AS n FROM audit_logs').get() as { n: number }).n > 0;
      if (!hasAudit) INITIAL_AUDIT_LOGS.forEach(importAudit);
    }
    const ref = db.prepare("SELECT 1 FROM settings WHERE key = 'referentiels'").get();
    if (!ref) {
      db.prepare("INSERT INTO settings (key, value) VALUES ('referentiels', ?)").run(JSON.stringify(INITIAL_REFERENCE_LISTS));
    }
  });
}
