<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let user;
  let senha;
  let form = "logar";
  let message = "";
</script>

<style>
  .panel {
    display: grid;
    justify-content: center;
    margin-top: 5em;
    position: relative;
 
  }
  input {
    min-width: 20em;
  }
  p{
    color: orange;
    font-weight: 600;
  }

  section {
 text-align: center;
  }
  img {
   width: 20em;
   margin-top: 15px;
   color: yellow;
  }

  .creditos{
   position: absolute;
   bottom: 20px;
   left: 20px;
  }
</style>
<section>

{#if form == 'logar'}
  <form
    class="panel"
    on:submit|preventDefault={() => dispatch('logUser', { user, senha })}>
    <input type="text" placeholder="Usuário" bind:value={user} required />
    <input type="password" placeholder="Senha" bind:value={senha} required />
    <button type="submit">Logar</button>
    <a on:click={() => (form = 'esqueceu')}>Esqueceu a senha ?</a>
  </form>
{:else}

  <form
  
    class="panel"
    on:submit|preventDefault={() => {
      message = 'Olhe sua caixa de email !!!';
      setTimeout((_) => {
        message = '';
      }, 10000);
      dispatch('resetPass', { user });
    }}>
    {#if message}
    <p>{message}</p>
    {/if}
    <input type="text" placeholder="Usuário" bind:value={user} required />
    <button type="submit">Solicitar Reset</button>
    <a on:click={() => { form = 'logar'; message = ''}}>Logar ?</a>
  </form>
{/if}
<img src="/img/talk.svg" alt="pupito">
<a class="creditos" href="https://www.vecteezy.com/free-vector/meeting">Meeting Vectors by Vecteezy</a>
</section>
<!-- 123 -->
