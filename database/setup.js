import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create or connect to database
const db = new Database(join(__dirname, "database.db"));

// Read and execute the schema
const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");

// Split by semicolon and execute each statement
const statements = schema.split(";").filter((stmt) => stmt.trim());

console.log("Setting up database...");
statements.forEach((statement, index) => {
  try {
    if (statement.trim()) {
      db.exec(statement);
    }
  } catch (error) {
    console.error(`Error executing statement ${index + 1}:`, error.message);
  }
});

console.log("Database setup complete!");
db.close();
