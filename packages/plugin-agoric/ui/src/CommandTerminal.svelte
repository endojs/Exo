<script>
  import 'smelte/src/tailwind.css';
  import { E } from '@agoric/eventual-send';
  import { updateFromNotifier } from '@agoric/notifier';

  export let actions;
  export let value = '';

  $: consoleData = [];
  updateFromNotifier({
    updateState(state) {
      consoleData = state;
    },
    finish(state) {
      consoleData = state;
    },
  }, E(actions).getNotifier());

  const tt = s =>
    s.replace(/(.{80})/g, '$1\n');

  const handleKeyup = ev => {
    if (ev.key === 'Enter') {
      E(actions).write(`${value}\n`);
      value = '';
    }
  };

  function init(el) {
    el.focus();
  }
</script>

<style>
  .stderr {
    color: red;
  }
  .stdin {
    color: blue;
  }
  input {
    width: 100%;
  }
</style>

<section>
  {#each consoleData as { type, data }}
    <div class="{type}">
      <code>
    {#if type === 'exit'}
      Exited {data.code}
    {:else}
      {tt(data)}
    {/if}
      </code>
    </div>
  {/each}
  <input use:init bind:value on:keyup={handleKeyup} />
</section>
