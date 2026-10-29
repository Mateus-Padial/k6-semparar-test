// ======================================
// LOG DE RESPOSTA
// ======================================
// Centraliza o log detalhado de resposta. Por padrão loga apenas erros
// (status >= 400 ou erro de rede), evitando poluir o output e degradar a
// performance sob carga. O log de sucesso é opcional e desativado por padrão.

function logBlock(titulo, response, scenario) {
    console.log('====================');
    console.log(titulo);
    console.log('SCENARIO:', scenario);
    console.log('STATUS:', response.status);
    console.log('URL:', response.url);
    console.log('DURATION:', response.timings ? response.timings.duration : 'n/d');
    console.log('VU:', __VU);
    console.log('ITERATION:', __ITER);
    console.log('BODY:', response.body);
    console.log('====================');
}

export function logResponse(response, scenario, { logSuccess = false } = {}) {
    const isError = response.status >= 400 || Boolean(response.error_code);

    if (isError) {
        logBlock('❌ ERRO DETECTADO', response, scenario);
        return;
    }

    if (logSuccess && response.status === 200) {
        logBlock('✅ REQUEST SUCESSO', response, scenario);
    }
}
