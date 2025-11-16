# Bataille Navale - INF5153 - Génie logiciel : Conception
Université du Québec à Montréal.

Groupe 30 - Automne 2025.

## Identification
Ce projet est préparé par l'équipe 9 composée de :
- Thomas Angela 
- Alidou Ridwane-Lah
- Zoumenou Finagnon Alvis
- Sanoussi Issoufou Mayana Nana Myriam 
- Thiam Demba Aziz 

## Présentation du projet
Ce projet vise à concevoir et développer un logiciel complet de Bataille navale appliquant les principes de conception orientée objet et les patrons de conception GoF/GRASP.
L'application permet à deux joueurs de s'affronter : 
- en mode local contre une IA (StrategieAleatoire / StrategieCiblee) ;
- en mode en ligne, via un serveur de jeu (matchmaking et classement).  
Le système inclut : 
- une interface utilisateur (interface graphique),
- une logique métier claire (Jeu, Joueur, Grille, Navire, Statistiques),
- une persistance SQLite,
- des tests unitaires avec couverture ≥ 80 %,
- une intégration continue GitLab-CI.

## Technologie utilisée
- Base de données : SQLite 3 
- Tests : Jest + React Testing Library
- CI/CD : GitLab-CI
- IDE : IntelliJ IDEA
- Diagrammes : PlantUML 
- Frontend : React 
- Backend : Flask/Python

# Differents diagrammes
Cette section présente les différents diagrammes UML réalisés pour le projet *Bataille Navale*.  
Ils décrivent l’application sous plusieurs angles : fonctionnalités, architecture, structure interne, flux d’exécution, organisation des modules et déploiement.

## **Diagramme d'architecture logicielle (3-tiers)**
Ce diagramme représente la structure globale de l’application selon une architecture en couches (3-tiers) :
Présentation, Métier, et Données.
1. Couche Presentation (UI) : Contient les interfaces utilisateur
- VueGraphique
- InterfaceConsole  
Cette couche reçoit les commandes du joueur et transmet toutes les actions à la couche Application.  
- Role : Gérer les interactions homme-machine
- Aucune logique metier : faible couplage  

2. Couche Métier (Logique applicative + Domaine)  
Regroupe toutes les classes qui définissent les règles du jeu :  
- ServiceJeu 
- Jeu, Joueur, Grille, Case, Navire ... 
- Statistiques
- Stratégies IA (Aléatoire/Ciblée)  
C'est la couche la plus importante car elle gère le placement des navires, les tirs, les résultats, les victoires, les statistiques et les IA.  

**GRASP utilisé :**  
- Controller (serviceJeu)
- Information Expert 
- Low Coupling (UI ne connait pas le domaine directement) 

3. Couche Données (Persistance)  
Composée de:  
- BaseDeDonnées
- SQLite  
Elle se charge uniquement de :  
- sauvegarder les parties, 
- charger les scores,
- gérer les classements.

**GRASP :**  
Pure Fabrication, car elle isole la persistance pour garder un domaine propre.  

## **Diagramme de classe**
Le diagramme de classes représente l’ensemble des entités qui composent l’application Bataille Navale ainsi que leurs relations.
Il reflète la structure du domaine, les règles du jeu, la gestion des parties, les statistiques, l’IA et la persistance.
Ce modèle est structuré autour de 5 grands groupes de classes :
- Gestion d'une partie
- Gestion des joueurs et de la grille 
- Système d'IA (Strategy)
- Gestion des statistiques et de classement 
- Persistance des données

**1. Classes Principales et leur role**  
**Jeu** 
- Classe centrale qui contrôle les parties.
- Gère la liste des parties, le classement, et agit comme orchestrateur.
- Applique GRASP Controller : Elle contrôle le déroulement d’une partie : placement des navires, gestion des tours, et vérification des victoires.  

**Partie** 
- Représente une partie spécifique en cours.
- Contient les deux joueurs, l’état, le plateau, et le système d’observation (spectateur).
- Gère le déroulement du jeu (demandes de tir, validation).

**Joueur** 
- Représente un joueur humain ou IA.
- Attributs : id, nom, état, grille, statistiques.
- Comportements : tirer(), placerNavire().
- Peut utiliser une stratégie IA via l’attribut StrategieIA.

**Grille**
- Contient les 100 cases.
- Responsable de vérifier les tirs, placer les navires, et déterminer les états.
- Applique Information Expert car la grilleconnait ses propes cases.

**Case**
- Unité de base du plateau.
- Contient position, état, et éventuellement un Navire.
- Peut être touchée ou non.

**Navire**
- Représente un bateau (porte-avion, croiseur, etc.)
- Connaît ses positions (liste de Cases).
- Méthode estCoule().

