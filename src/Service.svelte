<script>
  import Flex from 'svelte-flex';
  import {Button, Card, Select, Switch, TextField, Tooltip} from "smelte";
  import UrlPrefix from './UrlPrefix.svelte';

  export let service;
  export let conf;
  export let hostnamesList;
  export let save;
  export let debug = false;

  const subdomainRegexp = /[a-z0-9_.\-]+/
  let deployError = {};
  let urlError = {};
  deployError[service.name_int] = "";
  urlError[service.name_int] = "";

  let verify = function () {
    if (conf[`LA_${service.name_int}_suburl`] == null) {
      conf[`LA_${service.name_int}_suburl`] = service.name;
    }
    if (conf[`LA_${service.name_int}_iniPath`] == null) {
      conf[`LA_${service.name_int}_iniPath`] = service.path;
    }
    if (conf[`LA_${service.name_int}_hostname`] == null && hostnamesList && hostnamesList.length > 0) {
      conf[`LA_${service.name_int}_hostname`] = hostnamesList[0];
    }
    if (!conf['LA_use_ala_bie']) {
      conf['LA_use_species_lists'] = false;
    }

    conf[`LA_${service.name_int}_path`] = (conf[`LA_${service.name_int}_uses_subdomain`] ? conf[`LA_${service.name_int}_iniPath`].startsWith("/") ? "" : "/" +
      conf[`LA_${service.name_int}_iniPath`] : conf[`LA_${service.name_int}_suburl`].startsWith("/") ? "" : "/" +
      conf[`LA_${service.name_int}_suburl`]);

    conf[`LA_${service.name_int}_url`] = (conf[`LA_${service.name_int}_uses_subdomain`] ?
      conf[`LA_${service.name_int}_suburl`] + "." + conf.LA_domain : conf.LA_domain);

    urlError[service.name_int] = (!subdomainRegexp.test(conf[`LA_${service.name_int}_suburl`])) ? "Invalid subdomain" : "";
    deployError[service.name_int] = conf[`LA_${service.name_int}_hostname`] == null ? "Please select a server" : "";
    if (debug) console.log("Url: " + conf[`LA_${service.name_int}_url`]);
    if (debug) console.log("Path: " + conf[`LA_${service.name_int}_path`]);
  }

  let onChange = function () {
    console.log("on service change")
    verify();
    save();
  }

  $: {
    verify();
  }
</script>

<!--<div class="service-group">-->
<!-- <Card.Card > -->
{#if (service.depends != null && conf[`LA_use_${service.depends}`] === true) || service.depends == null }
	<div class="p-20 pb-5 pt-3 body-2">
		<Flex justify="between">
			{#if (service.optional) }
				<div on:click={onChange}>
					<Switch color="secondary" bind:value={conf["LA_use_" + service.name_int]}
									label="Use the {service.name} service ({service.desc})?"

					/>
					{#if service.recommended}
						<span class="tip">Tip: It's quite recommended.</span>
					{/if}
				</div>
			{:else}
				<span class="desc">{service.desc.charAt(0).toUpperCase() + service.desc.slice(1)}:</span>
			{/if}
		</Flex>

		{#if !service.optional || conf["LA_use_" + service.name_int]}
			<Flex justify="between">
				<Flex justify="start">
					{#if (typeof service.forceSubdomain === 'undefined' && !service.forceSubdomain) && !service.withoutUrl}
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

					{#if !service.withoutUrl}
						<UrlPrefix ssl={conf.LA_enable_ssl}/>
					{/if}

					{#if !service.withoutUrl}
						{#if conf[`LA_${service.name_int}_uses_subdomain`]}
							<TextField bind:value={conf[`LA_${service.name_int}_suburl`]}
												 error={urlError[service.name_int]} on:change={onChange}
												 hint={service.hint}/>
							<span class="nowrap">.{conf.LA_domain}/</span>
							<TextField bind:value={conf[`LA_${service.name_int}_iniPath`]} on:change={onChange}/>
						{/if}

						{#if !conf[`LA_${service.name_int}_uses_subdomain`]}
							<span class="nowrap">{conf.LA_domain}/</span>
							<TextField bind:value={conf[`LA_${service.name_int}_suburl`]}
												 error={urlError[service.name_int]} on:change={onChange}
												 hint={service.hint}/>
							<span> /</span>
						{/if}
					{/if}
				</Flex>
				<div class="deploy-in">
					<Select bind:value={conf[`LA_${service.name_int}_hostname`]}
									error={deployError[service.name_int]} class="deploy-in" outlined
									autocomplete on:change={onChange}
									label="deploy it in" items={hostnamesList}/>
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
{/if}

<!-- </Card.Card> -->
<!-- </div> -->

<style>
    .deploy-in {
        margin: 0 0 5px auto;
        padding-left: 10px;
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

    .tip {
        color: gray;
        position: relative;
        bottom: 3px;
    }

    .desc {

    }

</style>