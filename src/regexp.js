module.exports.projectNameRegexp = /\p{General_Category=Letter}/u;
module.exports.domainRegexp = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;
module.exports.hostnameRegexp = /^[._\-a-z0-9A-Z, ]+$/;
//module.exports.shortNameRegexp = /^[._\-a-z0-9A-Z ]+$/;
module.exports.shortNameRegexp = /\p{General_Category=Letter}/u;

