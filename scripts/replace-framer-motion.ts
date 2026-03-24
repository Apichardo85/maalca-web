/**
 * Script to replace Framer Motion with CSS animations
 * Run: npx tsx scripts/replace-framer-motion.ts
 */

import fs from 'fs';
import path from 'path';

const PAGES_DIR = 'src/app';

// Files that still have Framer Motion (from our search)
const FILES_TO_FIX = [
  'contacto/page.tsx',
  'britocolor/page.tsx',
  'affiliates/page.tsx',
  'affiliates/[id]/page.tsx',
  'casos-estudio/page.tsx',
  'dr-pichardo/servicios/page.tsx',
  'dr-pichardo/portal/page.tsx',
  'dr-pichardo/operativos/page.tsx',
  'pegote/fila/page.tsx',
  'maalca-properties/page-optimized.tsx',
];

// Simple replacements that work in most cases
const REPLACEMENTS = [
  // Remove import
  { from: /import\s*\{[^}]*motion[^}]*\}\s*from\s*["']framer-motion["'];?/g, to: '' },
  { from: /import\s*\{\s*AnimatePresence\s*\}\s*from\s*["']framer-motion["'];?/g, to: '' },
  
  // Replace motion.div with div + CSS class
  { from: /<motion\.div(\s+[^>]*)?>/g, to: '<div class="fade-in-up"$1>' },
  { from: /<\/motion\.div>/g, to: '</div>' },
  
  // Replace motion.h1 with h1 + CSS class
  { from: /<motion\.h1(\s+[^>]*)?>/g, to: '<h1 class="fade-in-up"$1>' },
  { from: /<\/motion\.h1>/g, to: '</h1>' },
  
  // Replace motion.h2 with h2 + CSS class
  { from: /<motion\.h2(\s+[^>]*)?>/g, to: '<h2 class="fade-in-up"$1>' },
  { from: /<\/motion\.h2>/g, to: '</h2>' },
  
  // Replace motion.h3 with h3 + CSS class
  { from: /<motion\.h3(\s+[^>]*)?>/g, to: '<h3 class="fade-in-up"$1>' },
  { from: /<\/motion\.h3>/g, to: '</h3>' },
  
  // Replace motion.p with p + CSS class
  { from: /<motion\.p(\s+[^>]*)?>/g, to: '<p class="fade-in"$1>' },
  { from: /<\/motion\.p>/g, to: '</p>' },
  
  // Replace motion.span with span + CSS class
  { from: /<motion\.span(\s+[^>]*)?>/g, to: '<span class="fade-in"$1>' },
  { from: /<\/motion\.span>/g, to: '</span>' },
  
  // Replace motion.button with button
  { from: /<motion\.button(\s+[^>]*)?>/g, to: '<button$1>' },
  { from: /<\/motion\.button>/g, to: '</button>' },
  
  // Replace motion.img with img
  { from: /<motion\.img(\s+[^>]*)?>/g, to: '<img$1>' },
  { from: /<\/motion\.img>/g, to: '</img>' },
  
  // Replace motion.a with Link or a
  { from: /<motion\.a(\s+[^>]*)?>/g, to: '<a$1>' },
  { from: /<\/motion\.a>/g, to: '</a>' },
  
  // Replace motion.section with section
  { from: /<motion\.section(\s+[^>]*)?>/g, to: '<section$1>' },
  { from: /<\/motion\.section>/g, to: '</section>' },
  
  // Remove initial/animate/transition props from remaining motion elements
  { from: /\s+initial=\{[^}]+\}/g, to: '' },
  { from: /\s+animate=\{[^}]+\}/g, to: '' },
  { from: /\s+transition=\{[^}]+\}/g, to: '' },
  { from: /\s+whileHover=\{[^}]+\}/g, to: '' },
  { from: /\s+whileTap=\{[^}]+\}/g, to: '' },
  { from: /\s+whileInView=\{[^}]+\}/g, to: '' },
  { from: /\s+viewport=\{[^}]+\}/g, to: '' },
];

function processFile(filePath: string) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Apply all replacements
  for (const { from, to } of REPLACEMENTS) {
    content = content.replace(from, to);
  }
  
  // Clean up empty lines from removed imports
  content = content.replace(/^\s*[\r\n]/gm, '');
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // If content changed, write it
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ Updated: ${filePath}`);
    return true;
  }
  
  console.log(`  - No changes: ${filePath}`);
  return false;
}

function walkDir(dir: string, callback: (file: string) => void) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath, callback);
    } else if (stat.isFile() && file.endsWith('.tsx')) {
      callback(filePath);
    }
  }
}

function main() {
  console.log('🔧 Replacing Framer Motion with CSS animations...\n');
  
  let updatedCount = 0;
  
  for (const file of FILES_TO_FIX) {
    const filePath = path.join(PAGES_DIR, file);
    if (fs.existsSync(filePath)) {
      if (processFile(filePath)) {
        updatedCount++;
      }
    } else {
      console.log(`⚠ File not found: ${filePath}`);
    }
  }
  
  console.log(`\n✅ Done! Updated ${updatedCount} files.`);
  console.log('\n📝 Next steps:');
  console.log('1. Run `npm run build` to check for errors');
  console.log('2. Fix any remaining issues manually');
}

main();
