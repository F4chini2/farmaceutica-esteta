// utils/validations.js
const onlyDigits = (v='') => (v || '').toString().replace(/\D+/g, '');

function isValidCPF(cpf='') {
  cpf = onlyDigits(cpf);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (base, factor) => {
    let s=0; for (let i=0;i<base.length;i++) s += parseInt(base[i],10)*(factor-i);
    const r=(s*10)%11; return r===10?0:r;
  };
  const d1 = calc(cpf.slice(0,9),10), d2 = calc(cpf.slice(0,10),11);
  return d1 === +cpf[9] && d2 === +cpf[10];
}
function isValidPhone(p='') { const d=onlyDigits(p); return d.length===10 || d.length===11; }
function isValidEmail(e='') { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||'')); }
function isNonEmptyString(s){ return typeof s==='string' && s.trim().length>0; }

const validarCPF=isValidCPF, validaCpf=isValidCPF;
const validarTelefone=isValidPhone, validaTelefone=isValidPhone;
const validarEmail=isValidEmail;

module.exports = {
  onlyDigits,
  isValidCPF, validarCPF, validaCpf,
  isValidPhone, validarTelefone, validaTelefone,
  isValidEmail, validarEmail,
  isNonEmptyString
};