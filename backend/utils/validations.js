function isCPF(cpf=""){cpf=(cpf||"").replace(/\D/g,"");if(!cpf||cpf.length!==11||/^(\d)\1{10}$/.test(cpf))return false;let s=0,r;for(let i=1;i<=9;i++)s+=parseInt(cpf.substring(i-1,i))*(11-i);r=(s*10)%11;if(r===10||r===11)r=0;if(r!==parseInt(cpf.substring(9,10)))return false;s=0;for(let i=1;i<=10;i++)s+=parseInt(cpf.substring(i-1,i))*(12-i);r=(s*10)%11;if(r===10||r===11)r=0;return r===parseInt(cpf.substring(10,11));}
function isPhone(f=""){const d=(f||"").replace(/\D/g,"");return d.length===10||d.length===11;}
module.exports={isCPF,isPhone};
