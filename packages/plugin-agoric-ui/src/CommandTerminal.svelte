<script>
  import 'smelte/src/tailwind.css';
  import { E } from '@agoric/eventual-send';
  import { updateFromNotifier } from '@agoric/notifier';
  import { beforeUpdate, afterUpdate } from 'svelte';

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

  const removeAnsi = lines =>
    lines.trimRight().replace(/\x1b\[\d+m/g, ''); // FIXME: Need a better regex.

  const handleKeyup = ev => {
    if (ev.key === 'Enter') {
      E(actions).write(`${value}\n`);
      value = '';
    }
  };

  function init(el) {
    el.focus();
  }


  let div;
  let autoscroll;

  beforeUpdate(() => {
  	autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
  });

  afterUpdate(() => {
  	if (autoscroll) div.scrollTo(0, div.scrollHeight);
  });
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

  section {
    width: 100%;
  }

  code {
    width: 100%;
  }

  .history {
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    /* height: 60vh;
    width: 80vw; */
  }

  section {
    display: flex;
    min-height: 100px;
  }

  .preserve-whitespace {
    white-space: pre-wrap;
  }

  .scrollable {
		flex: 1 1 auto;
		border-top: 1px solid #eee;
		margin: 0 0 0.5em 0;
		overflow-y: auto;
	}
</style>

<section>
  <div class="history scrollable" bind:this={div}>
  <code>
  {#each consoleData as { type, data }}
    <div class="preserve-whitespace {type}">
    {#if type === 'exit'}
      Exited {data.code}
    {:else}
      {removeAnsi(data)}
    {/if}
    </div>
  {/each}
  </code>
  </div>
</section>
