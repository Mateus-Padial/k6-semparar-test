// ======================================
// BUILDERS DE PAYLOAD DE COMPRA
// ======================================
// Centraliza a montagem dos corpos de requisição dos cenários de compra.
// Mantém os payloads fora dos cenários, deixando-os declarativos e evitando a
// duplicação do bloco de attributes.

import exec from 'k6/execution';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { env } from '../config/env.js';

// Gera o número único de transação combinando o número base com a iteração
// atual, garantindo unicidade ao longo do teste.
function numeroUnicoTransacao() {
    return `${env.transaction.baseNumber + exec.scenario.iterationInTest}`;
}

// Monta o array de attributes comum aos cenários de compra (acúmulo e débito).
// O parâmetro includeDescription controla se cada item carrega a chave
// "description" (presente no acúmulo, ausente no débito), preservando o
// comportamento original de cada cenário.
function buildAttributes({ includeDescription = false } = {}) {
    const base = [
        { key: 'tipo valor', values: ['D'] },
        { key: 'numero parcela', values: ['0'] },
        { key: 'total parcelas', values: ['0'] },
        { key: 'codigo origem', values: [''] },
        { key: 'descricao origem', values: [env.attributes.descricaoOrigem] },
        { key: 'plano do cliente', values: [env.attributes.planoCliente] },
        { key: 'placa veiculo', values: [''] },
        { key: 'marca veiculo', values: [''] },
        { key: 'modelo veiculo', values: [''] },
        { key: 'tipo combustivel', values: [''] },
        { key: 'numero unico transacao', values: [numeroUnicoTransacao()] },
    ];

    if (!includeDescription) {
        return base;
    }

    return base.map((attr) => ({ key: attr.key, description: '', values: attr.values }));
}

// Converte uma config de produto do env no formato esperado pela API.
function buildProduct(product) {
    return {
        id: product.id,
        code: product.code,
        unitaryValue: product.unitaryValue,
        quantity: product.quantity,
        description: product.description,
    };
}

// Payload do cenário de Acúmulo Motor: usa identificadores fixos do env e
// inclui description nos attributes.
export function buildAcumuloPayload() {
    return {
        partnerTransactionId: env.transaction.partnerTransactionId,
        participant: { id: env.participant.id },
        campaignIds: [env.campaigns.default],
        merchant: {
            id: env.merchant.id,
            transactionId: env.merchant.transactionId,
        },
        products: [buildProduct(env.product)],
        attributes: buildAttributes({ includeDescription: true }),
        payments: {
            type: env.payment.type,
            entryMode: env.payment.entryMode,
            value: env.payment.value,
        },
        invoiceCode: env.transaction.invoiceCode,
    };
}

// Payload do cenário de Crédito Voucher: identificadores gerados por iteração
// (uuid) e produto de voucher.
export function buildCreditoVoucherPayload() {
    return {
        partnerTransactionId: uuidv4(),
        participant: { id: env.participant.id },
        campaignIds: [env.campaigns.voucher1, env.campaigns.voucher2],
        merchant: {
            id: env.merchant.id,
            transactionId: uuidv4(),
        },
        products: [buildProduct(env.voucherProduct)],
        payments: {
            type: env.payment.type,
            entryMode: env.payment.entryMode,
            value: env.payment.value,
        },
        invoiceCode: uuidv4(),
    };
}

// Payload do cenário de Débito Voucher: usa campanhas de abastecimento, produto
// de abastecimento e attributes sem description.
export function buildDebitoVoucherPayload() {
    return {
        partnerTransactionId: uuidv4(),
        participant: { id: env.participant.id },
        campaignIds: [env.campaigns.abastecimento, env.campaigns.default],
        merchant: {
            id: env.merchant.id,
            transactionId: uuidv4(),
        },
        attributes: buildAttributes({ includeDescription: false }),
        products: [buildProduct(env.abastecimentoProduct)],
        payments: {
            type: env.payment.type,
            entryMode: env.payment.entryMode,
            value: env.payment.abastecimentoValue,
        },
        invoiceCode: uuidv4(),
    };
}

// Payload do cenário de Voucher Expirado (serviço Aberto): consulta de
// expiração de créditos.
export function buildVoucherExpiradoPayload() {
    return {
        walletId: env.aberto.walletId,
        participantIdentifier: env.aberto.participantIdentifier,
        maxDate: env.aberto.maxDate,
    };
}
