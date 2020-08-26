<script>
  import {Tooltip} from "smelte";
</script>

<div class="to-left">
	<blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg right">
		<p>
			This tool facilitates the generation of your Living Atlas (LA) initial configuration.
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
	<p>This generator helps you with this last step. Following this assistant, and asking some basic questions
		you can generate and download your initial LA inventories. It generates also a compatible LA
		basic theme for your site.
	</p>
	<h5>Do you prefer to use the command line?</h5>
	No problem, this is only a web helper for our <a
		href="https://www.npmjs.com/package/generator-living-atlas"
		target="_blank">yeoman living-atlas generator</a>.
</div>

<style>
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
</style>