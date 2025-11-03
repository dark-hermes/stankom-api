import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    const uptime = process.uptime();
    return {
      status: 'ok',
      uptime,
      timestamp: new Date().toISOString(),
    };
  }

  getHealthHtml() {
    const h = this.getHealth();
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>API Health</title>
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial;padding:2rem;background:#f6f8fa;color:#111}</style>
  </head>
  <body>
    <h1>API Health</h1>
    <p>Status: <strong>${h.status}</strong></p>
    <p>Uptime: <strong>${Math.round(h.uptime)}s</strong></p>
    <p>Timestamp: <strong>${h.timestamp}</strong></p>
  </body>
</html>`;
  }
}
