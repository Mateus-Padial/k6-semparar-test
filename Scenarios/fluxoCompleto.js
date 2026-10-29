import { setupVertemToken, setupAbertoToken } from '../utils/auth.js';
import { executeRequest } from '../utils/request.js';
import { buildSummary } from '../utils/report.js';
import { rampProfile } from '../config/load.js';
import { fullFlowThresholds } from '../config/thresholds.js';
import { SERVICES, OPERATIONS, ENDPOINTS } from '../config/constants.js';
import { env } from '../config/env.js';
import {
    buildAcumuloPayload,
    buildCreditoVoucherPayload,
    buildDebitoVoucherPayload,
    buildVoucherExpiradoPayload,
} from '../payloads/purchasePayload.js';

// ======================================
// OPTIONS
// ======================================

function rampScenario(exec, startTime) {
    return {
        executor: 'ramping-vus',
        exec,
        startTime,
        stages: rampProfile,
    };
}

export const options = {
    scenarios: {
        acumuloMotor: rampScenario('acumuloMotor', '0s'),
        creditoVoucher: rampScenario('creditoVoucher', '1m10s'),
        debitoVoucher: rampScenario('debitoVoucher', '2m20s'),
        voucherExpirado: rampScenario('voucherExpirado', '3m20s'),
    },
    thresholds: fullFlowThresholds,
};

// ======================================
// SETUP (TOKENS GLOBAIS)
// ======================================

export function setup() {
    console.log(`AMBIENTE K6 => ${env.name}`);

    return {
        vertemToken: setupVertemToken(),
        abertoToken: setupAbertoToken(),
    };
}

// ======================================
// EXECUÇÃO DOS CENÁRIOS
// ======================================

export function acumuloMotor(data) {
    executeRequest({
        url: env.urls.purchase,
        token: data.vertemToken,
        service: SERVICES.VERTEM,
        operation: OPERATIONS.ACUMULO_MOTOR,
        endpoint: ENDPOINTS.PURCHASE,
        body: buildAcumuloPayload(),
    });
}

export function creditoVoucher(data) {
    executeRequest({
        url: env.urls.purchaseOrchestrator,
        token: data.vertemToken,
        service: SERVICES.VERTEM,
        operation: OPERATIONS.CREDITO_VOUCHER,
        endpoint: ENDPOINTS.PURCHASE_ORCHESTRATOR,
        body: buildCreditoVoucherPayload(),
    });
}

export function debitoVoucher(data) {
    executeRequest({
        url: env.urls.purchase,
        token: data.vertemToken,
        service: SERVICES.VERTEM,
        operation: OPERATIONS.DEBITO_VOUCHER,
        endpoint: ENDPOINTS.PURCHASE,
        body: buildDebitoVoucherPayload(),
        extraHeaders: {
            'Ocp-Apim-Subscription-Key': env.apim.subscriptionKey,
        },
    });
}

export function voucherExpirado(data) {
    executeRequest({
        url: env.aberto.creditsExpirationUrl,
        token: data.abertoToken,
        service: SERVICES.ABERTO,
        operation: OPERATIONS.VOUCHER_EXPIRADO,
        endpoint: ENDPOINTS.CREDITS_EXPIRATION,
        body: buildVoucherExpiradoPayload(),
        accept: 'text/plain',
        extraHeaders: {
            'Ocp-Apim-Subscription-Key': env.aberto.subscriptionKey,
        },
    });
}

// ======================================
// REPORT
// ======================================

export const handleSummary = buildSummary;
