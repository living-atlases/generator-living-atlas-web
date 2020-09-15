<script>
  import {Button, Menu, Snackbar} from "smelte";

  export let save;
  let open = false;
  let selected = "";
  let showSnackbarTop = false;

  const items = [
    {value: 1, text: 'Share this configuration'},
    {value: 2, text: 'This software on github'},
    {value: 3, text: 'Report issues'},
    {value: 4, text: 'Reset this assistant'},
    {value: 5, text: 'Living Atlases Community'},
  ];

  let doReset = () => {
    save(true);
  }

  let share = () => {
    const text = window.location.href;
    const copyDiv = document.getElementById("inputContainingTextToBeCopied");
    copyDiv.style.display = 'block';
    copyDiv.value = text;
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    copyDiv.style.display = 'none';
    showSnackbarTop = true;
  }

  $: {
    switch (selected) {
      case 1:
        share();
        break;
      case 2:
        window.open("https://github.com/living-atlases/generator-living-atlas-web", "_blank");
        break;
      case 3:
        window.open("https://github.com/living-atlases/generator-living-atlas-web/issues", "_blank");
        break;
      case 4:
        doReset();
        break;
      case 5:
        window.open("https://living-atlases.gbif.org/", "_blank");
        break;
    }
  }

</script>
<input type="text" name="InputToCopy" id="inputContainingTextToBeCopied" value="foo"
			 style="display:none; position: relative; left: -10000px;"/>

<Snackbar top bind:value={showSnackbarTop}>
	<div>URL copied to your clipboard. Others can edit this configuration. You can also bookmark it</div>
</Snackbar>
<Menu bind:open {items} bind:value={selected}>
	<div slot="activator">
		<Button icon="menu" text light flat on:click={() => open = !open}/>
	</div>
</Menu>