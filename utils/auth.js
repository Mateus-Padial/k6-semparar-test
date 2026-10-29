// ======================================
// AUTENTICAÇÃO (SETUP DE TOKENS)
// ======================================
// Centraliza a geração de tokens Vertem e Aberto, eliminando a duplicação que
// existia no setup() de cada cenário. Cada função gera o token, registra as
// métricas de autenticação e devolve o access_token.

import http from 'k6/http';
import { env } from '../config/env.js';
import { SERVICES, OPERATIONS, ENDPOINTS, SETUP_SCENARIO } from '../config/constants.js';
import { buildTags, recordTokenMetrics, recordResponseMetrics } from './metrics.js';

const FORM_URLENCODED = { 'Content-Type': 'application/x-www-form-urlencoded' };

// Gera o token do serviço Vertem (OAuth client_credentials).
export function setupVertemToken() {
    const tags = buildTags({
        environment: env.name,
        service: SERVICES.VERTEM,
        operation: OPERATIONS.TOKEN_VERTEM,
        endpoint: ENDPOINTS.TOKEN,
        scenario: SETUP_SCENARIO,
    });

    const payload = {
        client_id: env.vertem.clientId,
        client_secret: env.vertem.clientSecret,
        grant_type: env.vertem.grantType,
    };

    const response = http.post(env.vertem.tokenUrl, payload, { headers: FORM_URLENCODED, tags });
    const accessToken = response.json('access_token');

    recordTokenMetrics(response, SERVICES.VERTEM, tags);
    recordResponseMetrics(response, tags, {
        requestPayload: payload,
        businessSuccess: Boolean(accessToken),
    });

    console.log(`TOKEN VERTEM => status ${response.status}`);

    return accessToken;
}

// Gera o token do serviço Aberto. O Aberto espera o corpo como string
// x-www-form-urlencoded com a chave "client_Id" (capitalização específica).
export function setupAbertoToken() {
    const tags = buildTags({
        environment: env.name,
        service: SERVICES.ABERTO,
        operation: OPERATIONS.TOKEN_ABERTO,
        endpoint: ENDPOINTS.TOKEN,
        scenario: SETUP_SCENARIO,
    });

    const payload =
        `client_Id=${encodeURIComponent(env.aberto.clientId)}` +
        `&client_secret=${encodeURIComponent(env.aberto.clientSecret)}` +
        `&scope=${encodeURIComponent(env.aberto.scope)}` +
        `&grant_type=${encodeURIComponent(env.aberto.grantType)}`;

    const response = http.post(env.aberto.tokenUrl, payload, { headers: FORM_URLENCODED, tags });
    const accessToken = response.json('access_token');

    recordTokenMetrics(response, SERVICES.ABERTO, tags);
    recordResponseMetrics(response, tags, {
        requestPayload: payload,
        businessSuccess: Boolean(accessToken),
    });

    console.log(`TOKEN ABERTO => status ${response.status}`);

    return accessToken;
}
