const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const summaryPath = args[0] || 'reports/summary.json';
const outputPath = args[1] || 'reports/analise-rodada.md';

const rootDir = path.resolve(__dirname, '..');
const absoluteSummary = path.resolve(rootDir, summaryPath);
const absoluteOutput = path.resolve(rootDir, outputPath);

if (!fs.existsSync(absoluteSummary)) {
    console.error('Arquivo de summary não encontrado: ' + absoluteSummary);
    console.error('Rode primeiro um teste k6 que gere reports/summary.json.');
    process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(absoluteSummary, 'utf8'));
const metrics = summary.metrics || {};

function getMetric(name) {
    return metrics[name];
}

function ms(value) {
    if (value === undefined || value === null) return 'n/d';
    if (value >= 1000) return (value / 1000).toFixed(2) + ' s';
    return value.toFixed(2) + ' ms';
}

function pct(value) {
    if (value === undefined || value === null) return 'n/d';
    return (value * 100).toFixed(2) + '%';
}

function num(value) {
    if (value === undefined || value === null) return 'n/d';
    return value.toLocaleString('pt-BR');
}

function trendValues(name) {
    const metric = getMetric(name);
    if (!metric || !metric.values) return null;
    return metric.values;
}

function rateValue(name) {
    const metric = getMetric(name);
    if (!metric || !metric.values) return null;
    return metric.values.rate;
}

function thresholdsOf(name) {
    const metric = getMetric(name);
    if (!metric || !metric.thresholds) return [];
    return Object.entries(metric.thresholds).map(function (entry) {
        return { expr: entry[0], ok: entry[1].ok === true };
    });
}

const allThresholds = [];
for (const entry of Object.entries(metrics)) {
    const metricName = entry[0];
    const metric = entry[1];
    if (!metric.thresholds) continue;
    for (const th of Object.entries(metric.thresholds)) {
        allThresholds.push({ metric: metricName, expr: th[0], ok: th[1].ok === true });
    }
}

const violated = allThresholds.filter(function (t) { return !t.ok; });
const passed = allThresholds.filter(function (t) { return t.ok; });

const operations = [
    { key: 'acumulo_motor', label: 'Acúmulo Motor', service: 'Vertem' },
    { key: 'credito_voucher', label: 'Crédito Voucher', service: 'Vertem' },
    { key: 'debito_voucher', label: 'Débito Voucher', service: 'Vertem' },
    { key: 'voucher_expirado', label: 'Voucher Expirado', service: 'Aberto' },
];

const lines = [];

lines.push('# Análise da Rodada de Teste de Performance');
lines.push('');
lines.push('Documento gerado automaticamente a partir de `' + summaryPath + '`.');
lines.push('');
lines.push('> Observação: o k6 não registra data/hora no summary. Preencha manualmente a data da execução se necessário.');
lines.push('');

const httpReqs = getMetric('http_reqs');
const iterations = getMetric('iterations');
const reqDuration = trendValues('http_req_duration');
const failRate = rateValue('http_req_failed');
const checks = getMetric('checks');
const dataReceived = getMetric('data_received');
const dataSent = getMetric('data_sent');
const vusMax = getMetric('vus_max');

lines.push('## 1. Visão geral da execução');
lines.push('');
lines.push('| Indicador | Valor |');
lines.push('| --- | --- |');
if (httpReqs) {
    lines.push('| Total de requisições | ' + num(httpReqs.values.count) + ' |');
    lines.push('| Throughput médio | ' + httpReqs.values.rate.toFixed(2) + ' req/s |');
}
if (iterations) lines.push('| Iterações completas | ' + num(iterations.values.count) + ' |');
if (vusMax) lines.push('| VUs máximos | ' + num(vusMax.values.max) + ' |');
if (failRate !== null) lines.push('| Taxa de falha HTTP | ' + pct(failRate) + ' |');
if (checks) lines.push('| Taxa de checks aprovados | ' + pct(checks.values.rate) + ' (' + num(checks.values.passes) + ' ok / ' + num(checks.values.fails) + ' falhas) |');
if (reqDuration) {
    lines.push('| Duração média | ' + ms(reqDuration.avg) + ' |');
    lines.push('| Duração p90 | ' + ms(reqDuration['p(90)']) + ' |');
    lines.push('| Duração p95 | ' + ms(reqDuration['p(95)']) + ' |');
    lines.push('| Duração máxima | ' + ms(reqDuration.max) + ' |');
}
if (dataReceived) lines.push('| Dados recebidos | ' + (dataReceived.values.count / 1024 / 1024).toFixed(2) + ' MB |');
if (dataSent) lines.push('| Dados enviados | ' + (dataSent.values.count / 1024 / 1024).toFixed(2) + ' MB |');
lines.push('');

lines.push('## 2. Resultado dos thresholds');
lines.push('');
lines.push('Total de thresholds avaliados: **' + allThresholds.length + '** - aprovados: **' + passed.length + '** - violados: **' + violated.length + '**.');
lines.push('');

