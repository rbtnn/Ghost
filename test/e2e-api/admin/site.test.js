const {agentProvider, matchers} = require('../../utils/e2e-framework');
<<<<<<< HEAD
const {anyEtag, stringMatching} = matchers;
=======
const {anyEtag, stringMatching, anyContentLength} = matchers;
>>>>>>> v5.0.0

describe('Site API', function () {
    let agent;

    before(async function () {
        agent = await agentProvider.getAdminAPIAgent();
    });

    it('can retrieve config and all expected properties', async function () {
        await agent
            .get('site/')
            .matchBodySnapshot({
                site: {
                    version: stringMatching(/\d+\.\d+/)
                }
            })
            .matchHeaderSnapshot({
<<<<<<< HEAD
                etag: anyEtag
=======
                etag: anyEtag,
                'content-length': anyContentLength
>>>>>>> v5.0.0
            });
    });
});
