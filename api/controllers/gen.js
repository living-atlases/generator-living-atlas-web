const tmp = require("tmp");
const archiver = require("archiver");
const p = require("path");

module.exports = {
  friendlyName: "Generate and Download",

  description: "Generate the LA inventories and send to the user",

  inputs: {
    uuid: {
      description: "the uuid to download",
      type: "string",
      required: true,
      custom: async function (uuid) {
        return await Conf.findOne({uuid: uuid});
      },
    },
  },

  exits: {
    fsError: {
      description: "FS error generating your inventories.",
      responseType: "serverError",
    },
    genError: {
      description: "Error generating your inventories.",
      responseType: "serverError",
    },
    zipError: {
      description: "Error archiving your inventories.",
      responseType: "serverError",
    },
  },

  fn: async function (inputs, exits) {
    // temporal directory
    const tmpobj = tmp.dirSync({unsafeCleanup: true});
    const path = tmpobj.name;
    console.log("Tmp dir: ", path);
    let conf = await Conf.findOne({uuid: inputs.uuid});

    const yoRc = sails.helpers.transform(conf);
    const pkgName = yoRc["generator-living-atlas"]["promptValues"]["LA_pkg_name"]

    await sails.helpers.yoGen(pkgName, path, yoRc);

    let res = this.res;

    // set the archive name
    res.attachment(`${pkgName}-inventories-and-theme.zip`);

    // https://github.com/archiverjs/node-archiver/blob/master/examples/express.js
    const archive = archiver("zip", {zlib: {level: 9}});
    archive.pipe(res);

    console.log("Starting to zip");
    archive.on("error", function (err) {
      console.log(err.message);
      throw "zipError";
    });

    //on stream closed we can end the request
    archive.on("end", function () {
      console.log("Archive wrote %d bytes", archive.pointer());
      // Manual temporal dir cleanup
      tmpobj.removeCallback();
    });

    var files = [];
    for (var i in files) {
      archive.file(files[i], {name: p.basename(files[i])});
    }

    var directories = [path];
    for (var i in directories) {
      archive.directory(directories[i], directories[i].replace(path, ''));
    }

    archive.finalize();
    return res;
  },
};
