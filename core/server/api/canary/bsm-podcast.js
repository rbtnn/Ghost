const config = require('../../../shared/config');
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
                        const response = await request(config.get('bsm_podcast').url, {
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

