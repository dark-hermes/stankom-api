/* Jest e2e global setup: run prisma migrations and seed base user */
const { execSync } = require('node:child_process');

module.exports = async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/stankom_test';

    try {
        console.log('[globalSetup] Running prisma migrate deploy...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('[globalSetup] Running prisma generate...');
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('[globalSetup] Seeding base data...');
        execSync('npm run -s seed', { stdio: 'inherit' });
    } catch (err) {
        console.error('[globalSetup] Failed:', err);
        throw err;
    }
};
