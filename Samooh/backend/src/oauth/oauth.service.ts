import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { randomUUID } from 'crypto';

@Injectable()
export class OAuthService {
  constructor(private databaseService: DatabaseService) {}

  validateClient(clientId: string, clientSecret?: string) {
    const db = this.databaseService.getDb();
    const query = clientSecret
      ? 'SELECT * FROM oauth_clients WHERE client_id = ? AND client_secret = ?'
      : 'SELECT * FROM oauth_clients WHERE client_id = ?';

    const params = clientSecret ? [clientId, clientSecret] : [clientId];
    const client = db.prepare(query).get(...params) as any;

    if (!client) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    return client;
  }

  createAuthorizationCode(clientId: string, userId: string, redirectUri: string) {
    const db = this.databaseService.getDb();
    const code = randomUUID();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    db.prepare(`
      INSERT INTO oauth_authorization_codes (code, client_id, user_id, redirect_uri, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(code, clientId, userId, redirectUri, expiresAt, Date.now());

    return code;
  }

  exchangeCodeForToken(code: string, clientId: string, redirectUri: string) {
    const db = this.databaseService.getDb();

    const authCode = db.prepare(`
      SELECT * FROM oauth_authorization_codes
      WHERE code = ? AND client_id = ? AND redirect_uri = ? AND used = 0
    `).get(code, clientId, redirectUri) as any;

    if (!authCode) {
      throw new BadRequestException('Invalid authorization code');
    }

    if (authCode.expires_at < Date.now()) {
      throw new BadRequestException('Authorization code expired');
    }

    // Mark code as used
    db.prepare('UPDATE oauth_authorization_codes SET used = 1 WHERE code = ?').run(code);

    // Create access token
    const accessToken = randomUUID();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    db.prepare(`
      INSERT INTO oauth_access_tokens (token, client_id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(accessToken, clientId, authCode.user_id, expiresAt, Date.now());

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 30 * 24 * 60 * 60,
    };
  }

  verifyAccessToken(token: string) {
    const db = this.databaseService.getDb();
    const accessToken = db.prepare(`
      SELECT * FROM oauth_access_tokens WHERE token = ?
    `).get(token) as any;

    if (!accessToken) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (accessToken.expires_at < Date.now()) {
      throw new UnauthorizedException('Access token expired');
    }

    return accessToken;
  }

  revokeAccessToken(token: string): boolean {
    const db = this.databaseService.getDb();

    // Check if token exists
    const accessToken = db.prepare(`
      SELECT * FROM oauth_access_tokens WHERE token = ?
    `).get(token) as any;

    if (!accessToken) {
      return false;
    }

    // Delete the token
    db.prepare('DELETE FROM oauth_access_tokens WHERE token = ?').run(token);

    return true;
  }
}
