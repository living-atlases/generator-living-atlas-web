const test = require("ava");
const transform = require("./src/transform.js");
const validate = require("./src/validate.js");
const sails = require("sails");

const defObj = {
  LA_project_name: "Atlas of Living Australia",
  LA_project_shortname: "ALA",
  LA_domain: "ala.org.au",
  LA_enable_ssl: true,
  LA_use_spatial: true,
  LA_use_ala_bie: true,
  LA_use_regions: true,
  LA_use_species_lists: true,
  LA_use_cas: true,
  LA_use_webapi: false,
  LA_use_alerts: true,
  LA_use_doi: true,
  LA_use_dashboard: true,
  LA_collectory_uses_subdomain: true,
  LA_ala_hub_uses_subdomain: true,
  LA_biocache_service_uses_subdomain: true,
  LA_ala_bie_uses_subdomain: true,
  LA_bie_index_uses_subdomain: true,
  LA_images_uses_subdomain: true,
  LA_species_lists_uses_subdomain: true,
  LA_regions_uses_subdomain: true,
  LA_logger_uses_subdomain: true,
  LA_solr_uses_subdomain: true,
  LA_webapi_uses_subdomain: true,
  LA_spatial_uses_subdomain: true,
  LA_alerts_uses_subdomain: true,
  LA_doi_uses_subdomain: true,
  LA_dashboard_uses_subdomain: true,
  LA_cas_uses_subdomain: true,
  hostnames: "vm1",
  hostnamesList: ["vm1"],
  LA_collectory_suburl: "collections",
  LA_collectory_iniPath: "",
  LA_collectory_hostname: "vm1",
  LA_collectory_path: "/",
  LA_collectory_url: "collections.ala.org.au",
  LA_ala_hub_suburl: "biocache",
  LA_ala_hub_iniPath: "",
  LA_ala_hub_hostname: "vm1",
  LA_ala_hub_path: "/",
  LA_ala_hub_url: "biocache.ala.org.au",
  LA_biocache_service_suburl: "biocache-ws",
  LA_biocache_service_iniPath: "ws",
  LA_biocache_service_hostname: "vm1",
  LA_biocache_service_path: "/ws",
  LA_biocache_service_url: "biocache-ws.ala.org.au",
  LA_ala_bie_suburl: "bie",
  LA_ala_bie_iniPath: "",
  LA_ala_bie_hostname: "vm1",
  LA_ala_bie_path: "/",
  LA_ala_bie_url: "bie.ala.org.au",
  LA_bie_index_suburl: "bie-index",
  LA_bie_index_iniPath: "",
  LA_bie_index_hostname: "vm1",
  LA_bie_index_path: "/",
  LA_bie_index_url: "bie-index.ala.org.au",
  LA_images_suburl: "images",
  LA_images_iniPath: "",
  LA_images_hostname: "vm1",
  LA_images_path: "/",
  LA_images_url: "images.ala.org.au",
  LA_species_lists_suburl: "lists",
  LA_species_lists_iniPath: "",
  LA_species_lists_hostname: "vm1",
  LA_species_lists_path: "/",
  LA_species_lists_url: "lists.ala.org.au",
  LA_regions_suburl: "regions",
  LA_regions_iniPath: "",
  LA_regions_hostname: "vm1",
  LA_regions_path: "/",
  LA_regions_url: "regions.ala.org.au",
  LA_logger_suburl: "logger",
  LA_logger_iniPath: "",
  LA_logger_hostname: "vm1",
  LA_logger_path: "/",
  LA_logger_url: "logger.ala.org.au",
  LA_solr_suburl: "index",
  LA_solr_iniPath: "",
  LA_solr_hostname: "vm1",
  LA_solr_path: "/",
  LA_solr_url: "index.ala.org.au",
  LA_biocache_backend_suburl: "biocache-backend",
  LA_biocache_backend_iniPath: "",
  LA_biocache_backend_hostname: "vm1",
  LA_biocache_backend_path: "/biocache-backend",
  LA_biocache_backend_url: "ala.org.au",
  LA_cas_suburl: "auth",
  LA_cas_iniPath: "",
  LA_cas_hostname: "vm1",
  LA_cas_path: "/",
  LA_cas_url: "auth.ala.org.au",
  LA_spatial_suburl: "spacial",
  LA_spatial_iniPath: "",
  LA_spatial_hostname: "vm1",
  LA_spatial_path: "/",
  LA_spatial_url: "spacial.ala.org.au",
  LA_alerts_suburl: "alerts",
  LA_alerts_iniPath: "",
  LA_alerts_hostname: "vm1",
  LA_alerts_path: "/",
  LA_alerts_url: "alerts.ala.org.au",
  LA_doi_suburl: "doi",
  LA_doi_iniPath: "",
  LA_doi_hostname: "vm1",
  LA_doi_path: "/",
  LA_doi_url: "doi.ala.org.au",
  LA_dashboard_suburl: "dashboard",
  LA_dashboard_iniPath: "",
  LA_dashboard_hostname: "vm1",
  LA_dashboard_path: "/",
  LA_dashboard_url: "dashboard.ala.org.au",
};

const P = "generator-living-atlas";
const G = "promptValues";

const src = {conf: defObj};
let dest = transform(src);

test("pkgname transform", async (t) => {
  const src = {conf: {LA_project_shortname: "GBIF.ES"}};
  let dest = transform(src);
  t.is(dest[P][G].LA_pkg_name, "gbif-es");
});

test("long name valid", async (t) => {
  const testObj = defObj;
  const names = [
    "回尚芸策出多探政検済浜朝毎。車記隠地実問底欠葉下女保月兄介禄情内線裁。的点回父政埼芸岡",
    "LA Wäkßandâ",
    "Лорем ипсум долор сит амет, фастидии ехпетенда при ид.",
    "議さだや設9売サコヱ助送首し康美イヤエテ決竹ハキ約泣ヘハ式追だじけ"
  ]
  for (name in names) {
    testObj.LA_project_name = names[name];
    testObj.LA_project_shortname = names[name].substring(0, 10);
    t.is(validate({conf: JSON.stringify(testObj)}), '');
    let src = {conf: testObj}
    let dest = transform(src);
    t.is(dest[P][G].LA_project_name.length > 0, true);
    t.is(dest[P][G].LA_project_shortname.length > 0, true);
    t.is(dest[P][G].LA_project_name, src.conf.LA_project_name);
    t.is(dest[P][G].LA_project_shortname, src.conf.LA_project_shortname);
  }
});

test("cas", (t) => {
  t.is(dest[P][G].LA_use_CAS, true);
  t.is(dest[P][G].LA_use_CAS, src.conf.LA_use_cas);
});

test("use_ala_bie", (t) => {
  t.is(dest[P][G].LA_use_species, true);
  t.is(dest[P][G].LA_use_species, src.conf.LA_use_ala_bie);
});

test("species list use", (t) => {
  t.is(dest[P][G].LA_use_species_lists, true);
  t.is(dest[P][G].LA_lists_hostname, "vm1");
});

test("species list hostname", (t) => {
  t.is(dest[P][G].LA_lists_hostname, "vm1");
});

test("species list url", (t) => {
  t.is(dest[P][G].LA_lists_url, "lists.ala.org.au");
});

test("species list path", (t) => {
  t.is(dest[P][G].LA_lists_path, "/");
});

test("species list host", (t) => {
  t.is(dest[P][G].LA_lists_hostname, "vm1");
});

test("json validation default", (t) => {
  t.is(validate({conf: JSON.stringify(defObj)}), '');
});
