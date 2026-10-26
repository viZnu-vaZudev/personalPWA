import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
for (const name of ['.env.local', '.env']) {
  const file = new URL('../' + name, import.meta.url);
  if (existsSync(file)) loadEnvFile(fileURLToPath(file));
}
import { writeFile } from 'node:fs/promises';
const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)
  throw new Error(
    'Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY for the confirmed MyCompass project.',
  );
const url = new URL(SUPABASE_URL);
if (
  url.username ||
  url.password ||
  (url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))
)
  throw new Error(
    'Use HTTPS, or HTTP only for loopback local development. Do not include database credentials.',
  );
let publicKey = SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_');
if (!publicKey) {
  try {
    publicKey =
      JSON.parse(Buffer.from(SUPABASE_PUBLISHABLE_KEY.split('.')[1], 'base64url').toString())
        .role === 'anon';
  } catch {
    /* rejected below */
  }
}
if (!publicKey)
  throw new Error('Use a publishable key or legacy anon key. Server secrets are rejected.');
const config = { supabaseUrl: url.origin, supabasePublishableKey: SUPABASE_PUBLISHABLE_KEY };
await writeFile(
  new URL('../src/app/core/backend-config.ts', import.meta.url),
  '// Public browser configuration. Never add server secrets.\nexport const backendConfig = ' +
    JSON.stringify(config, null, 2) +
    ';\n',
);
console.log(
  'Configured public Supabase connection for ' + url.origin + '. Rebuild the application.',
);