if (violated.length > 0) {
    lines.push('### Thresholds violados');
    lines.push('');
    lines.push('| Métrica | Critério | Status |');
    lines.push('| --- | --- | --- |');
    for (const t of violated) {
        lines.push('| `' + t.metric + '` | `' + t.expr + '` | violado |');
    }
    lines.push('');
} else {
    lines.push('Nenhum threshold violado.');
    lines.push('');
}

lines.push('## 3. Desempenho por operação');
lines.push('');
lines.push('| Operação | Serviço | Média | p90 | p95 | Máx | Status SLA |');
lines.push('| --- | --- | --- | --- | --- | --- | --- |');
for (const op of operations) {
    const values = trendValues('http_req_duration{operation:' + op.key + '}');
    const ths = thresholdsOf('http_req_duration{operation:' + op.key + '}');
    const slaOk = ths.length > 0 && ths.every(function (t) { return t.ok; });
    if (values) {
        lines.push('| ' + op.label + ' | ' + op.service + ' | ' + ms(values.avg) + ' | ' + ms(values['p(90)']) + ' | ' + ms(values['p(95)']) + ' | ' + ms(values.max) + ' | ' + (slaOk ? 'OK' : 'FALHOU') + ' |');
    } else {
        lines.push('| ' + op.label + ' | ' + op.service + ' | n/d | n/d | n/d | n/d | sem dados |');
    }
}
lines.push('');

lines.push('## 4. Análise de erros');
lines.push('');
const http5xx = rateValue('http_5xx_rate');
const http4xx = rateValue('http_4xx_rate');
const networkError = rateValue('network_error_rate');
const businessFail = rateValue('business_fail_rate');

lines.push('| Tipo de erro | Taxa |');
lines.push('| --- | --- |');
if (http4xx !== null) lines.push('| Erros 4xx (cliente/contrato) | ' + pct(http4xx) + ' |');
if (http5xx !== null) lines.push('| Erros 5xx (servidor) | ' + pct(http5xx) + ' |');
if (networkError !== null) lines.push('| Erros de rede/timeout | ' + pct(networkError) + ' |');
if (businessFail !== null) lines.push('| Falha funcional | ' + pct(businessFail) + ' |');
lines.push('');

const failVertem = rateValue('request_fail_rate{service:vertem}');
const failAberto = rateValue('request_fail_rate{service:aberto}');
if (failVertem !== null || failAberto !== null) {
    lines.push('### Falha por serviço');
    lines.push('');
    lines.push('| Serviço | Taxa de falha |');
    lines.push('| --- | --- |');
    if (failVertem !== null) lines.push('| Vertem | ' + pct(failVertem) + ' |');
    if (failAberto !== null) lines.push('| Aberto | ' + pct(failAberto) + ' |');
    lines.push('');
}

lines.push('## 5. Experiência do usuário (Apdex e SLA)');
lines.push('');
const apdexSat = rateValue('apdex_satisfied_rate');
const apdexTol = rateValue('apdex_tolerated_rate');
const apdexFru = rateValue('apdex_frustrated_rate');
const sla = rateValue('sla_compliance_rate');

if (apdexSat !== null) {
    const apdexScore = apdexSat + (apdexTol || 0) / 2;
    lines.push('| Categoria | Percentual |');
    lines.push('| --- | --- |');
    lines.push('| Satisfeito (até 1s) | ' + pct(apdexSat) + ' |');
    lines.push('| Tolerável (1s a 4s) | ' + pct(apdexTol) + ' |');
    lines.push('| Frustrado (acima de 4s ou erro) | ' + pct(apdexFru) + ' |');
    lines.push('');
    lines.push('**Apdex Score:** ' + apdexScore.toFixed(2) + ' (0 a 1, quanto mais perto de 1 melhor).');
    lines.push('');
}
if (sla !== null) {
    lines.push('**Conformidade de SLA (resposta funcional até 1s):** ' + pct(sla));
    lines.push('');
}

lines.push('## 6. Autenticação (tokens)');
lines.push('');
const tokenVertem = trendValues('token_vertem_duration');
const tokenAberto = trendValues('token_aberto_duration');
const tokenVertemFail = rateValue('token_vertem_fail_rate');
const tokenAbertoFail = rateValue('token_aberto_fail_rate');

lines.push('| Provedor | Duração | Taxa de falha |');
lines.push('| --- | --- | --- |');
if (tokenVertem) lines.push('| Vertem | ' + ms(tokenVertem.avg) + ' | ' + pct(tokenVertemFail) + ' |');
if (tokenAberto) lines.push('| Aberto | ' + ms(tokenAberto.avg) + ' | ' + pct(tokenAbertoFail) + ' |');
lines.push('');

lines.push('## 7. Diagnóstico e possíveis ajustes');
lines.push('');

