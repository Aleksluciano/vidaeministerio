<script>
  import { createEventDispatcher } from "svelte";
  import Button from "../shared/Button.svelte";
  import Spinner from "../shared/Spinner.svelte";
  import { callFirebaseFnJw } from "../../firebase.js";
  import { fade } from "svelte/transition";
  import { DesignacaoPeriodo } from "./DesignacaoPeriodo";

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
  let grupoDesignacoes = [];
  let designacaoPeriodo;

  const doPost = async (params) => {
    grupoDesignacoes = [];
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

        irmaos.sort((a, b) =>
          nDate(a.data).getTime < nDate(b.data).getTime()
            ? -1
            : nDate(a.data).getTime() > nDate(b.data).getTime()
            ? 1
            : 0
        );

       designacaoPeriodo = new DesignacaoPeriodo(copyArray(irmaos),partesjw,gruposNumero);
       designacaoPeriodo.montar();
       console.log("Comecaaaa",designacaoPeriodo)
      }
   
    } catch (e) {
      console.log(e);
    }
    pronto = true;
  };
  const nDate = (date) => new Date(date.substring(6)+'/'+date.substring(3,5)+'/'+date.substring(0,2));
  const diasSemParte = (data) => {
    let hoje = dataInicial;
    
   // console.log(data.substring(6)+'/'+data.substring(3,5)+'/'+data.substring(0,2))
    let Difference_In_Time = hoje.getTime() - nDate(data).getTime();
    console.log("Difference_In_Time ",Difference_In_Time)
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    let result = Difference_In_Days.toFixed(0);
    if(result < 0)result = result * -1;
    return result;
  };

  const copyArray = (array) => array.map((a) => ({ ...a }));

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
    return `${dataInicial.toLocaleDateString(
      "pt-br"
    )}-${dataFinal.toLocaleDateString("pt-br")}`;
  };

  const manualSelection = () => {

  }


  doPost(montaDataProxima());
</script>

<style>
  .pane {
    margin-top: 1%;
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
    justify-content: space-between;
    height: 3em;
  }

  .periodo {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .person-input {
    border: solid lightgray 1px;
    display: flex; /* required for drag & drop to work when .item display is inline */
    height: 40px;
    padding: 8px;
    background-color: white;
    align-items: center;
    border: solid rgb(212, 210, 210) 1px;
    flex: 2;
  }

  .table-align {
    display: flex;
    justify-content: center;
  }

  .label-input {
    display: flex;
    padding: 10px;
    border: solid rgb(199, 197, 197) 1px;
    text-align: center;
    height: 36px;
    align-items: center;
    flex: 1;
  }

  .stick {
    position: relative;
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
    color: rgb(27, 69, 206);
    font-weight: 600;
  }

  .privilegio {
    position: absolute;
    left: 4px;
    padding: 1px;
    color: rgb(87, 85, 85);
  }

  .dias-diferenca {
    position: absolute;
    right: 4px;
    padding: 1px;
    color: rgb(87, 85, 85);
    
  }
  span:hover {
    background: orange;
    color: white;
  }

  table {
    width: 100%;
    border: 3px solid rgb(60, 122, 81);
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
    border: solid rgb(196, 193, 193) 1px;
    justify-content: center;
    align-items: center;
    height: 80px;
    flex: 1;
    background-color: whitesmoke;
  }

  .control {
    border: solid lightgray 1px;
    display: flex; /* required for drag & drop to work when .item display is inline */
    height: 80px;
    padding: 8px;
    background-color: white;
    align-items: center;
    border: solid rgb(197, 195, 195) 1px;
    flex: 4;
    background-color: whitesmoke;
  }

  .titulo {
    flex: 4;
    justify-content: left;
    color: whitesmoke;
    font-weight: 800;
    font-size: 18px;
    padding: 8px;
    background-color: rgb(60, 122, 81);
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
      👈🏻
    </Button>

    {#if dataFinal.getMonth() == dataInicial.getMonth()}
      <div class="periodo">
        <h2>
          <a target="_blank" href={linksitejw}>{dataInicial.getDate()}-{dataFinal.getDate()}
            de
            {meses[dataInicial.getMonth() + 1]}</a>
        </h2>
      </div>
    {:else}
      <div class="periodo">
        <h2>
          <a target="_blank" href={linksitejw}>{dataInicial.getDate()}
            de
            {meses[dataInicial.getMonth() + 1]}-{dataFinal.getDate()}
            de
            {meses[dataFinal.getMonth() + 1]}</a>
        </h2>
      </div>
    {/if}

    <Button
      type="secondary"
      inverse={true}
      on:click={() => {
        doPost(montaDataProxima());
      }}>
      👉🏻
    </Button>
  </div>

  {#if pronto && partesjw.length > 0}
    <div class="table-align" in:fade|local={{ duration: 1000 }}>
      <table>
        <tr class="control-table">
          <td class="figure">
            <img src={imagemjw} alt="Imagem" hidden={imagemjw == ''} />
          </td>
          <td class="control" />
        </tr>
        {#each designacaoPeriodo.grupos as gp, i}
          {#if gp}
            <tr>
              <td class="titulo">{gp.nomeGrupo} - {gp.nomeSala}</td>
            </tr>
            {#each gp.partes as item}
              <tr>
                <td class="label-input">
                  {@html item.titulo}
                </td>
                <td class="person-input" on:click="{()=>{ manualSelection() }}">
                  {#if item.vaga1}
                    <span
                      class="stick"
                      style={item.vaga1.sexo == 'F' ? 'color:#d90166' : ''}>
                      {#if item.vaga1.privilegio}
                        <span class="privilegio">{item.vaga1?.privilegio}</span>
                      {/if}

                      {item.vaga1.nome}
                      {#if item.vaga1.data}
                        <span class="dias-diferenca">{ diasSemParte(item.vaga1.data) }</span>
                      {/if}
                    </span>
                  {/if}
                </td>
                <td class="person-input">
                  {#if item.vaga2}
                    <span
                      class="stick"
                      style={item.vaga2.sexo == 'F' ? 'color:#d90166' : ''}>
                      {#if item.vaga2.privilegio}
                        <span class="privilegio">{item.vaga2?.privilegio}</span>
                      {/if}
                      {item.vaga2.nome}
                      {#if item.vaga2.data}
                      <span class="dias-diferenca">{ diasSemParte(item.vaga2.data) }</span>
                    {/if}
                    </span>
                  {/if}
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
