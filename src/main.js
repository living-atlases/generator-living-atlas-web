import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    mainDomain: 'l-a.site'
  },
});

export default app;
