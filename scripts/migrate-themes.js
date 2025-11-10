#!/usr/bin/env node

/**
 * Theme Migration Script
 *
 * This script helps migrate from the old multiple theme systems to the new unified system.
 * It performs the following tasks:
 *
 * 1. Scans files for old theme patterns
 * 2. Suggests replacements using semantic classes
 * 3. Generates a migration report
 * 4. Optionally applies automatic replacements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  srcDir: './src',
  extensions: ['tsx', 'ts', 'jsx', 'js', 'css'],
  outputDir: './migration-reports',
  dryRun: true, // Set to false to apply changes automatically
};

// Migration mappings from old patterns to new semantic classes
const MIGRATIONS = {
  // Old Tailwind classes to semantic classes
  tailwindToSemantic: {
    // Text colors
    'text-slate-900': 'text-primary',
    'text-slate-800': 'text-primary',
    'text-slate-700': 'text-secondary',
    'text-slate-600': 'text-secondary',
    'text-slate-500': 'text-tertiary',
    'text-slate-400': 'text-muted',
    'text-slate-300': 'text-muted',
    'text-slate-200': 'text-inverse',
    'text-slate-100': 'text-inverse',
    'text-white': 'text-inverse',
    'text-black': 'text-primary',
    'text-gray-900': 'text-primary',
    'text-gray-800': 'text-primary',
    'text-gray-700': 'text-secondary',
    'text-gray-600': 'text-secondary',
    'text-gray-500': 'text-tertiary',
    'text-gray-400': 'text-muted',
    'text-red-600': 'text-accent',
    'text-red-500': 'text-accent',
    'text-blue-600': 'text-link',
    'text-blue-500': 'text-link',

    // Background colors
    'bg-white': 'bg-primary',
    'bg-slate-50': 'bg-secondary',
    'bg-slate-100': 'bg-secondary',
    'bg-slate-900': 'bg-primary',
    'bg-slate-800': 'surface-primary',
    'bg-gray-50': 'bg-secondary',
    'bg-gray-100': 'bg-secondary',
    'bg-gray-900': 'bg-primary',

    // Borders
    'border-slate-200': 'border-primary',
    'border-slate-300': 'border-primary',
    'border-gray-200': 'border-primary',
    'border-gray-300': 'border-primary',

    // Shadows
    'shadow-sm': 'elevation-1',
    'shadow-md': 'elevation-2',
    'shadow-lg': 'elevation-3',
    'shadow-xl': 'elevation-4',
    'shadow-2xl': 'elevation-5',
  },

  // CSS custom properties to design tokens
  cssToTokens: {
    '--background': '--color-bg-primary',
    '--foreground': '--color-text-primary',
    '--primary': '--color-brand-primary',
    '--secondary': '--color-surface-secondary',
    '--muted': '--color-text-muted',
    '--border': '--color-border-primary',
    '--card': '--color-surface-primary',
    '--card-foreground': '--color-text-primary',
  },

  // Theme providers to unified system
  providers: {
    'next-themes': 'UnifiedThemeProvider',
    'ThemeProvider from "next-themes"': 'UnifiedThemeProvider',
    'useTheme from "next-themes"': 'useUnifiedTheme',
  },

  // Old theme classes to data-theme attributes
  themeClasses: {
    '.dark': '[data-theme="dark"]',
    'html.light-theme': '[data-theme="paper"]',
    '@media (prefers-color-scheme: dark)': '[data-theme="dark"]',
  }
};

class ThemeMigrator {
  constructor() {
    this.migrations = [];
    this.statistics = {
      filesScanned: 0,
      filesWithIssues: 0,
      totalIssues: 0,
      issuesByType: {},
    };
  }

  async run() {
    console.log('🎨 Starting theme migration analysis...\n');

    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Find all files to analyze
    const files = await this.findFiles();
    console.log(`Found ${files.length} files to analyze\n`);

    // Analyze each file
    for (const file of files) {
      await this.analyzeFile(file);
    }

    // Generate reports
    await this.generateReports();

    // Apply migrations if not in dry run mode
    if (!CONFIG.dryRun) {
      await this.applyMigrations();
    }

    this.printSummary();
  }

  async findFiles() {
    const patterns = CONFIG.extensions.map(ext =>
      `${CONFIG.srcDir}/**/*.${ext}`
    );

    const files = [];
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, { ignore: ['**/node_modules/**'] });
      files.push(...matches);
    }

    return files;
  }

  async analyzeFile(filePath) {
    this.statistics.filesScanned++;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = this.findIssues(filePath, content);

      if (issues.length > 0) {
        this.statistics.filesWithIssues++;
        this.statistics.totalIssues += issues.length;

        this.migrations.push({
          file: filePath,
          issues: issues,
          originalContent: content,
        });

        // Update statistics
        issues.forEach(issue => {
          this.statistics.issuesByType[issue.type] =
            (this.statistics.issuesByType[issue.type] || 0) + 1;
        });
      }
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  findIssues(filePath, content) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for old Tailwind classes
      Object.entries(MIGRATIONS.tailwindToSemantic).forEach(([oldClass, newClass]) => {
        if (line.includes(oldClass)) {
          issues.push({
            type: 'tailwind-class',
            line: lineNumber,
            column: line.indexOf(oldClass),
            oldValue: oldClass,
            newValue: newClass,
            context: line.trim(),
            severity: 'warning',
            message: `Replace Tailwind class "${oldClass}" with semantic class "${newClass}"`,
          });
        }
      });

      // Check for old CSS custom properties
      Object.entries(MIGRATIONS.cssToTokens).forEach(([oldProp, newProp]) => {
        if (line.includes(oldProp)) {
          issues.push({
            type: 'css-property',
            line: lineNumber,
            column: line.indexOf(oldProp),
            oldValue: oldProp,
            newValue: newProp,
            context: line.trim(),
            severity: 'info',
            message: `Consider replacing CSS property "${oldProp}" with design token "${newProp}"`,
          });
        }
      });

      // Check for old theme providers
      Object.entries(MIGRATIONS.providers).forEach(([oldProvider, newProvider]) => {
        if (line.includes(oldProvider)) {
          issues.push({
            type: 'provider',
            line: lineNumber,
            column: line.indexOf(oldProvider),
            oldValue: oldProvider,
            newValue: newProvider,
            context: line.trim(),
            severity: 'error',
            message: `Replace "${oldProvider}" with "${newProvider}"`,
          });
        }
      });

      // Check for old theme classes (CSS files)
      if (filePath.endsWith('.css')) {
        Object.entries(MIGRATIONS.themeClasses).forEach(([oldSelector, newSelector]) => {
          if (line.includes(oldSelector)) {
            issues.push({
              type: 'css-selector',
              line: lineNumber,
              column: line.indexOf(oldSelector),
              oldValue: oldSelector,
              newValue: newSelector,
              context: line.trim(),
              severity: 'warning',
              message: `Replace selector "${oldSelector}" with "${newSelector}"`,
            });
          }
        });
      }

      // Check for problematic blue text patterns
      const blueTextPattern = /text-blue-[5-9]00/g;
      let match;
      while ((match = blueTextPattern.exec(line)) !== null) {
        issues.push({
          type: 'blue-text-accessibility',
          line: lineNumber,
          column: match.index,
          oldValue: match[0],
          newValue: 'text-link',
          context: line.trim(),
          severity: 'error',
          message: `Blue text "${match[0]}" may be unreadable in dark mode. Use "text-link" instead.`,
        });
      }

      // Check for manual theme switching code
      if (line.includes('classList.add("dark")') || line.includes('classList.remove("dark")')) {
        issues.push({
          type: 'manual-theme-switching',
          line: lineNumber,
          column: 0,
          oldValue: line.trim(),
          newValue: 'setTheme("dark") // Use UnifiedThemeProvider',
          context: line.trim(),
          severity: 'warning',
          message: 'Manual theme switching detected. Use UnifiedThemeProvider instead.',
        });
      }
    });

    return issues;
  }

  async generateReports() {
    // Generate summary report
    const summaryReport = this.generateSummaryReport();
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'migration-summary.md'),
      summaryReport
    );

    // Generate detailed report
    const detailedReport = this.generateDetailedReport();
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'migration-details.md'),
      detailedReport
    );

    // Generate JSON report for tooling
    const jsonReport = {
      timestamp: new Date().toISOString(),
      statistics: this.statistics,
      migrations: this.migrations,
    };
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'migration-data.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    console.log(`📊 Reports generated in ${CONFIG.outputDir}/`);
  }

  generateSummaryReport() {
    return `# Theme Migration Summary

