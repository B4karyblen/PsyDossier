# PRD — DOSSIER PATIENT EN PSYCHIATRIE (SaaS)

Source de vérité : « PLAN TYPE DE DOSSIER PATIENT EN PSYCHIATRIE » (17 rubriques).
Convention : `[NEEDS CLARIFICATION]` = non défini par la source. `[ASSUMPTION]` = interprétation, non exigence officielle. Tout ce qui n'est pas marqué est issu directement de la source.

---

## PARTIE A — VISION ET ARCHITECTURE PRODUIT

### A1. Produit
**Objet** : application web de constitution, consultation et suivi du dossier médical d'un patient en psychiatrie, structurée selon le plan type en 17 rubriques (identification → pronostic).
**Finalité** : standardiser l'observation psychiatrique, tracer le parcours du patient, permettre la continuité des soins.
**Contexte** : la source mentionne des représentations socio-culturelles (sorcellerie, envoûtement, djinn), une ethnie et une religion → contexte ouest-africain. [ASSUMPTION] Marché : Mali / Afrique de l'Ouest francophone. Langue de l'interface : français.
**Hors périmètre (non cité par la source)** : facturation, pharmacie/stock, rendez-vous, téléconsultation, portail patient. [NEEDS CLARIFICATION : à confirmer]

### A2. Types d'utilisateurs et rôles
La source ne définit aucun rôle. [ASSUMPTION] Rôles minimum :

| Rôle | Description |
|---|---|
| ADMIN | Configure la structure, les comptes, les listes |
| PSYCHIATRE | Médecin responsable : rédige tout le dossier, pose diagnostic, prescrit, valide |
| PSYCHOLOGUE | Renseigne rubriques 4–9, 10 (examen psychiatrique), psychothérapie ; pas de traitement médicamenteux |
| INFIRMIER | Renseigne identification, constantes, examen somatique (partiel), évolution |
| ASSISTANT_SOCIAL | Renseigne rubrique 8 (enquête sociale) et 7 (biographie) |
| SECRETARIAT | Crée l'identité (rubrique 1) et la modalité (2) uniquement |
| LECTEUR | Lecture seule (ex. médecin adresseur, audit) |

[NEEDS CLARIFICATION] Liste réelle des rôles, existence d'un chef de service, multi-établissements.

### A3. Hiérarchie produit
```
PRODUIT Dossier Patient Psychiatrie
├─ M0 Comptes, rôles, journal d'audit
├─ M1 Registre des patients (création, recherche, liste)
├─ M2 Dossier patient = 17 rubriques (sous-modules S1…S17)
│   ├─ Bloc ADMINISTRATIF   : S1 Identification, S2 Modalités de consultation
│   ├─ Bloc ANAMNÈSE        : S3 Motif, S4 Histoire de la maladie, S5 Représentation socio-culturelle
│   ├─ Bloc ANTÉCÉDENTS     : S6 Antécédents, S7 Biographie, S8 Enquête sociale, S9 Demande
│   ├─ Bloc CLINIQUE        : S10 Examen clinique (somatique + psychiatrique)
│   ├─ Bloc SYNTHÈSE        : S11 Résumé syndromique, S12 Hypothèses diagnostiques, S13 Bilans paracliniques
│   └─ Bloc PRISE EN CHARGE : S14 Prise en charge, S15 Évolution clinique, S16 Projet thérapeutique, S17 Pronostic
├─ M3 Export / impression du dossier
└─ M4 Recherche et tableau de bord
```

### A4. Cartographie des fonctionnalités
| ID | Fonctionnalité | Module |
|---|---|---|
| F-00 | Authentification et gestion des comptes/rôles | M0 |
| F-01 | Journal d'audit | M0 |
| F-02 | Créer un patient / dossier | M1 |
| F-03 | Rechercher / lister les patients | M1/M4 |
| F-04…F-20 | Rubriques S1…S17 (F-03+n) | M2 |
| F-21 | Verrouillage / validation du dossier | M2 |
| F-22 | Export PDF / impression | M3 |
| F-23 | Archivage / suppression logique | M1 |
| F-24 | Gestion des listes de valeurs | M0 |

> Numérotation : F-04 = S1, F-05 = S2, … F-20 = S17.

---

## PARTIE B — RÈGLES TRANSVERSALES

