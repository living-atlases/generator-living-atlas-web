<script>
  import Switch from '@smui/switch';
  import Textfield from '@smui/textfield'

  export let ssl;
  export let isSubdomain;
  export let service;
  export let name = '';
  export let path = '';
  let pathTrimmed = '';
  export let mainDomain;
  $: {
   pathTrimmed = path.length > 0 ? path.split(/\/(.+)/)[1]: path;
   console.log(`pathTrimmed: ${pathTrimmed}`)
  }
</script>

<!--<Switch bind:checked={isSubdomain} title="Use a subdomain?"></Switch>-->

<span>http{#if ssl}s{/if}://</span>

{#if isSubdomain}
 <Textfield bind:value={name} label={service.name} />
 <span>.{mainDomain}/</span>
 <Textfield bind:value={path} label={service.path} />
{/if}

{#if !isSubdomain}
 <span>{mainDomain}/</span>
 <Textfield bind:value={name} label={service.name} />
 <span> /</span>
{/if}