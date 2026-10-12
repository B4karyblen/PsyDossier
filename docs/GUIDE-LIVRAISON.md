# PsyDossier — Guide de livraison

**Pour : Aboubacar Togola, éditeur de PsyDossier**
**Premier client : Dr Amadou Maïga, Polyclinique de Kati, licence `PSD-2026-6K3T`**

Ce guide décrit, dans l'ordre, tout ce qu'il faut faire : de la préparation sur votre PC jusqu'à la clé définitive remise au docteur. Suivez les étapes une par une, sans en sauter.

---

## En bref

| # | Étape | Où | Fréquence | Durée |
|---|---|---|---|---|
| 1 | Récupérer la dernière version | Votre PC | Avant chaque livraison | 5 min |
| 2 | Créer vos clés de signature | Votre PC | **Une seule fois, pour toujours** | 2 min |
| 3 | Publier la clé publique | Votre PC | Une seule fois | 2 min |
| 4 | Fabriquer le zip du client | Votre PC | Une fois par client | 5 min |
| 5 | Répétition générale | Votre PC | Recommandé | 10 min |
| 6 | Installer et activer chez le docteur | PC du docteur | Jour de l'installation | ~2 h 30 |
| 7 | Clé définitive ou remboursement | À distance | Au 30ᵉ jour | 10 min |

> [!NOTE]
> **Le principe de l'activation, en deux phrases.** Votre PC détient une **clé privée** secrète qui fabrique les clés d'activation. PsyDossier ne contient que la **clé publique** : il peut vérifier une clé, mais jamais en fabriquer une.

---

## Avant de commencer

Sur **votre** PC, il vous faut :

