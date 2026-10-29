import { check } from 'k6';
import { metrics } from '../config/metrics.js';

export const SLA = {
    satisfiedMs: 1000,
    toleratedMs: 4000,
};

export function buildTags({ environment, service, operation, endpoint, scenario }) {
    return {
        environment,
        service,
        operation,
        endpoint,
        scenario,
    };
}

export function statusClass(status) {
    if (status >= 200 && status < 300) {
        return '2xx';
    }

    if (status >= 300 && status < 400) {
        return '3xx';
    }

    if (status >= 400 && status < 500) {
        return '4xx';
    }

    if (status >= 500) {
        return '5xx';
    }

    return 'unknown';
}

export function bodySize(response) {
    if (!response || !response.body) {
        return 0;
    }

    return response.body.length;
}

export function payloadSize(payload) {
    if (payload === undefined || payload === null) {
        return 0;
    }

    if (typeof payload === 'string') {
        return payload.length;
    }

    return JSON.stringify(payload).length;
}

export function safeJson(response) {
    try {
        return response.json();
    } catch (error) {
        return null;
    }
}

export function runCommonChecks(response, {
    operation,
    expectedStatus = 200,
    requireBody = true,
    requireJson = false,
    validateBody,
} = {}) {
    const parsedBody = requireJson ? safeJson(response) : null;
    const checkName = operation || 'request';

    const checks = {
        [`${checkName} status ${expectedStatus}`]: (r) => r.status === expectedStatus,
        [`${checkName} sem erro de rede`]: (r) => !r.error_code,
    };

    if (requireBody) {
        checks[`${checkName} body não vazio`] = (r) => Boolean(r.body && r.body.length > 0);
    }

    if (requireJson) {
        checks[`${checkName} JSON válido`] = () => parsedBody !== null;
    }

    if (validateBody) {
        checks[`${checkName} regra funcional válida`] = () => validateBody(parsedBody, response);
    }

    return check(response, checks);
}

export function recordResponseMetrics(response, tags, {
    requestPayload,
    businessSuccess,
    expectedStatus = 200,
    satisfiedMs = SLA.satisfiedMs,
    toleratedMs = SLA.toleratedMs,
} = {}) {
    const status = response ? response.status : 0;
    const duration = response && response.timings ? response.timings.duration : 0;
    const statusGroup = statusClass(status);
    const networkError = Boolean(response && response.error_code);
    const technicalSuccess = !networkError && status >= 200 && status < 300;
    const expectedStatusSuccess = !networkError && status === expectedStatus;
    const functionalSuccess = businessSuccess === undefined ? expectedStatusSuccess : Boolean(businessSuccess);

    const metricTags = {
        ...tags,
        status: String(status),
        status_class: statusGroup,
    };

    metrics.requestDuration.add(duration, metricTags);
    metrics.requestPayloadSize.add(payloadSize(requestPayload), metricTags);
    metrics.responseBodySize.add(bodySize(response), metricTags);

    metrics.requestTotal.add(1, metricTags);
    metrics.requestSuccessRate.add(technicalSuccess, metricTags);
    metrics.requestFailRate.add(!technicalSuccess, metricTags);

    metrics.businessSuccessRate.add(functionalSuccess, metricTags);
    metrics.businessFailRate.add(!functionalSuccess, metricTags);

    if (functionalSuccess) {
        metrics.businessSuccessTotal.add(1, metricTags);
    } else {
        metrics.businessFailTotal.add(1, metricTags);
    }

    metrics.http2xxRate.add(statusGroup === '2xx', metricTags);
    metrics.http3xxRate.add(statusGroup === '3xx', metricTags);
    metrics.http4xxRate.add(statusGroup === '4xx', metricTags);
    metrics.http5xxRate.add(statusGroup === '5xx', metricTags);
    metrics.networkErrorRate.add(networkError, metricTags);

    metrics.slaComplianceRate.add(functionalSuccess && duration <= satisfiedMs, metricTags);
    metrics.apdexSatisfiedRate.add(functionalSuccess && duration <= satisfiedMs, metricTags);
    metrics.apdexToleratedRate.add(functionalSuccess && duration > satisfiedMs && duration <= toleratedMs, metricTags);
    metrics.apdexFrustratedRate.add(!functionalSuccess || duration > toleratedMs, metricTags);
}

export function recordTokenMetrics(response, tokenProvider, tags) {
    const status = response ? response.status : 0;
    const duration = response && response.timings ? response.timings.duration : 0;
    const failed = Boolean(response && response.error_code) || status < 200 || status >= 300;
    const metricTags = {
        ...tags,
        status: String(status),
        status_class: statusClass(status),
    };

    if (tokenProvider === 'vertem') {
        metrics.tokenVertemDuration.add(duration, metricTags);
        metrics.tokenVertemFailRate.add(failed, metricTags);
        return;
    }

    if (tokenProvider === 'aberto') {
        metrics.tokenAbertoDuration.add(duration, metricTags);
        metrics.tokenAbertoFailRate.add(failed, metricTags);
    }
}
