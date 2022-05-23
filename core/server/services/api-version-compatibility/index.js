const APIVersionCompatibilityService = require('@tryghost/api-version-compatibility-service');
<<<<<<< HEAD
const VersionNotificationsDataService = require('@tryghost/version-notifications-data-service');
const versionMismatchHandler = require('@tryghost/mw-api-version-mismatch');
// const {GhostMailer} = require('../mail');
const settingsService = require('../../services/settings');
const models = require('../../models');
const logging = require('@tryghost/logging');
const ghostVersion = require('@tryghost/version');
=======
const versionMismatchHandler = require('@tryghost/mw-api-version-mismatch');
const ghostVersion = require('@tryghost/version');
const {GhostMailer} = require('../mail');
const settingsService = require('../settings/settings-service');
const models = require('../../models');
const urlUtils = require('../../../shared/url-utils');
const settingsCache = require('../../../shared/settings-cache');
>>>>>>> v5.0.0

let serviceInstance;

const init = () => {
    const ghostMailer = new GhostMailer();

    serviceInstance = new APIVersionCompatibilityService({
<<<<<<< HEAD
=======
        UserModel: models.User,
        ApiKeyModel: models.ApiKey,
        settingsService: settingsService.getSettingsBREADServiceInstance(),
>>>>>>> v5.0.0
        sendEmail: (options) => {
            // NOTE: not using bind here because mockMailer is having trouble mocking bound methods
            return ghostMailer.send(options);
        },
        getSiteUrl: () => urlUtils.urlFor('home', true),
        getSiteTitle: () => settingsCache.get('title')
    });
};

<<<<<<< HEAD
module.exports.errorHandler = (req, res, next) => {
    return versionMismatchHandler(serviceInstance)(req, res, next);
};

=======
module.exports.errorHandler = (err, req, res, next) => {
    return versionMismatchHandler(serviceInstance)(err, req, res, next);
};

/**
 * If Accept-Version is set on the request set Content-Version on the response
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
>>>>>>> v5.0.0
module.exports.contentVersion = (req, res, next) => {
    if (req.header('accept-version')) {
        res.header('Content-Version', `v${ghostVersion.safe}`);
    }
    next();
};

<<<<<<< HEAD
=======
module.exports.versionRewrites = require('./mw-version-rewrites');
module.exports.legacyApiPathMatch = require('./legacy-api-path-match');

>>>>>>> v5.0.0
module.exports.init = init;
