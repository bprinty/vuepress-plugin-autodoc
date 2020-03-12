/**
 * Testing for store getters and data retrieval.
 */

// imports
// -------
import _ from 'lodash';
import { assert } from 'chai';
import server from '../server';
import store from './models';


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

test("getters.model", async () => {
  // fetch collection
  await store.dispatch("authors.fetch");

  // all
  res = store.getters.authors();
  assert.equal(res.length, 2);
  assert.equal(res[0].name, 'Jane Doe');

  // subset by id
  res = store.getters.authors([2]);
  assert.equal(res.length, 1);
  assert.equal(res[0].name, 'John Doe');
  res = store.getters.authors([1, 2]);
  assert.equal(res.length, 2);
  assert.equal(res[0].name, 'Jane Doe');

  // one
  res = store.getters.authors(2);
  assert.equal(res.name, 'John Doe');

  // missing
  res = store.getters.authors(9000);
  assert.isUndefined(res);

});

test("getters.sample", async () => {
  // fetch collection
  await store.dispatch("authors.fetch");

  // one
  res = store.getters['authors.sample']();
  assert.isTrue('name' in res);

  // some
  res = store.getters['authors.sample'](2);
  assert.equal(res.length, 2);
  assert.isTrue('name' in res[0]);
});

test("getters.template", async () => {
  res = store.getters['profile.template']();
  assert.isTrue(_.isEqual(res, { username: '<anonymous>' }));

  res = store.getters['authors.template']();
  assert.isTrue(_.isEqual(res, { name: null, email: undefined }));

  res = store.getters['posts.template']();
  assert.isTrue(_.isEqual(res, {
    slug: undefined,
    title: 'My Post Title',
    body: undefined,
    footer: 'footer',
    author: undefined
  }));
});

test("getters.defaults", async () => {
  res = store.getters['profile.defaults']();
  assert.isTrue(_.isEqual(res, { username: '<anonymous>' }));

  res = store.getters['authors.defaults']();
  assert.isTrue(_.isEqual(res, { name: null }));

  res = store.getters['posts.defaults']();
  assert.isTrue(_.isEqual(res, {
    title: 'My Post Title',
    footer: 'footer',
  }));
});
