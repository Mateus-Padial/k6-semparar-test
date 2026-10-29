import { setupVertemToken } from '../utils/auth.js';
import { executeRequest } from '../utils/request.js';
import { buildSummary } from '../utils/report.js';
import { smokeProfile } from '../config/load.js';
import { acumuloMotorThresholds } from '../config/thresholds.js';
import { SERVICES, OPERATIONS, ENDPOINTS } from '../config/constants.js';
import { env } from '../config/env.js';
import { buildAcumuloPayload } from '../payloads/purchasePayload.js';

export const options = {
    stages: smokeProfile,
    thresholds: acumuloMotorThresholds,
};

export function setup() {
    return { vertemToken: setupVertemToken() };
}

export default function (data) {
    executeRequest({
        url: env.urls.purchase,
        token: data.vertemToken,
        service: SERVICES.VERTEM,
        operation: OPERATIONS.ACUMULO_MOTOR,
        endpoint: ENDPOINTS.PURCHASE,
        body: buildAcumuloPayload(),
    });
}

export const handleSummary = buildSummary;
