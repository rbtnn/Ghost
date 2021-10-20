const i18n = require('../../../shared/i18n');
const errors = require('@tryghost/errors');
const request = require('@tryghost/request');
const models = require('../../models');

module.exports = {
    docName: 'bsm_podcast',
    browse: {
        options: [
        ],
        data: [
            'uuid'
        ],
        permissions: true,
        async query(frame) {
            frame.response = async function (req, res) {
                res.writeHead(200, {
                    "Content-Type" : "text/xml"
                });
                const memberRows = await models.Member.getFilteredCollectionQuery({}).select('members.*').distinct();
                for (var i = 0; i < memberRows.length; i++) {
                    if ((memberRows[i].uuid === frame.data.uuid) && (memberRows[i].status !== 'free')) {
                        const response = await request('https://test.backspace.fm/feeds/f3f5805fe279e95b9d46f4623f7d998b409371f2658dab0fcec41d70b5bcb5ae/', {
                            headers: {
                                accept: 'text/xml'
                            },
                            encoding: null
                        });
                        return res.end(response.body);
                    }
                }
                return res.end('');
            };
        }
    }
};

