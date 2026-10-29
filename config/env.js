function required(name) {
    const value = __ENV[name];

    if (value === undefined || value === null || value === '') {
        throw new Error(`Variável de ambiente obrigatória não configurada: ${name}`);
    }

    return value;
}

function requiredNumber(name) {
    const value = Number(required(name));

    if (Number.isNaN(value)) {
        throw new Error(`Variável de ambiente deve ser numérica: ${name}`);
    }

    return value;
}

export const env = {
    name: __ENV.K6_ENV || 'local',

    // ======================================
    // VERTEM
    // ======================================

    vertem: {
        tokenUrl: required('VERTEM_TOKEN_URL'),
        clientId: required('VERTEM_CLIENT_ID'),
        clientSecret: required('VERTEM_CLIENT_SECRET'),
        grantType: required('VERTEM_GRANT_TYPE'),
    },

    // ======================================
    // ABERTO
    // ======================================

    aberto: {
        tokenUrl: required('ABERTO_TOKEN_URL'),
        clientId: required('ABERTO_CLIENT_ID'),
        clientSecret: required('ABERTO_CLIENT_SECRET'),
        grantType: required('ABERTO_GRANT_TYPE'),
        scope: required('ABERTO_SCOPE'),

        creditsExpirationUrl: required('ABERTO_CREDITS_EXPIRATION_URL'),
        subscriptionKey: required('ABERTO_APIM_SUBSCRIPTION_KEY'),

        walletId: required('ABERTO_WALLET_ID'),
        participantIdentifier: required('ABERTO_PARTICIPANT_IDENTIFIER'),
        maxDate: required('ABERTO_MAX_DATE'),
    },

    // ======================================
    // URLS
    // ======================================

    urls: {
        purchase: required('PURCHASE_URL'),
        purchaseOrchestrator: required('PURCHASE_ORCHESTRATOR_URL'),
    },

    // ======================================
    // PARTICIPANTE
    // ======================================

    participant: {
        id: required('PARTICIPANT_ID'),
    },

    // ======================================
    // MERCHANT
    // ======================================

    merchant: {
        id: required('MERCHANT_ID'),
        transactionId: required('MERCHANT_TRANSACTION_ID'),
    },

    // ======================================
    // CAMPANHAS
    // ======================================

    campaigns: {
        default: required('CAMPAIGN_ID'),

        voucher1: required('CAMPAIGN_ID_VOUCHER_1'),
        voucher2: required('CAMPAIGN_ID_VOUCHER_2'),

        abastecimento: required('CAMPAIGN_ID_ABASTECIMENTO'),
    },

    // ======================================
    // PRODUTO PONTOS
    // ======================================

    product: {
        id: required('PRODUCT_ID'),
        code: required('PRODUCT_CODE'),
        unitaryValue: requiredNumber('PRODUCT_UNITARY_VALUE'),
        quantity: requiredNumber('PRODUCT_QUANTITY'),
        description: required('PRODUCT_DESCRIPTION'),
    },

    // ======================================
    // PRODUTO VOUCHER
    // ======================================

    voucherProduct: {
        id: required('PRODUCT_ID_VOUCHER'),
        code: required('PRODUCT_CODE_VOUCHER'),
        unitaryValue: requiredNumber('PRODUCT_UNITARY_VALUE_VOUCHER'),
        quantity: requiredNumber('PRODUCT_QUANTITY_VOUCHER'),
        description: required('PRODUCT_DESCRIPTION_VOUCHER'),
    },

    // ======================================
    // PRODUTO ABASTECIMENTO
    // ======================================

    abastecimentoProduct: {
        id: required('PRODUCT_ID_ABASTECIMENTO'),
        code: required('PRODUCT_CODE_ABASTECIMENTO'),
        unitaryValue: requiredNumber('PRODUCT_UNITARY_VALUE_ABASTECIMENTO'),
        quantity: requiredNumber('PRODUCT_QUANTITY_ABASTECIMENTO'),
        description: required('PRODUCT_DESCRIPTION_ABASTECIMENTO'),
    },

    // ======================================
    // PAGAMENTO
    // ======================================

    payment: {
        type: requiredNumber('PAYMENT_TYPE'),
        entryMode: requiredNumber('PAYMENT_ENTRY_MODE'),
        value: requiredNumber('PAYMENT_VALUE'),

        abastecimentoValue: requiredNumber('PAYMENT_VALUE_ABASTECIMENTO'),
    },

    // ======================================
    // ATRIBUTOS
    // ======================================

    attributes: {
        descricaoOrigem: required('DESCRICAO_ORIGEM'),
        planoCliente: required('PLANO_CLIENTE'),
    },

    // ======================================
    // TRANSAÇÕES
    // ======================================

    transaction: {
        partnerTransactionId: required('PARTNER_TRANSACTION_ID'),
        invoiceCode: required('INVOICE_CODE'),
        baseNumber: requiredNumber('TRANSACTION_BASE_NUMBER'),
    },

    // ======================================
    // APIM
    // ======================================

    apim: {
        subscriptionKey: required('APIM_SUBSCRIPTION_KEY'),
    },
};
