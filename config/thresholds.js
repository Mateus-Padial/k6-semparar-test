const baseThresholds = {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(90)<800', 'p(95)<1200', 'p(99)<2500'],
    checks: ['rate>0.99'],

    request_fail_rate: ['rate<0.01'],
    request_success_rate: ['rate>0.99'],
    business_fail_rate: ['rate<0.01'],
    business_success_rate: ['rate>0.99'],
    http_5xx_rate: ['rate<0.005'],
    http_4xx_rate: ['rate<0.02'],
    network_error_rate: ['rate<0.001'],
    sla_compliance_rate: ['rate>0.95'],
    apdex_frustrated_rate: ['rate<0.05'],
};

const vertemTokenThresholds = {
    token_vertem_fail_rate: ['rate<0.01'],
    token_vertem_duration: ['p(95)<1000'],
    'request_fail_rate{service:vertem}': ['rate<0.01'],
    'business_fail_rate{service:vertem}': ['rate<0.01'],
};

const abertoTokenThresholds = {
    token_aberto_fail_rate: ['rate<0.01'],
    token_aberto_duration: ['p(95)<1500'],
    'request_fail_rate{service:aberto}': ['rate<0.01'],
    'business_fail_rate{service:aberto}': ['rate<0.01'],
};

export const acumuloMotorThresholds = {
    ...baseThresholds,
    ...vertemTokenThresholds,
    'http_req_duration{operation:acumulo_motor}': ['p(95)<1200', 'p(99)<2500'],
};

export const creditoVoucherThresholds = {
    ...baseThresholds,
    ...vertemTokenThresholds,
    'http_req_duration{operation:credito_voucher}': ['p(95)<1500', 'p(99)<3000'],
};

export const debitoVoucherThresholds = {
    ...baseThresholds,
    ...vertemTokenThresholds,
    'http_req_duration{operation:debito_voucher}': ['p(95)<1500', 'p(99)<3000'],
};

export const voucherExpiradoThresholds = {
    ...baseThresholds,
    ...abertoTokenThresholds,
    'http_req_duration{operation:voucher_expirado}': ['p(95)<1500', 'p(99)<3000'],
};

export const fullFlowThresholds = {
    ...baseThresholds,
    ...vertemTokenThresholds,
    ...abertoTokenThresholds,
    'http_req_duration{operation:acumulo_motor}': ['p(95)<1200', 'p(99)<2500'],
    'http_req_duration{operation:credito_voucher}': ['p(95)<1500', 'p(99)<3000'],
    'http_req_duration{operation:debito_voucher}': ['p(95)<1500', 'p(99)<3000'],
    'http_req_duration{operation:voucher_expirado}': ['p(95)<1500', 'p(99)<3000'],
};

export const thresholds = baseThresholds;
