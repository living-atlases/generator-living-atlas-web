/**
 * Conf.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    "uuid": { type: "string", unique: true },
    "LA_project_name": { type: "string", defaultsTo: "Living Atlas Of Wakanda", required: false },
    "LA_project_shortname":{ type: "string", defaultsTo: "LA Wakanda", required: false },
    "LA_domain":{ type: "string", defaultsTo: "your.l-a.site", required: false },
    "LA_enable_ssl":{ type: "boolean", defaultsTo: true },
    "LA_use_spatial":{ type: "boolean", defaultsTo: true },
    "LA_use_regions":{ type: "boolean", defaultsTo: true },
    "LA_use_ala_bie":{ type: "boolean", defaultsTo: true },
    "LA_use_images":{ type: "boolean", defaultsTo: true },
    "LA_use_species_lists":{ type: "boolean", defaultsTo: true },
    "LA_use_cas":{ type: "boolean", defaultsTo: true },
    "LA_use_webapi":{ type: "boolean", defaultsTo: false },
    "LA_use_alerts":{ type: "boolean", defaultsTo: false },
    "LA_use_doi":{ type: "boolean", defaultsTo: false },
    "LA_use_dashboard":{ type: "boolean", defaultsTo: false },

    "LA_collectory_uses_subdomain":{ type: "boolean", defaultsTo: true },
    "LA_ala_hub_uses_subdomain":{ type: "boolean", defaultsTo: true },
    "LA_biocache_service_uses_subdomain":{ type: "boolean", defaultsTo: true },
    "LA_ala_bie_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_bie_index_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_images_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_species_lists_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_regions_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_logger_uses_subdomain":{ type: "boolean", defaultsTo: true },
    "LA_solr_uses_subdomain":{ type: "boolean", defaultsTo: true },
    "LA_webapi_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_spatial_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_alerts_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_doi_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_dashboard_uses_subdomain":{ type: "boolean", defaultsTo: true, required: false },
    "LA_cas_uses_subdomain":{ type: "boolean", defaultsTo: true },

    "LA_collectory_url":{ type: "string", required: false },
    "LA_ala_hub_url":{ type: "string", required: false },
    "LA_biocache_service_url":{ type: "string", required: false },
    "LA_ala_bie_url":{ type: "string", required: false },
    "LA_bie_index_url":{ type: "string", required: false },
    "LA_images_url":{ type: "string", required: false },
    "LA_species_lists_url":{ type: "string", required: false },
    "LA_regions_url":{ type: "string", required: false },
    "LA_logger_url":{ type: "string", required: false },
    "LA_solr_url":{ type: "string", required: false },
    "LA_webapi_url":{ type: "string", required: false },
    "LA_spatial_url":{ type: "string", required: false },
    "LA_alerts_url":{ type: "string", required: false },
    "LA_doi_url":{ type: "string", required: false },
    "LA_dashboard_url":{ type: "string", required: false },
    "LA_cas_url":{ type: "string", required: false },

    "LA_collectory_path":{ type: "string", required: false },
    "LA_ala_hub_path":{ type: "string", required: false },
    "LA_biocache_service_path":{ type: "string", required: false },
    "LA_ala_bie_path":{ type: "string", required: false },
    "LA_bie_index_path":{ type: "string", required: false },
    "LA_images_path":{ type: "string", required: false },
    "LA_species_lists_path":{ type: "string", required: false },
    "LA_regions_path":{ type: "string", required: false },
    "LA_logger_path":{ type: "string", required: false },
    "LA_solr_path":{ type: "string", required: false },
    "LA_webapi_path":{ type: "string", required: false },
    "LA_spatial_path":{ type: "string", required: false },
    "LA_alerts_path":{ type: "string", required: false },
    "LA_doi_path":{ type: "string", required: false },
    "LA_dashboard_path":{ type: "string", required: false },
    "LA_cas_path":{ type: "string", required: false },

    "LA_collectory_hostname":{ type: "string", required: false },
    "LA_ala_hub_hostname":{ type: "string", required: false },
    "LA_biocache_service_hostname":{ type: "string", required: false },
    "LA_ala_bie_hostname":{ type: "string", required: false },
    "LA_bie_index_hostname":{ type: "string", required: false },
    "LA_images_hostname":{ type: "string", required: false },
    "LA_species_lists_hostname":{ type: "string", required: false },
    "LA_regions_hostname":{ type: "string", required: false },
    "LA_logger_hostname":{ type: "string", required: false },
    "LA_solr_hostname":{ type: "string", required: false },
    "LA_webapi_hostname":{ type: "string", required: false },
    "LA_spatial_hostname":{ type: "string", required: false },
    "LA_alerts_hostname":{ type: "string", required: false },
    "LA_doi_hostname":{ type: "string", required: false },
    "LA_dashboard_hostname":{ type: "string", required: false },
    "LA_cas_hostname":{ type: "string", required: false },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  }

};
