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
test("contract.default", async () => {
  let model;

  model = await store.dispatch('posts.get', 1);
  assert.equal(model.title, 'Foo');
  assert.equal(model.footer, 'footer');

});


test("contract.validate", async () => {
  let model;

  try {
    await store.dispatch("authors.create", { name: 'a', email: 'a' });
    throw 'Create with invalid data should have failed.';
  } catch(err) {
    assert.equal(err, "`a` is not a valid email.");
  }

});


test("contract.required", async () => {
  let model;

  // missing not required key
  model = await store.dispatch('authors.create', { name: 'a' });
  assert.equal(model.name, 'a');
  assert.equal(model.email, null);

  // missing required key
  try {
    await store.dispatch('authors.create', { email: 'a@a.com' });
    throw 'Expected create to fail requirement check.';
  } catch (err) {
    assert.equal(err, 'Key `name` is required for create and update actions.');
  }

});


test("contract.mutate", async () => {
  let model;

  model = await store.dispatch("posts.create", { title: 'aaa', body: 'a', author_id: 1 });
  assert.equal(model.body, '<div>a</div>');

});

test("contract.parse", async () => {
  let model;

  model = await store.dispatch('posts.get', 1);
  assert.equal(model.title, 'Foo');
  assert.equal(model.slug, 'foo');

});


test("contract.collapse", async () => {
  let model;

  model = await store.dispatch("posts.create", {
    title: 'aba',
    body: 'bbb',
    author: { id: 2 },
  });
  assert.equal(model.title, 'aba');
  assert.equal(model.author.id, 2);

});
