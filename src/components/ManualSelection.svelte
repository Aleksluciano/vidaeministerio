<script>

import { createEventDispatcher } from "svelte";
const dispatch = createEventDispatcher();


export let data = {};


//data.irmaos = data.designacao.substituicao(data.irmao);


</script>
<div class="backdrop" on:click|self >
<div class=pane style="top:{data.top}px;left:{data.left}px">
<!-- <button class="cancelar" style="top:{data.top - 180}px;">cancelar</button> -->
  {#each data.designacao.substituicao(data) as item}
  <span
  on:click={() => {
    dispatch('substituicao', { subIrmao: item })
  }}
  class="stick"
  style={item.sexo == 'F' ? 'color:#d90166' : ''}>
  {#if item.privilegio}
    <span class="privilegio">{item.privilegio}</span>
  {/if}
  
  {item.nome}
  {#if item.data}
  <span
  class="dias-diferenca">{data.designacao.diasSemParte(item.data)}</span>
  {/if}
  </span>
  {/each}
  </div>
  </div> 


<style>
  .backdrop{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
  }

  .cancelar{
    z-index: 200;
    position: relative;
    background-color: brown;
    margin-right: auto;
  }
.pane{
  position: absolute;
  top: 0px;
  width: 20%;
  z-index: 100;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgb(10, 10, 10,0.8);
  clip-path: polygon(38% 0, 21% 0, 100% 0, 100% 100%, 6% 100%, 6% 6%, 0 0);
}




  .stick {
    margin:5px;
    margin-left: 8%;
    position: relative;
    background-color: lightgray;
    cursor: pointer;
    display: flex;
    padding: 4px;
    width: 90%;
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
</style>