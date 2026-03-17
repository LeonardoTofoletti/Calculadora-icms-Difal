const aliquotasInternas = {
AC:19, AL:20, AM:20, AP:18, BA:20.5, CE:20, DF:20, ES:17,
GO:19, MA:23, MT:17, MS:17, MG:18, PA:19, PB:20, PR:19.5,
PE:20.5, PI:22.5, RN:20, RS:17, RJ:22, RO:19.5, RR:20,
SC:17, SP:18, SE:20, TO:20
};

const estadosSulSudeste = ["SP","RJ","MG","ES","RS","SC","PR"];

const origem = document.getElementById("origem");
const destino = document.getElementById("destino");
const inputValor = document.getElementById("valor");

// preencher estados
for(let uf in aliquotasInternas){

let op1 = document.createElement("option");
op1.value = uf;
op1.textContent = uf;
origem.appendChild(op1);

let op2 = document.createElement("option");
op2.value = uf;
op2.textContent = uf;
destino.appendChild(op2);

}

// máscara de valor
inputValor.addEventListener('input', (e) => {

let value = e.target.value.replace(/\D/g, "");
value = (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
e.target.value = value === "0,00" ? "" : value;

});

function calcular(){

let valorStr = inputValor.value;
let valor = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));

if(isNaN(valor) || !origem.value || !destino.value){
alert("Preencha o valor e os estados.");
return;
}

let ufOrigem = origem.value;
let ufDestino = destino.value;

let ehImportado = document.getElementById("importado").checked;
let ativarFCP = document.getElementById("ativarFCP").checked;
let baseDupla = document.getElementById("baseDupla")?.checked;

let fcpPercentual = parseFloat(document.getElementById("fcp_select").value);

let aliqInterna = aliquotasInternas[ufDestino];

// ================= ALÍQUOTA INTERESTADUAL =================
let interestadual = 12;

if (ehImportado) {
interestadual = 4;
}
else if (estadosSulSudeste.includes(ufOrigem) && !estadosSulSudeste.includes(ufDestino)) {
interestadual = 7;
}

// ================= FORMATADOR =================
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ================= VARIÁVEIS =================
let valorInterno = 0;
let valorInterestadual = (valor * interestadual) / 100;
let valorDifal = 0;
let difal = 0;
let valorFCP = 0;
let baseDestino = valor; // padrão

// ================= BASE DUPLA OU NORMAL =================
if(baseDupla){

    // 🔥 BASE DUPLA CORRETA (NF-e)
    baseDestino = valor * (1 - (interestadual / 100)) / (1 - (aliqInterna / 100));

    valorInterno = baseDestino * (aliqInterna / 100);
    valorDifal = valorInterno - valorInterestadual;

    difal = (valorDifal / valor) * 100;

    let linhaBaseDupla = document.querySelector(".base-dupla");
    if(linhaBaseDupla){
        linhaBaseDupla.style.display = "flex";
        document.getElementById("resBaseDupla").textContent = fmt(baseDestino);
    }

}else{

    // ✅ BASE SIMPLES
    difal = aliqInterna - interestadual;

    valorInterno = (valor * aliqInterna) / 100;
    valorDifal = (valor * difal) / 100;

    let linhaBaseDupla = document.querySelector(".base-dupla");
    if(linhaBaseDupla){
        linhaBaseDupla.style.display = "none";
    }
}

// ================= FCP =================
if(ativarFCP){

    if(baseDupla){
        valorFCP = baseDestino * (fcpPercentual / 100);
    }else{
        valorFCP = valor * (fcpPercentual / 100);
    }

}

// ================= TOTAL DESTINO =================
let totalDestino = valorDifal + valorFCP;

// ================= EXIBIÇÃO =================
document.getElementById("resBase").textContent = fmt(valor);

document.getElementById("resAliqInterna").textContent = aliqInterna + "%";
document.getElementById("resValorInterno").textContent = fmt(valorInterno);

document.getElementById("resAliqInterestadual").textContent = interestadual + "%";
document.getElementById("resValorInterestadual").textContent = fmt(valorInterestadual);

document.getElementById("resDifal").textContent = difal.toFixed(2) + "%";
document.getElementById("resValorDifal").textContent = fmt(valorDifal);

// ================= FCP + TOTAL =================
if(ativarFCP){

document.querySelectorAll(".fcp-linha").forEach(el => {
el.style.display = "flex";
});

document.getElementById("resAliqFCP").textContent = fcpPercentual + "%";
document.getElementById("resValorFCP").textContent = fmt(valorFCP);

document.querySelectorAll(".total-destino").forEach(el => {
el.style.display = "flex";
});

document.getElementById("resTotalDestino").textContent = fmt(totalDestino);

}else{

document.querySelectorAll(".fcp-linha").forEach(el => {
el.style.display = "none";
});

document.querySelectorAll(".total-destino").forEach(el => {
el.style.display = "none";
});

}

}

// ================= DARK MODE =================
const botaoTema = document.getElementById("toggleTema");

botaoTema.addEventListener("click", () => {

document.body.classList.toggle("dark");

botaoTema.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";

});

// ================= TOGGLE FCP =================
function toggleFCP(){

const check = document.getElementById("ativarFCP");
const select = document.getElementById("fcp_select");

if(check.checked){
    select.style.display = "inline-block";
}else{
    select.style.display = "none";
}

calcular();

}