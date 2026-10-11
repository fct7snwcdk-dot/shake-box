# Shake Box

Site mobile Three.js + Rapier utilisant le GLB original de Hugo.

## Démarrer

Node.js 22 et pnpm 11 :

```
pnpm install
pnpm dev
pnpm test
pnpm build
```

Ouvrir l’adresse affichée, avec le chemin `/shake-box/`. Pour les capteurs du téléphone, utiliser HTTPS et toucher « Autoriser les capteurs ». Sur iOS, accepter la demande système. « Réinitialiser » restaure les 48 balles. La vue est fixe, sans rotation ni zoom. La boîte occupe le maximum de l’écran en conservant ses proportions ; son grand côté suit celui de l’écran. Le bouton d’autorisation disparaît une fois l’accès accordé.

## Scène réellement inspectée

Le GLB contient 48 sphères de rayon 1, sept matériaux PBR colorés et des sphères sans matériau explicite (matériau glTF par défaut). Deux objets Cube contiennent une même géométrie superposée, sans matériau explicite. La boîte mesure 18 × 11,595 × 10,081 unités, avec son fond côté +Y et son ouverture côté −Y. La scène est orientée ouverture en haut et uniformément ramenée à 10 % de sa taille pour la physique. Aucun matériau ni forme de balle n’est remplacé. Le fichier `public/box.glb` est une copie binaire intacte de l’original. Le doublon de boîte est masqué à l’exécution pour éviter le scintillement.

Les collisions de la boîte suivent ses triangles réels ; les balles utilisent des colliders sphériques avec CCD. Une grille 8 × 4 répartit les 48 balles sur deux niveaux sans chevauchement. La simulation tourne à 120 Hz avec durée de rattrapage limitée. Un sol invisible reçoit les balles éjectées. Les secousses utilisent l’accélération sans gravité quand disponible, sinon un filtre de gravité, avec seuil et temporisation.

## GitHub Pages

Le workflow `.github/workflows/pages.yml` teste, compile et déploie à chaque push sur `main`. Dans Settings → Pages, choisir **GitHub Actions** comme source. Cette configuration nécessite un accès administrateur au dépôt ; l’écriture du workflow nécessite aussi l’autorisation Workflows pour un jeton GitHub à droits fins (ou `workflow` pour un jeton classique). Aucun secret n’est intégré au site.

Adresse attendue après un déploiement réussi : https://fct7snwcdk-dot.github.io/shake-box/

## Vérifications

Le test utilise le véritable GLB et Rapier : nombre de balles, absence de chevauchement initial, confinement après cinq secondes, franchissement du bord après une impulsion et réinitialisation. Les capteurs et la permission iOS nécessitent une validation sur téléphone réel.