**État & TypeNavire (enum)**  
Définissent les valeurs :
- État : TOUCHÉ, COULÉ, DANS_L_EAU
- TypeNavire : PORTE_AVION, CROISEUR, etc.

**2. Classes IA (Patron Strategy)**
**StrategieIA (interface)**  
- Définit la méthode : choisirCaseATirer(grilleAdverse)

**StrategieAleatoire**
- Implémentation IA débutante.
- Choisit des cases aléatoirement.

**StrategieCiblee**
- Implémentation IA avancée.
- Tire autour des cases touchées précédemment.  
- Patron GRASP : Polymorphism car chaque stratégie (StrategieAleatoire, StrategieCiblee) implémente la même interface StrategieIA, mais fournit son propre comportement pour le choix du tir. Le joueur peut ainsi utiliser n'importe quelle stratégie sans modifier son propre code, ce qui réduit le couplage et augmente l’extensibilité.

**3. Statistiques et Classement**
**Statistiques**
- Stocke les données de performance d’un joueur.
(tirs réussis, tirs totaux, victoires, défaites, précision)
- Méthodes :
    - getPrecision()
    - enregistrerTIR()
    - enregisterVictoire()
- Applique aussi Information Expert.

**Classement & EntreeClassement**
- Le classement contient une liste d’EntréeClassement.
- Chaque entrée contient :
    - joueur
    - nbVictoire
    - ratioPrecision
- Géré par BaseDeDonnees.

**4. Persistance (Base de données)**
**BaseDeDonnees**
- Effectue la sauvegarde/chargement des parties, joueurs et classements.
- Méthodes :
    - sauvegarderPartie()
    - chargerPartie()
    - chargerClassement()
- Patron GRASP : Pure Fabrication car le domaine ne dépend pas de SQLite.

**5. ServeurJeu et Matchmaking**
**ServeurJeu**
- Gère la communication réseau, les connexions et la recherche d’adversaire.
- Méthodes :
    - connecterJoueur()
    - trouverAdversaire()

**ServiceMatchmaking**
- Sélectionne les joueurs disponibles pour commencer une partie.

**6. Relations importantes du modèle**
**Composition (forte)**
- Grille → contient 100 Cases
- Partie → contient 2 Joueurs
- Joueur → possède Statistiques
- Navire → a une liste de Cases

**Agrégation**
- Classement contient plusieurs EntréeClassement
- Case peut contenir un Navire

**Associations**
- Joueur utilise une stratégie IA (Strategy)
- Partie observe les joueurs et transmet les résultats
- BaseDeDonnees persiste Jeu, Partie, Joueur, Classement

**Héritage**
- StrategieAleatoire & StrategieCiblee héritent de StrategieIA.  

## **Diagramme de packages**
Ce diagramme montre la structure du code organisée en modules cohérents.

**Packages :**
- Interface utilisateur
- Logique du jeu
- IA
- GestionStatistiques
- Données

Rôles :
- UI importe la logique de jeu.
- La logique du jeu utilise les stratégies IA.
- Le système de statistiques importe la BD.
- Le package “Données” contient uniquement la persistance.

But : 
- séparation claire, modularité, maintenabilité.

## **Diagramme de composant** 
Ce diagramme illustre comment les principaux modules communiquent via des interfaces.

**Composants :**
- InterfaceJoueur
- Jeu
- IA
- Statistiques
- BaseDeDonnees
- Grille / Case / Navire

Chacun expose des ports / interfaces :
- P_ActionJoueur : actions venant de l’interface
- P_EmissionTir : communication vers IA
- P_EmissionStats : mise à jour des statistiques
- P_EnvoiDonnees : envoi à la BD : Permet de visualiser les dépendances sans entrer dans les détails des classes.

## **Diagramme de déploiement** 
Ce diagramme montre où l’application s’exécute physiquement.  

**Noeud : Client Joueur 1 et Client Joueur 2**  
Chaque client contient :
- Application BatailleNavale.jar
- Interface (Graphique ou Console)
- ServiceJeu
- Domaine du jeu
- IA (en mode solo)
- Fichier SQLite local

**Noeud : Serveur de Jeu**
Contient :
- API réseau
- Service de matchmaking
- Base SQLite centrale (classements, scores)

**Communications :**
- TCP/HTTP entre clients et serveur
- Échanges de coups entre joueurs en réseau
- Accès BD centrale par le serveur  
L’objectif est de représenter les machines, les composants et les liens.

## **Diagramme de cas d'utilisation** 
Le diagramme de cas d’utilisation « Bataille Navale » décrit les principales fonctionnalités offertes par le système du point de vue des utilisateurs externes.
On distingue trois acteurs : Joueur, IA et Spectateur.
- Le Joueur est l’acteur principal : il lance une partie, choisit le mode de jeu, place ses navires, tire sur la grille adverse, consulte ses statistiques, etc.
- L’IA représente un adversaire contrôlé par le système, avec plusieurs niveaux de difficulté.
- Le Spectateur représente un utilisateur qui ne joue pas mais qui peut regarder une partie en cours.  

