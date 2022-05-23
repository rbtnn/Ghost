const debug = require('@tryghost/debug')('web:api:default:app');
const config = require('../../../shared/config');
const express = require('../../../shared/express');
const sentry = require('../../../shared/sentry');
const errorHandler = require('@tryghost/mw-error-handler');
const APIVersionCompatibilityService = require('../../services/api-version-compatibility');

module.exports = function setupApiApp() {
    debug('Parent API setup start');
    const apiApp = express('api');

    if (config.get('server:testmode')) {
        apiApp.use(require('./testmode')());
    }

<<<<<<< HEAD
    apiApp.use(APIVersionCompatibilityService.contentVersion);

    apiApp.lazyUse(urlUtils.getVersionPath({version: 'v2', type: 'content'}), require('./v2/content/app'));
    apiApp.lazyUse(urlUtils.getVersionPath({version: 'v2', type: 'admin'}), require('./v2/admin/app'));
=======
    apiApp.use(APIVersionCompatibilityService.versionRewrites);
    apiApp.use(APIVersionCompatibilityService.contentVersion);
>>>>>>> v5.0.0

    apiApp.lazyUse('/content/', require('./canary/content/app'));
    apiApp.lazyUse('/admin/', require('./canary/admin/app'));

    // Error handling for requests to non-existent API versions
    apiApp.use(errorHandler.resourceNotFound);
    apiApp.use(APIVersionCompatibilityService.errorHandler);
    apiApp.use(errorHandler.handleJSONResponse(sentry));

    debug('Parent API setup end');
    return apiApp;
};
