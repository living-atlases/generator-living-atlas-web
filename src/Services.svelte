<script context="module">
  export const services = [ "collectory", "ala_hub", "biocache_service", "ala_bie", "bie_index", "images" ];
  export let servicesStore = {
    collectory: {
      name: "collections",
      desc: "biodiversity collections",
      path: ""
    },
    ala_hub: {
      name: "biocache",
      desc: "occurrences search frontend",
      path: ""
    },
    biocache_service: {
      name: "biocache-ws",
      desc: "occurrences web service",
      path: "ws"
    },
    ala_bie: {
      name: "species",
      desc: "species search frontend",
      path: ""
    },
    bie_index: {
      name: "species-ws",
      desc: "species web service",
      path: "ws"
    },
    images: {
      name: "images",
      desc: "",
      path: ""
    },
    lists: {
      name: "lists",
      desc: "",
      path: ""
    },
    regions: {
      name: "regions",
      desc: "regional data frontend",
      path: ""
    },
    logger: {
      name: "logger",
      desc: "event logging",
      path: ""
    },
    solr: {
      name: "solr",
      desc: "indexing",
      path: ""
    },
    cas: {
      name: "cas",
      desc: "authentication system",
      path: ""
    },
    biocache_backend: {
      name: "biocache_backend",
      desc: "cassandra",
      path: ""
    },
    biocache_cli: {
      name: "biocache_cli",
      desc: "manages the loading, sampling, processing and indexing of occurrence records",
      path: ""
    },
    spatial: {
      name: "spatial",
      desc: "spatial front-end",
      path: ""
    },
    webapi: {
      name: "webapi",
      desc: "API front-end",
      path: ""
    },
    dashboard: {
      name: "dashboard",
      desc: "dashboard",
      path: ""
    },
    alerts: {
      name: "alerts",
      desc: "alerts",
      path: ""
    },
    doi: {
      name: "doi",
      desc: "DOI service",
      path: ""
    },
    nameindexer: {
      name: "nameindexer",
      desc: "nameindexer",
      path: ""
    }
  };
</script>