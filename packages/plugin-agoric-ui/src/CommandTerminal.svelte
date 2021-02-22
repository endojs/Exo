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

  const breakLines = lines =>
    lines.trimRight().split('\n')
    .map(
      l =>
        l
          .replace(/\x1b\[\d+m/g, '') // FIXME: ANSI colors.
          .replace(/\t/g, '  ')
    );

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

  .history {
    overflow-y: auto;
    overflow-x: hidden;
    height: 60vh;
    width: 80vw;
  }
</style>

<section>
  <div class="history">
  <code>
  {#each consoleData as { type, data }}
    <div class="{type}">
    {#if type === 'exit'}
      Exited {data.code}
    {:else}
      {#each breakLines(data) as line}
        {line}<br/>
      {/each}
    {/if}
    </div>
  {/each}
  </code>
  </div>
  <input use:init bind:value on:keyup={handleKeyup} />
</section>
