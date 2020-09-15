<script>
  import Url from 'domurl';
  import Assistant from './Assistant.svelte';
  import {title} from './utils';

  let initStore = {};
  let debug = false;
  let uuid = new Url().path.replace(/^\/+/, '');
  let init = function () {
    let req;
    if (uuid === "" || uuid == null) req = {} // let's ask for a uuid
    else req = {uuid} // let's get the conf for the server
    fetch('/v1/ses', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then(res => res.json()).then((ses) => {
      uuid = ses.uuid;
      let conf = ses.conf;
      if (debug) console.log(`Conf of '${conf.LA_project_name}' with uuid: ${uuid} `);
      window.history.pushState({page: uuid}, title(conf.LA_project_shortname), uuid);
      initStore = {uuid, conf};
    })
  }
  init();
</script>

{#if (typeof initStore.uuid !== "undefined")}
	<Assistant {initStore} {debug}/>
{:else}
	<!--	Loading -->
{/if}

<style>
</style>