Generated: ${new Date().toISOString()}

## Statistics
- **Files Scanned:** ${this.statistics.filesScanned}
- **Files with Issues:** ${this.statistics.filesWithIssues}
- **Total Issues:** ${this.statistics.totalIssues}

## Issues by Type
${Object.entries(this.statistics.issuesByType)
  .map(([type, count]) => `- **${type}:** ${count}`)
  .join('\n')}

## Next Steps

### 1. Update Design Tokens
Import the new design token system in your main CSS file:
\`\`\`css
@import './src/styles/tokens/index.css';
@import './src/styles/components/index.css';
\`\`\`

### 2. Replace Theme Provider
Update your layout to use the unified theme provider:
\`\`\`tsx
import { UnifiedThemeProvider } from '@/components/providers/UnifiedThemeProvider';

// Replace existing ThemeProvider with:
<UnifiedThemeProvider defaultTheme="system">
  {children}
</UnifiedThemeProvider>
\`\`\`

### 3. Update Theme Switches
Replace existing theme switches with:
\`\`\`tsx
import { UnifiedThemeSwitch } from '@/components/ui/UnifiedThemeSwitch';
\`\`\`

### 4. Apply Semantic Classes
Review the detailed report and replace Tailwind classes with semantic equivalents.

### 5. Test Thoroughly
- Test all three themes: light, dark, and paper
- Verify text contrast and readability
- Check component interactions across themes
`;
  }

  generateDetailedReport() {
    let report = `# Detailed Migration Report

Generated: ${new Date().toISOString()}

`;

    this.migrations.forEach(migration => {
      report += `## ${migration.file}\n\n`;

      const issuesByType = {};
      migration.issues.forEach(issue => {
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = [];
        }
        issuesByType[issue.type].push(issue);
      });

      Object.entries(issuesByType).forEach(([type, issues]) => {
        report += `### ${type} (${issues.length} issues)\n\n`;

        issues.forEach(issue => {
          const severity = issue.severity === 'error' ? '🚨' :
                          issue.severity === 'warning' ? '⚠️' : 'ℹ️';

          report += `${severity} **Line ${issue.line}:** ${issue.message}\n`;
          report += `- **Old:** \`${issue.oldValue}\`\n`;
          report += `- **New:** \`${issue.newValue}\`\n`;
          report += `- **Context:** \`${issue.context}\`\n\n`;
        });
      });

      report += '\n---\n\n';
    });

    return report;
  }

  async applyMigrations() {
    console.log('🔧 Applying automatic migrations...\n');

    for (const migration of this.migrations) {
      try {
        let content = migration.originalContent;
        let changesMade = 0;

        // Apply safe migrations only (excluding manual review items)
        const safeMigrations = migration.issues.filter(issue =>
          ['tailwind-class', 'css-property'].includes(issue.type)
        );

        // Sort by line and column (descending) to avoid offset issues
        safeMigrations.sort((a, b) => {
          if (a.line !== b.line) return b.line - a.line;
          return b.column - a.column;
        });

        for (const issue of safeMigrations) {
          const oldContent = content;
          content = content.replace(
            new RegExp(escapeRegExp(issue.oldValue), 'g'),
            issue.newValue
          );

          if (content !== oldContent) {
            changesMade++;
          }
        }

        if (changesMade > 0) {
          fs.writeFileSync(migration.file, content);
          console.log(`✅ Applied ${changesMade} changes to ${migration.file}`);
        }
      } catch (error) {
        console.error(`❌ Error applying migration to ${migration.file}:`, error.message);
      }
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎨 THEME MIGRATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Files Scanned: ${this.statistics.filesScanned}`);
    console.log(`Files with Issues: ${this.statistics.filesWithIssues}`);
    console.log(`Total Issues: ${this.statistics.totalIssues}`);
    console.log('='.repeat(60));

    if (CONFIG.dryRun) {
      console.log('ℹ️  This was a DRY RUN - no files were modified');
      console.log('💡 Set CONFIG.dryRun = false to apply changes');
    } else {
      console.log('✅ Automatic migrations have been applied');
      console.log('⚠️  Please review manual changes in the detailed report');
    }

    console.log(`📊 Check reports in: ${CONFIG.outputDir}/`);
    console.log('='.repeat(60) + '\n');
  }
}

// Utility function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Run the migration if this script is executed directly
if (require.main === module) {
  const migrator = new ThemeMigrator();
  migrator.run().catch(console.error);
}

module.exports = ThemeMigrator;