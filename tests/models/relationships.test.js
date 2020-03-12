/**
 * Testing for store mutations and data validation.
 */

// imports
// -------
import { assert } from 'chai';
import store from './models';
import { Profile, Post, Author } from './models';
import server from '../server';


// config
// ------
jest.mock('axios');
server.init();
beforeEach(() => {
  server.reset();
});


// tests
// -----
describe("model.relations", () => {
  let res;
  let model;

  test("model.relations.collection", async () => {
    // dispatch relation
    model = await Author.get(1);
    res = await model.posts.fetch();
    assert.equal(res.length, 2);
    assert.equal(res[0].id, 1);

    // check that nested collection in store
    res = Post.query().all();
    assert.equal(res.length, 2);
    assert.equal(res[0].id, 1);
  });

});


describe("model.nested", () => {
  let res;
  let model;

  test("model.nested.actions", async () => {
    // default method
    model = await Post.get(1);
    assert.equal(model.archived, false);
    await model.archive();
    assert.equal(model.title, 'Foo');
    assert.equal(model.archived, true);
    assert.equal(model.$.archived, true);

    // dispatch method
    res = await model.history.fetch();
    assert.equal(res.length, 2);
    await model.history.create({ delta: 'test' });
    res = await model.history.fetch();
    assert.equal(res.length, 3);
  });

  test("model.nested.queries", async () => {
    model = await Post.get(1);
    res = await model.history.fetch();
    assert.equal(res.length, 2);
    assert.equal(res[0].delta, 'foo');
  });

});
