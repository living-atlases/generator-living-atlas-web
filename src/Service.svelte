<script>
 import Flex from 'svelte-flex';
 import { Card, Switch, TextField, Tooltip } from "smelte";
 import UrlPrefix from './UrlPrefix.svelte';

  export let ssl;
  export let isSubdomain;
  export let service;
  export let name = '';
  export let path = '';
  export let conf;
  let pathTrimmed = '';
  export let mainDomain;
  $: {
   pathTrimmed = path.length > 0 ? path.split(/\/(.+)/)[1]: path;
   console.log(`pathTrimmed: ${pathTrimmed}`)
  }
</script>

<!--<div class="service-group">-->
 <Card.Card >
  <div slot="text" class="p-20 pb-5 pt-3 body-2">

 <Flex justify="start">
 {#if service.optional}
 <Switch bind:value={conf["LA_use_" + service.name_int]} label="Use the {service.name} service ({service.desc})?"></Switch>
 {/if}
 </Flex>

 {#if !service.optional || conf["LA_use_" + service.name_int]}
<Flex justify="start">
 <Tooltip>
  <div slot="activator">
   <Switch bind:value={isSubdomain}></Switch>

  </div>
  Use a subdomain for this service?
 </Tooltip>

 <UrlPrefix ssl={ssl} />

{#if isSubdomain}
 <TextField bind:value={name} label={service.name} hint={service.hint} />
 <span>.{mainDomain}/</span>
 <TextField bind:value={path} label={service.path} />
{/if}

{#if !isSubdomain}
 <span>{mainDomain}/</span>
 <TextField bind:value={name} label={service.name} hint={service.hint} />
 <span> /</span>
{/if}
</Flex>
 {/if}

  </div>
 </Card.Card>
<!-- </div> -->

<style>
   .service-group {
    padding: 10px;
    margin: 10px;
    border: 1px solid grey;
   }
</style>