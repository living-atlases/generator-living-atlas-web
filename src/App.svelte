<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto+Mono" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<GdprBanner
		cookieName="la-generator"
		acceptLabel="Accept"
		closeLabel="Close"
		settingsLabel="Preferences"
		heading="Use of Cookies"
		choices="{{tracking: false, marketing: false, analytics: false}}"
		categories={gdprCategories}
		description="We use cookies to ensure a better use of our website. If you continue browsing, we consider that you accept their use."
		showEditIcon=false
		on:analytics={initAnalytics}/>

<script>
  import {projectNameRegexp, domainRegexp, hostnameRegexp, shortNameRegexp} from './regexp.js';
  import IntroPage from './IntroPage.svelte';
  import BtnArea from './BtnArea.svelte';
  import Service from './Service.svelte';
  import SiteMenu from './SiteMenu.svelte';
  import "smelte/src/tailwind.css";
  import Flex from 'svelte-flex';
  import UrlPrefix from './UrlPrefix.svelte';
  import {Card, Button, List, Snackbar, Switch, TextField, Tooltip} from "smelte";
  import {services, servicesStore} from './Services.svelte';
  import {onMount, onDestroy} from "svelte";
  import storez from "storez";
  import '@beyonk/gdpr-cookie-consent-banner/dist/style.css' // optional, you can also define your own styles
  import GdprBanner from '@beyonk/gdpr-cookie-consent-banner';

  function initAnalytics() {
    // do something with segment.io or google analytics etc
  }

  let gdprCategories = {
    analytics: function () {
      console.log('No analytics cookies specified')
    },
    tracking: function () {
      console.log('No tracking cookies specified')
    },
    marketing: function () {
      console.log('No marketing cookies specified')
    },
    necessary: function () {
      console.log('No necessary cookies specified')
    }
  };

  let footerHeight = "70px";
  let debug = true;
  export let defConf;

  const myStore = storez({
    conf: defConf,
    page: 1
  }, {localstorage: {key: "store"}});

  let conf;
  let page;

  let subs = () => myStore.subscribe(newVal => {
    if (debug) console.log("On set conf");
    if (newVal != null) {
      conf = newVal.conf;
      page = newVal.page ? newVal.page : 1;
      if (debug) console.log(newVal);
      console.log(conf);
    }
  });

  let persist = subs();

  let save = function (resetConf) {
    if (resetConf) {
      if (debug) console.log("Resetting the assistant")
      myStore.set(null);
      persist();
      location.reload();
    } else {
      myStore.set({conf: conf, "page": page});
    }
    persist(); // persist remove the subscription, so we subs again
    persist = subs()
  }

  let onChange = function () {
    console.log("onchange")
    save();
  }

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
  let pageValid = [() => true, () => !longNameInvalid && !shortNameInvalid && !mainDomainInvalid,
    () => conf.hostnames != null && !hostnameInvalid,
    () => true
  ]
  let hostnamesHint = "Something typically like 'vm1, vm2, vm3' or 'aws-ip-12-34-56-78, aws-ip-12-34-56-79, aws-ip-12-34-56-80'";
  let showSnackbarTop = false;

  $: {
    longNameInvalid = !(conf.LA_project_name.length > 0 && projectNameRegexp.test(conf.LA_project_name));
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
    if (debug) console.log(`Current page ${page} valid ${pageValid[page - 1]()}`)
    sndBtnDisabled = !pageValid[page - 1]();

    lastPage = page === 4;
    sndBtnText = page === 1 ? "Start" : lastPage ? "Generate & Download" : "Continue »";
    if (conf.hostnames && conf.hostnames.length > 0) {
      conf.hostnamesList = conf.hostnames.split(/[,\s]/).filter(Boolean);
      if (debug) console.log(`hostnames: ${conf.hostnamesList.toString()}`);
    }
  }

  let onFirstBtnClick = function () {
    page -= 1;
    save();
  }

  let doPost = function () {
    const btn = document.getElementById('submit-btn');
    btn.click();
  }

  let onSndBtnClick = function () {
    if (page === 4) {
      save();
      doPost();
      // showSnackbarTop = true;
    } else {
      page += 1;
      save();
    }
  }

</script>

