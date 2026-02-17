import { Controller, Get, Post, Body, Req, UnauthorizedException, Param } from '@nestjs/common';
import { Request } from 'express';
import { PostsService } from './posts.service';
import { OAuthService } from '../oauth/oauth.service';
import { AuthService } from '../auth/auth.service';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private oauthService: OAuthService,
    private authService: AuthService,
  ) {}

  private getUserIdFromRequest(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Try OAuth token first
    try {
      const accessToken = this.oauthService.verifyAccessToken(token) as any;
      return accessToken.user_id;
    } catch {
      // Try JWT token
      const payload = this.authService.verifyToken(token) as any;
      return payload.userId;
    }
  }

  @Post()
  async createPost(@Body() body: { content: string }, @Req() req: Request) {
    const userId = this.getUserIdFromRequest(req);
    return this.postsService.createPost(userId, body.content);
  }

  @Get()
  async getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get('my')
  async getMyPosts(@Req() req: Request) {
    const userId = this.getUserIdFromRequest(req);
    return this.postsService.getPostsByUser(userId);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }
}
