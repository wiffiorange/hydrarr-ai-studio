# Comment lancer Hydrarr sur Android Studio

Vous avez maintenant tous les fichiers de configuration nécessaires. Voici la marche à suivre pour générer l'application Native.

### Prérequis
1. Avoir **Node.js** installé.
2. Avoir **Android Studio** installé (avec le SDK Android configuré).

### Étape 1 : Installer les dépendances
Ouvrez un terminal dans le dossier du projet et lancez :
```bash
npm install
```

### Étape 2 : Initialiser Android
Lancez cette commande pour préparer le projet Android (cela va créer le dossier `android/`) :
```bash
npx cap add android
```

### Étape 3 : Compiler l'application Web
Pour que l'application Android ait la dernière version de votre code React :
```bash
npm run build
npx cap sync
```

### Étape 4 : Ouvrir dans Android Studio
Lancez la commande magique :
```bash
npx cap open android
```
Cela ouvrira Android Studio. Attendez que "Gradle Sync" soit terminé (barre de chargement en bas à droite).
Ensuite, cliquez sur le bouton **Play (▶)** vert en haut pour lancer l'application sur votre émulateur ou votre téléphone branché en USB.

---
**Note importante pour les serveurs locaux :**
Votre téléphone Android doit être connecté au **même réseau Wi-Fi** que votre serveur (NAS/PC).
L'adresse `localhost` ne fonctionnera pas sur le téléphone. Utilisez l'IP locale (ex: `192.168.1.50`).
