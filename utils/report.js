// ======================================
// RELATÓRIO DE FIM DE TESTE
// ======================================
// handleSummary reutilizável por todos os cenários. Centraliza a geração dos
// arquivos de saída (HTML, JSON e TXT) e o resumo no console, eliminando a
// duplicação que existia em cada cenário.

import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export function buildSummary(data) {
    return {
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
        'reports/summary.html': htmlReport(data),
        'reports/summary.json': JSON.stringify(data, null, 2),
        'reports/summary.txt': textSummary(data, { indent: ' ', enableColors: false }),
    };
}
