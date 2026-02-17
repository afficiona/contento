import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PostsService {
  constructor(private databaseService: DatabaseService) {}

  createPost(userId: string, content: string) {
    const db = this.databaseService.getDb();
    const postId = randomUUID();

    db.prepare(`
      INSERT INTO posts (id, user_id, content, created_at)
      VALUES (?, ?, ?, ?)
    `).run(postId, userId, content, Date.now());

    return {
      id: postId,
      userId,
      content,
      createdAt: Date.now(),
    };
  }

  getPostsByUser(userId: string) {
    const db = this.databaseService.getDb();
    const posts = db.prepare(`
      SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId);

    return posts;
  }

  getAllPosts() {
    const db = this.databaseService.getDb();
    const posts = db.prepare(`
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 100
    `).all();

    return posts;
  }

  getPostById(postId: string) {
    const db = this.databaseService.getDb();
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    return post;
  }
}
