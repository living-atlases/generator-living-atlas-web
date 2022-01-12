const cp = require("child_process");
const fs = require('fs').promises;
const p = require("path");
const brandOrign = sails.config.custom.baseBrandingLocation;

async function yoGen(pkgName, path, yoRc) {
  return new Promise(function (resolve, reject) {
    fs.open(p.join(path, ".yo-rc.json"), "wx").then((desc) => {
        fs.writeFile(desc, JSON.stringify(yoRc, null, 2), {encoding: "utf8"})
          .then(() => {
            desc.close();
            let errC;
            let errY;
            let errCF;
            console.log(`Copying branding from ${brandOrign}`);
            cp.execSync(
              `cp -a ${brandOrign} ${pkgName}-branding`,
              {cwd: path, stderr: errC});
            if (errC) console.log(errC);
            console.log("Generating inventories")
            cp.execSync(
              "yo living-atlas --replay-dont-ask --force", //  --debug",
              {cwd: path, stderr: errY});
            if (errY) console.log(errY);
            console.log("End of yo");
            resolve();
          }).catch((err) => {
          resolve("genError");
        });
        // console.log("yo-rc written");
      }
    ).catch((err) => {
      resolve("fsError");
    });
  });
}

module.exports = {
  friendlyName: 'yo living generator',
  description: 'Calls to yeoman living-atlas generator',

  inputs: {
    pkgName: {
      type: "string",
      required: true,
    },
    path: {
      type: "string",
      required: true,
    },
    yoRc: {
      type: {},
      required: true,
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
    genError: {
      description: "Error during yeoman generation."
    },
    fsError: {
      description: "Error during fs calls."
    },
  },

  fn: async function (inputs, exits) {
    let opt = await yoGen(inputs.pkgName, inputs.path, inputs.yoRc);
    if (opt) {
      throw opt;
    } else return exits.success();
  }
}
