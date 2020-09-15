/**
 * SessionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const uuidV4 = require('uuid').v4;
const uuidValidate = require('uuid').validate;
const PREFIX = 'user_configs_';
const util = require('util');
const assert = require('../../src/utils').assert;
const defConf = require('../../src/constants').defConf;
let validate = require("../../src/validate");

const get = async function (uuid) {
  assert(typeof uuid === 'string', 'uuid should be a String');
  let value = await sails.getDatastore('cache').leaseConnection(async (db) => {
    let found = await (util.promisify(db.get).bind(db))(PREFIX + uuid);
    // console.log(`Uuid: ${uuid} ${typeof found !== 'undefined' ? "found" : "not found"}`);
    if (typeof found === 'undefined') {
      return undefined;
    } else {
      // console.log(found);
      return found;
    }
  });
  return JSON.parse(value);
}

const set = async function (uuid, conf) {
  assert(typeof uuid === 'string', 'uuid should be a String');
  assert(typeof conf === 'string', 'conf should be a String');
  await sails.getDatastore('cache').leaseConnection(async (db) => {
    await (util.promisify(db.set).bind(db))(PREFIX + uuid, conf);
  });
}

module.exports = {

  friendlyName: "Session Controller",

  description: "Store a recover user main session",

  inputs: {
    uuid: {
      description: "uuid",
      type: "string",
      required: false,
      custom: function (value) {
        if (value == null) return true;
        return uuidValidate(value);
      },
    },
    conf: {
      description: "the incoming conf for yo living-atlas",
      type: "string",
      required: false,
    },
  },

  exits: {
    genError: {
      description: "Error generating your session",
      responseType: "serverError",
    },
  },

  fn: async function (inputs) {
    let res = this.res;
    let currentUuid = inputs.uuid;
    if (currentUuid == null) {
      currentUuid = uuidV4();
      await set(currentUuid, JSON.stringify(defConf));
      return res.json({uuid: currentUuid, conf: defConf});
    }

    let confRetrieved = await get(currentUuid);
    if (typeof inputs.conf === "undefined") {
      return res.json({uuid: currentUuid, conf: confRetrieved});
    }

    if (validate(inputs) === '')
      await set(currentUuid, inputs.conf);
    else {
      console.log('Not saving because is not valid');
      // do nothing til is valid
    }
    return res.json({uuid: currentUuid, conf: inputs.conf});
  }
}