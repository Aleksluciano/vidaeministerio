const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const axios = require('axios');
const HTMLParser = require("node-html-parser");



app.use(cors());
app.use(express.static("./../public"));

app.get("/jw", async (req, res) => {

  let data = [];
  console.log(req.query.data);
  try {

    data = await pegaInformacaoNoSiteJW(req.query.data);
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      message: "This is an error in pegaInformacaoNoSiteJW()",
    });
  }
  console.log('data', data);
  res.status(200).send({ data });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const axiosConfig = {
  headers: {
    "Content-Type": 'application/json',
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
    console.log('periodooo', periodo);
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
  let dataInicial = new DataInicial(periodo);
  let dataFinal = new DataFinal(periodo);

  let urlPartes = definirUrlPartes(dataInicial, dataFinal, 1);

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

    console.log(e)
  }

  dataInicial = new DataInicial(periodo);
  dataFinal = new DataFinal(periodo);
  urlPartes = definirUrlPartes(dataInicial, dataFinal, 2);
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

    console.log(e)
  }

  dataInicial = new DataInicial(periodo);
  dataFinal = new DataFinal(periodo);
  urlPartes = definirUrlPartes(dataInicial, dataFinal, 3);
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

    console.log(e)
  }

  return [];
};


const definirUrlPartes = (dataInicial, dataFinal, mode) => {

  if (dataInicial.ano == "2020") {
    if (dataInicial.dia == "1") dataInicial.dia = "1%C2%BA";
    if (dataFinal.dia == "1") dataFinal.dia = "1%C2%BA";
    if (dataInicial.mes == dataFinal.mes)
      return `https://jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataInicial.ano}-mwb/Programa-da-semana-de-${dataInicial.dia}-${dataFinal.dia}-de-${dataInicial.mes}-de-${dataInicial.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
    if (dataInicial.ano !== dataFinal.ano)
      return `https://jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataInicial.ano}-mwb/Programa-da-semana-de-${dataInicial.dia}-de-${dataInicial.mes}-de-${dataInicial.ano}-${dataFinal.dia}-de-${dataFinal.mes}-de-${dataFinal.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
    if (dataInicial.mes !== dataFinal.mes) {
      console.log("ENCONTROU3");
      if (dataInicial.indiceMes % 2 == 0) {
        dataInicial.mes = meses[dataInicial.indiceMes - 1];
      } else {
        dataFinal.mes = meses[dataInicial.indiceMes + 1];
      }
      return `https://jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataInicial.ano}-mwb/Programa-da-semana-de-${dataInicial.dia}-de-${dataInicial.mes}-${dataFinal.dia}-de-${dataFinal.mes}-de-${dataInicial.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
    }
  } else {

    let mes;
    if (dataInicial.indiceMes % 2 == 0) {
      mes = dataInicial.mesSemAcento;
      dataInicial.mesSemAcento = meses[dataInicial.indiceMes - 1];
    } else {
      mes = dataFinal.mesSemAcento;
      if (dataInicial.dia > dataFinal.dia) mes = dataInicial.mesSemAcento;

      dataFinal.mesSemAcento = meses[dataInicial.indiceMes + 1];
    }

    if (mes == 'marco') mes = 'mar%C3%A7o';
    // if (dataInicial.dia == "1") dataInicial.dia = "1%C2%BA";
    // if (dataFinal.dia == "1") dataFinal.dia = "1%C2%BA";

    if (dataInicial.ano !== dataFinal.ano) {
      dataFinal.mesSemAcento = meses[12];
      return `https://jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataFinal.mesSemAcento}-${dataInicial.ano}-mwb/Programa%C3%A7%C3%A3o-da-semana-de-${dataInicial.dia}-de-${dataInicial.mes}-de-${dataInicial.ano}-${dataFinal.dia}-de-${dataFinal.mes}-de-${dataFinal.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
    }
    if( dataFinal.mesSemAcento == 'marco')dataFinal.mes = 'mar%C3%A7o';
    if (dataInicial.mes !== dataFinal.mes) {
      if (dataInicial.mesSemAcento == 'marco') mes = 'mar%C3%A7o';
      if (dataInicial.mesSemAcento == 'março') dataInicial.mesSemAcento = 'marco';
      if (dataFinal.indiceMes % 2 != 0) dataFinal.mesSemAcento = mes;
      return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataFinal.mesSemAcento}-${dataInicial.ano}-mwb/Programa%C3%A7%C3%A3o-da-semana-de-${dataInicial.dia}-de-${mes}-${dataFinal.dia}-de-${dataFinal.mes}-de-${dataFinal.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`
    }

    if (dataInicial.mesSemAcento == 'março') dataInicial.mesSemAcento = 'marco';
    if (mode == 3) return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataFinal.mesSemAcento}-${dataInicial.ano}-mwb/Programa%C3%A7%C3%A3o-da-semana-de-${dataInicial.dia}-${dataFinal.dia}-de-${mes}-de-${dataInicial.ano}/`;
    if (mode == 2) return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataFinal.mesSemAcento}-${dataInicial.ano}-mwb/Programa%C3%A7%C3%A3o-da-semana-de-${dataInicial.dia}-${dataFinal.dia}-de-${mes}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
    else return `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/${dataInicial.mesSemAcento}-${dataFinal.mesSemAcento}-${dataInicial.ano}-mwb/Programa%C3%A7%C3%A3o-da-semana-de-${dataInicial.dia}-${dataFinal.dia}-de-${mes}-de-${dataInicial.ano}-na-Apostila-da-Reuni%C3%A3o-Vida-e-Minist%C3%A9rio/`;
  }
};

const extrairNomeDeCadaParte = (anoini, parte) => {
  if (anoini == "2020")
    return [parte("#p14"), parte("#p16"), parte("#p17"), parte("#p18")];
  return [parte("#p10"), parte("#p12"), parte("#p13"), parte("#p14"), parte("#p15")];
};
const buscarPartesEParsear = async (url) => {


    //console.log("ulala",url,axiosConfig);
  try {
    let res = await axios.get(url);
    console.log(res)
    for (var key in res) {
      if (res.hasOwnProperty(key)) {
        console.log(key);
      }
    }
    return HTMLParser.parse(res.data);
  }catch (e) {
    console.log(e);
  }

  return HTMLParser.parse(res.data);


    //console.log(res);
    //const res_parse = await res.json();
    console.log("lele", HTMLParser.parse(res.data));




  };

const definirUrlFigura = (mesini, mesfim, anoini) => {
  if (anoini == "2020")
    return `https://jw.org/pt/biblioteca/jw-apostila-do-mes/${mesini}-${anoini}-mwb/`;
  return `https://jw.org/pt/biblioteca/jw-apostila-do-mes/${mesini}-${mesfim}-${anoini}-mwb/`;

};

const buscarFigura = async (url) => {
  try {
    const res = await axios.get(url);
    return HTMLParser.parse(res.data);
  }catch (e) {
    console.log(e)
    return ' ';
  }
};

const disponibilizarPartes = (root) => {
  return (target) => {
    console.log("aqui", target, root);

    const data = root.querySelector(target);
    console.log(data);
    const info = data.querySelector("strong");

    return info?.toString();



  };
};

const extrairFigura = (root) => {
  const data = root.querySelectorAll(".jsRespImg");
  return data[0].getAttribute("data-img-size-xs");
};
