<script context="module">
  export const services = ["collectory", "ala_hub", "biocache_service", "ala_bie", "bie_index", "images", "species_lists",
    "regions", "logger", "solr", "cas", "spatial", "alerts", "doi", "dashboard"];
  export let servicesStore = {
    collectory: {
      name: "collections",
      name_int: "collectory",
      desc: "biodiversity collections",
      optional: false,
      sample: "https://collections.ala.org.au",
      path: ""
    },
    ala_hub: {
      name: "records",
      name_int: "ala_hub",
      desc: "occurrences search frontend",
      optional: false,
      hint: "Typically 'records' or similar",
      sample: "https://biocache.ala.org.au",
      path: ""
    },
    biocache_service: {
      name: "records-ws",
      name_int: "biocache_service",
      desc: "occurrences web service",
      optional: false,
      sample: "https://biocache.ala.org.au/ws",
      path: ""
    },
    ala_bie: {
      name: "species",
      name_int: "ala_bie",
      desc: "species search frontend",
      optional: false,
      sample: "https://bie.ala.org.au",
      path: ""
    },
    bie_index: {
      name: "species-ws",
      name_int: "bie_index",
      desc: "species web service",
      optional: false,
      sample: "https://bie.ala.org.au/ws",
      path: ""
    },
    images: {
      name: "images",
      name_int: "images",
      desc: "images service",
      optional: false,
      sample: "https://images.ala.org.au",
      path: ""
    },
    species_lists: {
      name: "lists",
      name_int: "species_lists",
      desc: "user provided species lists",
      optional: true,
      sample: "https://lists.ala.org.au",
      path: ""
    },
    regions: {
      name: "regions",
      name_int: "regions",
      desc: "regional data frontend",
      optional: true,
      sample: "https://regions.ala.org.au",
      path: ""
    },
    logger: {
      name: "logger",
      name_int: "logger",
      desc: "event logging (downloads stats, etc)",
      optional: false,
      sample: "https://logger.ala.org.au",
      path: ""
    },
    solr: {
      name: "index",
      name_int: "solr",
      desc: "indexing (Solr)",
      optional: false,
      path: ""
    },
    cas: {
      name: "auth",
      name_int: "cas",
      desc: "CAS authentication system",
      optional: true,
      forceSubdomain: true,
      sample: "https://auth.ala.org.au/cas/",
      recommended: true,
      path: ""
    },
    biocache_backend: {
      name: "biocache-backend",
      name_int: "biocache_backend",
      desc: "cassandra",
      optional: false,
      path: ""
    },
    biocache_cli: {
      name: "biocache-cli",
      name_int: "biocache_cli",
      desc: "manages the loading, sampling, processing and indexing of occurrence records",
      optional: false,
      path: ""
    },
    spatial: {
      name: "spatial",
      name_int: "spatial",
      desc: "spatial front-end",
      optional: true,
      forceSubdomain: true,
      sample: "https://spatial.ala.org.au",
      path: ""
    },
    webapi: {
      name: "webapi",
      name_int: "webapi",
      desc: "API front-end",
      optional: true,
      sample: "https://api.ala.org.au",
      path: ""
    },
    dashboard: {
      name: "dashboard",
      name_int: "dashboard",
      desc: "work in progress",
      optional: true,
      sample: "https://dashboard.ala.org.au",
      path: ""
    },
    alerts: {
      name: "alerts",
      name_int: "alerts",
      desc: "users can subscribe to notifications about new species occurrences they are interested, regions, etc",
      optional: true,
      sample: "https://alerts.ala.org.au",
      path: ""
    },
    doi: {
      name: "doi",
      name_int: "doi",
      desc: "mainly used for generating DOIs of user downloads",
      optional: true,
      sample: "https://doi.ala.org.au",
      path: ""
    },
    nameindexer: {
      name: "nameindexer",
      name_int: "nameindexer",
      desc: "nameindexer",
      optional: false,
      path: ""
    }
  };
</script>