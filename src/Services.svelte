<script context="module">
  export const services = [ "collectory", "ala_hub", "biocache_service", "ala_bie", "bie_index", "images", "lists",
    "regions", "logger", "solr", "cas", "spatial", "alerts", "doi", "dashboard" ];
  export let servicesStore = {
    collectory: {
      name: "collections",
      name_int: "collectory",
      desc: "biodiversity collections",
      optional: false,
      path: ""
    },
    ala_hub: {
      name: "biocache",
      name_int: "ala_hub",
      desc: "occurrences search frontend",
      optional: false,
      hint: "Typically 'records' or similar",
      path: ""
    },
    biocache_service: {
      name: "biocache-ws",
      name_int: "biocache_service",
      desc: "occurrences web service",
      optional: false,
      path: "ws"
    },
    ala_bie: {
      name: "species",
      name_int: "ala_bie",
      desc: "species search frontend",
      optional: false,
      path: ""
    },
    bie_index: {
      name: "species-ws",
      name_int: "bie_index",
      desc: "species web service",
      optional: false,
      path: "ws"
    },
    images: {
      name: "images",
      name_int: "images",
      desc: "",
      optional: false,
      path: ""
    },
    lists: {
      name: "lists",
      name_int: "species_lists",
      desc: "user provided species lists",
      optional: true,
      path: ""
    },
    regions: {
      name: "regions",
      name_int: "regions",
      desc: "regional data frontend",
      optional: true,
      path: ""
    },
    logger: {
      name: "logger",
      name_int: "logger",
      desc: "event logging",
      optional: false,
      path: ""
    },
    solr: {
      name: "solr",
      name_int: "solr",
      desc: "indexing",
      optional: false,
      path: ""
    },
    cas: {
      name: "cas",
      name_int: "cas",
      desc: "authentication system",
      optional: true,
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
      path: ""
    },
    webapi: {
      name: "webapi",
      name_int: "webapi",
      desc: "API front-end",
      optional: true,
      path: ""
    },
    dashboard: {
      name: "dashboard",
      name_int: "dashboard",
      desc: "work in progress",
      optional: true,
      path: ""
    },
    alerts: {
      name: "alerts",
      name_int: "alerts",
      desc: "alerts notifications to new species occurrences, etc",
      optional: true,
      path: ""
    },
    doi: {
      name: "doi",
      name_int: "doi",
      desc: "mainly used for user download DOIs",
      optional: true,
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