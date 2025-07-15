# 📋 Guide d'ajout de nouvelles catégories

## 🎯 **Objectif**
Ce système permet d'ajouter facilement de nouvelles catégories sans toucher au frontend. Tout est centralisé côté backend.

## 🔧 **Méthode 1 : Script automatique (Recommandé)**

### Utilisation du script
```bash
cd back
node scripts/addCategory.js <nom_categorie> <label> <icon> <color>
```

### Exemples
```bash
# Ajouter une catégorie "cameras"
node scripts/addCategory.js cameras "Caméras" camera "#a55eea"

# Ajouter une catégorie "gaming"
node scripts/addCategory.js gaming "Gaming" gamepad "#ff6b9d"
```

## 🔧 **Méthode 2 : Manuel**

### 1. Ajouter dans le modèle Product
Dans `back/models/Product.js`, ajouter la nouvelle catégorie dans l'enum :

```javascript
category: {
  type: String,
  required: [true, 'La catégorie est obligatoire'],
  enum: {
    values: ['smartphones', 'laptops', 'accessories', 'tablets', 'smartwatches', 'cameras', 'nouvelle_categorie'],
    message: 'Catégorie non valide'
  }
}
```

### 2. Ajouter dans la configuration
Dans `back/config/categories.js`, ajouter les métadonnées :

```javascript
const categoryMetadata = {
  // ... autres catégories
  nouvelle_categorie: {
    label: 'Nouvelle Catégorie',
    icon: 'icon_name',
    color: '#hex_color'
  }
};
```

### 3. Ajouter l'icône dans le frontend (si nécessaire)
Dans `front/src/components/common/Navbar/CategoryMenu.js`, ajouter l'icône :

```javascript
const getIconComponent = (iconName) => {
  const iconMap = {
    // ... autres icônes
    icon_name: <IconComponent fontSize="small" />
  };
  
  return iconMap[iconName] || <ViewModule fontSize="small" />;
};
```

## 📊 **Structure des métadonnées**

Chaque catégorie a :
- **key** : Nom technique (ex: 'smartphones')
- **label** : Nom affiché (ex: 'Smartphones')
- **icon** : Nom de l'icône Material-UI (ex: 'smartphone')
- **color** : Couleur hexadécimale (ex: '#ff6b6b')

## 🎨 **Icônes disponibles**

Icônes Material-UI couramment utilisées :
- `smartphone` → Smartphone
- `laptop` → Laptop
- `headset` → Headset
- `watch` → WatchOutlined
- `tablet` → Tablet
- `camera` → CameraAlt
- `gamepad` → SportsEsports
- `tv` → Tv
- `speaker` → Speaker

## ✅ **Avantages de cette approche**

1. **Centralisation** : Tout est géré côté backend
2. **Maintenabilité** : Un seul endroit à modifier
3. **Cohérence** : Les métadonnées sont toujours synchronisées
4. **Évolutivité** : Facile d'ajouter de nouvelles catégories
5. **Automatisation** : Script pour éviter les erreurs

## 🔄 **Workflow complet**

1. Ajouter la catégorie avec le script
2. Redémarrer le serveur backend
3. La nouvelle catégorie apparaît automatiquement dans le menu
4. Les produits peuvent utiliser la nouvelle catégorie

## 🚨 **Points d'attention**

- Toujours utiliser des noms de catégories en minuscules
- Vérifier que l'icône existe dans Material-UI
- Tester après l'ajout d'une nouvelle catégorie
- Redémarrer le serveur après modification du modèle 