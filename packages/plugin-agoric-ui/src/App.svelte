<script>
  import 'smelte/src/tailwind.css';
  import { E } from '@agoric/eventual-send';

  import Button from 'smelte/src/components/Button';
  import Dialog from 'smelte/src/components/Dialog';
  import { connected, ready, appP } from './store';
  
  import ListItems from '../lib/ListItems.svelte';
  import MenuButton from '../lib/MenuButton.svelte';
  import DefaultButton from '../lib/DefaultButton.svelte';
  import CancelButton from '../lib/CancelButton.svelte';

  import Config from './Config.svelte';
  import CommandTerminal from './CommandTerminal.svelte';

  const menu = [
    { id: 'main', text: 'Main' },
  ];

  let navPanel = 'main';

  import { ThemeWrapper } from 'svelte-themer';

  connected.connect();

  $: connectStatus = $connected ? 'Connected' : 'Disconnected';
  $: connectLabel = $connected ? 'Disconnect' : 'Connect';
  $: connectAction = $connected ? connected.disconnect : connected.connect;

  let nickname = '';
  let runningProcess = null;

  const sayHello = () => E(appP).hello(nickname || 'friend').then(r => alert(r), r => alert(r));
  const handleHelloKeyup = ev => {
    if (ev.key === 'Enter') {
      sayHello();
    }
  };

  const fork = async (title, ...args) => {
    runningProcess = { actions: E(appP).fork(title, ...args), title, value: '' };
  };
  fork('Agoric', 'ag-solo', 'setup');

  const launchWallet = async (port = 8000) => {
    accessToken = await E(appP).getAccessToken(port);
  };
</script>

<style>
  :global(html) {
    --text-color-normal: green;
    --text-color-light: #8cabd9;
    color: var(--theme-text);
    --agoric-bg: #ab2328;
    --banner-height: 70px;
    --content-width: 100%;
  }
  :global(.highlighted) {
    color: var(--text-color-light);
  }
  :global(body) {
    padding-top: var(--banner-height);
    color: var(--theme-text);
    height: 100vh;
  }
  :global([data-theme='dark']) {
    --text-color-normal: hsl(210, 10%, 62%);
    --text-color-light: hsl(210, 15%, 35%);
    --text-color-richer: hsl(210, 50%, 72%);
    --text-color-highlight: hsl(25, 70%, 45%);
  }
  img {
    max-width: 100%;
    size: auto;
  }
  .header-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    background-color: var(--agoric-bg);
    width: 100%;
    /* height: var(--banner-height); */
    z-index: 25;
    border-bottom: 1px solid var(--color-primary-700);
  }
  .disconnected-background {
    position: absolute;
    top: var(--banner-height);
    left: 0;
    width: 100%;
    height: calc(max(100%, 100vh) - var(--banner-height));
    border: none;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
  }

  header {
    z-index: 30;
    min-height: var(--banner-height);
    max-width: var(--content-width);
    margin: auto;
    color: #f1f1f1;
    background-color: var(--agoric-bg);
    padding: 10px 20px;

    display: flex;
    align-items: center;
    flex-shrink: 0;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  nav {
    display: flex;
    align-items: center;
  }
  nav :global(button) {
    /* remove the padding at the bottom */
    margin: auto;
  }
  nav h6 {
    text-transform: uppercase;
    font-size: 10px;
    font-style: italic;
  }
  .connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 10rem;
  }

  main {
    padding: 8px;
    max-width: var(--content-width);
    /* margin: 1em auto; */
    display: grid;
    /* grid-template-columns: 1fr 1fr; */
    grid-gap: 10px;
    width: 100%;
    height: 100%;
  }
  footer {
    min-height: var(--banner-height);
    max-width: var(--content-width);
    padding: 8px;
    margin: auto;
    /* padding: 2em 3em; */

    display: flex;
    align-items: center;
    flex-shrink: 0;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .theme-hidden {
    display: none;
  }

  .full {
    grid-column: 1 / span 2;
  }

  .bottom {
    position: absolute;
    bottom: calc(20px + var(--banner-height));
    margin: 20px;
    z-index: 32;
  }

  /* DEBUGGING */
  /* * {
    border: 1px solid red;
  } */

  /* :global(*) {
    border: thin dashed gray;
  }  */
</style>

<svelte:head>
  <title>Pledger</title>
</svelte:head>

<ThemeWrapper>

  <div class="header-wrapper">
    <header>
      <a href="https://agoric.com" class="flex items-center">
        <img src="logo.png" alt="Agoric" width="200" />
      </a>
      <h4>Pledger</h4>
    </header>
  </div>

  <main>
    <CommandTerminal actions={runningProcess.actions} bind:value={runningProcess.value} />
  </main>
</ThemeWrapper>
