# Database Schema and Scripts

This file contains the SQL scripts required to set up the database for this application.

## Schema Configuration

The application supports a configurable schema (defaulting to `public`).

```sql
-- Replace 'public' with your specific schema name if different
CREATE SCHEMA IF NOT EXISTS "public";
SET search_path TO "public";
```

## Table Creation Scripts

### 1. Todos Table
Stores the task items.

```sql
CREATE TABLE IF NOT EXISTS "todos" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

### 2. Contacts Table
Stores contact form submissions.

```sql
CREATE TABLE IF NOT EXISTS "contacts" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

## Seed Data (Optional)

Here are some sample insert statements to populate the tables with initial data.

```sql
-- Insert sample todos
INSERT INTO "todos" (title, completed) VALUES 
('Setup Railway project', true),
('Connect Database', true),
('Test API endpoints', false);

-- Insert sample contacts
INSERT INTO "contacts" (name, email) VALUES 
('Alice Smith', 'alice@example.com'),
('Bob Jones', 'bob@example.com');
```

## Drop Tables (Cleanup)

Use these commands if you need to reset the database. **Warning: This deletes all data.**

```sql
DROP TABLE IF EXISTS "todos";
DROP TABLE IF EXISTS "contacts";
```
