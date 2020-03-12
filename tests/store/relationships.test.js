/**
 * Testing for store mutations and data validation.
 */

// imports
// -------
import { assert } from 'chai';
import store from './models';
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
describe("store.relations", () => {
  let res;

  test("store.relations.model", async () => {
    // dispatch relation
    res = await store.dispatch('posts.author.fetch', 1);
    assert.equal(res.id, 1);
    assert.equal(res.name, 'Jane Doe');

    // check that nested model in store
    res = store.getters['authors'](1);
    assert.equal(res.id, 1);
  });

  test("store.relations.collection", async () => {
    // dispatch relation
    res = await store.dispatch('authors.posts.fetch', 1);
    assert.equal(res.length, 2);
    assert.equal(res[0].id, 1);

    // check that nested collection in store
    res = store.getters['posts']();
    assert.equal(res.length, 2);
    assert.equal(res[0].id, 1);
  });

});


describe("store.nested", () => {
  let res;

  test("store.nested.actions", async () => {
    // default method
    await store.dispatch('posts.archive', 1);
    res = store.getters['posts'](1);
    assert.equal(res.title, 'Foo');
    assert.equal(res.archived, true);

    // dispatch method
    res = await store.dispatch('posts.history.fetch', 1);
    assert.equal(res.length, 2);
    await store.dispatch('posts.history.create', 1, { delta: 'test' });
    res = await store.dispatch('posts.history.fetch', 1);
    assert.equal(res.length, 3);
  });

  test("store.nested.queries", async () => {
    res = await store.dispatch('posts.history.fetch', 1);
    assert.equal(res.length, 2);
    assert.equal(res[0].delta, 'foo');
  });

});
