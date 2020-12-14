<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let user;
  let senha;
</script>

<style>
  .panel {
    display: grid;
    justify-content: center;
    margin-top: 5em;
  }
  input {
    min-width: 20em;
  }
</style>

<form class="panel" on:submit|preventDefault={ () => dispatch("logUser", { user, senha })}>
  <input type="text" placeholder="Usuário" bind:value={user} required />
  <input
    type="password"
    placeholder="Senha"
    bind:value={senha}
    required />
  <button type="submit">Logar</button>
</form>
<!-- 123 -->