# ExtractorCV (Sujet 1)

### Bînome
* Simon DUFAC
* Tahir Cherif ABAKAR

### Executer le projet
* Installer node.js version 15 ou faire la commande ```node -v``` pour vérifier l'instalation
    * Si la version n'est pas la bonne on peut la télécharger avec nvm :```nvm install 15``` et ```nvm use 15```
* Installer les dépendances avec ```npm install```
* Compiler avec ```tsc```
* Démarrer le projet avec la commande ```node dist/server.js```
    * Le serveur écoute sur le port 3000

# Détails du projet
### video.ts
Seul script côté client
* ```captureVideo()```
    * Capture la vidéo et l'audio de l'utilisateur grâce à ```getUserMedia()``` et ```MediaRecorder```,
    on créé un blob vidéo et audio destinée à être convertit en .mp4 plus tard et un blob audio seulement qui sera convertit
    en .wav à destination de deepspeech.
* ```upload()```
    * Fonction pour envoyer les 2 blobs créé précedement au serveur node qui seront récupéré sur la route /upload grâce à multer
    qui est utilise pour récupéré directement les 2 blob distinct sans avoir à faire de traitement supplémentaire.

### server.ts
Serveur node.js express on utilise seulement la route upload qui se charge d'appeler tout les fonction de traitement
à la réception des blobs et renvoi seulement au client le résultat de la transcription du CV de l'utilisateur.

### audioprocess.ts
Script qui contient toutes les fonctions de traitement audio et vidéo. Tout les traitement sont fait avec fluent-ffmpeg.
* ```convertToWav```
    * Convertit un buffer en fichier wav avec les paramètres requis pour deepspeech(une seule piste, 16khz de fréquence)
    et l'enregistre dans le chemin préciser en paramètre.
* ```convertToMp4```
    * Convertit un buffer en vidéo mp4 et l'enregistre et l'enregistre dans le chemin précisé en paramètre.
* ```extractSegment()```
    * A partir d'une video et de time stamp fournis en paramètre, la fonction découpe la vidéo et l'enregistre.
* ```concatSegments()```
    * A partir d'un tableau de string qui représente les chemin des segment découpé grâce à ```extractSegment()```
    la fonction écrit d'abord dans un fichier text la liste de tout les chemins précédé de "file" car cela et demandé par
    ffmpeg pour éffectué la concatenation. Ensuite la fonction concatene les segments et enregistr ela vidéo finale dans le
    chemin de destination.
* ```createCompetenceVideo()```
    * Fonction qui gère la logique pour les fonctions précedente. En paramètre on prend un tableau d'objet TextTimeCode qui
    represente la phrase retranscrite à extraire ainsi que le time stamp de début et de fin dans la vidéo de base.
    Pour chaque élément dans ce tableau, on extrait un segment et on appel la fonction de concaténation à la fin on appel
    ```concatSegments()``` qui concatene tout les segments extraits.

### deepspeechprocess.ts
Script qui contient la fonction de retranscription
* ```TextTimeCode```
    * Type servant à stocké les phrases retranscrites et leurs time stamp de début et de fin dans la vidéo
* ```speechToText```
    * Prend en paramètres le chemin vers l'audio en .wav enregistrer précedement. On initialise le model avec le .pbmm
    et le .scorer obtenue [ici](https://github.com/common-voice/commonvoice-fr/releases) et les réglage pour la retranscription.
    On appel ensuite la methode ```sttWithMetaData()``` qui nous renvoi un tableau avec chaque lettre et chaque pause
    retranscrite et leurs time stamp. Le problème est que les timestamp pour les pauses ne sont pas toujours correct, lors
    de longue pause (+ d'une seconde) au lieu de mettre l'écart de time stamp sur un caractère ' ' qui represente une pause
    deepspeech place l'écart entre deux lettre d'un même mot. Le traitement ligne 50 permet de corriger cela après copie du tableau retourné par le modèle car on ne peut pas le modifier.
    On ajoute ensuite de la ponctuation en fonction des pauses faîtes entre les mots (deepspeech ne prend pas en charge
    la ponctuation), pour pouvoir découper le texte en phrases. La ponctuation n'a pas pour but d'être cohérente mais sert
    seulement à isolé les potentienls compétences du reste du texte. La fonction retourne ensuite le tableau de phrase avec
    les time stamp.
* ```wordsToString()```
    * Simple fonction utilitaire servant à transformer un tableau ```TextTimeCode``` en string

### romeo.ts
Script contenant toutes les fonction utilisant l'API ROMEOv2 de France Travail.

* ```CompetenceRome```,```Competence``` et ```RomeoResponse```
    * Type reprenant la structure du json retourné par l'api romeo afin de pouvoir stocker la réponse dans un objet pour
    l'exploiter par la suite.
* ```generateAccesToken()``` 
    * Fonction faisant la requête pour s'authentifier à France Travail et obtenir un token pour faire les requêtes à
    ROMEO.
* ```sendToRomeo()```
    * Fonction qui à partir d'une chaîne de caractère donné en paramètre fait la requête à ROMEO afin de savoir s'il
    sagit d'une compétence Rome. On demande trois compétence maximum et un score de prédiction de minimum 0.8 (sur 1).
* ```sendAllPhrase()```
    * A partir d'un tableau ```TextTimeCode``` on fait un appel à ```sendToRomeo()``` par seconde (on est limité à un appel par
    seconde par France Travail) et stock la réponse dans un tableau. On renvoie ensuite le tableau de réponses.

### city.ts
Script correspondant à l'extraction des villes dans le text retranscrit.

* ```getCities()```
    * Grâce à un dataset json contenant toutes les villes de France obtenue [ici](https://www.data.gouv.fr/fr/datasets/villes-de-france/) qu'on convertit en Set, on regarde simplement si chacun des mot des phrases du tableau en paramètre correspond à
    une ville.

### bdd.ts
Script gérant tout les insertion en BDD. La BDD est une BDD sqlite dont on peut trouver le fichier dans dist/db/db.sqlite.
Elle est composé de deux tables video et competence. Dans video on à les attribues suivant: id,nom du fichier et dans competence
on à: id, intitule, codeRome, clé étrangère vers un id de vidéo. La solution envisagé au départ et qui semble bien meilleur que
celle ci était d'inserer toutes les compétences existante à partir du dataset téléchargeable sur France Travail et de créé une
troisième table faisant la liaison entre les compétences et les vidéos mais malheuresement nous n'avons pas réussi à importer
les données vers la table. Il y aura donc des doublons dans les compétences.

* ```sendToBdd()```
    * Insert la vidéo finalisé dans la table video de la BDD et renvoie son id généré dans la base et qui sera utilisé en
    tant que clé étrangère lors de l'insertion des compétences.
* ```insertCompetence()```
    * Insere les competences dans la table competence de la BDD en prenant en paramètre l'id de la vidéo precedement inséré.
* ```createTable()```
    * Fonction qui tente de créer les table requise dans la BDD si elle ne sont pas déjà présente.
