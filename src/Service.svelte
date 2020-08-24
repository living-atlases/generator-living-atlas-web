<script>
  import Flex from 'svelte-flex';
  import {Card, Select, Switch, TextField, Tooltip} from "smelte";
  import UrlPrefix from './UrlPrefix.svelte';

  export let service;
  export let conf;
  export let hostnamesList;

</script>

<!--<div class="service-group">-->
<!-- <Card.Card > -->
<div class="p-20 pb-5 pt-3 body-2">

	<Flex justify="between">
		{#if service.optional}
			<Switch bind:value={conf["LA_use_" + service.name_int]}
							label="Use the {service.name} service ({service.desc})?"></Switch>
		{/if}
	</Flex>

	{#if !service.optional || conf["LA_use_" + service.name_int]}
		<Flex justify="between">
			<Flex justify="start">
				<Tooltip>
					<div slot="activator">
						<Switch bind:value={conf["LA_uses_subdomain_" + service.name_int]}></Switch>
					</div>
					Use a subdomain for this service?
				</Tooltip>

				<UrlPrefix ssl={conf.LA_enable_ssl}/>

				{#if conf["LA_uses_subdomain_" + service.name_int]}
					<TextField bind:value={conf[`LA_${service.name_int}_suburl`]} label={service.name} hint={service.hint}/>
					<span>.{conf.LA_domain}/</span>
					<TextField bind:value={conf[`LA_${service.name_int}_path`]} label={service.path}/>
				{/if}

				{#if !conf["LA_uses_subdomain_" + service.name_int]}
					<span>{conf.LA_domain}/</span>
					<TextField bind:value={conf[`LA_${service.name_int}_suburl`]} label={service.name} hint={service.hint}/>
					<span> /</span>
				{/if}
			</Flex>
			<div class="deploy-in">
				<Select bind:value={conf[`LA_use_${service.name_int}_hostname`]} class="deploy-in" outlined autocomplete
								label="deploy in" items={hostnamesList}/>
			</div>
		</Flex>
	{/if}

</div>
<hr>
<!-- </Card.Card> -->
<!-- </div> -->

<style>
    .deploy-in {
        margin: 0 0 5px 10px;
    }
</style>