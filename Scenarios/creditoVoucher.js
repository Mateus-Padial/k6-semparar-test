import { setupVertemToken } from '../utils/auth.js';
import { executeRequest } from '../utils/request.js';
import { buildSummary } from '../utils/report.js';
import { smokeProfile } from '../config/load.js';
import { creditoVoucherThresholds } from '../config/thresholds.js';
import { SERVICES, OPERATIONS, ENDPOINTS } from '../config/constants.js';
import { env } from '../config/env.js';
import { buildCreditoVoucherPayload } from '../payloads/purchasePayload.js';

export const options = {
    stages: smokeProfile,
    thresholds: creditoVoucherThresholds,
};

export function setup() {
    return { vertemToken: setupVertemToken() };
}

export default function (data) {
    executeRequest({
        url: env.urls.purchaseOrchestrator,
        token: data.vertemToken,
        service: SERVICES.VERTEM,
        operation: OPERATIONS.CREDITO_VOUCHER,
        endpoint: ENDPOINTS.PURCHASE_ORCHESTRATOR,
        body: buildCreditoVoucherPayload(),
    });
}

export const handleSummary = buildSummary;
