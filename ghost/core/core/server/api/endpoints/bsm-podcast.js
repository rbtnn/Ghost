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
                // /home/ubuntu/ghost-mysql/versions/5.54.0/node_modules/@tryghost/express-dynamic-redirects/lib/DynamicRedirectManager.js
                //
                //            if (-1 != req.url.indexOf('/bsm_podcast/')) {
                //                res.set({
                //                    "Cache-Control" : "no-store"
                //                });
                //            }
                //            else {
                //                res.set({
                //                    'Cache-Control': `public, max-age=${maxAge}`
                //                });
                //            }
                //
                //            res.redirect(permanent ? 301 : 302, formatURL(toURL));
                //        });

                res.writeHead(200, {
                    "Content-Type" : "application/rss+xml;charset=UTF8",
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
