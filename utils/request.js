// ======================================
// EXECUTOR DE REQUISIÇÃO (TEMPLATE METHOD)
// ======================================
// Encapsula o fluxo repetido em todos os cenários: montar tags, serializar o
// body, fazer o POST, rodar os checks, registrar métricas, logar e aplicar o
// think time. Cada cenário passa apenas o que é específico dele.

import http from 'k6/http';
import { sleep } from 'k6';
import exec from 'k6/execution';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { env } from '../config/env.js';
import { DEFAULT_SLEEP_SECONDS, DEFAULT_EXPECTED_STATUS } from '../config/constants.js';
import { buildTags, recordResponseMetrics, runCommonChecks } from './metrics.js';
import { logResponse } from './logger.js';

// Monta os headers padrão de uma requisição autenticada em JSON.
// Headers extras (ex.: Ocp-Apim-Subscription-Key) podem ser mesclados.
function buildHeaders(token, extraHeaders) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Idempotency-Key': uuidv4(),
        ...extraHeaders,
    };
}

// Executa uma iteração completa de cenário.
//
// Parâmetros:
//   url           - endpoint alvo (obrigatório)
//   token         - access_token para o header Authorization (obrigatório)
//   service       - SERVICES.* usado nas tags (obrigatório)
//   operation     - OPERATIONS.* usado nas tags e checks (obrigatório)
//   endpoint      - ENDPOINTS.* usado nas tags (obrigatório)
//   body          - objeto do corpo da requisição (obrigatório)
//   extraHeaders  - headers adicionais (opcional)
//   expectedStatus- status HTTP de sucesso (opcional, padrão 200)
//   requireBody   - exige body não vazio no check (opcional, padrão true)
//   accept        - valor do header Accept (opcional)
//   sleepSeconds  - think time após a iteração (opcional, padrão 1)
//   logSuccess    - loga também respostas de sucesso (opcional, padrão false)
//
// Retorna a resposta HTTP do k6.
export function executeRequest({
    url,
    token,
    service,
    operation,
    endpoint,
    body,
    extraHeaders,
    expectedStatus = DEFAULT_EXPECTED_STATUS,
    requireBody = true,
    accept,
    sleepSeconds = DEFAULT_SLEEP_SECONDS,
    logSuccess = false,
}) {
    const scenario = exec.scenario.name;

    const tags = buildTags({
        environment: env.name,
        service,
        operation,
        endpoint,
        scenario,
    });

    const headers = buildHeaders(token, extraHeaders);
    if (accept) {
        headers.accept = accept;
    }

    const requestPayload = JSON.stringify(body);

    const response = http.post(url, requestPayload, { headers, tags });

    const checksOk = runCommonChecks(response, {
        operation,
        expectedStatus,
        requireBody,
    });

    recordResponseMetrics(response, tags, {
        requestPayload,
        businessSuccess: checksOk,
        expectedStatus,
    });

    logResponse(response, scenario, { logSuccess });

    if (sleepSeconds > 0) {
        sleep(sleepSeconds);
    }

    return response;
}