<main class="hero" style="--footer-height: {footerHeight};">
	<SiteMenu conf={conf} save="{save}"/>
	<Flex direction="column" align="stretch" justify="start">
		<div class="main-flex">
			<h2>Living Atlas Generator</h2>
			{#if (page === 1)}
				<IntroPage/>
			{/if}
			{#if (page === 2)}
				<TextField bind:value={conf.LA_project_name} label="Your LA Project Long Name" error={longNameError}
									 on:change={onChange} append={longNameAppend}/>
				<TextField bind:value={conf.LA_project_shortname} label="Your LA Project Short Name" error={shortNameError}
									 on:change={onChange} append={shortNameAppend}/>
				<Tooltip>
					<div slot="activator">
						<Switch bind:value={conf.LA_enable_ssl} label="Use SSL?"></Switch>
					</div>
					Quite recommended
				</Tooltip>
				<Flex align="center" justify="start">
					<UrlPrefix ssl={conf.LA_enable_ssl}/>
					<TextField on:change={onChange} bind:value={conf.LA_domain} error={mainDomainError} append={mainDomainAppend}
										 label="The domain of your LA node"/>
				</Flex>
			{/if}

			{#if (page === 3)}
				<TextField textarea rows=2 bind:value={conf.hostnames} append={hostnameAppend} error={hostnameError}
									 on:change={onChange} outlined
									 label="Names of the servers you will use (comma or space separated)"
				/>
				<p>
					<Card.Card>
						<div slot="title">
							<Card.Title title="Tips" d/>
						</div>
						<div slot="text" class="p-5 pb-5 pt-0 text-gray-700 body-2">
							See the <a href="https://github.com/AtlasOfLivingAustralia/documentation/wiki/Infrastructure-Requirements"
												 target="_blank"> infrastructure requirements page</a> and other portals infrastructure in
							<a href="https://github.com/AtlasOfLivingAustralia/documentation/wiki/"
								 target="_blank">our documentation wiki</a> to dimension your LA portal.
							For a test portal a big server can host the main basic LA services.<br>
							If you are unsure type something like "server1, server2, server3". You can modify this and the rest of
							values later.
						</div>
					</Card.Card>
				</p>
			{/if}

			{#if (page === 4)}
				<div class="to-left">
					<h5 class="t-center">Define how your services URLs will look like:</h5>
					<List class="" items={services}>
						<li slot="item" let:item={item}>
							<Service conf={conf} service={servicesStore[item]} save="{save}" debug
											 hostnamesList={conf.hostnamesList}/>
						</li>
					</List>
				</div>
				<form target="_blank" method="post" action="/v1/gen" class="form-link">
					<button id="submit-btn" type="submit" name="conf" value={JSON.stringify(conf)} class="link-button">
					</button>
				</form>
			{/if}
			<BtnArea {firstBtnDisabled} {onFirstBtnClick} {sndBtnDisabled} {onSndBtnClick} {sndBtnText} {footerHeight}/>
		</div>
	</Flex>
	<Snackbar top bind:value={showSnackbarTop}>
		<div>This is still in development. Come back soon!</div>
	</Snackbar>
</main>

<style>
    main {
        /* text-align: center; */
        /* padding: 30px; */
        max-width: none;
        margin: 0 auto;
    }

    h2, .t-center {
        text-align: center;
        padding-bottom: 20px;
    }

    .to-left, blockquote {
        text-align: left;
    }

    @media (min-width: 640px) {
        .main-flex {
            padding: 30px;
        }
    }

    @media (max-width: 640px) {
        main {
            max-width: none;
        }

        .main-flex {
            padding: 10px;
        }

        h2 {
            font-size: 32px;
        }
    }

    @media (min-width: 640px) and (max-width: 1024px) {
        main {
            max-width: none;
        }
    }

    @media (min-width: 1024px) and (max-width: 1920px) {
        .main-flex {
            margin: 0 100px;
        }
    }

    @media (min-width: 1920px) {
        .main-flex {
            margin: 0 150px;
        }
    }

    .main-flex {
        padding-bottom: var(--footer-height);
    }

    .form-link {
        display: none;
    }

    .hero::before {
        background-size: cover;
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -2;
        opacity: 0.1;
        background-attachment: fixed;
    }

    @media (min-width: 320px) {
        .hero::before {
            background-image: url(/images/back-460.jpg);
        }
    }

    @media (min-width: 460px) {
        .hero::before {
            background-image: url(/images/back-720.jpg);
        }
    }

    @media (min-width: 720px) {
        .hero::before {
            background-image: url(/images/back-980.jpg);
        }
    }

    @media (min-width: 980px) {
        .hero::before {
            background-image: url(/images/back-1240.jpg);
        }
    }

    @media (min-width: 1240px) {
        .hero::before {
            background-image: url(/images/back-1500.jpg);
        }
    }

    @media (min-width: 1500px) {
        .hero::before {
            background-image: url(/images/back-1760.jpg);
        }
    }

    @media (min-width: 1760px) {
        .hero::before {
            background-image: url(/images/back-1920.jpg);
        }
    }

</style>
