const config = require('../../../shared/config');
const models = require('../../models');
const https = require('https');

const fetchFeed = async () => {
    const URL = config.get('bsm_podcast')?.url || '';
    return new Promise((resolve) => {
        https.get(URL, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            resolve('Error: ' + err.message);
        });
    });
};

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
                    'Content-Type': 'application/rss+xml;charset=UTF8',
                    'Cache-Control': 'no-store'
                });
                const memberRows = await models.Member.getFilteredCollectionQuery({}).select('members.*').distinct();
                for (let i = 0; i < memberRows.length; i++) {
                    if ((memberRows[i].uuid === frame.data.uuid) && (memberRows[i].status !== 'free')) {
                        return res.end(await fetchFeed());
                    }
                }
                return res.end('');
            };
        }
    }
};

