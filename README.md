# Teste de performance Sem Parar com k6

Projeto de testes de performance em k6 com configuração de ambiente via arquivos `.env` locais.

## Por que existe um runner Node?

O k6 não carrega arquivos `.env` automaticamente. Ele só enxerga variáveis expostas no processo por `__ENV`.

Para resolver isso, o projeto usa o script `scripts/run-k6.js`:

1. lê o arquivo `.env.<ambiente>`;
2. injeta as variáveis no processo do k6;
3. executa `k6 run` normalmente;
4. permite usar `__ENV` nos scripts k6 por meio de `config/env.js`.

## Arquivos de ambiente

Arquivos reais com segredos ficam apenas localmente e estão ignorados no `.gitignore`:

- `.env.hml`
- `.env.prd`
- `.env`

Arquivos seguros para versionamento:

- `.env.example`
- `.env.hml.example`
- `.env.prd.example`

## Configurar HML

O arquivo `.env.hml` foi criado a partir do `.env` atual para manter o comportamento já existente.

Para recriar manualmente:

```powershell
Copy-Item .env.hml.example .env.hml
```

Depois, preencha os valores reais.

## Configurar PRD

Crie o arquivo de produção a partir do exemplo:

```powershell
Copy-Item .env.prd.example .env.prd
```

Depois, preencha os valores reais de produção.

## Executar testes

### Fluxo completo em HML

```powershell
npm run test:hml
```

### Fluxo completo em PRD

```powershell
npm run test:prd
```

### Gerar saída JSON em HML

```powershell
npm run test:hml:full
```

### Cenários individuais em HML

```powershell
npm run test:hml:acumuloMotor
npm run test:hml:creditoVoucher
npm run test:hml:debitoVouchers
npm run test:hml:voucherExpirado
```

### Cenários individuais em PRD

```powershell
npm run test:prd:acumuloMotor
npm run test:prd:creditoVoucher
npm run test:prd:debitoVouchers
npm run test:prd:voucherExpirado
```

## Execução direta do runner

```powershell
node scripts/run-k6.js hml Scenarios/fluxoCompleto.js --out json=reports/resultado.json
node scripts/run-k6.js prd Scenarios/fluxoCompleto.js --summary-export=reports/summary.json
```

## Validação de variáveis obrigatórias

O arquivo `config/env.js` valida as variáveis obrigatórias. Se alguma variável estiver ausente ou vazia, o k6 falhará no início com uma mensagem indicando o nome da variável.

## Métricas e indicadores

A camada de métricas fica centralizada em:

```text
config/metrics.js
utils/metrics.js
config/thresholds.js
```

Indicadores customizados adicionados:

- `request_duration`: duração das chamadas por ambiente, serviço, operação, endpoint e cenário;
- `request_total`: total de chamadas instrumentadas;
- `request_success_rate` e `request_fail_rate`: sucesso/falha técnica;
- `business_success_rate` e `business_fail_rate`: sucesso/falha funcional considerando checks;
- `http_2xx_rate`, `http_3xx_rate`, `http_4xx_rate`, `http_5xx_rate`: distribuição por classe HTTP;
- `network_error_rate`: falhas de rede reportadas pelo k6;
- `request_payload_size` e `response_body_size`: tamanho de payload e resposta;
- `sla_compliance_rate`: percentual de respostas funcionais dentro do SLA configurado;
- `apdex_satisfied_rate`, `apdex_tolerated_rate`, `apdex_frustrated_rate`: experiência percebida por tempo de resposta;
- `token_vertem_duration` e `token_vertem_fail_rate`: geração de token Vertem;
- `token_aberto_duration` e `token_aberto_fail_rate`: geração de token Aberto.

Tags padronizadas usadas nas métricas:

```text
environment
service
operation
endpoint
scenario
status
status_class
```

Os thresholds estão em `config/thresholds.js` e fazem o pipeline falhar automaticamente quando os limites de performance, erro, SLA, Apdex ou checks forem violados.

Os relatórios gerados agora incluem:

```text
reports/summary.html
reports/summary.json
reports/summary.txt
```

## Backup e rollback

Antes da refatoração foi criado um backup local em:

```text
.backups/backup-pre-env-*.zip
```

Para rollback manual, extraia esse arquivo em uma pasta separada ou substitua os arquivos alterados pelo conteúdo do backup.
