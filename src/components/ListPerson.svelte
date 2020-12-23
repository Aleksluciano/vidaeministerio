<script>
  import Button from "../shared/Button.svelte";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  export let irmaos = [];
  
  const dispatch = createEventDispatcher();

  let animeOptions = { duration: 1000 };
  // Holds table sort state.  Initialized to reflect table sorted by id column ascending.
  let sortBy = { col: "id", ascending: true };

  $: sort = (column) => {
    if (sortBy.col == column) {
      sortBy.ascending = !sortBy.ascending;
    } else {
      sortBy.col = column;
      sortBy.ascending = true;
    }

    // Modifier to sorting function for ascending or descending
    let sortModifier = sortBy.ascending ? 1 : -1;

    let sort = (a, b) =>
      a[column] < b[column]
        ? -1 * sortModifier
        : a[column] > b[column]
        ? 1 * sortModifier
        : 0;

    irmaos = irmaos.sort(sort);
  };
  const privilegios = [
    { sigla: "E", privilegio: "Estudante" },
    { sigla: "P", privilegio: "Publicador" },
    { sigla: "S", privilegio: "Servo Ministerial" },
    { sigla: "A", privilegio: "Ancião" },
  ];
  const siglaPrivilegio = (sigla) => {
    return privilegios.find((a) => a.sigla == sigla).privilegio;
  };

  const partes = [
    { sigla: "I", parte: "Inicio" },
    { sigla: "A", parte: "Ajudante" },
    { sigla: "C", parte: "1 Conversa" },
    { sigla: "D", parte: "Discurso" },
    { sigla: "E", parte: "Estudo" },
    { sigla: "L", parte: "Leitura" },
    { sigla: "R", parte: "Revisita" },
  ];
  const siglaParte = (sigla) => {
    return partes.find((a) => a.sigla == sigla?.substring(2)).parte;
   
	};
</script>

<style>
  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
    padding: 0;
  }
  table {
    background: rgb(251, 252, 250);
    text-align: center;
    width: 100%;
    font-size: .9em;
  }
  table th {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 0;
    background: #fff;
    border: 2px black solid;
    font-size: .9em;
  }

  th {
    cursor: pointer;
  }

  .pane {
    width: 100%;
    overflow-y: scroll;
    max-height: 500px;
  }

   .space-left {
    margin-right: 15px;
  }

  .space-top {
    padding-top: 5px;
  }

  tr:hover {
    background-color: #f5f5f5;
  }

  td{
    padding: 0;
  }
</style>

<div class="pane">
  <table>
    <thead>
      <tr>
        <th on:click={sort('situacao')}>St</th>
        <th on:click={sort('nome')}>Nome</th>
        <th on:click={sort('sexo')}>Sexo</th>
        <th on:click={sort('privilegio')}>Privilégio</th>
        <th on:click={sort('grupo')}>Grupo</th>
        <th on:click={sort('parte')}>Parte</th>
        <th on:click={sort('data')}>Data</th>
        <th>Funções</th>
      </tr>
    </thead>
    <tbody>
      {#each irmaos as row (row.id)}
        <tr in:fade|local={animeOptions} out:fade|local={animeOptions}>
          <td>{row.situacao ? '🟢' : '🔴'}</td>
          <td>{row.nome}</td>
          <td>{row.sexo}</td>
          <td>{siglaPrivilegio(row.privilegio)}</td>
          <td>{row.grupo}</td>
          <td>{siglaParte(row.parte)}</td>
          <td>{row.data}</td>
          <td class="space-top">
            <Button
              on:click={() => {
                dispatch('editPerson', row);
              }}
              flat={true}
              type="secondary"
              cmd="true"
              inverse="true">
              editar
            </Button>
            <span class="space-left" />
            <Button
              cmd="true"
              inverse="true"
              on:click={() => {
                dispatch('deletePerson', row);
              }}
              flat={true}>
             X
            </Button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
