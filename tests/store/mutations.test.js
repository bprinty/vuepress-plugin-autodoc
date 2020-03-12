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
let res;

test("mutations.sync", async () => {

  // fetch data
  res = await store.dispatch('posts.fetch');
  res[0].title = 'test'

  // get missing
  try {
    obj = store.getters['posts'](3);
    assert.fail('Should not be able to access object before commit.');
  } catch (err) {
    assert.isTrue(err.message.length > 0);
  }

  // sync one
  let obj = Object.assign(
    store.getters['posts.template'](),
    { id: 3, title: 'a' },
  );
  store.commit('posts.sync', obj);
  obj = store.getters['posts'](3);
  assert.equal(obj.id, 3);
  assert.equal(obj.title, 'a');

  // sync existing
  obj.title = 'b';
  store.commit('posts.sync', obj);
  obj = store.getters['posts'](3);
  assert.equal(obj.id, 3);
  assert.equal(obj.title, 'b');

  // sync array
  obj.title = 'c';
  store.commit('posts.sync', [obj]);
  obj = store.getters['posts'](3);
  assert.equal(obj.id, 3);
  assert.equal(obj.title, 'c');

});

test("mutations.remove", async () => {

  // fetch data
  await store.dispatch('posts.fetch');

  // remove one
  res = store.getters['posts'](2);
  assert.equal(res.id, 2);
  store.commit('posts.remove', res.id);
  try {
    res = store.getters['posts'](2);
    assert.fail('Should not be able to access removed object.');
  } catch (err) {
    assert.isTrue(err.message.length > 0);
  }

  // remove multiple
  res = store.getters['posts'](1);
  assert.equal(res.id, 1);
  store.commit('posts.remove', res.id);
  try {
    res = store.getters['posts']([1]);
    assert.fail('Should not be able to access removed object.');
  } catch (err) {
    assert.isTrue(err.message.length > 0);
  }

});


test("mutations.clear", async () => {

  // fetch and assert store
  await store.dispatch('authors.fetch');
  res = store.getters['authors']()
  assert.equal(res.length, 2);

  // clear and assert store
  store.commit('authors.clear');
  res = store.getters['authors']()
  assert.equal(res.length, 0);

});
