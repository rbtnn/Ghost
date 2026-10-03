const assert = require('node:assert/strict');
const sinon = require('sinon');
const https = require('https');
const config = require('../../../../core/shared/config');
const models = require('../../../../core/server/models');
const bsmPodcastEndpoint = require('../../../../core/server/api/endpoints/bsm-podcast');

// rbtnn 独自の bsm_podcast endpoint のユニットテスト。
// DB/MySQL を使わず、models.Member / config / https.get を sinon でスタブして
// browse.query の中身（メンバー gating + RSS プロキシ）を検証する。
describe('bsm_podcast endpoint (unit)', function () {
  const feedContent = '<rss version="2.0"><channel><title>BSM Podcast</title></channel></rss>';
  const originalConfigGet = config.get.bind(config);

  // テストごとに制御できる可変状態
  const state = {
    members: [],
    feedUrl: 'https://example.com/feed.xml'
  };

  beforeEach(function () {
    state.members = [];
    state.feedUrl = 'https://example.com/feed.xml';

    sinon.stub(config, 'get').callsFake((key) => {
      if (key === 'bsm_podcast') {
        return state.feedUrl ? {url: state.feedUrl} : undefined;
      }
      return originalConfigGet(key);
    });

    // models.Member.getFilteredCollectionQuery({}).select('members.*').distinct()
    sinon.stub(models.Member, 'getFilteredCollectionQuery').callsFake(() => {
      const q = {
        select: () => q,
        distinct: () => Promise.resolve(state.members)
      };
      return q;
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  // https.get をスタブして fetchFeed が安定したフィード文字列を返すようにする
  function stubFeed(feed = feedContent) {
    return sinon.stub(https, 'get').callsFake((_url, cb) => {
      const handlers = {};
      cb({
        on: (event, handler) => {
          handlers[event] = handler;
        }
      });
      setImmediate(() => {
        handlers.data?.(feed);
        handlers.end?.();
      });
      return {on: () => {}};
    });
  }

  async function run(uuid) {
    const frame = {data: {uuid}, response: null};
    await bsmPodcastEndpoint.browse.query(frame);

    const captured = {statusCode: null, headers: null, body: null};
    const res = {
      writeHead: (statusCode, headers) => {
        captured.statusCode = statusCode;
        captured.headers = headers;
      },
      end: (body) => {
        captured.body = body;
        return Promise.resolve();
      }
    };
    await frame.response({}, res);
    return captured;
  }

  it('serves the RSS feed for a privileged (non-free) member', async function () {
    stubFeed();
    state.members = [
      {uuid: 'member-a', status: 'paid'},
      {uuid: 'member-b', status: 'free'}
    ];

    const out = await run('member-a');

    assert.equal(out.statusCode, 200);
    assert.equal(out.headers['Content-Type'], 'application/rss+xml;charset=UTF8');
    assert.equal(out.headers['Cache-Control'], 'no-store');
    assert.equal(out.body, feedContent);
  });

  it('returns an empty body when the matching member is free', async function () {
    stubFeed();
    state.members = [{uuid: 'member-a', status: 'free'}];

    const out = await run('member-a');

    assert.equal(out.statusCode, 200);
    assert.equal(out.body, '');
  });

  it('returns an empty body when no member matches the uuid', async function () {
    state.members = [{uuid: 'member-a', status: 'paid'}];

    const out = await run('member-b');

    assert.equal(out.statusCode, 200);
    assert.equal(out.body, '');
  });

  it('does not perform an outbound https request for free / unmatched uuids', async function () {
    const httpsGet = stubFeed();

    state.members = [];
    await run('nobody');
    assert.equal(httpsGet.callCount, 0);

    state.members = [{uuid: 'free-member', status: 'free'}];
    await run('free-member');
    assert.equal(httpsGet.callCount, 0);
  });

  it('does not throw when the feed URL is missing (falls back to an Error body)', async function () {
    state.feedUrl = undefined;
    const httpsGet = sinon.stub(https, 'get').callsFake((_url, cb) => {
      // config に URL が無いため空文字で https.get が呼ばれ、接続エラーを発火させる
      return {
        on: (event, handler) => {
          if (event === 'error') {
            setImmediate(() => handler({message: 'getaddrinfo ENOTFOUND'}));
          }
        }
      };
    });

    state.members = [{uuid: 'member-a', status: 'paid'}];
    const out = await run('member-a');

    assert.equal(httpsGet.callCount, 1);
    assert.match(out.body, /^Error:/);
  });
});
