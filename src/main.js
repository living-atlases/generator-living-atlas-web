import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    defConf: {
      "LA_project_name": "Living Atlas Of Wäkänðä",
      "LA_project_shortname": "LA Wakanda",
      "LA_pkg_name": "la-wakanda",
      "LA_domain": "your.l-a.site",
      "LA_enable_ssl": true,
      "LA_use_spatial": true,
      "LA_use_regions": true,
      "LA_use_species_lists": true,
      "LA_use_CAS": true,
      "LA_use_webapi": false,
      "LA_use_alerts": false,
      "LA_use_doi": false,
      "LA_use_dashboard": false,
    }
  },
});

export default app;
