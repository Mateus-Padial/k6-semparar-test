// ======================================
// CONSTANTES COMPARTILHADAS
// ======================================
// Centraliza nomes de serviços, operações e endpoints usados nas tags de
// métricas. Evita strings soltas espalhadas pelos cenários (magic values) e
// garante consistência entre tags, thresholds e relatórios.

export const SERVICES = {
    VERTEM: 'vertem',
    ABERTO: 'aberto',
};

export const OPERATIONS = {
    TOKEN_VERTEM: 'token_vertem',
    TOKEN_ABERTO: 'token_aberto',
    ACUMULO_MOTOR: 'acumulo_motor',
    CREDITO_VOUCHER: 'credito_voucher',
    DEBITO_VOUCHER: 'debito_voucher',
    VOUCHER_EXPIRADO: 'voucher_expirado',
};

export const ENDPOINTS = {
    TOKEN: 'token',
    PURCHASE: 'purchase',
    PURCHASE_ORCHESTRATOR: 'purchase_orchestrator',
    CREDITS_EXPIRATION: 'credits_expiration',
};

// Nome usado nas tags durante a fase de setup (geração de token).
export const SETUP_SCENARIO = 'setup';

// Think time padrão entre iterações, em segundos.
export const DEFAULT_SLEEP_SECONDS = 1;

// Status HTTP esperado como sucesso funcional padrão.
export const DEFAULT_EXPECTED_STATUS = 200;
