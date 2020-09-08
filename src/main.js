import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    defConf: {
      "LA_project_name": "Living Atlas Of Wakanda",
      "LA_project_shortname": "LA Wakanda",
      "LA_domain": "your.l-a.site",
      "LA_enable_ssl": true,
      "LA_use_spatial": true,
      "LA_use_regions": true,
      "LA_use_ala_bie": true,
      "LA_use_images": true,
      "LA_use_species_lists": true,
      "LA_use_cas": true,
      "LA_use_webapi": false,
      "LA_use_alerts": false,
      "LA_use_doi": false,
      "LA_use_dashboard": false,
      "LA_collectory_uses_subdomain": true,
      "LA_ala_hub_uses_subdomain": true,
      "LA_biocache_service_uses_subdomain": true,
      "LA_ala_bie_uses_subdomain": true,
      "LA_bie_index_uses_subdomain": true,
      "LA_images_uses_subdomain": true,
      "LA_species_lists_uses_subdomain": true,
      "LA_regions_uses_subdomain": true,
      "LA_logger_uses_subdomain": true,
      "LA_solr_uses_subdomain": true,
      "LA_webapi_uses_subdomain": true,
      "LA_spatial_uses_subdomain": true,
      "LA_alerts_uses_subdomain": true,
      "LA_doi_uses_subdomain": true,
      "LA_dashboard_uses_subdomain": true,
      "LA_cas_uses_subdomain": true,
    }
  },
});

export default app;
