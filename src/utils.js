module.exports = {
  assert: (condition, message) => {
    if (!condition)
      throw Error('Assert failed: ' + (message || ''))
  },
  title: (shortName) => `${shortName} LA Inventories`
};
