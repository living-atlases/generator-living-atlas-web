<script>
  import Flex from 'svelte-flex';
  import {Button} from "smelte";

  export let firstBtnDisabled;
  export let onFirstBtnClick;
  export let sndBtnDisabled;
  export let onSndBtnClick;
  export let sndBtnText;
  export let footerHeight;

</script>

<div class="btn-area" style="--height: {footerHeight};">
  <Flex direction="row" align="end" justify="center">
    {#if !firstBtnDisabled}
      <div class="py-2 mr-2">
        <Button on:click={onFirstBtnClick} block>« Back</Button>
      </div>
    {/if}
    <div class="py-2">
      <Button block disabled={sndBtnDisabled} on:click="{onSndBtnClick}">{sndBtnText}</Button>
    </div>
  </Flex>
</div>

<style>
  .btn-area {
    background: #e2e7ea;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding-top: 10px;
    height: var(--height);
  }
</style>
