const models = require('../../models');
const https = require('https');

const fetch_feed = async () => {
  const URL = 'https://rbtnn.github.io/bsm-feed-generator/bsm-feed.xml';
  return new Promise((resolve, reject) => {
    https.get(URL, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(data);
      });
    }).on("error", (err) => {
      resolve("Error: " + err.message);
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
                    "Content-Type" : "application/rss+xml",
                    "Cache-Control" : "no-store"
                });
                const memberRows = await models.Member.getFilteredCollectionQuery({}).select('members.*').distinct();
                for (var i = 0; i < memberRows.length; i++) {
                    if ((memberRows[i].uuid === frame.data.uuid) && (memberRows[i].status !== 'free')) {
                        return res.end(await fetch_feed());
                    }
                }
                return res.end('');
            };
        }
    }
};
