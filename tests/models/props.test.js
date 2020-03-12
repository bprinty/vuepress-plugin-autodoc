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
let model;

test("contract.default", async () => {
  model = await Post.get(1);
  assert.equal(model.title, 'Foo');
  assert.equal(model.footer, 'footer');
});

test("contract.validate", async () => {
  try {
    model = new Author({ name: 'a', email: 'a' });
    await model.commit();
    assert.fail('Create with invalid data should have failed.');
  } catch(err) {
    assert.equal(err, "`a` is not a valid email.");
  }
});

test("contract.required", async () => {
  // missing not required key
  model = new Author({ name: 'a' });
  await model.commit();
  assert.equal(model.name, 'a');
  assert.equal(model.email, null);

  // missing required key
  try {
    model = new Author({ email: 'a@a.com' });
    await model.commit();
    assert.fail('Expected create to fail requirement check.');
  } catch (err) {
    assert.equal(err, 'Key `name` is required for create and update actions.');
  }
});

test("contract.mutate", async () => {
  model = new Post({ title: 'aaa', body: 'a', author_id: 1 });
  await model.commit();
  assert.equal(model.body, '<div>a</div>');
});

test("contract.parse", async () => {
  model = await Post.get(1);
  assert.equal(model.title, 'Foo');
  assert.equal(model.slug, 'foo');
});

test("contract.collapse", async () => {
  model = new Post({
    title: 'aba',
    body: 'bbb',
    author: { id: 2 },
  });
  await model.commit();
  assert.equal(model.title, 'aba');
  assert.equal(model.author.id, 2);
});

test("contract.sync", async () => {
  model = await Post.get(1);
  model.title = 'Bar';
  assert.equal(model.title, 'Bar');
  assert.equal(model.$.title, 'Foo');
  model.sync();
  assert.equal(model.title, 'Foo');
  assert.equal(model.$.title, 'Foo');
});
