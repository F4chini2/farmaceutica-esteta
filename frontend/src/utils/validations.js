// validations.js
export function limparNumero(v = '') {
  return String(v).replace(/\D/g, '');
}

export function validarTelefone(tel) {
  const n = limparNumero(tel);
  // BR: 10 (fixo+DDD) ou 11 (celular+DDD)
  return n.length === 10 || n.length === 11;
}

export function normalizarTelefone(tel) {
  const n = limparNumero(tel);
  return n; // salve só dígitos no BD; formate na UI se quiser
}

export function obrigatorio(v) {
  return String(v || '').trim().length > 0;
}