const findings = [];
const credito = trendValues('http_req_duration{operation:credito_voucher}');
if (credito && credito['p(95)'] > 10000) {
    findings.push({
        sev: 'CRÍTICO',
        titulo: 'Crédito Voucher com latência muito alta',
        detalhe: 'O p95 do crédito de voucher está em ' + ms(credito['p(95)']) + ' (média ' + ms(credito.avg) + '). Isso indica gargalo grave no orquestrador (purchase_orchestrator), provavelmente saturação, fila ou timeout em integração downstream.',
        acao: 'Investigar o serviço orquestrador de voucher: verificar pool de conexões, dependências externas, locks de banco e timeouts. Considerar reduzir a carga desse cenário até estabilizar.',
    });
}
if (http5xx !== null && http5xx > 0.005) {
    findings.push({
        sev: 'CRÍTICO',
        titulo: 'Taxa de erros 5xx acima do aceitável',
        detalhe: 'A taxa de erros 5xx está em ' + pct(http5xx) + ', acima do limite de 0,5%. Erros 5xx indicam instabilidade do lado servidor sob carga.',
        acao: 'Analisar logs do servidor nos horários de pico, verificar escalonamento automático, limites de memória/CPU e capacidade do banco de dados.',
    });
}
if (networkError !== null && networkError > 0.001) {
    findings.push({
        sev: 'ATENÇÃO',
        titulo: 'Erros de rede/timeout presentes',
        detalhe: 'A taxa de erro de rede está em ' + pct(networkError) + '. Isso pode indicar timeouts, conexões recusadas ou saturação de rede sob carga.',
        acao: 'Verificar timeouts configurados, capacidade de conexões simultâneas no gateway/APIM e limites de rate limiting.',
    });
}
if (sla !== null && sla < 0.95) {
    findings.push({
        sev: 'ATENÇÃO',
        titulo: 'Conformidade de SLA abaixo da meta',
        detalhe: 'Apenas ' + pct(sla) + ' das respostas funcionais ficaram dentro do SLA de 1s (meta: 95%).',
        acao: 'Revisar os endpoints mais lentos (ver seção 3) e priorizar otimização das operações que mais puxam a latência para cima.',
    });
}
if (apdexFru !== null && apdexFru > 0.05) {
    findings.push({
        sev: 'ATENÇÃO',
        titulo: 'Percentual de usuários frustrados elevado',
        detalhe: pct(apdexFru) + ' das interações caíram na faixa frustrado (acima de 4s ou erro), acima do limite de 5%.',
        acao: 'Focar na cauda longa de latência (p99 e máx). Mesmo com média boa, picos altos degradam a experiência percebida.',
    });
}
const debito = trendValues('http_req_duration{operation:debito_voucher}');
if (debito && debito['p(95)'] > 1500) {
    findings.push({
        sev: 'MONITORAR',
        titulo: 'Débito Voucher acima do SLA de p95',
        detalhe: 'O p95 do débito de voucher está em ' + ms(debito['p(95)']) + ' (meta < 1,5s).',
        acao: 'Avaliar otimização da operação de débito; comparar com horários de menor carga para isolar efeito de concorrência.',
    });
}
if (tokenVertemFail === 0 && tokenAbertoFail === 0) {
    findings.push({
        sev: 'SAUDÁVEL',
        titulo: 'Autenticação estável',
        detalhe: 'A geração de tokens Vertem e Aberto não apresentou falhas e ficou dentro dos tempos esperados.',
        acao: 'Nenhuma ação necessária. As falhas observadas não vêm da autenticação, e sim das operações de negócio.',
    });
}

if (findings.length === 0) {
    lines.push('Nenhum problema relevante detectado automaticamente. Todos os indicadores principais estão dentro das metas.');
    lines.push('');
} else {
    for (const f of findings) {
        lines.push('### [' + f.sev + '] ' + f.titulo);
        lines.push('');
        lines.push(f.detalhe);
        lines.push('');
        lines.push('**Ação sugerida:** ' + f.acao);
        lines.push('');
    }
}

lines.push('## 8. Conclusão');
lines.push('');
const criticos = findings.filter(function (f) { return f.sev === 'CRÍTICO'; }).length;
const atencao = findings.filter(function (f) { return f.sev === 'ATENÇÃO'; }).length;

if (criticos > 0) {
    lines.push('A rodada apresentou **' + criticos + ' problema(s) crítico(s)** e **' + atencao + ' ponto(s) de atenção**. O sistema **não passou** nos critérios de performance definidos e precisa de ajustes antes de ir para produção.');
} else if (atencao > 0) {
    lines.push('A rodada apresentou **' + atencao + ' ponto(s) de atenção**, mas nenhum problema crítico. Recomenda-se ajustes pontuais.');
} else {
    lines.push('A rodada passou nos critérios de performance definidos.');
}
lines.push('');
lines.push('---');
lines.push('');
lines.push('_Relatório gerado por scripts/gerar-relatorio.js a partir do summary do k6._');
lines.push('');

fs.writeFileSync(absoluteOutput, lines.join('\n'), 'utf8');
console.log('Relatório gerado em: ' + absoluteOutput);
console.log('Thresholds violados: ' + violated.length + ' | Achados: ' + findings.length);
