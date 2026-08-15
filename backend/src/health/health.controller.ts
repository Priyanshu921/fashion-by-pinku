import { Controller, Get } from '@nestjs/common';

/**
 * HealthController
 *
 * Exposes a lightweight `/health` endpoint that external uptime monitors
 * (UptimeRobot, cron-job.org) and the internal KeepAliveService can ping
 * to prevent Render Free Tier cold starts.
 *
 * Route: GET /api/health  (because app.setGlobalPrefix('api') is set in main.ts)
 */
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
