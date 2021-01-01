const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const axios = require("axios");
const HTMLParser = require("node-html-parser");

app.use(cors());
app.use(express.static("./../public"));

app.get("/jw", async (req, res) => {
  
  let data = [];
  try {
  
    data = await pegaInformacaoNoSiteJW(req.query.jwperiodo);
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      message: "This is an error in pegaInformacaoNoSiteJW()",
    });
  }
  res.status(200).send(data);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
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
