<script>
  import Url from 'domurl';
  import Assistant from './Assistant.svelte';
  import {title} from './utils';
  import Flex from 'svelte-flex';
  import {Button} from "smelte";
  import browserUpdate from 'browser-update';

  browserUpdate({
    // fetch compatibility
    required: {i: 14, f: 139, o: 29, s: 10.1, c: 42},
  });
  let initStore = {};
  let debug = false;
  let uuid = new Url().path.replace(/^\/+/, '');
  let error = "";
  let init = function () {
    let req;
    if (uuid === "" || uuid == null) req = {} // let's ask for a uuid
    else req = {uuid} // let's get the conf for the server
    fetch('/v1/ses', {
      method: 'POST',
      body: JSON.stringify(req)
    }).then((res) => {
      if (res.ok)
        return res.json()
      else {
        error = "Oops, we can't find this configuration ...";
        throw new Error(error);
      }
    }).then((ses) => {
      uuid = ses.uuid;
      let conf = ses.conf;
      if (debug) console.log(`Conf of '${conf.LA_project_name}' with uuid: ${uuid} `);
      window.history.pushState({page: uuid}, title(conf.LA_project_shortname), uuid);
      initStore = {uuid, conf};
    })
  }
  let onFirstBtnClick = () => {
    const newUrl = new Url();
    newUrl.path = "/";
    window.open(newUrl.toString());
  }
  init();
</script>
{#if (typeof initStore.uuid !== "undefined")}
	<Assistant {initStore} {debug}/>
{:else}
	<!--	Loading -->
	{#if (error.length > 0)}
		<Flex direction="row" align="stretch" justify="center">
			<Flex direction="column" align="stretch" justify="center">
				<h2>Living Atlas Generator</h2>
				<span class="error-message">{error}</span>
				<div class="py-2 mr-2">
					<Button on:click={onFirstBtnClick} block>Restart</Button>
				</div>
			</Flex>
		</Flex>
	{/if}
{/if}
<style>
    .error-message {
        font-size: 24px;
    }
</style>
