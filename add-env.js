const { execSync } = require('child_process');
const fs = require('fs');

const envs = fs.readFileSync('.env.local', 'utf8').split('\n');
const environments = ['production', 'preview', 'development'];

for (const line of envs) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;

    const [key, ...rest] = line.split('=');
    let value = rest.join('=').trim();

    // Remove quotes
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
    }

    console.log(`Adding ${key}...`);

    console.log(`Removing old ${key} if it exists...`);
    for (const env of environments) {
        try {
            execSync(`npx vercel env rm ${key} ${env} -y`, { stdio: 'ignore' });
        } catch (e) {
            // Ignore if it doesn't exist
        }
    }

    for (const env of environments) {
        try {
            // Using printf "%s" avoids trailing newlines
            execSync(`printf "%s" "${value}" | npx vercel env add ${key} ${env}`, { stdio: 'inherit' });
            console.log(`  Added to ${env}`);
        } catch (e) {
            console.error(`  Failed to add to ${env}`);
        }
    }
}
console.log('Done mapping env variables');
