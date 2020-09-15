let validate = require("../../src/validate");

module.exports = {
  friendlyName: "Validate received conf",

  description:
    "Validates that the receive configuration has the correct values type for security and reliability reasons",

  sync: true,

  exits: {
    jsonError: {
      description: "Error in main JSON parameter."
    },
    projectNameError: {
      description: "Error in project name parameter."
    },
    shortNameError: {
      description: "Error in short project name parameter."
    },
    domainError: {
      description: "Error in domain parameter."
    },
    serviceParamError: {
      description: "Error in service parameter."
    },
    servicePathParamError: {
      description: "Error in service path parameter."
    },
    serviceUrlParamError: {
      description: "Error in service url parameter."
    },
    serviceHostParamError: {
      description: "Error in service host parameter."
    },
    paramError: {
      description: "Error in some parameter of your request."
    },
    success: {
      description: 'All done.',
    },

  },

  inputs: {
    conf: {
      type: "string",
      required: true,
    },
  },

  fn: function (inputs, exits) {
    let result = validate(inputs);
    if (result !== '')
      throw result;
    return exits.success(true);
  },
};
