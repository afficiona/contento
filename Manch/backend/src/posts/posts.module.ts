import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { OAuthModule } from '../oauth/oauth.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OAuthModule, AuthModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