- **Node.js 22.13 ou plus récent.** Vérifiez avec `node --version`. Si besoin, installez la version LTS depuis [nodejs.org](https://nodejs.org).
- **Git**, avec un accès au dépôt `B4karyblen/PsyDossier`.
- **Une connexion Internet**, la première fois seulement, pour `npm install` et pour télécharger le Node.js Windows embarqué dans le zip.
- **Deux clés USB :**
  - une pour livrer le zip au docteur ;
  - une **réservée** à la sauvegarde de votre clé privée. Rangez-la en lieu sûr, jamais dans le sac d'ordinateur.

> [!TIP]
> **Sous Windows, utilisez l'« Invite de commandes » (cmd), pas PowerShell.**
> PowerShell peut supprimer le `--` des commandes `npm run … -- …`, et les options ne sont alors pas transmises.
> Menu Démarrer → tapez `cmd` → Entrée, puis placez-vous dans le dossier du projet avec `cd C:\chemin\vers\PsyDossier`.

---

## Étape 1 — Récupérer la dernière version

```bat
cd C:\chemin\vers\PsyDossier
git checkout main
git pull
npm install
```

**Résultat attendu :** `npm install` se termine sans erreur et le dossier `node_modules` existe.

---

## Étape 2 — Créer vos clés de signature *(une seule fois, pour toujours)*

```bat
npm run licence:init
```

**Résultat attendu :**

```
✓ Clé privée créée : C:\Users\<vous>\.psydossier\licence-private.pem
  Gardez-en une copie sur une clé USB en lieu sûr. Ne la partagez jamais.
✓ Clé publique : licence/public-key.pem (à committer)
```

### Sauvegardez immédiatement la clé privée

1. Ouvrez l'Explorateur et tapez `%USERPROFILE%\.psydossier` dans la barre d'adresse.
2. Copiez **tout le dossier** `.psydossier` sur votre clé USB de sauvegarde.

> [!CAUTION]
> **La clé privée, c'est la clé de votre coffre.**
> - **Perdue** (PC volé, disque mort, Windows réinstallé) : vous ne pourrez plus jamais activer les clients déjà livrés avec cette clé.
> - **Volée** : n'importe qui pourra activer PsyDossier où il veut.
>
> Elle ne doit donc **jamais** aller sur GitHub, WhatsApp, un e-mail, Google Drive, ni être donnée à qui que ce soit, y compris à une IA.

> [!WARNING]
> **Ne relancez pas `licence:init` sur un autre PC sans y avoir d'abord restauré le dossier `.psydossier`.**
> Sinon, une nouvelle paire de clés est créée et les zips déjà livrés ne reconnaîtront plus vos clés.
> - Pour travailler depuis un autre ordinateur : copiez le dossier `.psydossier` de votre clé USB vers `C:\Users\<vous>\` sur cet ordinateur, puis lancez `npm run licence:init`.
> - Le script détecte alors la clé existante et ne fait que recréer la clé publique.

---

## Étape 3 — Publier la clé publique

La clé publique n'est pas secrète : elle doit être dans le dépôt pour être intégrée à chaque zip.

```bat
git add licence/public-key.pem
git commit -m "chore: add licence public key"
git push
```

**Vérification :** `git status` ne doit **jamais** afficher de fichier `licence-private.pem`. Le dépôt l'ignore de toute façon, par sécurité.

---

## Étape 4 — Fabriquer le zip du Dr Maïga

Gardez **exactement** la référence `PSD-2026-6K3T` : c'est celle du contrat.

```bat
npm run package:win -- --titulaire "Dr Amadou Maïga" --lieu "Polyclinique de Kati" --ref PSD-2026-6K3T
```

**Résultat attendu**, après une à deux minutes :

```
✓ release\PsyDossier-PSD-2026-6K3T.zip (… Mo)
  Fiche de licence à conserver : release\PsyDossier-PSD-2026-6K3T.json
```

| Fichier | Rôle | À faire |
|---|---|---|
| `release\PsyDossier-PSD-2026-6K3T.zip` | Le logiciel du docteur | Le copier sur la clé USB de livraison |
| `release\PsyDossier-PSD-2026-6K3T.json` | La fiche de licence et l'empreinte SHA-256 | La garder ; ne jamais la donner au client |

> [!IMPORTANT]
> **Mettez à jour l'annexe du contrat.**
> Le nouveau zip a une nouvelle empreinte SHA-256, différente de celle qui figure en page 7 du contrat.
> 1. Ouvrez le fichier `.json` et copiez la valeur `sha256`.
> 2. Envoyez-la-moi : je vous renvoie le contrat avec la bonne empreinte avant la signature.

---

## Étape 5 — Répétition générale sur votre PC *(recommandé)*

L'activation n'a pas encore été testée sur un vrai PC Windows. Dix minutes chez vous évitent une surprise chez le client.

1. **Décompressez le zip** dans un dossier de test, par exemple `C:\PsyDossier-test`.
2. **Lancez** `Demarrer PsyDossier.bat`. Le navigateur affiche l'écran **« Activer PsyDossier »** avec un code machine du type `ABCD-EFGH-JKLM-NPQR`.
3. **Générez une clé d'essai d'un jour** pour votre propre PC :
   ```bat
   npm run licence:key -- --ref PSD-2026-6K3T --machine ABCD-EFGH-JKLM-NPQR --jours 1
   ```
4. **Activez** : copiez la longue clé affichée, collez-la dans PsyDossier, puis cliquez sur **Activer**. L'écran « Bienvenue » s'affiche, avec le bandeau « Version d'essai » en haut.
5. **Nettoyez** : fermez la fenêtre noire, puis supprimez `C:\PsyDossier-test`.

> Si l'écran d'activation ne s'affiche pas, ou si la clé est refusée, **arrêtez-vous** et envoyez-moi une capture d'écran avant d'aller chez le docteur.

---

## Étape 6 — Le jour de l'installation chez le docteur

**À emporter :**
- **votre PC portable**, car c'est lui qui détient la clé privée ;
- la clé USB avec le zip ;
- le contrat imprimé en **deux exemplaires**.

### 6.1 Installer

1. **Débloquer.** Copiez le zip sur le PC du docteur. Faites un clic droit sur le zip → **Propriétés** → cochez **« Débloquer »** → **OK**.
2. **Décompresser.** Décompressez le zip et placez le dossier `PsyDossier` dans **`C:\PsyDossier`**.
   - Pas dans le Bureau ni dans Documents : ils sont souvent synchronisés par OneDrive.
   - Pas dans Program Files.
3. **Lancer.** Double-cliquez sur **`Demarrer PsyDossier.bat`**.
   - Si une fenêtre bleue « Windows a protégé votre ordinateur » apparaît : **Informations complémentaires** → **Exécuter quand même**.
4. **Créer un raccourci.** Clic droit sur le `.bat` → **Envoyer vers** → **Bureau (créer un raccourci)**.

### 6.2 Activer avec une clé d'essai

1. Notez le **code machine** affiché à l'écran.
2. Sur **votre** PC, générez la clé d'essai :
   ```bat
   npm run licence:key -- --ref PSD-2026-6K3T --machine XXXX-XXXX-XXXX-XXXX --jours 45
   ```
3. Transférez la clé sur le PC du docteur. Le plus simple : enregistrez-la dans un fichier `.txt` sur la clé USB. Vous pouvez aussi l'envoyer par e-mail.
4. Collez-la dans PsyDossier → **Activer**.

> [!IMPORTANT]
> **Pourquoi 45 jours et pas 30 ?**
> Le contrat prévoit 30 jours d'essai, puis jusqu'à 15 jours de retard de paiement avant que vous puissiez suspendre **l'assistance**. Le contrat ne prévoit pas de bloquer le logiciel pendant ces 15 jours. Avec 45 jours, l'application ne s'arrête jamais avant ce que le contrat autorise.
>
> Le contrat ne mentionne pas encore la clé d'essai. Je peux ajouter une phrase à l'article 6 avant la signature : dites-le-moi.

### 6.3 Créer le compte et assurer la prise en main *(environ 2 h, article 4 du contrat)*

- **Compte.** Le docteur crée **lui-même** son compte : nom, identifiant, mot de passe. Ne regardez pas son mot de passe. Conseillez-lui de le noter en lieu sûr : **il ne peut pas être récupéré**.
- **Prise en main.** Montrez-lui :
  - la création d'un patient et la saisie de quelques rubriques ;
  - la validation d'un dossier ;
  - l'export en PDF ;
  - la **première sauvegarde sur sa clé USB** (menu Sauvegarde).
- **Sécurité.** Conseillez-lui d'activer **BitLocker** sur son disque.

### 6.4 Les papiers

- Signez les deux exemplaires du contrat.
- Encaissez la **tranche I : 150 000 FCFA** et remplissez le reçu en page 6.

---

## Étape 7 — Au 30ᵉ jour

### Cas A — Le docteur est satisfait

1. Encaissez la **tranche II : 100 000 FCFA** et remplissez le second reçu.
2. Générez la **clé définitive**. C'est la même commande, avec le même code machine, mais **sans `--jours`** :
   ```bat
   npm run licence:key -- --ref PSD-2026-6K3T --machine XXXX-XXXX-XXXX-XXXX
   ```
   Le code machine est noté dans `%USERPROFILE%\.psydossier\cles-emises.csv`.
3. Envoyez la clé au docteur par e-mail.
4. Dans PsyDossier, il clique sur **« Saisir ma clé définitive »** dans le bandeau en haut, colle la clé, puis clique sur **Activer**. Le bandeau disparaît : c'est terminé.

### Cas B — Le docteur n'est pas satisfait *(article 6 du contrat)*

1. Il vous prévient **par écrit** avant la fin des 30 jours.
2. Vous lui remboursez les **150 000 FCFA** sous **7 jours**.
3. Aidez-le à garder ses données : sauvegarde complète sur clé USB et export PDF des dossiers utiles.
4. Il désinstalle le logiciel en supprimant `C:\PsyDossier`. Sans clé définitive, l'application se serait arrêtée d'elle-même à la fin de l'essai.

---

## Plus tard

### Mettre à jour le logiciel du docteur

1. Refaites l'étape 4 avec **la même référence** `--ref PSD-2026-6K3T`.
2. Chez le docteur, ne remplacez **que** le dossier `app` et le fichier `.bat`.
3. Ne touchez **jamais** au dossier `data` : il contient ses dossiers patients et son activation.

L'activation reste valable, aucune nouvelle clé n'est nécessaire.

### Le docteur change de PC ou réinstalle Windows

Le code machine change, il faut donc une nouvelle clé. Pendant les 12 mois d'assistance, c'est gratuit (article 3 du contrat).

1. Restaurez sa sauvegarde USB sur le nouveau PC.
2. Générez une clé définitive pour le **nouveau** code machine.

### Un nouveau client

1. Faites l'étape 4 **sans** `--ref` : une nouvelle référence est créée automatiquement.
   ```bat
   npm run package:win -- --titulaire "Dr Prénom Nom" --lieu "Nom du cabinet"
   ```
2. Notez la référence affichée. Elle sert pour son contrat et pour ses clés.

---

## Dépannage

| Message ou situation | Cause | Solution |
|---|---|---|
| `Clé publique de licence absente` | L'étape 2 ou 3 n'a pas été faite sur ce PC | `npm run licence:init` |
| `Clé privée introuvable` | Vous êtes sur un PC sans votre dossier `.psydossier` | Restaurez-le depuis la clé USB vers `C:\Users\<vous>\`, puis relancez la commande |
| `licence/public-key.pem ne correspond pas à votre clé privée` | Une autre paire de clés a été créée | `npm run licence:init`, puis vérifiez que vous utilisez bien la clé privée d'origine |
| Les options `--titulaire`… sont ignorées | La commande a été lancée dans PowerShell | Relancez-la dans l'Invite de commandes (cmd) |
| Chez le docteur : « Clé illisible » | La clé est incomplète | Recopiez la clé **en entier** |
| Chez le docteur : « Cette clé n'a pas été émise pour ce poste… » | Erreur dans le code machine ou dans la référence | Relisez le code machine à l'écran et vérifiez `--ref` |
| « Windows a protégé votre ordinateur » | Le logiciel n'est pas signé numériquement | Informations complémentaires → Exécuter quand même |
| Le navigateur ne s'ouvre pas | — | Ouvrez `http://127.0.0.1:3210` à la main |
| « Le port 3210 est utilisé par une autre application » | Un autre logiciel occupe ce port | Fermez cet autre logiciel, ou redémarrez le PC |

---

## Les règles d'or

1. **La clé privée ne quitte jamais votre PC**, sauf vers votre clé USB de sauvegarde.
2. **Le code source ne quitte jamais GitHub.** Le dépôt reste privé, et le client ne reçoit que le zip.
3. **Une référence par client**, toujours la même pour ses mises à jour.
4. **Chaque clé émise est notée** dans `cles-emises.csv`. Sauvegardez ce fichier avec la clé privée.
5. **Le dossier `data` du docteur est sacré** : ne jamais le remplacer ni le supprimer.

---

## Aide-mémoire

```bat
:: Une seule fois
npm run licence:init

:: Fabriquer le zip d'un client
npm run package:win -- --titulaire "Dr Amadou Maïga" --lieu "Polyclinique de Kati" --ref PSD-2026-6K3T

:: Clé d'essai (45 jours)
npm run licence:key -- --ref PSD-2026-6K3T --machine XXXX-XXXX-XXXX-XXXX --jours 45

:: Clé définitive
npm run licence:key -- --ref PSD-2026-6K3T --machine XXXX-XXXX-XXXX-XXXX
```

*Éditeur : Aboubacar Togola · +223 71 41 47 74*
