<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto+Mono" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<script>
  import Service from './Service.svelte';
  import SiteMenu from './SiteMenu.svelte';
  import "smelte/src/tailwind.css";
  import Flex from 'svelte-flex';
  import UrlPrefix from './UrlPrefix.svelte';
  import {Button, List, Snackbar, Switch, TextField, Tooltip} from "smelte";
  import {services, servicesStore} from './Services.svelte';

  import storez from "storez";

  export let defConf;

  const actualStore = localStorage.getItem("store");
  console.log(actualStore);
  const myStore = storez(actualStore !== "null" ? actualStore : {
    conf: defConf,
    page: 1
  }, {localstorage: {key: "store"}}, {debounce: 500});

  let conf;
  let page;

  const persist = myStore.subscribe(newVal => {
    console.log("Trying to persist");
    if (newVal != null) {
      conf = newVal.conf;
      page = newVal.page ? newVal.page : 1;
      // console.log("Subscribe");
      console.log(newVal);
      console.log("Saved");
    }
  });

  let save = function (resetConf) {
    if (resetConf) {
      myStore.set(null);
    } else {
      myStore.set({conf: conf, "page": page});
    }
    persist();
  }

  const domainRegexp = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;
  const hostnameRegexp = /^[._\-a-z0-9A-Z, ]+$/;
  const shortNameRegexp = /^[._\-a-z0-9A-Z ]+$/;
  let longNameInvalid = false;
  let longNameError = "";
  let longNameAppend = "";
  let shortNameInvalid = false;
  let shortNameError = "";
  let shortNameAppend = "";
  let hostnameInvalid = false;
  let hostnameError = "";
  let hostnameAppend = "";
  let mainDomainInvalid = false;
  let mainDomainError = "";
  let mainDomainAppend = "";
  let firstBtnDisabled = true;
  let sndBtnDisabled = false;
  let firstBtnText = "« Back";
  let sndBtnText = "Start";
  let lastPage = false;
  // || shortNameInvalid || mainDomainInvalid),;
  let pageValid = [() => true, () => !longNameInvalid && !shortNameInvalid && !mainDomainInvalid,
    () => !hostnameInvalid,
    () => true
  ]
  let hostnamesHint = "Something typically like 'vm1, vm2, vm3' or 'aws-ip-12-34-56-78, aws-ip-12-34-56-79, aws-ip-12-34-56-80'";
  let showSnackbarTop = false;

  $: {
    longNameInvalid = !conf.LA_project_name.length > 0;
    longNameError = longNameInvalid ? "Project name invalid" : "";
    longNameAppend = longNameInvalid ? "error" : "";

    shortNameInvalid = !shortNameRegexp.test(conf.LA_project_shortname);
    shortNameError = shortNameInvalid ? "Project short name invalid" : "";
    shortNameAppend = shortNameInvalid ? "error" : "";

    mainDomainInvalid = !domainRegexp.test(conf.LA_domain);
    mainDomainError = mainDomainInvalid ? "You need to provide some-atlas-domain.org" : "";
    mainDomainAppend = mainDomainInvalid ? "error" : "";

    hostnameInvalid = !hostnameRegexp.test(conf.hostnames);
    hostnameError = hostnameInvalid ? hostnamesHint : "";
    hostnameAppend = hostnameInvalid

    firstBtnDisabled = page === 1
    console.log(`Current page ${page} valid ${pageValid[page - 1]()}`)
    sndBtnDisabled = !pageValid[page - 1]();

    lastPage = page === 4;
    sndBtnText = page === 1 ? "Start" : lastPage ? "Generate & Download" : "Continue »";
    if (conf.hostnames && conf.hostnames.length > 0) {
      conf.hostnamesList = conf.hostnames.split(/[,\s]/).filter(Boolean);
      console.log(`hostnames: ${conf.hostnamesList.toString()}`);
    }
  }

  let onFirstBtnClick = function () {
    page -= 1;
    save();
  }

  let onSndBtnClick = function () {
    if (page === 4) {
      // server call
      showSnackbarTop = true;
    } else {
      page += 1;
    }
    save();
  }

</script>

