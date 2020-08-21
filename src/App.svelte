<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto+Mono" rel="stylesheet">

<script>
  import Service from './Service.svelte';
  import { services, servicesStore } from './Services.svelte';
  import Textfield from '@smui/textfield';
  import {Label, Icon} from '@smui/common';
  import List, {Item, Text, Separator} from '@smui/list';
//  import Card, {Content, PrimaryAction, Media, MediaContent, Actions, ActionButtons, ActionIcons} from '@smui/card';

  export let mainDomain;
  const domain = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;
  let mainDomainInvalid = false;

  $: {
    mainDomainInvalid = !domain.test(mainDomain);
    console.log(`The main domain ${mainDomain} is invalid: ${mainDomainInvalid}`);
  }

  </script>

<main>
    <Textfield bind:value={mainDomain} invalid={mainDomainInvalid} label="The domain of your LA node">
<!--          <Icon class="material-icons">delete</Icon>-->
    </Textfield>
    <Text>Your services: </Text>
    <div>
        <List class="demo-list" nonInteractive>
            {#each services as service}
                <Item ripple={false}>
                    <Service ssl=true service={servicesStore[service]} isSubdomain={true} mainDomain={mainDomain}/>
                </Item>
                <!-- <Separator /> -->
            {/each}
        </List>
    </div>

</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
