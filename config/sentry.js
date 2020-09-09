var git = require("git-rev-sync");

module.exports.sentry = {
  active: true,
  dsn: process.env.SENTRY_DSN,
  options: {
    logger: 'default',
    release: git.long(),
    // environment: 'staging'
    environment: 'production'
  }
};
