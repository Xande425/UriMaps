    console.log("JavaScript conectado com sucesso!");

const origemInput = document.getElementById("origem");
const destinoInput = document.getElementById("destino");
const botaoRota = document.getElementById("btn-rota");

const botaoInverter = document.getElementById("btn-inverter");

const caminhoTexto = document.getElementById("caminho");

const distanciaElemento = document.getElementById("distancia");
const tempoElemento = document.getElementById("tempo");

// Inicialização do mapa

const map = L.map('map', {

    minZoom: 16,
    maxZoom: 19,
    maxBoundsViscosity: 1.0

}).setView(
    [-27.6137189, -52.2282240],
    17
);

L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "&copy; Esri"
    }
).addTo(map);

// ================================
// COORDENADAS DOS LOCAIS
// ================================

const locais = {

    "Pórtico": [-27.6157023, -52.2293568],

    "Rotatória": [-27.6134912, -52.2291953],

    "Cruzamento A": [-27.6128400, -52.2291831],

    "Cruzamento B": [-27.6125316, -52.2292285],

    "Cruzamento C": [-27.6135785, -52.2282198],

    "Cruzamento D": [-27.6137743, -52.2271103],

    "Cruzamento E": [-27.6138266, -52.2269360],

    "Prédio 1": [-27.6130077, -52.2295068],

    "Prédio 2": [-27.6127338, -52.2295071],

    "Prédio 3": [-27.6104668, -52.2295795],

    "Prédio 4": [-27.6142411, -52.2270871],

    "Prédio 7": [-27.6128972, -52.2283893],

    "Prédio 8": [-27.6132431, -52.2295094],

    "Prédio 10": [-27.6142036, -52.2267621],

    "Cantina": [-27.6128099, -52.2289323],

    "Estacionamento 1": [-27.6134394, -52.2284833],

    "Estacionamento 2": [-27.6133062, -52.2280984],

    "Saída B": [-27.6138368, -52.2267627]
};

// Define os limites do mapa com base nos locais cadastrados

const limitesCampus = L.latLngBounds(
    Object.values(locais)
).pad(0.2);

// Restringe a movimentação do mapa
map.setMaxBounds(limitesCampus);

// Lista de sugestões dos locais

const listaLocais = document.getElementById("lista-locais");

for (const nome in locais) {

    const opcao = document.createElement("option");

    opcao.value = nome;

    listaLocais.appendChild(opcao);
}

// Marcadores dos locais

for (const nome in locais) {

    const coordenadas = locais[nome];

    L.circleMarker(coordenadas, {
        radius: 5,
        color: "#ffffff",
        weight: 2,
        fillColor: "#2563eb",
        fillOpacity: 0.9
    })
    .addTo(map)
    .bindPopup(nome);
}

//Variavél p guardar a rota desenhada no mapa
let linhaRota = null;
let marcadorOrigem = null;
let marcadorDestino = null;
let marcadoresCaminho = [];

function limparRotaAnterior() {

    // Remove a linha da rota
    if (linhaRota !== null) {
        map.removeLayer(linhaRota);
        linhaRota = null;
    }

    // Remove o marcador de origem
    if (marcadorOrigem !== null) {
        map.removeLayer(marcadorOrigem);
        marcadorOrigem = null;
    }

    // Remove o marcador de destino
    if (marcadorDestino !== null) {
        map.removeLayer(marcadorDestino);
        marcadorDestino = null;
    }

    // Remove os marcadores intermediários
    for (const marcador of marcadoresCaminho) {
        map.removeLayer(marcador);
    }

    marcadoresCaminho = [];

    // Limpa as informações na tela
    distanciaElemento.textContent = "-- m";
    tempoElemento.textContent = "-- min";
    caminhoTexto.textContent = "Nenhuma rota calculada.";
}

