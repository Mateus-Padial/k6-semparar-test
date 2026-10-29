# Análise da Rodada de Teste de Performance

Documento gerado automaticamente a partir de `reports/summary.json`.

> Observação: o k6 não registra data/hora no summary. Preencha manualmente a data da execução se necessário.

## 1. Visão geral da execução

| Indicador | Valor |
| --- | --- |
| Total de requisições | 17.003 |
| Throughput médio | 27.27 req/s |
| Iterações completas | 16.999 |
| VUs máximos | 156 |
| Taxa de falha HTTP | 4.95% |
| Taxa de checks aprovados | 95.83% (48.876 ok / 2.127 falhas) |
| Duração média | 1.69 s |
| Duração p90 | 2.45 s |
| Duração p95 | 3.78 s |
| Duração máxima | 35.11 s |
| Dados recebidos | 10.46 MB |
| Dados enviados | 25.68 MB |

## 2. Resultado dos thresholds

Total de thresholds avaliados: **30** - aprovados: **6** - violados: **24**.

### Thresholds violados

| Métrica | Critério | Status |
| --- | --- | --- |
| `http_req_duration{operation:acumulo_motor}` | `p(95)<1200` | violado |
| `http_req_duration{operation:acumulo_motor}` | `p(99)<2500` | violado |
| `http_req_duration{operation:debito_voucher}` | `p(95)<1500` | violado |
| `http_req_duration{operation:debito_voucher}` | `p(99)<3000` | violado |
| `checks` | `rate>0.99` | violado |
| `http_req_failed` | `rate<0.01` | violado |
| `request_fail_rate{service:aberto}` | `rate<0.01` | violado |
| `business_fail_rate` | `rate<0.01` | violado |
| `business_fail_rate{service:vertem}` | `rate<0.01` | violado |
| `business_success_rate` | `rate>0.99` | violado |
| `request_fail_rate{service:vertem}` | `rate<0.01` | violado |
| `apdex_frustrated_rate` | `rate<0.05` | violado |
| `http_req_duration{operation:voucher_expirado}` | `p(95)<1500` | violado |
| `http_req_duration` | `p(95)<1200` | violado |
| `http_req_duration` | `p(99)<2500` | violado |
| `http_req_duration` | `p(90)<800` | violado |
| `sla_compliance_rate` | `rate>0.95` | violado |
| `network_error_rate` | `rate<0.001` | violado |
| `business_fail_rate{service:aberto}` | `rate<0.01` | violado |
| `request_fail_rate` | `rate<0.01` | violado |
| `request_success_rate` | `rate>0.99` | violado |
| `http_5xx_rate` | `rate<0.005` | violado |
| `http_req_duration{operation:credito_voucher}` | `p(95)<1500` | violado |
| `http_req_duration{operation:credito_voucher}` | `p(99)<3000` | violado |

## 3. Desempenho por operação

| Operação | Serviço | Média | p90 | p95 | Máx | Status SLA |
| --- | --- | --- | --- | --- | --- | --- |
| Acúmulo Motor | Vertem | 720.08 ms | 1.12 s | 1.61 s | 13.37 s | FALHOU |
| Crédito Voucher | Vertem | 24.48 s | 30.58 s | 31.02 s | 35.11 s | FALHOU |
| Débito Voucher | Vertem | 2.12 s | 3.60 s | 4.79 s | 21.29 s | FALHOU |
| Voucher Expirado | Aberto | 746.50 ms | 1.35 s | 1.73 s | 18.36 s | FALHOU |

## 4. Análise de erros

| Tipo de erro | Taxa |
| --- | --- |
| Erros 4xx (cliente/contrato) | 0.38% |
| Erros 5xx (servidor) | 4.56% |
| Erros de rede/timeout | 4.95% |
| Falha funcional | 4.95% |

### Falha por serviço

| Serviço | Taxa de falha |
| --- | --- |
| Vertem | 3.76% |
| Aberto | 6.91% |

## 5. Experiência do usuário (Apdex e SLA)

| Categoria | Percentual |
| --- | --- |
| Satisfeito (até 1s) | 66.65% |
| Tolerável (1s a 4s) | 25.83% |
| Frustrado (acima de 4s ou erro) | 7.52% |

**Apdex Score:** 0.80 (0 a 1, quanto mais perto de 1 melhor).

**Conformidade de SLA (resposta funcional até 1s):** 66.65%

## 6. Autenticação (tokens)

| Provedor | Duração | Taxa de falha |
| --- | --- | --- |
| Vertem | 176.16 ms | 0.00% |
| Aberto | 791.64 ms | 0.00% |

## 7. Diagnóstico e possíveis ajustes

### [CRÍTICO] Crédito Voucher com latência muito alta

O p95 do crédito de voucher está em 31.02 s (média 24.48 s). Isso indica gargalo grave no orquestrador (purchase_orchestrator), provavelmente saturação, fila ou timeout em integração downstream.

**Ação sugerida:** Investigar o serviço orquestrador de voucher: verificar pool de conexões, dependências externas, locks de banco e timeouts. Considerar reduzir a carga desse cenário até estabilizar.

### [CRÍTICO] Taxa de erros 5xx acima do aceitável

A taxa de erros 5xx está em 4.56%, acima do limite de 0,5%. Erros 5xx indicam instabilidade do lado servidor sob carga.

**Ação sugerida:** Analisar logs do servidor nos horários de pico, verificar escalonamento automático, limites de memória/CPU e capacidade do banco de dados.

### [ATENÇÃO] Erros de rede/timeout presentes

A taxa de erro de rede está em 4.95%. Isso pode indicar timeouts, conexões recusadas ou saturação de rede sob carga.

**Ação sugerida:** Verificar timeouts configurados, capacidade de conexões simultâneas no gateway/APIM e limites de rate limiting.

### [ATENÇÃO] Conformidade de SLA abaixo da meta

Apenas 66.65% das respostas funcionais ficaram dentro do SLA de 1s (meta: 95%).

**Ação sugerida:** Revisar os endpoints mais lentos (ver seção 3) e priorizar otimização das operações que mais puxam a latência para cima.

### [ATENÇÃO] Percentual de usuários frustrados elevado

7.52% das interações caíram na faixa frustrado (acima de 4s ou erro), acima do limite de 5%.

**Ação sugerida:** Focar na cauda longa de latência (p99 e máx). Mesmo com média boa, picos altos degradam a experiência percebida.

### [MONITORAR] Débito Voucher acima do SLA de p95

O p95 do débito de voucher está em 4.79 s (meta < 1,5s).

**Ação sugerida:** Avaliar otimização da operação de débito; comparar com horários de menor carga para isolar efeito de concorrência.

### [SAUDÁVEL] Autenticação estável

A geração de tokens Vertem e Aberto não apresentou falhas e ficou dentro dos tempos esperados.

**Ação sugerida:** Nenhuma ação necessária. As falhas observadas não vêm da autenticação, e sim das operações de negócio.

## 8. Conclusão

A rodada apresentou **2 problema(s) crítico(s)** e **3 ponto(s) de atenção**. O sistema **não passou** nos critérios de performance definidos e precisa de ajustes antes de ir para produção.

---

_Relatório gerado por scripts/gerar-relatorio.js a partir do summary do k6._
