const functions = require('firebase-functions');
//const admin = require("firebase-admin");
//  const serviceAccount = require("../systemkey.json")
const axios = require("axios");
const HTMLParser = require("node-html-parser");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: serviceAccount.project_id,
//     clientEmail: serviceAccount.client_email,
//     privateKey: serviceAccount.private_key
//   }),
//   databaseURL: "https://vidaeministerio-e4bf6.web.app"
// });

//admin.initializeApp(functions.config().firebase);

//firebase.initializeApp(firebaseConfig);

exports.jw = functions.region('southamerica-east1').https.onCall(async (data, context) => {
  
  let dados = [];
  console.log(data.data,"AQUIII");
  try {
    console.log(data.data);
    dados = await pegaInformacaoNoSiteJW(data.data);
  } catch (e) {
    console.log(e);
    return {
      status: 400,
      message: "This is an error in pegaInformacaoNoSiteJW()",
    };
  }
  return { dados };
});



const axiosConfig = {
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    "Access-Control-Allow-Headers": "*",
  },
};

const meses = [
  "",
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

class DataInicial {
  constructor(periodo) {
    this.dia = parseInt(periodo.substring(0, 2));
    this.indiceMes = parseInt(periodo.substring(3, 5));
    this.mes = meses[this.indiceMes];
    this.ano = periodo.substring(6, 10);
    this.mesSemAcento = this.mes;
    if (this.mes == "março") this.mesSemAcento = "marco";
  }
}

class DataFinal {
  constructor(periodo) {
    this.dia = parseInt(periodo.substring(11, 13));
    this.indiceMes = parseInt(periodo.substring(14, 16));
    this.mes = meses[this.indiceMes];
    this.ano = periodo.substring(17, 21);
    this.mesSemAcento = this.mes;
    if (this.mes == "março") this.mesSemAcento = "marco";
  }
}

const pegaInformacaoNoSiteJW = async (periodo) => {
  const dataInicial = new DataInicial(periodo);
  const dataFinal = new DataFinal(periodo);

  const urlPartes = definirUrlPartes(dataInicial, dataFinal);
  console.log(urlPartes);
  try {
    let partes = extrairNomeDeCadaParte(
      dataInicial.ano,
      disponibilizarPartes(await buscarPartesEParsear(urlPartes))
    );
    const figura = extrairFigura(
      await buscarFigura(
        definirUrlFigura(
          dataInicial.mesSemAcento,
          dataFinal.mesSemAcento,
          dataInicial.ano
        )
      )
    );

    partes.push({ url: urlPartes, figura: figura });
    return partes;
  } catch (e) {
    console.log(e);
  }

  return [];
};

const definirUrlPartes = (dataInicial, dataFinal) => {
  if (dataInicial.ano == "2020") {
    if (dataInicial.dia == "1") dataInicial.dia = "1%C2%BA";
    if (dataFinal.dia == "1") dataFinal.dia = "1%C2%BA";
    if (dataInicial.mes == dataFinal.mes)
      return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataInicial.ano}-mwb/Programa-da-semana-de-${dataInicial.dia}-${dataFinal.dia}-de-${dataInicial.mes}-de-${dataInicial.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
    if (dataInicial.ano !== dataFinal.ano)
      return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataInicial.ano}-mwb/Programa-da-semana-de-${dataInicial.dia}-de-${dataInicial.mes}-de-${dataInicial.ano}-${dataFinal.dia}-de-${dataFinal.mes}-de-${dataFinal.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
    if (dataInicial.mes !== dataFinal.mes)
      return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataInicial.ano}-mwb/Programa-da-semana-de-${dataInicial.dia}-de-${dataInicial.mes}-${dataFinal.dia}-de-${dataFinal.mes}-de-${dataInicial.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
  } else {
    if (dataInicial.indiceMes % 2 == 0)
      dataInicial.mesSemAcento = meses[dataInicial.indiceMes - 1];
    else {
      dataFinal.mesSemAcento = meses[dataInicial.indiceMes + 1];
    }
    return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataFinal.mesSemAcento}-${dataInicial.ano}-mwb/Programa%C3%A7%C3%A3o-da-semana-de-${dataInicial.dia}-${dataFinal.dia}-de-${dataInicial.mes}-de-${dataInicial.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
  }
};

const extrairNomeDeCadaParte = (anoini, parte) => {
  if (anoini == "2020")
    return [parte("#p14"), parte("#p16"), parte("#p17"), parte("#p18")];
  return [parte("#p10"), parte("#p12"), parte("#p13"), parte("#p14")];
};
const buscarPartesEParsear = async (url) => {
  const res = await axios.get(url, axiosConfig);
  return HTMLParser.parse(res.data);
};

const definirUrlFigura = (mesini, mesfim, anoini) => {
  if (anoini == "2020")
    return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${mesini}-${anoini}-mwb/`;
  return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${mesini}-${mesfim}-${anoini}-mwb/`;
};

const buscarFigura = async (url) => {
  const res = await axios.get(url, axiosConfig);
  return HTMLParser.parse(res.data);
};

const disponibilizarPartes = (root) => {
  return (target) => {
    const data = root.querySelector(target);
    const info = data.querySelector("strong");
    return info.toString();
  };
};

const extrairFigura = (root) => {
  const data = root.querySelectorAll(".jsRespImg");
  return data[0].getAttribute("data-img-size-xs");
};
