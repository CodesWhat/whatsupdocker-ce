const { Before, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(20 * 1000);

Before(function initScope() {
  this.scenarioScope = {};
});
