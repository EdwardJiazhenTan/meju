#!/usr/bin/env node

/**
 * Script to populate the ingredients table with comprehensive English and Chinese ingredients
 * including calorie data for automatic dish calorie calculation.
 * 
 * Usage: node scripts/update-database.js
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const DB_PATH = path.join(__dirname, '../database/database.db');
const SQL_SCRIPT_PATH = path.join(__dirname, 'populate-ingredients.sql');

function main() {
    try {
        console.log('🔧 Starting database update...');
        
        // Check if database exists
        if (!fs.existsSync(DB_PATH)) {
            console.error('❌ Database not found at:', DB_PATH);
            console.log('Please ensure the database exists. You might need to run the setup script first.');
            process.exit(1);
        }

        // Check if SQL script exists
        if (!fs.existsSync(SQL_SCRIPT_PATH)) {
            console.error('❌ SQL script not found at:', SQL_SCRIPT_PATH);
            process.exit(1);
        }

        console.log('📖 Reading SQL script...');
        const sqlScript = fs.readFileSync(SQL_SCRIPT_PATH, 'utf8');

        console.log('🔗 Connecting to database...');
        const db = new Database(DB_PATH);

        // Enable foreign key constraints
        db.pragma('foreign_keys = ON');

        console.log('📊 Current ingredients count:');
        const beforeCount = db.prepare('SELECT COUNT(*) as count FROM ingredients').get();
        console.log(`   Total: ${beforeCount?.count || 0}`);
        
        const beforeEnCount = db.prepare('SELECT COUNT(*) as count FROM ingredients WHERE language_code = ?').get('en');
        const beforeZhCount = db.prepare('SELECT COUNT(*) as count FROM ingredients WHERE language_code = ?').get('zh-CN');
        console.log(`   English: ${beforeEnCount?.count || 0}, Chinese: ${beforeZhCount?.count || 0}`);

        console.log('💾 Executing SQL script...');
        
        // Split SQL script into individual statements and execute them
        const statements = sqlScript
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('SELECT'));

        let successCount = 0;
        
        for (const statement of statements) {
            try {
                if (statement.toUpperCase().includes('INSERT') || 
                    statement.toUpperCase().includes('UPDATE') || 
                    statement.toUpperCase().includes('CREATE INDEX')) {
                    db.exec(statement);
                    successCount++;
                }
            } catch (error) {
                console.warn(`⚠️  Warning executing statement: ${error.message}`);
            }
        }

        console.log(`✅ Successfully executed ${successCount} statements`);

        console.log('📊 Updated ingredients count:');
        const afterCount = db.prepare('SELECT COUNT(*) as count FROM ingredients').get();
        console.log(`   Total: ${afterCount?.count || 0}`);
        
        const afterEnCount = db.prepare('SELECT COUNT(*) as count FROM ingredients WHERE language_code = ?').get('en');
        const afterZhCount = db.prepare('SELECT COUNT(*) as count FROM ingredients WHERE language_code = ?').get('zh-CN');
        console.log(`   English: ${afterEnCount?.count || 0}, Chinese: ${afterZhCount?.count || 0}`);

        // Show sample data
        console.log('📋 Sample ingredients with calories:');
        const sampleIngredients = db.prepare(`
            SELECT ingredient_key, name, calories_per_unit, unit, language_code 
            FROM ingredients 
            WHERE ingredient_key IN ('tomato', 'chicken_breast', 'rice', 'tofu') 
            ORDER BY ingredient_key, language_code
        `).all();

        sampleIngredients.forEach(ing => {
            console.log(`   ${ing.ingredient_key}: ${ing.name} (${ing.calories_per_unit} cal/${ing.unit}) [${ing.language_code}]`);
        });

        db.close();
        console.log('🎉 Database update completed successfully!');
        console.log('');
        console.log('Now your dish creation form will automatically calculate calories based on ingredients.');

    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        process.exit(1);
    }
}

// Run main function if this file is executed directly
main();