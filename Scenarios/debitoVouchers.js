import { setupVertemToken } from '../utils/auth.js';
import { executeRequest } from '../utils/request.js';
import { buildSummary } from '../utils/report.js';
import { smokeProfile } from '../config/load.js';
import { debitoVoucherThresholds } from '../config/thresholds.js';
import { SERVICES, OPERATIONS, ENDPOINTS } from '../config/constants.js';
import { env } from '../config/env.js';
import { buildDebitoVoucherPayload } from '../payloads/purchasePayload.js';

export const options = {
    stages: smokeProfile,
    thresholds: debitoVoucherThresholds,
};

export function setup() {
    return { vertemToken: setupVertemToken() };
}

export default function (data) {
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

export const handleSummary = buildSummary;
