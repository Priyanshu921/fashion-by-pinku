import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

// KeepAliveService
//
// Pings the application's own /health endpoint on a cron schedule to prevent
// Render's free tier from spinning down the server due to inactivity.
//
// Schedule: Every 5 minutes  →  "0 */5 * * * *"  (well within the 15-min sleep window)
//
// How it works:
//  - Render spins down after 15 minutes of *zero inbound traffic*.
//  - This service generates inbound traffic to itself every 5 minutes.
//  - fetch() is used (built into Node.js >= 18) so there are zero extra dependencies.
//  - In development (NODE_ENV !== 'production'), pings are skipped to avoid noise.
@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  /**
   * APP_URL must be set in your Render environment variables to your
   * deployed service URL, e.g. https://fashion-by-pinku.onrender.com
   * Falls back to localhost for local development (where pings are skipped anyway).
   */
  private readonly appUrl =
    process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL ?? 'http://localhost:3000';

  // Cron expression breakdown:  "0 */5 * * * *"
  //  - Seconds:  0          → trigger at the 0-second mark
  //  - Minutes:  */5        → every 5 minutes
  //  - Hours:    *          → every hour
  //  - Day/Month/Weekday: * → every day, every month
  //
  // This fires at :00, :05, :10, :15, etc. of every hour — 12 pings/hour.
  @Cron('0 */5 * * * *')
  async pingHealth(): Promise<void> {
    // Skip pings outside production to keep local logs clean
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(
        '[KeepAlive] Skipping ping in non-production environment.',
      );
      return;
    }

    const url = `${this.appUrl}/api/health`;

    try {
      const start = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(10_000), // 10-second timeout
      });
      const elapsed = Date.now() - start;

      if (response.ok) {
        this.logger.log(
          `[KeepAlive] ✅ Ping successful → ${url} | Status: ${response.status} | ${elapsed}ms`,
        );
      } else {
        this.logger.warn(
          `[KeepAlive] ⚠️  Ping returned non-OK status → ${url} | Status: ${response.status} | ${elapsed}ms`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[KeepAlive] ❌ Ping failed → ${url} | Error: ${message}`,
      );
    }
  }
}