### B1. Règles métier (BR)
| ID | Règle |
|---|---|
| BR-001 | Un dossier est rattaché à un et un seul patient. Le « Numéro d'ordre » est unique, non modifiable après création. [ASSUMPTION : généré automatiquement, format à définir] |
| BR-002 | Nom et prénoms, âge (ou date de naissance), sexe sont obligatoires pour créer un dossier. [ASSUMPTION] |
| BR-003 | Le sexe conditionne l'affichage : « Gynéco-obstétricaux » (S6), « Ménarche » (S7) si Féminin ; « Spermarche » si Masculin. |
| BR-004 | Une modalité de consultation est obligatoire (S2) ; une seule valeur principale parmi : Libre / Adressé par un tiers / Soins sans consentement. |
| BR-005 | Si « Soins sans consentement » : sous-type obligatoire : « À la demande d'un tiers » ou « À la demande d'un représentant de l'État ». |
| BR-006 | Si « Adressé par un tiers » : préciser qui (médecin traitant, autre). |
| BR-007 | « Mode d'installation » (S4) = Brutal ou Progressif (exclusif). |
| BR-008 | « Facteurs déclenchants » (S4) = choix multiple : stress, deuil, rupture sentimentale, échec, perte d'emploi, autre (+ précision libre si « autre »). |
| BR-009 | « Orientation » (S14) = Ambulatoire ou Hospitalisation (exclusif). |
| BR-010 | Le pronostic comporte trois horizons distincts : court, moyen, long terme. |
| BR-011 | Les rubriques 6 (antécédents personnels et familiaux) : familiaux n'ont pas de sous-rubrique « Judiciaires » ni « Gynéco-obstétricaux » (conforme à la source). |
| BR-012 | Toute modification d'un champ après enregistrement est tracée (auteur, date/heure, ancienne/nouvelle valeur). [ASSUMPTION, exigé par la nature médicale] |
| BR-013 | Un dossier « Validé/Clôturé » n'est plus modifiable ; toute correction passe par un addendum daté. [ASSUMPTION] |
| BR-014 | Seuls PSYCHIATRE peut renseigner S12 (diagnostic) et S14 (traitement médicamenteux). [ASSUMPTION] |
| BR-015 | L'évolution clinique (S15) est un journal d'entrées datées, jamais écrasées. [ASSUMPTION : la source ne précise pas la nature chronologique] |
| BR-016 | Les données de santé mentale (religion, ethnie, antécédents judiciaires, addictions, sexualité) sont des données sensibles : accès restreint aux rôles cliniques, chaque consultation du dossier est journalisée. [ASSUMPTION] |
| BR-017 | Aucune suppression physique d'un dossier par un utilisateur ; archivage logique uniquement. [ASSUMPTION] |

### B2. Matrice de permissions [ASSUMPTION]
C=créer, L=lire, M=modifier, V=valider, X=aucun accès

| Rubrique | ADMIN | PSYCHIATRE | PSYCHOLOGUE | INFIRMIER | ASS. SOCIAL | SECRÉTARIAT | LECTEUR |
|---|---|---|---|---|---|---|---|
| S1 Identification | L | C/L/M | L | C/L/M | L | C/L/M | L |
| S2 Modalités | L | C/L/M | L | L | L | C/L/M | L |
| S3–S5 | X | C/L/M | C/L/M | L | L | X | L |
| S6 Antécédents | X | C/L/M | C/L/M | C/L/M | L | X | L |
| S7 Biographie | X | C/L/M | C/L/M | L | C/L/M | X | L |
| S8 Enquête sociale | X | C/L/M | C/L/M | L | C/L/M | X | L |
| S9 Demande | X | C/L/M | C/L/M | L | L | X | L |
| S10 Somatique | X | C/L/M | L | C/L/M | L | X | L |
| S10 Psychiatrique | X | C/L/M | C/L/M | L | L | X | L |
| S11 Résumé syndromique | X | C/L/M | L | L | L | X | L |
| S12 Hypothèses diag. | X | C/L/M | L | L | X | X | L |
| S13 Bilans | X | C/L/M | L | C/L/M (saisie résultats) | X | X | L |
| S14 Prise en charge | X | C/L/M | L (psychothérapie : C/L/M) | L | X | X | L |
| S15 Évolution | X | C/L/M | C/L/M | C/L/M | C/L | X | L |
| S16 Projet thérapeutique | X | C/L/M/V | C/L/M | L | L | X | L |
| S17 Pronostic | X | C/L/M | L | X | X | X | L |
| Valider dossier | X | V | X | X | X | X | X |
| Archiver | ✔ | ✔ (demande) | X | X | X | X | X |
| Config. listes / comptes | ✔ | X | X | X | X | X | X |

