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
  return await Conf.findOne({uuid: uuid});
}

const set = async function (uuid, conf) {
  assert(typeof uuid === 'string', 'uuid should be a String');
  assert(typeof conf === 'object', 'conf should be an Object');
  conf.uuid = uuid;
  return await Conf.findOne({uuid: uuid}).then(function (result) {
    if (result) {
      return Conf.update({uuid: uuid}, conf).fetch();
    } else {
      delete conf.id;
      return Conf.create(conf).fetch();
    }
  });
}

let validConf = (inputs) => validate(inputs) === '';

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
      let withConf = typeof inputs.conf !== 'undefined' && validConf(inputs) ? JSON.parse(inputs.conf) : defConf;
      let createdConf = await set(currentUuid, withConf);
      // console.log(createdConf);
      return res.json({uuid: currentUuid, conf: createdConf});
    }

    let confRetrieved = await get(currentUuid);
    if (typeof confRetrieved === "undefined") {
      return res.notFound();
    }
    if (typeof inputs.conf === "undefined") {
      return res.json({uuid: currentUuid, conf: confRetrieved});
    }

    if (validConf(inputs)) {
      let persisted = await set(currentUuid, JSON.parse(inputs.conf));
      // console.log(persisted);
    } else {
      console.log('Not saving because is not valid');
      // do nothing til is valid
    }
    return res.json({uuid: currentUuid, conf: inputs.conf});
  }
}