Ce diagramme sert à capturer les exigences fonctionnelles avant d’entrer dans les détails techniques ou de conception.

**Acteur et roles**  
**Joueur**  
Le Joueur interagit avec presque tous les cas d’utilisation :
- Choisir Mode de Jeu : point d’entrée du système, le joueur décide de jouer contre un humain ou contre l’IA.
- Jouer contre Humain : démarrage d’une partie en ligne contre un autre joueur.
- Jouer contre IA : démarrage d’une partie locale contre une IA.
- Stratégie IA débutant / Stratégie IA avancée : choix du niveau de difficulté de l’IA (ces cas d’utilisation spécialisent « Stratégie IA »).
- Voir classement/statistiques : consultation des résultats et performances.
- Créer données joueur : création du profil joueur (nom, identifiant, etc.).

Le Joueur est aussi lié aux cas d’utilisation Placer navires, Jouer partie, Quitter et Rejouer via les relations include et extend.

**IA**  
L’acteur IA intervient surtout comme participant au cas d’utilisation « Jouer contre IA ».
Le cas d’utilisation « Stratégie IA » encapsule le comportement de l’IA : selon le choix du joueur, le système utilise soit Stratégie IA débutant, soit Stratégie IA avancée.

**Spectateur**  
Le Spectateur n’intervient pas dans le déroulement de la partie mais utilise :
- Regarder la partie en mode spectateur : permet de visualiser les coups joués en temps réel sans interagir avec la grille.

***Cas d’utilisation principaux***  
**Choisir Mode de Jeu**  
C’est le cas d’utilisation central pour démarrer l’application.
Le joueur choisit :  
- de jouer contre l’IA (local),
- ou de jouer contre un humain (en ligne).

Ce cas d’utilisation inclut implicitement la logique de vérification de mode, de configuration de la partie et de préparation des grilles.

**Jouer contre Humain**  
Ce cas d’utilisation permet à un joueur de trouver un adversaire en ligne.
Il inclut :
- Vérifier disponibilité joueur : le système vérifie s’il existe un autre joueur libre.
- Matchmaking : une fois un adversaire trouvé, le système associe les deux joueurs dans une même partie.

**Jouer contre IA / Stratégie IA**  
Le cas « Jouer contre IA » utilise le cas Stratégie IA pour déterminer la manière dont l’IA jouera.
- Stratégie IA débutant : coups aléatoires.
- Stratégie IA avancée : coups intelligents, tir ciblé autour des cases déjà touchées.  

Ces deux derniers sont des spécialisations du cas d’utilisation « Stratégie IA » et reflètent directement le patron Strategy implémenté dans le modèle de classes.

**Placer navires (include)**  
Avant de commencer à jouer, le joueur doit placer ses 5 navires sur sa grille.
- Ce cas est inclus dans « Jouer partie » : une partie ne peut pas démarrer tant que les navires ne sont pas correctement placés.
- Il couvre la validation des positions, la gestion des chevauchements et des limites de la grille.

**Jouer partie**  
C’est le cœur fonctionnel : alternance de tours, tirs, réponses « Touché / Coulé / Dans l’eau », vérification de fin de partie.
- Il inclut « Placer navires ».
- Il est étendu par :
    - Quitter : le joueur peut quitter la partie avant la fin.
    - Rejouer : après une partie, le joueur peut relancer immédiatement une nouvelle partie avec les mêmes réglages.

**Voir classement/statistiques**  
Permet au joueur de consulter :
- le nombre de parties jouées,
- les victoires / défaites,
- le taux de précision,
- éventuellement un classement global.

Ce cas d’utilisation est étroitement lié à la classe Statistiques et au Classement dans le diagramme de classes.

**Créer données Joueur**  
Permet d’enregistrer un nouveau joueur dans le système (profil local ou en ligne).  
Il est souvent appelé au premier lancement du jeu ou pour créer un deuxième profil.

**Regarder la partie en mode spectateur**  
Ce cas d’utilisation permet à un spectateur :
- de voir la liste des parties en cours,
- d’en sélectionner une,
- d’observer les coups joués en temps réel.  

Il prépare le terrain pour un futur patron Observer côté implementation (mode spectateur qui reçoit les mises à jour de la partie).

**Rôle des relations « include » et « extend »**
- include est utilisé lorsque un cas d’utilisation A ne peut pas fonctionner sans un cas B :
    - « Jouer contre Humain » inclut « Vérifier disponibilité joueur ».
    - « Vérifier disponibilité joueur » inclut « Matchmaking ».
    - « Jouer partie » inclut « Placer navires ».