Règle de propriété : un patient est suivi par un PSYCHIATRE référent [ASSUMPTION] ; les autres rôles voient les dossiers de leur établissement. [NEEDS CLARIFICATION : visibilité inter-services]

### B3. États et transitions du dossier [ASSUMPTION]
```
BROUILLON → EN_COURS → VALIDÉ → ARCHIVÉ
                 ↑         │
                 └─ Addendum (dossier reste VALIDÉ, addendum ajouté)
```
| Transition | Déclencheur | Acteur | Préconditions | Résultat | Échec |
|---|---|---|---|---|---|
| Ø → BROUILLON | Création patient | Secrétariat / Infirmier / Psychiatre | S1 obligatoires remplis | Dossier + n° d'ordre créés | Message d'erreur champ par champ |
| BROUILLON → EN_COURS | Enregistrement S2 (modalité) + S3 (motif) | Psychiatre | S1, S2, S3 présents | Dossier actif | Blocage + liste des champs manquants |
| EN_COURS → VALIDÉ | « Valider le dossier » | Psychiatre | S3, S10, S11, S12, S14 renseignés | Verrouillage, horodatage, signataire | Message listant rubriques manquantes |
| VALIDÉ → ARCHIVÉ | « Archiver » | Admin (sur demande psychiatre) | Confirmation | Lecture seule, masqué des listes actives | Refus si nouvelle consultation en cours |
| ARCHIVÉ → EN_COURS | « Réactiver » | Psychiatre | Motif saisi | Dossier rouvert, tracé | — |
Transitions invalides : VALIDÉ → BROUILLON ; BROUILLON → ARCHIVÉ ; tout saut d'état. Réponse : refus et message explicite.

**Statut par rubrique** : Non commencée / Partielle / Complète (calculé sur les champs obligatoires). [ASSUMPTION]

