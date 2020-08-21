<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto+Mono" rel="stylesheet">

<script>
  import Service from './Service.svelte';
  import "smelte/src/tailwind.css";
  // import Textfield from '@smui/textfield';
  import Flex from 'svelte-flex';
  import UrlPrefix from './UrlPrefix.svelte';
  import { Button, List, Switch, TextField, Tooltip } from "smelte";
  import { services, servicesStore } from './Services.svelte';

  export let conf;

  const domain = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;
  let mainDomainInvalid = false;
  let error = "";
  let append = "";
  let page = 3;
  let firstBtnDisabled = true;
  let firstBtnText = "« Back";
  let sndBtnText = "Start";
  let lastPage = false;
  let hostnames = '';
  let hostnamesList = [];

  $: {
    mainDomainInvalid = !domain.test(conf.LA_domain);
    error = mainDomainInvalid ? "You need to provide some-atlas-domain.org" : "";
    append = mainDomainInvalid ? "error" : "";
    // console.log(`The main domain ${conf.LA_domain} is invalid: ${mainDomainInvalid}`);
    firstBtnDisabled = page === 1;
    lastPage = page === 4;
    sndBtnText = page === 1 ? "Start" : lastPage ? "Generate & Download": "Continue »";
    if (hostnames.length > 0) {
      hostnamesList = hostnames.split(/[,\s]/).filter(Boolean);
      console.log(`hostnames: ${hostnamesList.toString()}`);
    }
  }

  let onFirstBtnClick = function () {
    page-=1;
  }

  let onSndBtnClick = function () {
    page+=1;
  }

</script>


<main>
    <Flex direction="column" align="stretch" justify="start">

        <h2>Living Atlas Generator</h2>

        {#if (page === 1)}
        <div class="to-left">
            <blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg right">
                <p>
                    This is a tool that allows you to generate your Living Atlas (LA) ansible inventories for you.
                </p>
                <p>
                    That allows you to bootstrap the deployment of your LA Platform, customizing and generating your LA
                    ansible inventories.
                </p>
            </blockquote>
            <h5>How this works?</h5>
            <p>A <a href="https://living-atlases.gbif.org" target="_blank">Living Atlas</a> can be typically deployed
                using:</p>
            <ul class="list-decimal">
                <li><a href="https://ala.org.au/" target="_blank">Atlas of Living Australia (ALA)</a> Open Source
                    Software, plus
                </li>
                <li><a href="https://github.com/AtlasOfLivingAustralia/ala-install/" target="_blank">ala-install</a> ALA
                    ansible playbooks, plus
                </li>
                <li>some custom ansible inventories with information for your LA site (like domain,
                    organization name, name of servers to use, contact email, and a big etcetera)
                </li>
            </ul>
            <p>This generator helps you with this last step, allowing to generate and download your initial LA
                inventories filling this form.
            </p>
            <h5>Do you prefer the command line?</h5>
            No problem, this is only a web helper for our <a href="https://www.npmjs.com/package/generator-living-atlas"
                                                             target="_blank">yeoman living-atlas generator</a>.
        </div>
        {/if}
        {#if (page === 2)}
            <TextField bind:value={conf.LA_project_name} label="Your LA Project Long Name" />
            <TextField bind:value={conf.LA_project_shortname} label="Your LA Project Short Name"/>
            <Switch bind:value={conf.LA_enable_ssl} label="Use SSL?"></Switch>
            <Flex align="center" justify="start">
                <UrlPrefix ssl={conf.LA_enable_ssl}/>
                <TextField bind:value={conf.LA_domain} error={error} append={append} label="The domain of your LA node"/>
            </Flex>
        {/if}

        {#if (page === 3)}
            <TextField textarea rows=2 bind:value={hostnames} label="List of the hostnames of the servers you will use (comma separated)"
                       hint="Something tipically like 'vm1, vm2, vm3' or 'aws-ip-12-34-56-78, aws-ip-12-34-56-79, aws-ip-12-34-56-80'" />
        {/if}

        {#if (page === 4)}
            <div class="to-left">
                <h5>Define how your services URLs will look like:</h5>
                <List class="" items={services}>
                    <li slot="item" let:item={item}>
                        <Service conf={conf} service={servicesStore[item]} ssl={conf.LA_enable_ssl} isSubdomain={true}
                                 mainDomain={conf.LA_domain}/>
                    </li>
                </List>
            </div>
        {/if}
        <Flex direction="row" align="end" justify="center">
            {#if !firstBtnDisabled}
                <div class="py-2 mr-2">
                    <Button on:click={onFirstBtnClick} block>« Back</Button>
                </div>
            {/if}
            <div class="py-2">
                <Button dark block on:click="{onSndBtnClick}">{sndBtnText}</Button>
            </div>
        </Flex>

    </Flex>
</main>

<style>
    main {
        text-align: center;
        padding: 40px;
        max-width: 240px;
        margin: 0 auto;
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

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