- extend est utilisé pour des scénarios optionnels :
    - Depuis « Jouer partie », le joueur peut Quitter la partie à tout moment.
    - À la fin de « Jouer partie », il peut Rejouer une nouvelle partie.

## **Diagramme de Séquence**  
Ces diagrammes montrent comment les objets du système collaborent pour réaliser les différents cas d’utilisation du jeu Bataille Navale.
Ils détaillent l’ordre des messages, les boucles, les alternatives, et les interactions avec l’interface, le domaine et le serveur.  

**1. Diagramme de séquence — Placer les navires**  
Ce diagramme décrit le processus complet de placement initial des navires au début d’une partie.

**Objectif**  
- Permettre au joueur de positionner ses 5 navires sur sa grille.
- Valider les placements (collisions, débordements, doublons).
- Retourner un message d’erreur si nécessaire.

**Déroulement**
1. Le joueur demande à placerNavires() via l’interface.
2. L’interface demande au système la grille vide et la liste des navires restants.
3. Pour chaque navire :
    - Le joueur tente un placement.
    - Le système valide le placement (validerPlacement()).
    - Si validé → navire affiché sur la grille.
    - Sinon → message d’erreur et nouvel essai.
4. Lorsque tous les navires sont correctement placés :
    - Le système confirme la fin du placement.

**GRASP appliqués**
- Information Expert (Grille / Case) : sait si une case est libre, si un placement est valide.
- Controller (Interface) : centralise les requêtes du joueur.

**2. Diagramme de séquence — Jouer une partie**  
Ce diagramme montre le flux complet d’une partie, tir après tir.

**Objectif**
- Gérer les tours, les tirs et l’avancement de la partie.
- Mettre à jour les grilles et les statistiques.
- Interagir avec le serveur si mode en ligne.

**Déroulement**
1. Le joueur sélectionne jouerPartie() via l’interface. 
2. Le système vérifie :
    - la disponibilité du joueur,
    - puis la connexion au serveur (mode en ligne).
3. Une fois la partie prête :
    - Séquence de boucles : chaque tir est traité.
    - Le tir est enregistré → résultat renvoyé → grille mise à jour.
4. Altération selon la fin de partie :
    - Si partie terminée : afficher le résultat final.
    - Sinon : attendre le tir adverse.
5. À la fin :
    -Le joueur peut quitter ou rejouer.

**GRASP appliqués**
- Controller (Système de gestion du jeu)
- Information Expert (Navire, Grille, Statistiques)
- Low Coupling (Interface - Domaine - Serveur)

**3. Diagramme de séquence — Créer données joueur**  
Ce diagramme illustre la création d’un nouvel utilisateur et son enregistrement dans la base.

**Objectif**
- Ajouter un joueur dans le système.
- Persistant dans la base SQLite.

**Déroulement**
1. Le système de gestion des joueurs appelle créerJoueur().
2. La base crée une nouvelle entrée via créerEntréeJoueur().
3. Deux scénarios :
    - Réussite → confirmation affichée.
    - Échec → message d’erreur.

**GRASP appliqués**
- Pure Fabrication (BaseDeDonnees) : isoler la persistance.
- Controller (Système de gestion).

**4. Diagramme de séquence — Choisir mode de jeu**  
Ce diagramme modélise la sélection du mode :
- IA débutante
- IA avancée
- Joueur humain

**Objectif**
- Enregistrer le choix du joueur.
- Charger la stratégie IA appropriée (Strategy Pattern).

**Déroulement**
1. Le joueur demande choisirModeDeJeu().
2. L’interface liste les modes disponibles.
3. Selon le choix :
    - IA débutante → stratégie aléatoire.
    - IA avancée → stratégie ciblée.
    - Humain → matchmaking / disponibilité du joueur adverse.
4. Le système confirme la sélection.

**GRASP appliqués**
- Polymorphism (IA)
- Strategy (choix de comportement IA)
- Controller (Interface de jeu)

**5. Diagramme de séquence — Regarder une partie en mode spectateur**  
Ce diagramme illustre la fonctionnalité bonus permettant à un utilisateur d'observer une partie en cours.

**Objectif**
- Afficher une partie en temps réel sans interaction.
- Récupérer les données du serveur.

**Déroulement**
1. Le joueur demande le mode spectateur.
2. Le système vérifie :
    - disponibilité du joueur,
    - existence de parties en cours.
3. L'utilisateur choisit une partie à observer.
4. Le serveur envoie :
    - état courant,
    - mises à jour en temps réel.
5. Tant que la partie n’est pas terminée :
    - boucle d’affichage continu.
6. Après la fin :
    - message "Partie terminée".
    - si indisponible → message d'erreur.

**GRASP appliqués**
- Low Coupling (Spectateur - Interface - Serveur)
- Information Expert (Système de jeu / Serveur)
- Controller (Interface spectateur)