const iconeOrigem = L.divIcon({
    className: "",
    html: '<div class="marcador-rota marcador-origem"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const iconeDestino = L.divIcon({
    className: "",
    html: '<div class="marcador-rota marcador-destino"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

//Grafo da Uri

const grafo = {

    //Pórtico

    "Pórtico": {
        "Rotatória": 244.9
    },

    //Rotatória

    "Rotatória": {
        "Pórtico": 244.9,
        "Cruzamento B": 105.4,
        "Prédio 8": 56.0,
        "Cruzamento A": 68.6,
        "Estacionamento 1": 78.4,
        "Prédio 2": 106.3,
        "Prédio 1": 85.4
    },

    //Cruzamento A

    "Cruzamento A": {
        "Rotatória": 68.6,
        "Prédio 8": 74.4,
        "Prédio 1": 47.7,
        "Prédio 2": 45.4,
        "Cantina": 21.8,
        "Cruzamento B": 21.8
    },

    //Cruzamento B

    "Cruzamento B": {
        "Rotatória": 105.4,
        "Prédio 2": 50.8,
        "Prédio 3": 266.8,
        "Cruzamento A": 21.8
    },

    //Prédio 8

    "Prédio 8": {
        "Rotatória": 56.0,
        "Prédio 1": 59.4,
        "Cruzamento A": 74.4
    },

    //Prédio 1

    "Prédio 1": {
        "Rotatória": 85.4,
        "Prédio 8": 59.4,
        "Prédio 2": 60.1,
        "Cruzamento A": 47.7
    },

    //Prédio 2

    "Prédio 2": {
        "Rotatória": 106.3,
        "Prédio 1": 60.1,
        "Cruzamento B": 50.8,
        "Cruzamento A": 45.4
    },

    //Prédio 3

    "Prédio 3": {
        "Cruzamento B": 266.8
    },

    //Cantina

    "Cantina": {
        "Cruzamento A": 21.8
    },

    //Estacionamento 1

    "Estacionamento 1": {
        "Rotatória": 78.4,
        "Cruzamento C": 36.2
    },

    //Cruzamento C

    "Cruzamento C": {

        // Caminhos normais
        "Estacionamento 1": 36.2,
        "Estacionamento 2": 30.5,

        // Mão única
        "Cruzamento D": 110.5
    },

    //Estacionamento 2

    "Estacionamento 2": {

        // Caminho normal
        "Cruzamento C": 30.5,

        // Mão única →
        "Prédio 7": 60.3
    },


    //Prédio 7

    "Prédio 7": {

        // Continua a mão única →
        "Cruzamento B": 94.2
    },

    //Cruzamento D

    "Cruzamento D": {

        // Prédio 4 é mão dupla
        "Prédio 4": 43.8,

        // Continua a mão única →
        "Cruzamento E": 18.0
    },

    //Prédio 4

    "Prédio 4": {
        "Cruzamento D": 43.8
    },

    //Cruzamento E

    "Cruzamento E": {

        // Prédio 10 é mão dupla
        "Prédio 10": 38.8,

        // Continua a mão única →
        "Saída B": 17.5
    },

    //Prédio 10

    "Prédio 10": {
        "Cruzamento E": 38.8
    },

    //Saída B

    "Saída B": {}
};


function dijkstra(grafo, origem, destino) {

    //Guarda a menor dist
    const distancias = {};

    //Guarda o local anterior de cada nó
    const anteriores = {};

    //Locais que ainda precisamos analisar
    const naoVisitados = new Set();

    //Inicializa todos os lugares
    for(const local in grafo) {

        distancias[local] = Infinity;
        anteriores[local] = null;

        naoVisitados.add(local);
    }

    //A distda origem para ela mesma é 0
    distancias[origem] = 0;

    //Enquanto ainda existem locais para analisar
    while(naoVisitados.size > 0) {

        let localAtual = null;
        let menorDistancia = Infinity;

        //Procurar o local nn visit com a menor dist
        for(const local of naoVisitados) {

            if (distancias[local] < menorDistancia) {

                menorDistancia = distancias[local];
                localAtual = local;
            }
        }

        //Se não encontramos nenhum local acessivel
        if(localAtual === null) {
            break;
        }

        //Se chegamos no destino, podemos parar
        if(localAtual === destino) {
            break;
        }

        //Remove o local atual dos não visitados
        naoVisitados.delete(localAtual);

        //Analisa os vizinhos do local atual
        for(const vizinho in grafo[localAtual]) {

            const distanciaAteVizinho = grafo[localAtual][vizinho];

            //Calcula uma nova distancia que de

            const novaDistancia =
                distancias[localAtual] + distanciaAteVizinho;

            //Se encontramos um caminho menor
            if(novaDistancia < distancias[vizinho]) {

                distancias[vizinho] = novaDistancia;

                //Guarda de onde chegamos nesse vizinho
                anteriores[vizinho] = localAtual;
            }
        }
    }

    //Construção do Caminho 

    const caminho = [];

    let localAtual = destino;

    //Volta do destino até a origem

    while(localAtual !== null) {

        caminho.unshift(localAtual);

        localAtual = anteriores[localAtual];
    }

    //Confere se realmente existe o caminho
    if(caminho[0] !== origem) {

        return {
            distancia: Infinity,
            caminho: []
        };
    }

    return {
        distancia: distancias[destino],
        caminho: caminho
    };
}

// Inverte origem e destino
botaoInverter.addEventListener("click", function() {

    // Guarda a origem atual
    const origemAtual = origemInput.value;

    // Troca os valores
    origemInput.value = destinoInput.value;
    destinoInput.value = origemAtual;

    // Limpa a rota anterior
    limparRotaAnterior();

});

botaoRota.addEventListener("click", function() {

    // Limpa o resultado anterior
    limparRotaAnterior();

    const origemDigitada = origemInput.value.trim();
    const destinoDigitado = destinoInput.value.trim();


    // Verifica se os campos estão vazios
    if (origemDigitada === "" || destinoDigitado === "") {

        alert("Por favor, preencha os campos de origem e destino.");

        return;
    }


    // Procura os nomes corretos dentro dos locais cadastrados
    const origem = Object.keys(locais).find(
        local => local.toUpperCase() === origemDigitada.toUpperCase()
    );

    const destino = Object.keys(locais).find(
        local => local.toUpperCase() === destinoDigitado.toUpperCase()
    );


    // Verifica se os locais existem
    if (!origem || !destino) {

        alert("Origem ou destino não encontrado.");

        return;
    }

    // Verifica se origem e destino são iguais
    if (origem === destino) {

        alert("A origem e o destino são iguais!");

        return;
    }

    // Executa o algoritmo de Dijkstra
    const resultado = dijkstra(
        grafo,
        origem,
        destino
    );


    // Verifica se existe caminho
    if (resultado.distancia === Infinity) {

        alert("Não existe um caminho disponível entre esses locais.");

        return;
    }


    // Mostra o resultado no Console
    console.log("===== ROTA ENCONTRADA =====");

    console.log("Origem:", origem);

    console.log("Destino:", destino);

    console.log("Distância:", resultado.distancia + " metros");

    console.log("Caminho:", resultado.caminho);

    // Atualiza a distância na tela
    distanciaElemento.textContent =
        resultado.distancia.toFixed(1) + " m";

        
 // Cria uma lista para mostrar os pontos da rota
const listaCaminho = document.createElement("ol");

listaCaminho.className = "passos-rota";

// Percorre os locais do caminho encontrado pelo Dijkstra
resultado.caminho.forEach(function(local, indice) {

    const item = document.createElement("li");

    item.textContent = local;

    // Identifica a origem
    if (indice === 0) {
        item.classList.add("passo-origem");
        item.textContent += " — Origem";
    }

    // Identifica o destino
    else if (indice === resultado.caminho.length - 1) {
        item.classList.add("passo-destino");
        item.textContent += " — Destino";
    }

    listaCaminho.appendChild(item);
});

// Substitui o conteúdo antigo pela nova lista
caminhoTexto.replaceChildren(listaCaminho);


        // Velocidade média de caminhada (km/h)
const velocidadeMedia = 5;

// Converte metros para quilômetros
const distanciaKm = resultado.distancia / 1000;

// Calcula o tempo em horas
const tempoHoras = distanciaKm / velocidadeMedia;

// Converte para minutos
const tempoMinutos = tempoHoras * 60;

// Mostra o tempo na tela
tempoElemento.textContent =
    tempoMinutos.toFixed(1) + " min";




// Transforma os nomes do caminho em coordenadas
const coordenadasRota = resultado.caminho.map(
    local => locais[local]
);


// Desenha a linha da rota no mapa
linhaRota = L.polyline(
    coordenadasRota,
    {
        weight: 5,
        opacity: 0.8
    }
).addTo(map);

// Remove o marcador de origem anterior
if (marcadorOrigem !== null) {
    map.removeLayer(marcadorOrigem);
}


// Remove o marcador de destino anterior
if (marcadorDestino !== null) {
    map.removeLayer(marcadorDestino);
}

// Remove os marcadores intermediários da rota anterior

for (const marcador of marcadoresCaminho) {
    map.removeLayer(marcador);
}

// Limpa a lista para a nova rota
marcadoresCaminho = [];


// Cria o marcador da origem

marcadorOrigem = L.marker(locais[origem], {
    icon: iconeOrigem
})
    .addTo(map)
    .bindPopup("🟢 Origem: " + origem);


// Cria o marcador do destino

marcadorDestino = L.marker(locais[destino], {
    icon: iconeDestino
})
    .addTo(map)
    .bindPopup("🔴 Destino: " + destino);



// Ajusta o mapa para mostrar toda a rota
map.fitBounds(linhaRota.getBounds());
});

