const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function parseEnvFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();

        if (!line || line.startsWith('#')) {
            continue;
        }

        const separatorIndex = line.indexOf('=');

        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        env[key] = value;
    }

    return env;
}

function printUsage() {
    console.log([
        'Uso:',
        '  node scripts/run-k6.js <ambiente> <script-k6> [argumentos-do-k6]',
        '',
        'Exemplos:',
        '  node scripts/run-k6.js hml Scenarios/fluxoCompleto.js',
        '  node scripts/run-k6.js prd Scenarios/fluxoCompleto.js --out json=reports/resultado.json',
        '',
        'O arquivo carregado será .env.<ambiente>, por exemplo .env.hml ou .env.prd.',
    ].join('\n'));
}

const [, , environmentName, scriptPath, ...k6Args] = process.argv;

if (!environmentName || !scriptPath || environmentName === '--help' || environmentName === '-h') {
    printUsage();
    process.exit(environmentName ? 0 : 1);
}

const rootDir = path.resolve(__dirname, '..');
const envFilePath = path.join(rootDir, `.env.${environmentName}`);
const absoluteScriptPath = path.resolve(rootDir, scriptPath);

if (!fs.existsSync(envFilePath)) {
    console.error(`Arquivo de ambiente não encontrado: ${envFilePath}`);
    console.error(`Crie o arquivo a partir de .env.${environmentName}.example ou .env.example.`);
    process.exit(1);
}

if (!fs.existsSync(absoluteScriptPath)) {
    console.error(`Script k6 não encontrado: ${absoluteScriptPath}`);
    process.exit(1);
}

const fileEnv = parseEnvFile(envFilePath);
const childEnv = {
    ...fileEnv,
    ...process.env,
    K6_ENV: environmentName,
};

const result = spawnSync('k6', ['run', ...k6Args, absoluteScriptPath], {
    cwd: rootDir,
    env: childEnv,
    stdio: 'inherit',
    shell: process.platform === 'win32',
});

if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}

process.exit(result.status ?? 1);
