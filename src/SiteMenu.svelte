<script>
  import Button from 'smelte/src/components/Button';
  import Menu from 'smelte/src/components/Menu';

  let open = false;
  let selected = "";
  export let conf;
  export let save;

  const items = [
    {value: 1, text: 'Living Atlases Community'},
    {value: 2, text: 'Report issues'},
    {value: 3, text: 'Reset this assistant'},
    {value: 4, text: 'This software on github'},
  ];

  let doReset = function () {
    save(true);
  }

  $: {
    switch (selected) {
      case 1:
        window.open("https://living-atlases.gbif.org/", "_blank");
        break;
      case 2:
        window.open("https://github.com/living-atlases/generator-living-atlas-web/issues", "_blank");
        break;
      case 3:
        doReset();
        break;
      case 4:
        window.open("https://github.com/living-atlases/generator-living-atlas-web", "_blank");
    }
  }

</script>

<Menu bind:open {items} bind:value={selected}>
	<div slot="activator">
		<Button icon="menu" text light flat on:click={() => open = !open}/>
	</div>
</Menu>