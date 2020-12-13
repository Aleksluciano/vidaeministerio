<script>
  import { createEventDispatcher } from "svelte";
  import Button from "../shared/Button.svelte";
  import Spinner from "../shared/Spinner.svelte";
  import { callFirebaseFnJw } from "../../firebase.js";
  export let gruposNumero = [];
  export let irmaos = [];
  let partesjw = [];
  let linksitejw = "#";
  let imagemjw = "";
  let pronto = false;

  const dispatch = createEventDispatcher();

  let meses = [
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

  let dataInicial = new Date();
  let dataFinal = new Date();
  let firstLoad = true;
  let grupoDesignacao = [];

  class GrupoDesignacao {
    constructor(grupo, partes) {
      this.grupo = { ...grupo };
      this.partes = [];
      partes.forEach((a) => {
        this.partes.push({ titulo: a, vaga1: null, vaga2: null });
      });
      this.preencheVaga();
    }

    preencheVaga() {
      this.partes.forEach((a) => {
        if (!a.titulo.toLowerCase().match("vídeo")) {
          if (a.titulo.toLowerCase().match("leitura")) {
            a.vaga1 = this.procuraIrmao("L", "M");
          }
          if (a.titulo.toLowerCase().match("discurso")) {
            a.vaga1 = this.procuraIrmao("D", "M");
          }
          if (a.titulo.toLowerCase().match("conversa")) {
            a.vaga1 = this.procuraIrmao("C");
            a.vaga2 = this.procuraIrmao("A", a.vaga1.sexo);
          }
          if (a.titulo.toLowerCase().match("estudo")) {
            a.vaga1 = this.procuraIrmao("E");
            a.vaga2 = this.procuraIrmao("A", a.vaga1.sexo);
          }
          if (a.titulo.toLowerCase().match("revisita")) {
            a.vaga1 = this.procuraIrmao("R");
            a.vaga2 = this.procuraIrmao("A", a.vaga1.sexo);
          }
        }
      });
    }

    procuraIrmao(parte, sexo) {
      let pessoa;
      if (sexo)
        pessoa = irmaos.splice(
          irmaos.findIndex(
            (a) =>
              a.situacao &&
              a.sexo == sexo &&
              a.parte == parte &&
              this.grupo.items.includes(a.grupo)
          ),
          1
        )[0];
      else
        pessoa = irmaos.splice(
          irmaos.findIndex(
            (a) =>
              a.situacao &&
              a.parte == parte &&
              this.grupo.items.includes(a.grupo)
          ),
          1
        )[0];
      if (!pessoa)
        pessoa = {
          nome: "❌",
        };

      return { ...pessoa };
    }
  }

  const doPost = async (params) => {
    grupoDesignacao = [];
    var myHeaders = new Headers();

    var myInit = {
      method: "GET",
      headers: myHeaders,
      mode: "cors",
      cache: "default",
    };
    pronto = false;

    let res;
    try {
      console.log("inicio try", params);
      //res = await fetch("http://localhost:5001/jw?" + params, myInit);
     
      res = await callFirebaseFnJw({ data: params });

      console.log("fim try", res);
 
      const dadosjs = res.data.dados; // get info layout from jw site
      if (dadosjs.length > 0) {
        let dados = dadosjs.splice(4, 1);
        console.log(dados, "sobrou");
        imagemjw = dados[0].figura;
        linksitejw = dados[0].url; // extract main image
        partesjw = [...dadosjs];
        console.log(gruposNumero);
        gruposNumero.forEach((a) => {
          if (a.items.length > 0) {
            grupoDesignacao.push(new GrupoDesignacao(a, partesjw));
            console.log(grupoDesignacao);
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
    pronto = true;
  };

  const montaDataProxima = () => {
    if (!firstLoad) {
      if (
        dataInicial.getTime() <
        new Date().getTime() + 3600 * 24 * 40 * 1000
      ) {
        //avoid go forward more than 30 days
        dataInicial = new Date(dataInicial.getTime() + 3600 * 24 * 7 * 1000);
        dataFinal = new Date(dataInicial.getTime() + 3600 * 24 * 6 * 1000);
      }
    } else {
      dataInicial.setDate(
        dataInicial.getDate() + ((1 + 7 - dataInicial.getDay()) % 7)
      ); //find next monday
      dataFinal = new Date(dataInicial.getTime() + 3600 * 24 * 6 * 1000); //find next sunday
      firstLoad = false;
    }

    return `${dataInicial.toLocaleDateString(
      "pt-br"
    )}-${dataFinal.toLocaleDateString("pt-br")}`;
  };

  const montaDataAnterior = () => {
    if (dataInicial.getTime() > new Date().getTime() + 3600 * 24 * -30 * 1000) {
      //avoid go back more than 30 days
      dataInicial = new Date(dataInicial.getTime() + 3600 * 24 * -7 * 1000);
      dataFinal = new Date(dataInicial.getTime() + 3600 * 24 * 6 * 1000);
    }
    return `jwperiodo=${dataInicial.toLocaleDateString(
      "pt-br"
    )}-${dataFinal.toLocaleDateString("pt-br")}`;
  };

  doPost(montaDataProxima());
</script>

<style>
  .pane {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    align-content: center;
  }

  tr {
    font-size: 16px;
    display: flex;
    align-items: center;
  }

  img {
    height: 95%;
    width: 95%;
    margin: 8px;
  }

  .btnControlDate {
    display: flex;
    justify-content: space-evenly;
  }

  .person-input {
    border: solid lightgray 1px;
    display: flex; /* required for drag & drop to work when .item display is inline */
    height: 40px;
    padding: 8px;
    background-color: white;
    align-items: center;
    border: solid rgb(110, 109, 109) 1px;
    flex: 2;
  }

  .table-align {
    display: flex;
    justify-content: center;
  }

  .label-input {
    display: flex;
    padding: 10px;
    border: solid rgb(110, 109, 109) 1px;
    text-align: center;
    height: 36px;
    align-items: center;
    flex: 1;
  }

  span {
    background-color: lightgray;
    cursor: pointer;
    display: flex;
    padding: 4px;
    width: 98%;
    text-align: center;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    height: 32px;
    font-size: 0.9em;
    box-shadow: 1px 2px 3px rgba(0, 0, 0, 2);
  }
  span:hover {
    background: orange;
    color: white;
  }

  table {
    width: 100%;
    border: 3px solid black;
  }
  td {
    display: flex;
    align-items: center;
    text-align: center;
    width: 50%;
  }

  tr {
    display: flex;
    flex-grow: 1;
  }

  .control-table {
    display: flex;
  }

  .figure {
    display: flex;
    padding: 8px;
    border: solid rgb(110, 109, 109) 1px;
    justify-content: center;
    align-items: center;
    height: 80px;
    flex: 1;
    background-color: black;
  }

  .control {
    border: solid lightgray 1px;
    display: flex; /* required for drag & drop to work when .item display is inline */
    height: 80px;
    padding: 8px;
    background-color: white;
    align-items: center;
    border: solid rgb(110, 109, 109) 1px;
    flex: 4;
    background-color: black;
  }

  .titulo {
    flex: 4;
    justify-content: left;
    color: whitesmoke;
    font-weight: 800;
    font-size: 18px;
    padding: 8px;
    background-color: black;
  }
</style>

<div class="pane">
  <div class="btnControlDate">
    <Button
      type="secondary"
      inverse={true}
      on:click={() => {
        doPost(montaDataAnterior());
      }}>
      ANTERIOR
    </Button>
    <Button
      type="secondary"
      inverse={true}
      on:click={() => {
        doPost(montaDataProxima());
      }}>
      PROXIMO
    </Button>
  </div>
  {#if dataFinal.getMonth() == dataInicial.getMonth()}
    <h2>
      <a href={linksitejw}>{dataInicial.getDate()}-{dataFinal.getDate()}
        de
        {meses[dataInicial.getMonth() + 1]}</a>
    </h2>
  {:else}
    <h2>
      <a href={linksitejw}>{dataInicial.getDate()}
        de
        {meses[dataInicial.getMonth() + 1]}-{dataFinal.getDate()}
        de
        {meses[dataFinal.getMonth() + 1]}</a>
    </h2>
  {/if}
  {#if pronto && partesjw.length > 0}
    <div class="table-align">
      <table>
        <tr class="control-table">
          <td class="figure">
            <img src={imagemjw} alt="Imagem" hidden={imagemjw == ''} />
          </td>
          <td class="control" />
        </tr>
        {#each grupoDesignacao as gp, i}
          {#if gp}
            <tr>
              <td class="titulo">{gp.grupo.name}</td>
            </tr>
            {#each gp.partes as item}
              <tr>
                <td class="label-input">
                  {@html item.titulo}
                </td>
                <td class="person-input">
                  {#if item.vaga1}<span>{item.vaga1.nome}</span>{/if}
                </td>
                <td class="person-input">
                  {#if item.vaga2}<span>{item.vaga2.nome}</span>{/if}
                </td>
              </tr>
            {/each}
          {/if}
        {/each}
      </table>
    </div>
  {:else if pronto && partesjw?.length <= 0}
    <p>Aconteceu algum erro!!!</p>
  {:else}
    <Spinner />
  {/if}
</div>