<main>
	<SiteMenu conf={conf} save="{save}"/>
	<Flex direction="column" align="stretch" justify="start">
		<div class="main-flex">
			<h2>Living Atlas Generator</h2>

			{#if (page === 1)}
				<div class="to-left">
					<blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg right">
						<p>
							This is a tool that allows you to generate your Living Atlas (LA) configurations for you.
						</p>
						<p>
							This allows you to bootstrap the initial deployment of your LA Platform.
						</p>
					</blockquote>
					<h5>How this works?</h5>
					<p>A <a href="https://living-atlases.gbif.org" target="_blank">Living Atlas</a> can be typically
						deployed using:</p>
					<ul class="list-decimal">
						<li>the <a href="https://ala.org.au/" target="_blank">Atlas of Living Australia (ALA)</a> Free and Open
							Source Software, with
						</li>
						<li>the <a href="https://github.com/AtlasOfLivingAustralia/ala-install/" target="_blank">ala-install</a>
							ALA <a href="https://www.ansible.com/" target="_blank">ansible</a> playbooks
							<Tooltip>
								<div slot="activator">
									<a role='button'><sup>(1)</sup></a>
								</div>
								That is, a big collection of IT 'recipes' that defines how to auto-deploy the LA services given some
								variables (the ansible inventories)
							</Tooltip>
							, with
						</li>
						<li>some custom ansible inventories with information about your LA site (like your domain,
							organization name, name of the servers to use, contact email, and a big etcetera)
						</li>
					</ul>
					<p>This generator helps you with this last step, allowing to generate and download your initial LA
						inventories following this wizard, and asking some basic questions.
					</p>
					<h5>Do you prefer to use the command line?</h5>
					No problem, this is only a web helper for our <a
						href="https://www.npmjs.com/package/generator-living-atlas"
						target="_blank">yeoman living-atlas generator</a>.
				</div>
			{/if}
			{#if (page === 2)}
				<TextField bind:value={conf.LA_project_name} label="Your LA Project Long Name" error={longNameError}
									 append={longNameAppend}/>
				<TextField bind:value={conf.LA_project_shortname} label="Your LA Project Short Name" error={shortNameError}
									 append={shortNameAppend}/>
				<Switch bind:value={conf.LA_enable_ssl} label="Use SSL?"></Switch>
				<Flex align="center" justify="start">
					<UrlPrefix ssl={conf.LA_enable_ssl}/>
					<TextField bind:value={conf.LA_domain} error={mainDomainError} append={mainDomainAppend}
										 label="The domain of your LA node"/>
				</Flex>
			{/if}

			{#if (page === 3)}
				<TextField textarea rows=2 bind:value={conf.hostnames} append={hostnameAppend} error={hostnameError}
									 label="List of the hostnames of the servers you will use (comma or space separated)"
				/>
			{/if}

			{#if (page === 4)}
				<div class="to-left">
					<h5 class="t-center">Define how your services URLs will look like:</h5>
					<List class="" items={services}>
						<li slot="item" let:item={item}>
							<Service conf={conf} service={servicesStore[item]} save="{save}"
											 hostnamesList={conf.hostnamesList}/>
						</li>
					</List>
				</div>
			{/if}
			<div class="btn-area">
				<Flex direction="row" align="end" justify="center">
					{#if !firstBtnDisabled}
						<div class="py-2 mr-2">
							<Button on:click={onFirstBtnClick} block>« Back</Button>
						</div>
					{/if}
					<div class="py-2">
						<Button dark block disabled={sndBtnDisabled} on:click="{onSndBtnClick}">{sndBtnText}</Button>
					</div>
				</Flex>
			</div>
		</div>
	</Flex>
	<Snackbar top bind:value={showSnackbarTop}>
		<div>This is still in development. Come back soon!</div>
	</Snackbar>
</main>

<style>
    main {
        /* text-align: center; */
        padding: 30px;

        max-width: none;
        margin: 0 auto;
    }

    .btn-area {
        margin-top: 20px;
    }

    h2, .t-center {
        text-align: center;
    }

    .to-left, blockquote {
        text-align: left;
    }

    p {
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
    }

    ul {
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        padding-inline-start: 40px;
    }


    .footnote-link {
        color: gray;
    }

    .footnote {
        position: absolute;
        left: 20px;
        bottom: 20px;
        width: 100%;
        color: gray;
        font-size: 14px;
        background-color: red;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }

    @media (min-width: 1024px) {
        .main-flex {
            margin: 0 150px;
        }
    }

    @media (max-width: 640px) {
        h2 {
            font-size: 32px;
        }
    }

</style>
