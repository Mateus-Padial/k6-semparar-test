import { setupAbertoToken } from '../utils/auth.js';
import { executeRequest } from '../utils/request.js';
import { buildSummary } from '../utils/report.js';
import { rampProfile } from '../config/load.js';
import { voucherExpiradoThresholds } from '../config/thresholds.js';
import { SERVICES, OPERATIONS, ENDPOINTS } from '../config/constants.js';
import { env } from '../config/env.js';
import { buildVoucherExpiradoPayload } from '../payloads/purchasePayload.js';

export const options = {
    stages: rampProfile,
    thresholds: voucherExpiradoThresholds,
};

export function setup() {
    return { abertoToken: setupAbertoToken() };
}

export default function (data) {
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

export const handleSummary = buildSummary;
