#!/usr/bin/env node

/**
 * Run database migrations for Supabase
 * Reads SQL files from supabase/migrations and executes them
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read migration file
const migrationPath = join(
  __dirname,
  "../supabase/migrations/003_add_progress_column.sql",
);
const migrationSQL = readFileSync(migrationPath, "utf-8");

console.log("🚀 Running migration: 003_add_progress_column.sql");
console.log("📄 SQL:", migrationSQL.substring(0, 200) + "...");

// Execute migration
const { data, error } = await supabase.rpc("exec_sql", { sql: migrationSQL });

if (error) {
  console.error("❌ Migration failed:", error);

  // Try direct approach using REST API
  console.log("🔄 Trying direct SQL execution...");

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: migrationSQL }),
  });

  if (!response.ok) {
    console.error("❌ Direct execution also failed");
    console.error(
      "You need to run this SQL manually in Supabase Dashboard > SQL Editor:",
    );
    console.log("\n" + migrationSQL + "\n");
    process.exit(1);
  }

  console.log("✅ Migration executed via direct API");
} else {
  console.log("✅ Migration completed successfully!");
  console.log("Result:", data);
}

console.log("\n✅ Progress column added to generated_courses table");
console.log("You can now track lesson completion progress!");
