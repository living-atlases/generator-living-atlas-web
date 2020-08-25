<script>
  import Flex from 'svelte-flex';
  import {Button, Card, Select, Switch, TextField, Tooltip} from "smelte";
  import UrlPrefix from './UrlPrefix.svelte';

  export let service;
  export let conf;
  export let hostnamesList;
  export let save;

  const subdomainRegexp = /[a-z0-9_.\-]+/
  let deployError = {};
  let urlError = {};
  deployError[service.name_int] = "";
  urlError[service.name_int] = "";

  let verify = function () {
    if (conf[`LA_${service.name_int}_suburl`] == null) {
      conf[`LA_${service.name_int}_suburl`] = service.name;
    }
    if (conf[`LA_${service.name_int}_path`] == null) {
      conf[`LA_${service.name_int}_path`] = service.path;
    }
    if (conf[`LA_use_${service.name_int}_hostname`] == null && hostnamesList && hostnamesList.length > 0) {
      conf[`LA_use_${service.name_int}_hostname`] = hostnamesList[0];
    }
    urlError[service.name_int] = (!subdomainRegexp.test(conf[`LA_${service.name_int}_suburl`])) ? "Invalid subdomain" : "";
    deployError[service.name_int] = conf[`LA_use_${service.name_int}_hostname`] == null ? "Please select a server" : "";
  }

  let onChange = function () {
    console.log("onchange")
    verify();
    save();
  }

  $: {
    verify();
  }
</script>

<!--<div class="service-group">-->
<!-- <Card.Card > -->
<div class="p-20 pb-5 pt-3 body-2">

	<Flex justify="between">
		{#if service.optional}
			<div on:click={onChange}>
				<Switch bind:value={conf["LA_use_" + service.name_int]}
								label="Use the {service.name} service ({service.desc})?"/>
			</div>
		{/if}
	</Flex>

	{#if !service.optional || conf["LA_use_" + service.name_int]}
		<Flex justify="between">
			<Flex justify="start">
				{#if typeof service.forceSubdomain === 'undefined' && !service.forceSubdomain}
					<Tooltip>
						<div slot="activator">
							<div on:click={onChange}>
								<!-- https://github.com/matyunya/smelte/issues/149 -->
								<Switch bind:value={conf[`LA_${service.name_int}_uses_subdomain`]}/>
							</div>
						</div>
						Use a subdomain for this service?
					</Tooltip>
				{/if}
				<UrlPrefix ssl={conf.LA_enable_ssl}/>

				{#if conf[`LA_${service.name_int}_uses_subdomain`]}
					<TextField bind:value={conf[`LA_${service.name_int}_suburl`]}
										 error={urlError[service.name_int]} on:change={onChange}
										 hint={service.hint}/>
					<span class="nowrap">.{conf.LA_domain}/</span>
					<TextField bind:value={conf[`LA_${service.name_int}_path`]} on:change={onChange}/>
				{/if}

				{#if !conf[`LA_${service.name_int}_uses_subdomain`]}
					<span class="nowrap">{conf.LA_domain}/</span>
					<TextField bind:value={conf[`LA_${service.name_int}_suburl`]}
										 error={urlError[service.name_int]} on:change={onChange}
										 hint={service.hint}/>
					<span> /</span>
				{/if}
			</Flex>
			<div class="deploy-in">
				<Select bind:value={conf[`LA_use_${service.name_int}_hostname`]}
								error={deployError[service.name_int]} class="deploy-in" outlined
								autocomplete on:change={onChange}
								label="deploy in" items={hostnamesList}/>
			</div>
			{#if service.sample != null}
				<Tooltip>
					<div slot="activator">
						<a class="btn-visible nohover" href={service.sample} target="_blank">
							<Button icon="help_outline" text light flat/>
						</a>
					</div>
					See a similar service in production
				</Tooltip>
			{:else}
				<div class="btn-hidden">
					<Button icon="help_outline" text light flat/>
				</div>
			{/if}
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

    a.nohover:hover {
        text-decoration: none;
    }

    .nowrap {
        white-space: nowrap;
    }

    .btn-hidden {
        opacity: 0%;
    }

    .btn-visible {
        opacity: 100%;
    }

</style>