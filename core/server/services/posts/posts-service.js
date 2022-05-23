const nql = require('@tryghost/nql');
const {BadRequestError} = require('@tryghost/errors');
const tpl = require('@tryghost/tpl');

const messages = {
    invalidVisibilityFilter: 'Invalid visibility filter.',
    invalidEmailSegment: 'The email segment parameter doesn\'t contain a valid filter'
};

class PostsService {
    constructor({mega, urlUtils, models, isSet}) {
        this.mega = mega;
        this.urlUtils = urlUtils;
        this.models = models;
        this.isSet = isSet;
    }

    async editPost(frame) {
<<<<<<< HEAD
        let model;

        // Make sure the newsletter_id is matching an active newsletter
        if (frame.options.newsletter_id) {
            const newsletter = await this.models.Newsletter.findOne({id: frame.options.newsletter_id}, {transacting: frame.options.transacting});
            if (!newsletter || newsletter.get('status') !== 'active') {
                throw new BadRequestError({
                    message: messages.invalidNewsletterId
                });
            }
        } else {
            // Set the newsletter_id if it isn't passed to the API
            // NOTE: this option is ignored if the newsletter_id is already set on the post.
            // Never use frame.options.newsletter_id to do actual logic. Use model.newsletter_id after the edit.
            const newsletters = await this.models.Newsletter.findPage({filter: 'status:active', limit: 1, columns: ['id']}, {transacting: frame.options.transacting});
            if (newsletters.data.length > 0) {
                frame.options.newsletter_id = newsletters.data[0].id;
            }
        }

        if (!frame.options.email_recipient_filter && frame.options.send_email_when_published) {
            await this.models.Base.transaction(async (transacting) => {
                const options = {
                    ...frame.options,
                    transacting
                };

                /**
                 * 1. We need to edit the post first in order to know what the visibility is.
                 * 2. We can only pass the email_recipient_filter when we change the status.
                 *
                 * So, we first edit the post as requested, with all information except the status,
                 * from there we can determine what the email_recipient_filter should be and then finish
                 * the edit, with the status and the email_recipient_filter option.
                 */
                const status = frame.data.posts[0].status;
                delete frame.data.posts[0].status;
                const interimModel = await this.models.Post.edit(frame.data.posts[0], options);
                frame.data.posts[0].status = status;

                options.email_recipient_filter = interimModel.get('visibility') === 'paid' ? 'paid' : 'all';

                model = await this.models.Post.edit(frame.data.posts[0], options);
            });
        } else {
            model = await this.models.Post.edit(frame.data.posts[0], frame.options);
        }

        /**Handle newsletter email */
        const emailRecipientFilter = model.get('email_recipient_filter');
        if (emailRecipientFilter !== 'none') {
            if (emailRecipientFilter !== 'all') {
=======
        // Make sure the newsletter is matching an active newsletter
        // Note that this option is simply ignored if the post isn't published or scheduled
        if (frame.options.newsletter && frame.options.email_segment) {
            if (frame.options.email_segment !== 'all') {
>>>>>>> v5.0.0
                // check filter is valid
                try {
                    await this.models.Member.findPage({filter: frame.options.email_segment, limit: 1});
                } catch (err) {
                    return Promise.reject(new BadRequestError({
                        message: tpl(messages.invalidEmailSegment),
                        context: err.message
                    }));
                }
            }
        }

        const model = await this.models.Post.edit(frame.data.posts[0], frame.options);

        /**Handle newsletter email */
        if (model.get('newsletter_id')) {
            const sendEmail = model.wasChanged() && this.shouldSendEmail(model.get('status'), model.previous('status'));

            if (sendEmail) {
                let postEmail = model.relations.email;

                if (!postEmail) {
<<<<<<< HEAD
                    const email = await this.mega.addEmail(model, {...frame.options, apiVersion: this.apiVersion});
=======
                    const email = await this.mega.addEmail(model, frame.options);
>>>>>>> v5.0.0
                    model.set('email', email);
                } else if (postEmail && postEmail.get('status') === 'failed') {
                    const email = await this.mega.retryFailedEmail(postEmail);
                    model.set('email', email);
                }
            }
        }

        return model;
    }

    async getProductsFromVisibilityFilter(visibilityFilter) {
        try {
            const allProducts = await this.models.Product.findAll();
            const visibilityFilterJson = nql(visibilityFilter).toJSON();
            const productsData = (visibilityFilterJson.product ? [visibilityFilterJson] : visibilityFilterJson.$or) || [];
            const tiers = productsData
                .map((data) => {
                    return allProducts.find((p) => {
                        return p.get('slug') === data.product;
                    });
                }).filter(p => !!p).map((d) => {
                    return d.toJSON();
                });
            return tiers;
        } catch (err) {
            return Promise.reject(new BadRequestError({
                message: tpl(messages.invalidVisibilityFilter),
                context: err.message
            }));
        }
    }

    /**
     * Calculates if the email should be tried to be sent out
     * @private
     * @param {String} currentStatus current status from the post model
     * @param {String} previousStatus previous status from the post model
     * @returns {Boolean}
     */
    shouldSendEmail(currentStatus, previousStatus) {
        return (['published', 'sent'].includes(currentStatus))
            && (!['published', 'sent'].includes(previousStatus));
    }

    handleCacheInvalidation(model) {
        let cacheInvalidate;

        if (
            model.get('status') === 'published' && model.wasChanged() ||
            model.get('status') === 'draft' && model.previous('status') === 'published'
        ) {
            cacheInvalidate = true;
        } else if (
            model.get('status') === 'draft' && model.previous('status') !== 'published' ||
            model.get('status') === 'scheduled' && model.wasChanged()
        ) {
            cacheInvalidate = {
                value: this.urlUtils.urlFor({
                    relativeUrl: this.urlUtils.urlJoin('/p', model.get('uuid'), '/')
                })
            };
        } else {
            cacheInvalidate = false;
        }

        return cacheInvalidate;
    }
}

/**
 * @returns {PostsService} instance of the PostsService
 */
const getPostServiceInstance = () => {
    const urlUtils = require('../../../shared/url-utils');
    const {mega} = require('../mega');
    const labs = require('../../../shared/labs');
    const models = require('../../models');

    return new PostsService({
        mega: mega,
        urlUtils: urlUtils,
        models: models,
        isSet: labs.isSet.bind(labs)
    });
};

module.exports = getPostServiceInstance;
// exposed for testing purposes only
module.exports.PostsService = PostsService;
