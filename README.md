# 🚀 MSM Helper ULTRA-COMPLÈTE v2.0

## Extension Tout-en-Un pour Dadabit

Cette extension combine **3 extensions en une seule** :

1. ✅ **MSM Helper** - Blocs simplifiés pour navigation et mouvements
2. ✅ **Dadabit** - Extension officielle complète avec tous les blocs
3. ✅ **WonderCam** - Module de vision IA (chargé automatiquement)

---

## 🎯 Avantages

| Avantage | Description |
|----------|-------------|
| **1 seul lien** | Plus besoin d'ajouter 3 extensions séparément |
| **3 catégories** | MSM Helper, Dadabit, WonderCam bien séparés |
| **Compatibilité totale** | Tous les blocs fonctionnent ensemble |
| **Mises à jour faciles** | Tout au même endroit |

---

## 📦 Installation

### Dans MakeCode :

1. Ouvrir https://makecode.microbit.org/
2. Créer un nouveau projet
3. Cliquer sur **Extensions** (icône engrenage)
4. Coller ce lien :
   ```
   https://github.com/VOTRE-USERNAME/dadabit-by-msm-medias-complete
   ```
5. Cliquer sur **Importer**

**C'est tout !** Vous avez maintenant accès aux 3 extensions.

---

## 🎨 Blocs Disponibles

### 📁 Catégorie "MSM Helper" (Orange #FF6B35)

Blocs simplifiés pour faciliter la programmation :

#### Navigation
- `suivre ligne automatique vitesse [42]`
- `sur barre transversale ?`
- `quitter barre`
- `recuperer ligne`

#### Mouvement
- `avancer [1000] ms vitesse [42]`
- `reculer [1000] ms vitesse [32]`
- `tourner gauche 90 durée [1200] ms`
- `tourner droite 90 durée [1200] ms`
- `demi tour durée [2400] ms`
- `arreter moteurs`

#### Capteurs
- `nombre capteurs noirs`
- `tous capteurs blancs ?`
- `tous capteurs noirs ?`
- `capteurs centraux sur ligne ?`
- `capteur [S1] noir ?`

#### Actions
- `deposer objet port [S1] angle dépôt [0] angle repos [90]`
- `saisir objet port [S1] angle saisie [180] angle repos [90]`
- `preparer servo port [S1] angle [90]`
- `feedback son et LED`

#### Utils
- `afficher temporaire [texte] [2000] ms`
- `afficher [texte]`
- `attendre barre detectee`
- `initialiser robot transport`
- `pause [1000] ms`

---

### 📁 Catégorie "Dadabit" (Orange #FF7F00)

Tous les blocs officiels Dadabit :

#### Servos
- `setLego360Servo [1] [Clockwise] vitesse [42]`
- `setBoardServo port [S1] angle [90]`
- `setBusServo ID [1] angle [90]`

#### Capteurs
- `line_followers [S1] couleur [Black]`
- `colorSensor port [4] objet [R]`
- `ultrasonic port [1]`
- `PIR port [1]`
- `Loudness port [1]`

#### LEDs
- `setBoardPixelRGB [All] couleur [rouge]`
- `showRainbow début [1] fin [8]`
- `setBrightness [100]`

#### Moteurs DC
- `MotorRun [M1] vitesse [100]`
- `MotorStop [M1]`
- `MotorStopAll`

Et bien plus encore !

---

### 📁 Catégorie "WonderCam" (Chargée automatiquement)

Module de vision IA avec détection :

- Reconnaissance faciale
- Détection d'objets
- Classification
- Détection de couleurs
- Suivi de ligne
- AprilTags
- QR Codes
- Codes-barres
- Reconnaissance de chiffres
- Et plus !

> **Note** : Les blocs WonderCam apparaissent automatiquement car l'extension est chargée en dépendance.

---

## 💡 Exemples d'utilisation

### Exemple 1 : Programme simple avec MSM Helper

```blocks
quand [drapeau vert] cliqué
MSM Helper > initialiser robot transport

MSM Helper > suivre ligne automatique vitesse [42]

répéter indéfiniment
    si <MSM Helper > sur barre transversale ?> alors
        MSM Helper > quitter barre
        MSM Helper > pause [500] ms
    fin
fin
```

### Exemple 2 : Utiliser Dadabit directement

```blocks
quand [drapeau vert] cliqué
Dadabit > setBoardPixelRGB [All] couleur [rouge]

répéter indéfiniment
    si <Dadabit > line_followers [S1] couleur [Black]> alors
        Dadabit > setLego360Servo [1] [Clockwise] vitesse [50]
    sinon
        Dadabit > setLego360Servo [1] [Counterclockwise] vitesse [50]
    fin
fin
```

### Exemple 3 : Combiner MSM Helper + WonderCam

```blocks
quand [drapeau vert] cliqué
WonderCam > wondercam_init adresse [0x32]
WonderCam > ChangeFunc fonction [AprilTag]

répéter indéfiniment
    si <WonderCam > isDetecteAprilTagId [1]> alors
        MSM Helper > avancer [1000] ms vitesse [42]
        MSM Helper > feedback son et LED
    sinon
        MSM Helper > tourner gauche 90
    fin
fin
```

---

## 🔧 Caractéristiques Techniques

### MSM Helper
- **Namespace** : `msmHelper`
- **Couleur** : Orange (#FF6B35)
- **Groupes** : Navigation, Mouvement, Capteurs, Actions, Utils
- **Fonctions** : 27 blocs simplifiés

### Dadabit
- **Namespace** : `dadabit`
- **Couleur** : Orange foncé (#FF7F00)
- **Groupes** : Servos, Capteurs, LEDs, Moteurs, RGB, etc.
- **Fonctions** : 50+ blocs officiels

### WonderCam
- **Dependency** : Automatique (github:Hiwonder/WonderCam)
- **Namespace** : `wondercam`
- **Fonctions** : Module vision IA complet

---

## 📚 Documentation

### Pour MSM Helper
Consultez les commentaires dans le code source : tous les blocs sont documentés.

### Pour Dadabit
Documentation officielle : https://github.com/hiwonder/dadabit

### Pour WonderCam
Documentation officielle : https://github.com/Hiwonder/WonderCam

---

## 🆘 Support

### Issues
Si vous rencontrez un problème, ouvrez une issue sur GitHub avec :
- Description du problème
- Code que vous utilisez
- Version de l'extension
- Screenshots si possible

### Questions
Pour des questions générales, utilisez les Discussions GitHub.

---

## 🔄 Historique des versions

### v2.0.0 (Actuelle)
- ✅ Intégration complète : MSM Helper + Dadabit + WonderCam
- ✅ 3 extensions en une seule
- ✅ Namespaces séparés pour éviter les conflits
- ✅ Compatible avec tous les projets existants

### v1.1.2 (Ancienne)
- MSM Helper seul
- Dépendance externe vers Dadabit

---

## 📄 Licence

MIT License - Libre d'utilisation pour l'éducation et projets personnels.

---

## 👥 Crédits

- **MSM Helper** : Créé par MSM MEDIAS
- **Dadabit** : Extension officielle Hiwonder
- **WonderCam** : Module IA Hiwonder

---

## 🌟 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à :
- Proposer des améliorations
- Signaler des bugs
- Ajouter de nouveaux blocs
- Améliorer la documentation

---

**Créé avec ❤️ par MSM MEDIAS pour faciliter l'apprentissage de la robotique**