### B4. Comportements UI communs
- Navigation : fiche patient avec bandeau fixe (n° d'ordre, nom, âge, sexe, statut) + menu latéral des 17 rubriques avec indicateur de complétude.
- Chaque rubrique : formulaire, boutons « Enregistrer » et « Annuler », enregistrement partiel autorisé (sauf S1/S2).
- États : chargement (squelette), vide (« Non renseigné » + bouton « Renseigner »), erreur (message + réessayer), succès (toast).
- Modale de confirmation avant : annulation avec saisie non enregistrée, validation, archivage.
- Liste patients : recherche (nom, prénoms, n° d'ordre), filtres (sexe, modalité, orientation, statut, tranche d'âge), tri (nom, date de création, dernière mise à jour), pagination.
- Erreurs réseau : conservation locale du brouillon de saisie et message « Enregistrement échoué, réessayer ». [ASSUMPTION]
- Concurrence : si deux utilisateurs modifient la même rubrique, le second reçoit un avertissement de conflit et doit recharger. [ASSUMPTION]

### B5. Cas limites communs
| Cas | Comportement |
|---|---|
| Patient sans identité connue (urgence, inconscient) | [NEEDS CLARIFICATION] Dossier « Identité inconnue » ? |
| Doublon (même nom + âge + adresse) | Avertissement à la création, choix « Ouvrir le dossier existant » ou « Créer quand même ». [ASSUMPTION] |
| Âge vs date de naissance | Source : « Âge ». [NEEDS CLARIFICATION] Âge saisi ou calculé ? |
| Patient mineur | [NEEDS CLARIFICATION] Représentant légal, champs supplémentaires |
| Champ obligatoire vide | Blocage de l'enregistrement, message par champ |
| Utilisateur non autorisé | Rubrique masquée ou en lecture seule ; action refusée, tentative journalisée |
| Session expirée | Redirection connexion, brouillon préservé |
| Dossier archivé consulté | Bannière « Archivé », aucun bouton d'édition |
| Données sensibles à l'export | Export réservé aux rôles cliniques, journalisé |
| Langue / termes locaux | Champs textuels libres en Unicode (noms, expressions locales) |

---

## PARTIE C — PRD PAR FONCTIONNALITÉ

> Format : Contexte / Objectif / Acteurs / Préconditions / Entrée / Champs / Flux / Actions→Système / Règles / Cas limites / Critères d'acceptation (GIVEN/WHEN/THEN).
> Acteurs et préconditions communs à S1–S17 : voir B2 ; préconditions : dossier existant, utilisateur connecté, non archivé. Entrée : fiche patient → menu latéral → rubrique.

### F-00 Authentification et comptes
**Contexte** : protéger des données de santé mentale. **Objectif** : accès nominatif par rôle. **Acteurs** : Admin. 
**Flux** : Admin crée un compte (nom, email/identifiant, rôle) → l'utilisateur définit son mot de passe → se connecte → voit uniquement ce que son rôle permet.
**Règles** : compte désactivable, jamais supprimé (traçabilité). [ASSUMPTION : méthode d'authentification, MFA : NEEDS CLARIFICATION]
**Critères** : GIVEN un utilisateur INFIRMIER, WHEN il ouvre S12, THEN la rubrique est en lecture seule/masquée et aucune modification n'est possible. GIVEN un compte désactivé, WHEN il tente de se connecter, THEN l'accès est refusé.

### F-01 Journal d'audit
**Objectif** : traçabilité (BR-012, BR-016). **Contenu** : utilisateur, action (lecture, création, modification, validation, export, archivage), rubrique, patient, date/heure, valeurs avant/après.
**Critères** : GIVEN un utilisateur ouvre un dossier, WHEN la page s'affiche, THEN une entrée « lecture » est créée. GIVEN une modification de S4, THEN l'ancienne et la nouvelle valeur sont consultables par l'Admin/Psychiatre. Le journal n'est ni modifiable ni supprimable.

### F-02 Création d'un patient et de son dossier
**Objectif** : ouvrir un dossier. **Entrée** : liste patients → « Nouveau patient ». **Flux** : formulaire S1 → validation → système génère le n° d'ordre → dossier BROUILLON → redirection vers S2.
**Actions→système** : clic « Créer » → validation obligatoires + contrôle doublon → création entité Patient + Dossier → statut BROUILLON → toast succès.
**Critères** : GIVEN S1 complète, WHEN « Créer », THEN dossier BROUILLON avec n° d'ordre unique créé. GIVEN doublon probable, THEN avertissement affiché avant création.

### F-03 Liste et recherche
**Affichage** : tableau (n° d'ordre, nom et prénoms, âge, sexe, modalité, orientation, statut, dernière mise à jour). Filtres/tri/pagination (B4). Vide : « Aucun patient » + bouton créer.
**Critères** : GIVEN 100 patients, WHEN recherche « Traoré », THEN seuls les patients correspondants s'affichent, insensible à la casse et aux accents.

### F-04 (S1) Identification du patient
**Champs** : Numéro d'ordre (auto, lecture seule), Nom et prénoms*, Âge*, Sexe*, Profession, Situation matrimoniale, Religion, Ethnie, Adresse.
Listes : Sexe = Masculin/Féminin [NEEDS CLARIFICATION : autres valeurs] ; Situation matrimoniale = célibataire, marié(e), divorcé(e), veuf/veuve, union libre [ASSUMPTION] ; Religion, Ethnie : liste paramétrable + « Autre » [ASSUMPTION].
**Règles** : BR-001, BR-002, BR-003, BR-016.
**Critères** : GIVEN nom vide, WHEN « Enregistrer », THEN erreur « Nom obligatoire » et aucun enregistrement. GIVEN sexe modifié après saisie de S6/S7, THEN avertissement de cohérence des champs dépendants.

### F-05 (S2) Modalités de consultation
**Champs** : Modalité (radio) : Libre (à la demande du patient) / Adressé par un tiers (médecin traitant, autres) / Soins sans consentement (À la demande d'un tiers ; À la demande d'un représentant de l'État).
**Règles** : BR-004, BR-005, BR-006.
**Détails manquants** : [NEEDS CLARIFICATION] identité/coordonnées du tiers, documents légaux (certificats, décisions), dates, durée, cadre juridique local.
**Critères** : GIVEN « Soins sans consentement » sélectionné, WHEN sous-type absent, THEN enregistrement bloqué. GIVEN « Libre », THEN aucun champ tiers n'est demandé.

### F-06 (S3) Motif de consultation actuel
**Champs** : Plainte principale (texte long)*, Source de la plainte : patient / entourage / les deux [ASSUMPTION, la source dit « formulée par le patient ou l'entourage »].
**Critères** : GIVEN motif vide, WHEN passage à EN_COURS, THEN refus. GIVEN saisie longue, THEN aucun texte n'est tronqué.

### F-07 (S4) Histoire de la maladie (anamnèse)
**Champs** : Date de début ; Mode d'installation (Brutal/Progressif) ; Facteurs déclenchants (multi : stress, deuil, rupture sentimentale, échec, perte d'emploi, autre + précision) ; Facteurs aggravants (texte) ; Itinéraire thérapeutique (texte ; [ASSUMPTION] liste de structures/thérapeutes consultés avec ordre chronologique) ; Évolution avec traitement / sans traitement (deux textes) ; Retentissement socio-professionnel (texte).
**Règles** : BR-007, BR-008. Date de début : [NEEDS CLARIFICATION] précision acceptée (année seule, mois/année ?).
**Critères** : GIVEN facteur « autre » coché, WHEN précision vide, THEN erreur. GIVEN date de début future, THEN refus.

### F-08 (S5) Représentation socio-culturelle de la maladie
**Champs** : Explication perçue par le patient ; Explication perçue par la famille [ASSUMPTION] ; Catégories : sorcellerie, envoûtement, djinn, autre [source : « etc. »] ; Précisions (texte).
**Règles** : rubrique descriptive, sans jugement clinique automatique. Multi-choix + texte libre.
**Critères** : GIVEN « Djinn » coché, THEN l'information est enregistrée et affichée dans le dossier et l'export.

### F-09 (S6) Antécédents
**Personnels** : Médicaux ; Chirurgicaux ; Gynéco-obstétricaux (si sexe Féminin, BR-003) ; Psychiatriques ; Addictifs ; Judiciaires.
**Familiaux** : Médicaux ; Chirurgicaux ; Psychiatriques ; Addictifs.
Chaque sous-rubrique : texte libre + case « Aucun antécédent connu » ; [ASSUMPTION] entrées multiples datées.
**Règles** : BR-003, BR-011. La case « Aucun » exclut la saisie de texte (et inversement).
**Critères** : GIVEN patient masculin, THEN Gynéco-obstétricaux masqué. GIVEN « Aucun » coché, WHEN texte saisi, THEN la case se décoche ou l'action est refusée avec message.

### F-10 (S7) Éléments de biographie
**Sections** : 
1. Ascendants : Père (identification), Mère (identification).
2. Collatéraux : place dans la fratrie utérine ; nombre de frères et sœurs ; identification de chaque frère/sœur (liste répétable).
3. Conception, grossesse et accouchement du patient.
4. Développement psychomoteur.
5. Scolarité : début ; niveau atteint ; diplômes ; échecs ; vécu des échecs.
6. Développement ultérieur et parcours professionnel.
7. Développement sexuel et adaptation sentimentale : ménarche/spermarche (selon sexe) ; premier rapport (conditions, vécu) ; principales relations amoureuses ; conjoint(e)s (liste répétable) ; enfants (nombre + identification, liste répétable).
8. Événements marquants : Positifs (liste) ; Négatifs (liste).
« Identification » : [NEEDS CLARIFICATION] champs exacts (nom, âge, profession, vivant/décédé ?). [ASSUMPTION] nom, âge, profession, statut vital.
**Règles** : BR-003 ; nombre de frères/sœurs cohérent avec la liste (avertissement non bloquant).
**Critères** : GIVEN patient féminin, THEN « Ménarche » affichée et « Spermarche » masquée. GIVEN 3 frères/sœurs déclarés et 2 identifiés, THEN avertissement non bloquant.

### F-11 (S8) Enquête sociale
**Champs** : Autodescription ; Hétérodescription (par qui : [ASSUMPTION] champ « source ») ; Relations sociales ; Loisirs ; Conduites addictives (substance, fréquence [ASSUMPTION]).
**Critères** : GIVEN saisie partielle, WHEN enregistrer, THEN rubrique « Partielle ». 

### F-12 (S9) Demande du patient
**Champs** : Demande consciente ; Demande inconsciente (texte, interprétation clinique).
**Règles** : « Demande inconsciente » réservée aux rôles PSYCHIATRE/PSYCHOLOGUE. [ASSUMPTION]
**Critères** : GIVEN INFIRMIER, THEN « Demande inconsciente » non modifiable.

### F-13 (S10) Examen clinique
**A. Examen somatique** : Constantes : température, tension artérielle, pouls, fréquence respiratoire, saturation ; État général ; Examen des appareils (texte, liste d'appareils : [NEEDS CLARIFICATION]).
Validation : valeurs numériques, unités (°C, mmHg, bpm, cycles/min, %). [ASSUMPTION] plages d'alerte (non bloquant) ; TA en deux valeurs (systolique/diastolique).
**B. Examen psychiatrique** :
- Présentation générale : tenue vestimentaire et hygiène ; mimique ; contact ; psychomotricité/comportement.
- Conduites (texte).
- Fonctions supérieures : symboliques ; mnésiques ; fonctionnement de la pensée et du jugement ; activités perceptives ; conscience de soi et de l'environnement ; expression des affects.
Chaque item : texte libre. [ASSUMPTION] listes de suggestions pour saisie rapide, non imposées.
**Critères** : GIVEN saturation = 105, THEN erreur (max 100 %). GIVEN valeur hors norme plausible, THEN alerte visuelle sans blocage. [NEEDS CLARIFICATION] : bornes.
**Cas limites** : patient non coopérant / constantes impossibles → case « Non réalisé » + motif.

### F-14 (S11) Résumé syndromique
**Champs** : Résumé (texte long)* ; [ASSUMPTION] liste de syndromes (paramétrable) en complément.
**Critère** : GIVEN S11 vide, WHEN validation dossier, THEN refus.

### F-15 (S12) Hypothèses diagnostiques
**Champs** : liste ordonnée d'hypothèses ; chacune : libellé (texte ; [NEEDS CLARIFICATION] nomenclature CIM-10/11 ou DSM-5 ?), niveau (principale / différentielle) [ASSUMPTION], commentaire.
**Règles** : BR-014 ; au moins une hypothèse pour valider. 
**Critères** : GIVEN PSYCHOLOGUE, THEN lecture seule. GIVEN plusieurs hypothèses, THEN une seule « principale ».

### F-16 (S13) Bilans paracliniques
**Champs** : liste de bilans : type, date de prescription, statut (Prescrit / Réalisé / Résultat reçu) [ASSUMPTION], résultat (texte), [ASSUMPTION] pièce jointe (PDF/image).
Source : aucun type de bilan précisé. [NEEDS CLARIFICATION]
**Critères** : GIVEN un bilan « Prescrit », WHEN résultat saisi, THEN statut « Résultat reçu ».

### F-17 (S14) Prise en charge
**Champs** : Orientation (Ambulatoire / Hospitalisation) ; Traitement médicamenteux (liste : molécule, dose, voie, fréquence, début, fin [ASSUMPTION]) ; Psychothérapie (type, fréquence, thérapeute [ASSUMPTION]).
Si Hospitalisation : [NEEDS CLARIFICATION] service, lit, dates d'entrée/sortie.
**Règles** : BR-009, BR-014. Prescription : pas d'interaction médicamenteuse automatique (hors périmètre sauf clarification).
**Critères** : GIVEN orientation absente, WHEN validation, THEN refus. GIVEN INFIRMIER, THEN traitement médicamenteux non modifiable.

### F-18 (S15) Évolution clinique
**Modèle** : journal d'entrées (date/heure, auteur, texte) ; ajout seulement, pas d'écrasement (BR-015). Correction = nouvelle entrée « rectificative ».
Affichage : ordre antéchronologique, filtre par auteur/période, pagination.
**Critères** : GIVEN une entrée existante, WHEN un utilisateur veut la modifier, THEN il ajoute un addendum ; l'original reste visible.

### F-19 (S16) Projet thérapeutique
**Champs** : objectifs, moyens, échéances, intervenants [ASSUMPTION : la source ne détaille pas], date de révision. Versionné.
**Critères** : GIVEN modification, THEN une nouvelle version est créée et l'ancienne consultable.

### F-20 (S17) Pronostic
**Champs** : Court terme, Moyen terme, Long terme (texte, ou niveau + texte [ASSUMPTION]). Définition des horizons (durées) : [NEEDS CLARIFICATION].
**Critère** : GIVEN un horizon vide, WHEN validation, THEN avertissement non bloquant. [ASSUMPTION]

### F-21 Validation / verrouillage
**Flux** : Psychiatre clique « Valider » → système vérifie B3 → modale de confirmation → statut VALIDÉ, horodatage et signataire enregistrés → rubriques verrouillées → addenda possibles.
**Critères** : GIVEN rubriques manquantes, WHEN « Valider », THEN liste des manquants affichée, statut inchangé. GIVEN VALIDÉ, WHEN tentative de modification, THEN champs non éditables, option « Ajouter un addendum ».

### F-22 Export / impression
**Flux** : « Exporter » → choix des rubriques (par défaut : toutes) → génération PDF avec en-tête (n° d'ordre, date, auteur) → téléchargement → action journalisée.
**Règles** : rôles cliniques uniquement ; filigrane « Confidentiel » [ASSUMPTION].
**Critères** : GIVEN dossier avec S5 renseignée, THEN le PDF contient S5. GIVEN rôle SECRÉTARIAT, THEN export refusé.

### F-23 Archivage
Voir B3. **Critère** : GIVEN dossier ARCHIVÉ, THEN absent de la liste par défaut, présent avec le filtre « Archivés ».

### F-24 Listes de valeurs
Admin gère les listes : religion, ethnie, situation matrimoniale, types de bilans, syndromes. Ajout, désactivation (pas de suppression si utilisée).
**Critère** : GIVEN valeur utilisée, WHEN suppression, THEN refus, désactivation proposée.

---

## PARTIE D — ENTITÉS DE DONNÉES (niveau produit)

| Entité | Rôle | Champs clés | Créée par | Dépend de |
|---|---|---|---|---|
| Utilisateur | Compte | nom, identifiant, rôle, actif | Admin | — |
| Patient | Identité (S1) | n° d'ordre, nom et prénoms, âge, sexe, profession, situation matrimoniale, religion, ethnie, adresse | F-02 | — |
| Dossier | Conteneur, statut | patient, statut, psychiatre référent, dates | F-02 | Patient |
| ModaliteConsultation | S2 | type, sous-type, tiers | Psychiatre | Dossier |
| Anamnese | S3–S5 | motif, date début, mode, facteurs, itinéraire, évolution, retentissement, représentation | Clinicien | Dossier |
| Antecedent | S6 | catégorie (personnel/familial), type, texte | Clinicien | Dossier |
| Biographie / Proche | S7 | ascendants, fratrie, scolarité, événements… | Clinicien | Dossier |
| EnqueteSociale | S8 | autodescription, hétérodescription, relations, loisirs, addictions | Clinicien | Dossier |
| Demande | S9 | consciente, inconsciente | Clinicien | Dossier |
| ExamenSomatique | S10A | constantes, état général, appareils | Infirmier/Psychiatre | Dossier |
| ExamenPsychiatrique | S10B | items de présentation, conduites, fonctions | Psychiatre/Psychologue | Dossier |
| Synthese | S11–S12 | résumé, hypothèses | Psychiatre | Dossier |
| Bilan | S13 | type, date, statut, résultat | Psychiatre/Infirmier | Dossier |
| PriseEnCharge | S14 | orientation, traitements, psychothérapie | Psychiatre | Dossier |
| EntreeEvolution | S15 | date, auteur, texte | Clinicien | Dossier |
| ProjetTherapeutique | S16 | objectifs, moyens, version | Psychiatre | Dossier |
| Pronostic | S17 | court, moyen, long | Psychiatre | Dossier |
| JournalAudit | Traçabilité | qui, quoi, quand, avant/après | Système | Tous |
| ListeValeurs | Référentiels | catégorie, valeur, actif | Admin | — |

Archivage : Dossier et entités enfants suivent le dossier ; pas de suppression physique (BR-017).

---

## PARTIE E — DÉPENDANCES ET ORDRE DE RÉALISATION

### E1. Carte des dépendances
- M0 (comptes/rôles/audit/listes) ← prérequis de tout.
- M1 Patient/Dossier (F-02, F-04) ← prérequis de S2–S17.
- S1 (sexe) → conditionne S6 et S7 (BR-003).
- S2, S3 → conditionnent le passage EN_COURS.
- S10–S12, S14 → conditionnent la validation (F-21).
- F-21 → conditionne F-22 (export « final ») et F-23.
- F-01 (audit) transversal : doit exister avant toute saisie clinique réelle.
- S15 dépend de S14 (suivi de la prise en charge).

### E2. Phases (ordre de dépendance produit)
| Phase | Contenu |
|---|---|
| 1 Fondations | F-00, F-01, F-24, matrice de permissions, modèle d'états |
| 2 Noyau | F-02, F-03, F-04 (S1), F-05 (S2), dossier et statuts |
| 3 Anamnèse et antécédents | F-06 à F-12 (S3–S9) |
| 4 Clinique et synthèse | F-13 à F-16 (S10–S13) |
| 5 Prise en charge et suivi | F-17 à F-20 (S14–S17) |
| 6 Cycle de vie | F-21 validation, addenda, F-23 archivage |
| 7 Sorties | F-22 export/impression, tableau de bord |
| 8 Finitions | cas limites B5, conflits de saisie, performance, accessibilité, messages |

---

## PARTIE F — CODING AI PRODUCT HANDOFF

**Produit** : application web de dossier patient psychiatrique structuré en 17 rubriques, utilisée par des équipes cliniques (psychiatre, psychologue, infirmier, assistant social) et administratives.
**Modules** : M0 Comptes/rôles/audit ; M1 Registre patients ; M2 Dossier (S1–S17) ; M3 Export ; M4 Recherche/tableau de bord.
**Workflow central** : créer patient (S1) → modalité (S2) → anamnèse (S3–S5) → antécédents/biographie/social/demande (S6–S9) → examen (S10) → synthèse (S11–S13) → prise en charge/suivi (S14–S17) → validation → archivage.
**Règles à ne jamais enfreindre** : BR-001 à BR-017, surtout BR-003 (champs conditionnés au sexe), BR-005 (sans consentement → sous-type obligatoire), BR-012/013 (traçabilité, verrouillage), BR-014 (droits médicaux), BR-016 (confidentialité).
**États** : BROUILLON, EN_COURS, VALIDÉ, ARCHIVÉ (B3) ; complétude par rubrique.
**Permissions** : B2.
**Ordre** : E2.
**Consignes** : implémenter exactement la structure de la source ; ne pas ajouter de champs cliniques absents sans marqueur ; traiter tous les `[ASSUMPTION]` comme modifiables ; ne pas implémenter les `[NEEDS CLARIFICATION]` sans réponse du porteur de projet (utiliser un texte libre neutre en attendant).

### Checklist de livraison (extrait des critères d'acceptation)
- [ ] F-00 Rôles et accès conformes à B2
- [ ] F-01 Journal d'audit immuable (lecture, écriture, export)
- [ ] F-02 Création patient, n° d'ordre unique, contrôle doublon
- [ ] F-03 Recherche, filtres, tri, pagination
- [ ] F-04 S1 : champs obligatoires, dépendances sexe
- [ ] F-05 S2 : modalité, sous-type sans consentement
- [ ] F-06 S3 : motif obligatoire
- [ ] F-07 S4 : mode, facteurs multi, « autre » précisé, date non future
- [ ] F-08 S5 : catégories sorcellerie/envoûtement/djinn/autre
- [ ] F-09 S6 : antécédents personnels/familiaux, gynéco conditionné, « Aucun »
- [ ] F-10 S7 : 8 sections biographiques, listes répétables
- [ ] F-11 S8 : enquête sociale
- [ ] F-12 S9 : demande consciente/inconsciente, restriction de rôle
- [ ] F-13 S10 : constantes validées, examen psychiatrique complet, « Non réalisé »
- [ ] F-14 S11 : résumé syndromique obligatoire à la validation
- [ ] F-15 S12 : hypothèses, une principale, droits psychiatre
- [ ] F-16 S13 : bilans et statuts
- [ ] F-17 S14 : orientation exclusive, traitements, psychothérapie
- [ ] F-18 S15 : journal en ajout seul
- [ ] F-19 S16 : projet versionné
- [ ] F-20 S17 : pronostic court/moyen/long
- [ ] F-21 Validation et verrouillage, addenda
- [ ] F-22 Export PDF contrôlé et journalisé
- [ ] F-23 Archivage / réactivation
- [ ] F-24 Listes de valeurs administrables

---

## PARTIE G — AUDIT QUALITÉ

**Points non définis par la source [NEEDS CLARIFICATION]**
1. Rôles, permissions, organisation (mono/multi-établissement).
2. Format du n° d'ordre ; âge saisi ou calculé ; identité inconnue ; patients mineurs.
3. Cadre légal des soins sans consentement : documents, dates, durée, tiers (nom, lien, coordonnées).
4. Nomenclature diagnostique (CIM/DSM), types de bilans, liste des appareils, champs d'« identification » des proches.
5. Hospitalisation : service, lit, dates, sortie.
6. Autres valeurs pour sexe ; listes religion/ethnie.
7. Plages de constantes, définition des horizons du pronostic.
8. Cycle de vie du dossier (validation, clôture, archivage), rétention des données.
9. Conformité : protection des données de santé applicable, hébergement, consentement à l'enregistrement, sauvegarde. Le produit traite des données de santé mentale et sensibles (religion, ethnie, judiciaire, sexualité) : exigence juridique à valider avant tout déploiement.
10. Fonctions absentes : rendez-vous, facturation, pièces jointes, notifications, intégrations. Aucune n'est spécifiée par la source.

**Hypothèses structurantes** : rôles (A2), états (B3), matrice (B2), journal d'audit, verrouillage, versioning S16, entrées datées S15.
**Contradictions détectées** : aucune. **Risque de lecture** : la source est un plan de dossier, pas un cahier des charges ; toute la couche SaaS (comptes, états, audit) est ajoutée par hypothèse.
