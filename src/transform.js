// https://github.com/wankdanker/node-object-mapper
var objectMapper = require("object-mapper");

module.exports = function (inputs) {
  var map = {
    LA_project_name: "LA_project_name",
    LA_project_shortname: "LA_project_shortname",
    LA_pkg_name: {
      key: "LA_pkg_name",
      transform: (value, obj) => {
        let shortName = obj.LA_project_shortname.toLowerCase().replace(/[^\d.-\w]/g, "").replace(/\./g, "-");
        return shortName.length === 0 ? "la" : shortName;
      },
    },
    LA_domain: "LA_domain",
    LA_use_spatial: "LA_use_spatial",
    LA_use_regions: "LA_use_regions",
    LA_use_species_lists: "LA_use_species_lists",
    LA_use_cas: "LA_use_CAS",
    LA_use_ala_bie: "LA_use_species",
    LA_use_images: "LA_use_images",
    LA_enable_ssl: "LA_enable_ssl",
    LA_use_git: {key: "LA_use_git", default: true},
    LA_generate_branding: {key: "LA_generate_branding", default: true}, // Set this to true
    // "check-ssl": "",
    LA_cas_hostname: "LA_cas_hostname",
    LA_spatial_hostname: "LA_spatial_hostname",
    LA_collectory_uses_subdomain: "LA_collectory_uses_subdomain",
    LA_collectory_hostname: "LA_collectory_hostname",
    LA_collectory_url: "LA_collectory_url",
    LA_collectory_path: "LA_collectory_path",
    LA_ala_hub_uses_subdomain: "LA_ala_hub_uses_subdomain",
    LA_ala_hub_hostname: "LA_ala_hub_hostname",
    LA_ala_hub_url: "LA_ala_hub_url",
    LA_ala_hub_path: "LA_ala_hub_path",
    LA_biocache_service_uses_subdomain: "LA_biocache_service_uses_subdomain",
    LA_biocache_service_hostname: "LA_biocache_service_hostname",
    LA_biocache_service_url: "LA_biocache_service_url",
    LA_biocache_service_path: "LA_biocache_service_path",
    LA_ala_bie_uses_subdomain: "LA_ala_bie_uses_subdomain",
    LA_ala_bie_hostname: "LA_ala_bie_hostname",
    LA_ala_bie_url: "LA_ala_bie_url",
    LA_ala_bie_path: "LA_ala_bie_path",
    LA_bie_index_uses_subdomain: "LA_bie_index_uses_subdomain",
    LA_bie_index_hostname: "LA_bie_index_hostname",
    LA_bie_index_url: "LA_bie_index_url",
    LA_bie_index_path: "LA_bie_index_path",
    LA_images_uses_subdomain: "LA_images_uses_subdomain",
    LA_images_hostname: "LA_images_hostname",
    LA_images_url: "LA_images_url",
    LA_images_path: "LA_images_path",
    LA_species_lists_uses_subdomain: "LA_lists_uses_subdomain",
    LA_species_lists_hostname: "LA_lists_hostname",
    LA_species_lists_url: "LA_lists_url",
    LA_species_lists_path: "LA_lists_path",
    LA_regions_uses_subdomain: "LA_regions_uses_subdomain",
    LA_regions_hostname: "LA_regions_hostname",
    LA_regions_url: "LA_regions_url",
    LA_regions_path: "LA_regions_path",
    LA_logger_uses_subdomain: "LA_logger_uses_subdomain",
    LA_logger_hostname: "LA_logger_hostname",
    LA_logger_url: "LA_logger_url",
    LA_logger_path: "LA_logger_path",
    LA_solr_uses_subdomain: "LA_solr_uses_subdomain",
    LA_solr_hostname: "LA_solr_hostname",
    LA_solr_url: "LA_solr_url",
    LA_solr_path: "LA_solr_path",
    LA_biocache_backend_hostname: "LA_biocache_backend_hostname",
    LA_branding_hostname: "LA_main_hostname",
    LA_use_webapi: "LA_use_webapi",
    LA_webapi_uses_subdomain: "LA_webapi_uses_subdomain",
    LA_webapi_hostname: "LA_webapi_hostname",
    LA_webapi_url: "LA_webapi_url",
    LA_webapi_path: "LA_webapi_path",
    LA_use_dashboard: "LA_use_dashboard",
    LA_dashboard_uses_subdomain: "LA_dashboard_uses_subdomain",
    LA_dashboard_hostname: "LA_dashboard_hostname",
    LA_dashboard_path: "LA_dashboard_path",
    LA_use_alerts: "LA_use_alerts",
    LA_use_doi: "LA_use_doi",
    LA_alerts_uses_subdomain: "LA_alerts_uses_subdomain",
    LA_alerts_hostname: "LA_alerts_hostname",
    LA_alerts_path: "LA_alerts_path",
    LA_doi_uses_subdomain: "LA_doi_uses_subdomain",
    LA_doi_hostname: "LA_doi_hostname",
    LA_doi_path: "LA_doi_path",
  };

  const dest = {
    "generator-living-atlas": {
      promptValues: objectMapper(inputs.conf, map),
      firstRun: false,
    },
  };
  // console.log(dest);

  return dest;
};
