import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Database from 'better-sqlite3';
import * as path from 'path';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: Database.Database;

  onModuleInit() {
    const DatabaseConstructor = (Database as any).default || Database;
    this.db = new DatabaseConstructor(path.join(__dirname, '../../manch.db'));
    this.initializeTables();
  }

  getDb(): Database.Database {
    return this.db;
  }

  private initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS oauth_clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        client_id TEXT UNIQUE NOT NULL,
        client_secret TEXT NOT NULL,
        redirect_uris TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
        code TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        redirect_uri TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS oauth_access_tokens (
        token TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_oauth_providers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(provider, provider_user_id)
      );
    `);

    // Seed Prasaran OAuth client
    this.db.prepare(`
      INSERT OR IGNORE INTO oauth_clients (id, name, client_id, client_secret, redirect_uris, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'prasaran-client',
      'Prasaran',
      'prasaran-client-id',
      'prasaran-client-secret',
      'http://localhost:3001/api/oauth/callback',
      Date.now()
    );
  }
}
