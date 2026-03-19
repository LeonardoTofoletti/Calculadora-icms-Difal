// ================= ESTADOS =================
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

// máscara valor
inputValor.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    e.target.value = value === "0,00" ? "" : value;
});

// ================= CALCULO =================
function calcular(){
    let valorStr = inputValor.value;
    let valor = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));

    if(!origem.value || !destino.value){
        return;
    }

    let ufOrigem = origem.value;
    let ufDestino = destino.value;

    let ehImportado = document.getElementById("importado").checked;
    let ativarFCP = document.getElementById("ativarFCP").checked;
    let baseDupla = document.getElementById("baseDupla")?.checked;

    let fcpPercentual = ativarFCP
        ? parseFloat(document.getElementById("fcp_select").value)
        : 0;

    let aliqInterna = aliquotasInternas[ufDestino];

    let interestadual = 12;

    if (ehImportado) interestadual = 4;
    else if (estadosSulSudeste.includes(ufOrigem) && !estadosSulSudeste.includes(ufDestino)) {
        interestadual = 7;
    }

    // ✅ MOSTRA PORCENTAGENS SEM VALOR
    document.getElementById("resAliqInterna").textContent = aliqInterna + "%";
    document.getElementById("resAliqInterestadual").textContent = interestadual + "%";
    document.getElementById("resDifal").textContent = (aliqInterna - interestadual).toFixed(2) + "%";

    // 🔥 SE NÃO TEM VALOR, PARA AQUI
    if(isNaN(valor)){
        document.getElementById("resBase").textContent = "R$ 0,00";
        document.getElementById("resValorInterno").textContent = "R$ 0,00";
        document.getElementById("resValorInterestadual").textContent = "R$ 0,00";
        document.getElementById("resValorDifal").textContent = "R$ 0,00";

        document.querySelector(".base-dupla").style.display = "none";
        document.querySelectorAll(".fcp-linha, .total-destino").forEach(el => el.style.display = "none");

        return;
    }

    const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    let valorInterno = 0;
    let valorInterestadual = (valor * interestadual) / 100;
    let valorDifal = 0;
    let difal = 0;
    let valorFCP = 0;
    let baseDestino = valor;

    if(baseDupla){
        baseDestino = valor * (1 - (interestadual / 100)) / (1 - (aliqInterna / 100));
        valorInterno = baseDestino * (aliqInterna / 100);
        valorDifal = valorInterno - valorInterestadual;
        difal = (valorDifal / valor) * 100;

        document.querySelector(".base-dupla").style.display = "flex";
        document.getElementById("resBaseDupla").textContent = fmt(baseDestino);
    }else{
        difal = aliqInterna - interestadual;
        valorInterno = (valor * aliqInterna) / 100;
        valorDifal = (valor * difal) / 100;

        document.querySelector(".base-dupla").style.display = "none";
    }

    if(ativarFCP){
        valorFCP = baseDupla
            ? baseDestino * (fcpPercentual / 100)
            : valor * (fcpPercentual / 100);
    }

    let totalDestino = valorDifal + valorFCP;

    document.getElementById("resBase").textContent = fmt(valor);
    document.getElementById("resValorInterno").textContent = fmt(valorInterno);
    document.getElementById("resValorInterestadual").textContent = fmt(valorInterestadual);
    document.getElementById("resDifal").textContent = difal.toFixed(2) + "%";
    document.getElementById("resValorDifal").textContent = fmt(valorDifal);

    if(ativarFCP){
        document.querySelectorAll(".fcp-linha").forEach(el => el.style.display = "flex");
        document.getElementById("resAliqFCP").textContent = fcpPercentual + "%";
        document.getElementById("resValorFCP").textContent = fmt(valorFCP);

        document.querySelectorAll(".total-destino").forEach(el => el.style.display = "flex");
        document.getElementById("resTotalDestino").textContent = fmt(totalDestino);
    }else{
        document.querySelectorAll(".fcp-linha, .total-destino").forEach(el => el.style.display = "none");
    }
}

// ================= AUTO UPDATE =================
inputValor.addEventListener("input", calcular);
origem.addEventListener("change", calcular);
destino.addEventListener("change", calcular);

document.getElementById("importado").addEventListener("change", calcular);
document.getElementById("baseDupla").addEventListener("change", calcular);

const checkFCP = document.getElementById("ativarFCP");
const selectFCP = document.getElementById("fcp_select");

checkFCP.addEventListener("change", () => {
    selectFCP.style.display = checkFCP.checked ? "inline-block" : "none";
    calcular();
});

selectFCP.addEventListener("change", calcular);