import { Controller, Get, Post, Query, Body, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { OAuthService } from './oauth.service';
import { AuthService } from '../auth/auth.service';

@Controller('oauth')
export class OAuthController {
  constructor(
    private oauthService: OAuthService,
    private authService: AuthService,
  ) {}

  @Get('authorize')
  authorize(
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('state') state: string,
    @Query('response_type') responseType: string,
    @Res() res: Response,
  ) {
    // Validate client
    this.oauthService.validateClient(clientId);

    // In a real app, this would redirect to a login/authorization page
    // For POC, we'll return a JSON response with authorization URL info
    res.json({
      message: 'Authorization required',
      clientId,
      redirectUri,
      state,
      responseType,
      authorizationUrl: `http://localhost:3000/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
    });
  }

  @Post('authorize/approve')
  async approveAuthorization(
    @Body() body: {
      client_id: string;
      redirect_uri: string;
      state: string;
      user_token: string;
    },
    @Res() res: Response,
  ) {
    // Verify user token
    const payload = this.authService.verifyToken(body.user_token) as any;

    // Create authorization code
    const code = this.oauthService.createAuthorizationCode(
      body.client_id,
      payload.userId,
      body.redirect_uri,
    );

    // Redirect back to client with code
    const separator = body.redirect_uri.includes('?') ? '&' : '?';
    const redirectUrl = `${body.redirect_uri}${separator}code=${code}&state=${body.state}`;
    res.json({ redirectUrl, code, state: body.state });
  }

  @Post('token')
  async token(
    @Body() body: {
      grant_type: string;
      code: string;
      redirect_uri: string;
      client_id: string;
      client_secret: string;
    },
  ) {
    if (body.grant_type !== 'authorization_code') {
      throw new UnauthorizedException('Unsupported grant type');
    }

    // Validate client
    this.oauthService.validateClient(body.client_id, body.client_secret);

    // Exchange code for token
    return this.oauthService.exchangeCodeForToken(
      body.code,
      body.client_id,
      body.redirect_uri,
    );
  }

  @Get('userinfo')
  async userinfo(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const accessToken = this.oauthService.verifyAccessToken(token) as any;

    const user = this.authService.getUserById(accessToken.user_id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  @Post('revoke')
  async revoke(@Body() body: { token: string }) {
    const success = this.oauthService.revokeAccessToken(body.token);

    if (!success) {
      throw new UnauthorizedException('Invalid token');
    }

    return { message: 'Token revoked successfully' };
  }
}
