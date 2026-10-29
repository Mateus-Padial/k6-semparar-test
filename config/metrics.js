import { Trend, Rate, Counter } from 'k6/metrics';

export const metrics = {
    requestDuration: new Trend('request_duration', true),
    requestPayloadSize: new Trend('request_payload_size'),
    responseBodySize: new Trend('response_body_size'),

    requestTotal: new Counter('request_total'),
    businessSuccessTotal: new Counter('business_success_total'),
    businessFailTotal: new Counter('business_fail_total'),

    requestSuccessRate: new Rate('request_success_rate'),
    requestFailRate: new Rate('request_fail_rate'),
    businessSuccessRate: new Rate('business_success_rate'),
    businessFailRate: new Rate('business_fail_rate'),

    http2xxRate: new Rate('http_2xx_rate'),
    http3xxRate: new Rate('http_3xx_rate'),
    http4xxRate: new Rate('http_4xx_rate'),
    http5xxRate: new Rate('http_5xx_rate'),
    networkErrorRate: new Rate('network_error_rate'),

    slaComplianceRate: new Rate('sla_compliance_rate'),
    apdexSatisfiedRate: new Rate('apdex_satisfied_rate'),
    apdexToleratedRate: new Rate('apdex_tolerated_rate'),
    apdexFrustratedRate: new Rate('apdex_frustrated_rate'),

    tokenVertemDuration: new Trend('token_vertem_duration', true),
    tokenVertemFailRate: new Rate('token_vertem_fail_rate'),
    tokenAbertoDuration: new Trend('token_aberto_duration', true),
    tokenAbertoFailRate: new Rate('token_aberto_fail_rate'),
};
