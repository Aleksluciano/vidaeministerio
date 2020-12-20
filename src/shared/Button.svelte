<script>
export let type = 'primary';
export let flat = false;
export let inverse = false;
export let disabled = false;
</script>

<button class={type} class:flat={flat} class:inverse={inverse} on:click {disabled}>
    <slot><!-- optional fallback --></slot>
</button>

<style>
button {
  border: 0;
  cursor: pointer;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: bold;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 2);
}

button:disabled,
button[disabled]{
  border: 1px solid #999999;
  background-color: #cccccc;
  color: #666666;
}

.neutral {
  background: white;
  color: #333;
}

.primary {
  background: #d91b42;
  color: white;
}

.secondary {
  background: #45c496;
  color: white;
}

.flat {
  box-shadow: none;
}

.primary.inverse {
  color: #d91b42;
  background: white;
  border: 2px solid #d91b42;
}

.secondary.inverse {
  color: #45c496;
  background: white;
  border: 2px solid #45c496;
}
</style>
