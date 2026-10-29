// ======================================
// PERFIS DE CARGA REUTILIZÁVEIS
// ======================================
// Centraliza os "stages" de carga para que os cenários não repitam a mesma
// configuração. Para mudar o perfil de carga de todos os cenários, basta
// ajustar aqui.

// Perfil leve para validação rápida / smoke test.
export const smokeProfile = [
    { duration: '1m', target: 10 },
];

// Perfil completo de rampa: sobe, sustenta, reduz e finaliza.
export const rampProfile = [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 50 },
    { duration: '2m', target: 25 },
    { duration: '1m', target: 10 },
];
