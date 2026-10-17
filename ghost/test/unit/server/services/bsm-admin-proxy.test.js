const assert = require('node:assert/strict');
const sinon = require('sinon');
const config = require('../../../../core/shared/config');
const bsmAdminProxy = require('../../../../core/server/services/bsm-admin-proxy');

// rbtnn 独自の server-side admin proxy のユニットテスト。
// DB/MySQL を使わず、config(config.get) と global fetch を sinon でスタブし、
// 「Admin メンバーの uuid のみが Admin API を呼べる」ことを検証する。
describe('bsm-admin-proxy (unit)', function () {
  const originalConfigGet = config.get.bind(config);
  const adminKey = 'aaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

  const state = {
    proxyConfig: {
      adminKey,
      memberUuids: ['admin-uuid-1', 'admin-uuid-2'],
      authorRoleId: 'role-author'
    }
  };

  beforeEach(function () {
    sinon.stub(config, 'get').callsFake((key) => {
      if (key === 'bsmAdminProxy') {
        return state.proxyConfig;
      }
      return originalConfigGet(key);
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  function makeRes() {
    const res = {
      json: sinon.stub(),
      status: sinon.stub()
    };
    res.status.callsFake(() => res);
    return res;
  }

  function stubFetch(overrides = {}) {
    const jsonBody = overrides.jsonBody || {};
    return sinon.stub(globalThis, 'fetch').resolves({
      ok: overrides.ok !== false,
      status: overrides.status || 200,
      json: async () => jsonBody
    });
  }

  describe('createPost', function () {
    it('403 for a non-admin member', async function () {
      const req = {member: {uuid: 'someone-else'}};
      const res = makeRes();
      await bsmAdminProxy.createPost(req, res);
      assert.equal(res.status.lastCall.args[0], 403);
      assert.equal(res.json.lastCall.args[0].ok, false);
    });

    it('403 when no member session is present', async function () {
      const req = {member: null};
      const res = makeRes();
      await bsmAdminProxy.createPost(req, res);
      assert.equal(res.status.lastCall.args[0], 403);
    });

    it('400 when body is missing a post', async function () {
      const req = {member: {uuid: 'admin-uuid-1'}, body: {}};
      const res = makeRes();
      await bsmAdminProxy.createPost(req, res);
      assert.equal(res.status.lastCall.args[0], 400);
    });

    it('calls the Admin API with a signed JWT and returns the created post', async function () {
      const fetchStub = stubFetch({jsonBody: {posts: [{id: 'post-1', slug: 'x'}]}});
      const req = {member: {uuid: 'admin-uuid-2'}, body: {post: {slug: 'x', title: 'X'}}};
      const res = makeRes();

      await bsmAdminProxy.createPost(req, res);

      assert.equal(res.status.called, false);
      assert.equal(res.json.called, true);
      const payload = res.json.lastCall.args[0];
      assert.equal(payload.ok, true);
      assert.equal(payload.post.id, 'post-1');

      assert.equal(fetchStub.calledOnce, true);
      const [url, opts] = fetchStub.firstCall.args;
      assert.match(url, /\/ghost\/api\/admin\/posts\/$/);
      assert.match(opts.headers.Authorization, /^Ghost \S+$/);
      assert.deepEqual(JSON.parse(opts.body).posts[0], {slug: 'x', title: 'X'});
    });
  });

  describe('createInvite', function () {
    it('403 for a non-admin member', async function () {
      const req = {member: {uuid: 'someone-else'}, body: {email: 'a@b.com'}};
      const res = makeRes();
      await bsmAdminProxy.createInvite(req, res);
      assert.equal(res.status.lastCall.args[0], 403);
    });

    it('400 for an invalid email', async function () {
      const req = {member: {uuid: 'admin-uuid-1'}, body: {email: 'not-an-email'}};
      const res = makeRes();
      await bsmAdminProxy.createInvite(req, res);
      assert.equal(res.status.lastCall.args[0], 400);
    });

    it('calls the Admin API to create an invite for an authorised admin member', async function () {
      const fetchStub = stubFetch({jsonBody: {invites: [{id: 'i1'}]}});
      const req = {member: {uuid: 'admin-uuid-1'}, body: {email: 'author@example.com'}};
      const res = makeRes();

      await bsmAdminProxy.createInvite(req, res);

      assert.equal(res.json.lastCall.args[0].ok, true);
      assert.match(fetchStub.firstCall.args[0], /\/ghost\/api\/admin\/invites\/$/);
      const sent = JSON.parse(fetchStub.firstCall.args[1].body);
      assert.deepEqual(sent.invites[0], {email: 'author@example.com', role_id: 'role-author'});
    });

    it('propagates an Admin API error status', async function () {
      stubFetch({ok: false, status: 422, jsonBody: {errors: [{message: 'nope'}]}});
      const req = {member: {uuid: 'admin-uuid-1'}, body: {email: 'author@example.com'}};
      const res = makeRes();
      await bsmAdminProxy.createInvite(req, res);
      assert.equal(res.status.lastCall.args[0], 422);
      assert.equal(res.json.lastCall.args[0].ok, false);
    });
  });
});
