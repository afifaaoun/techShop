#!/usr/bin/env node

/**
 * Script pour ajouter une nouvelle catégorie
 * Usage: node scripts/addCategory.js <nom_categorie> <label> <icon> <color>
 * Exemple: node scripts/addCategory.js cameras "Caméras" camera "#a55eea"
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length !== 4) {
  console.log('❌ Usage: node scripts/addCategory.js <nom_categorie> <label> <icon> <color>');
  console.log('📝 Exemple: node scripts/addCategory.js cameras "Caméras" camera "#a55eea"');
  process.exit(1);
}

const [categoryName, label, icon, color] = args;

console.log('🔧 Ajout de la catégorie:', categoryName);

// 1. Mettre à jour le modèle Product
const productModelPath = path.join(__dirname, '../models/Product.js');
let productModelContent = fs.readFileSync(productModelPath, 'utf8');

// Trouver et mettre à jour l'enum des catégories
const enumRegex = /values: \[([^\]]+)\]/;
const match = productModelContent.match(enumRegex);

if (match) {
  const currentCategories = match[1].split(',').map(cat => cat.trim().replace(/'/g, ''));
  
  if (currentCategories.includes(categoryName)) {
    console.log('⚠️ La catégorie existe déjà dans le modèle');
  } else {
    currentCategories.push(categoryName);
    const newEnumValues = currentCategories.map(cat => `'${cat}'`).join(', ');
    productModelContent = productModelContent.replace(enumRegex, `values: [${newEnumValues}]`);
    fs.writeFileSync(productModelPath, productModelContent);
    console.log('✅ Catégorie ajoutée au modèle Product');
  }
} else {
  console.log('❌ Impossible de trouver l\'enum des catégories');
}

// 2. Mettre à jour le fichier de configuration
const categoriesConfigPath = path.join(__dirname, '../config/categories.js');
let categoriesConfigContent = fs.readFileSync(categoriesConfigPath, 'utf8');

// Trouver la fin de l'objet categoryMetadata
const lastBraceIndex = categoriesConfigContent.lastIndexOf('}');
if (lastBraceIndex !== -1) {
  const newCategoryEntry = `  ${categoryName}: {
    label: '${label}',
    icon: '${icon}',
    color: '${color}'
  }`;
  
  categoriesConfigContent = categoriesConfigContent.slice(0, lastBraceIndex) + 
    ',\n' + newCategoryEntry + '\n' + 
    categoriesConfigContent.slice(lastBraceIndex);
  
  fs.writeFileSync(categoriesConfigPath, categoriesConfigContent);
  console.log('✅ Métadonnées ajoutées au fichier de configuration');
}

console.log('🎉 Catégorie ajoutée avec succès !');
console.log('📋 N\'oubliez pas d\'ajouter l\'icône correspondante dans le frontend si nécessaire'); 