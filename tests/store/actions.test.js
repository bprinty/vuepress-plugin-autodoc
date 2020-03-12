/**
 * Testing for api actions and data retrieval.
 */

// imports
// -------
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
describe("store.actions", () => {
  let collection;
  let model;

  test("store.fetch", async () => {
    // assert pre-fetch
    collection = store.getters.posts();
    assert.equal(collection.length, 0);
    collection = store.getters.authors();
    assert.equal(collection.length, 0);

    // fetch collection
    collection = await store.dispatch("posts.fetch");
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // get post count
    collection = store.getters.posts();
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // check nested payloads
    assert.equal(collection[0].author.id, 1);

    // get single post
    model = store.getters.posts(1);
    assert.equal(model.id, 1);
  });

  test("store.create", async () => {
    // fetch collection
    await store.dispatch("posts.fetch");

    // get item count
    collection = store.getters.posts();
    assert.equal(collection.length, 2);

    // create new item with id
    model = await store.dispatch("posts.create", {
      title: 'a',
      body: 'aaa',
      author_id: 1,
    });
    assert.equal(model.id, 3);
    assert.equal(model.title, 'a');
    assert.equal(model.author.id, 1);

    // get item count
    collection = store.getters.posts();
    assert.equal(collection.length, 3);

    // get single item
    model = store.getters.posts(3);
    assert.equal(model.title, 'a');
    assert.equal(model.author.id, 1);

    // create new item with nested data
    model = await store.dispatch("posts.create", {
      title: 'b',
      body: 'bbb',
      author: { id: 1 },
    });
    assert.equal(model.id, 4);
    assert.equal(model.title, 'b');
    assert.equal(model.author.id, 1);

    // get item count
    collection = store.getters.posts();
    assert.equal(collection.length, 4);

    // get single item
    model = store.getters.posts(4);
    assert.equal(model.title, 'b');
    assert.equal(model.author.id, 1);

  });

  test("store.update", async () => {
    // fetch collection
    await store.dispatch("authors.fetch");

    // verify existing
    model = store.getters.authors(1);
    assert.equal(model.name, 'Jane Doe');

    // update
    model.name = 'a';
    model = await store.dispatch("authors.update", model);
    assert.equal(model.name, 'a');

    // verify store update
    model = store.getters.authors(1);
    assert.equal(model.name, 'a');

    // update new item with id
    model = await store.dispatch("posts.update", {
      id: 1,
      title: 'a',
      body: 'aaa',
      author_id: 1,
    });
    assert.equal(model.id, 1);
    assert.equal(model.title, 'a');
    assert.equal(model.author.id, 1);

    // update new item with nested data
    model = await store.dispatch("posts.create", {
      title: 'b',
      body: 'bbb',
      author: { id: 1 },
    });
    assert.equal(model.id, 3);
    assert.equal(model.title, 'b');
    assert.equal(model.author.id, 1);

  });

  test("store.get", async () => {
    // fetch item
    model = await store.dispatch("authors.get", 2);
    assert.equal(model.name, 'John Doe');

    // verify getter
    model = store.getters.authors(2);
    assert.equal(model.name, 'John Doe');

    // fetch nested item
    model = await store.dispatch("posts.get", 1);
    assert.equal(model.title, 'Foo');
    assert.equal(model.author.id, 1);

    // TODO: BELOW
    // // get nested payloads
    // model = store.getters.authors(1);
    // assert.equal(model.id, 1);
  });

  test("store.delete", async () => {
    // fetch collection
    await store.dispatch("posts.fetch");

    // verify existing
    model = store.getters.posts(2);
    assert.equal(model.title, 'Bar');

    // delete
    await store.dispatch("posts.delete", 2);

    // verify store update
    model = store.getters.posts(2);
    assert.isUndefined(model);
  });

});


describe("store.invalid.actions", () => {
  let err;
  let model;

  test("store.invalid.create", async () => {
    // check validation
    try {
      await store.dispatch("authors.create", { name: 'a', email: 'a' });
      throw 'Create with invalid data should have failed.';
    } catch(err) {
      assert.equal(err, "`a` is not a valid email.");
    }

    // check mutation
    model = await store.dispatch("posts.create", { title: 'aaa', body: 'a', author_id: 1 });
    assert.equal(model.body, '<div>a</div>');

    // check required
    try {
      await store.dispatch("posts.create", { title: 'aaa', body: 'a' });
      throw 'Required check on create operation failed.';
    } catch(err) {
      assert.equal(err, "Key `author` is required for create and update actions.");
    }
  });

  test("store.invalid.update", async () => {
    await store.dispatch('authors.fetch');
    await store.dispatch('posts.fetch');

    // check validation
    try {
      model = store.getters.authors(1);
      model.email = 'a';
      await store.dispatch("authors.update", model);
      throw 'Create with invalid data should have failed.';
    } catch(err) {
      assert.equal(err, "`a` is not a valid email.");
    }

    // check mutation
    model = store.getters.posts(1);
    model.body = 'a'
    model = await store.dispatch("posts.update", model);
    assert.equal(model.body, '<div>a</div>');

    // check required
    try {
      model = store.getters.posts(1);
      delete model.author;
      await store.dispatch("posts.update", model);
      throw 'Required check on create operation failed.';
    } catch(err) {
      assert.equal(err, "Key `author` is required for create and update actions.");
    }
  });

});


describe("store.singleton.actions", () => {
  let obj;

  test("store.singleton.fetch", async () => {
    // assert pre-fetch
    obj = store.getters.profile();
    assert.isEmpty(obj);

    // fetch singleton
    obj = await store.dispatch("profile.fetch");
    assert.equal(obj.username, 'admin');

    // get singleton
    obj = store.getters.profile();
    assert.equal(obj.username, 'admin');
  });


  test("store.singleton.update", async () => {
    // fetch collection
    await store.dispatch("profile.fetch");

    // verify existing
    obj = store.getters.profile();
    assert.equal(obj.username, 'admin');

    // update
    obj.username = 'other';
    obj = await store.dispatch("profile.update", obj);
    assert.equal(obj.username, 'other');

    // verify store update
    obj = store.getters.profile();
    assert.equal(obj.username, 'other');
  });

  test("store.singleton.get", async () => {
    // get singleton
    obj = await store.dispatch("profile.get");
    assert.equal(obj.username, 'admin');

    // singleton getter
    obj = store.getters.profile();
    assert.equal(obj.username, 'admin');
  });

  test("store.singleton.delete", async () => {
    // fetch singleton
    await store.dispatch("profile.fetch");

    // verify existing
    obj = store.getters.profile();
    assert.equal(obj.username, 'admin');

    // delete
    await store.dispatch("profile.delete");

    // verify store update
    obj = store.getters.profile();
    assert.isEmpty(obj);
  });

});


describe("store.singleton.invalid.actions", () => {
  let err;
  let obj;

  test("store.singleton.invalid.update", async () => {
    await store.dispatch('profile.fetch');

    // check validation
    obj = store.getters.profile();
    obj.username = ' ';
    try {
      await store.dispatch("profile.update", obj);
      assert.fail('Create with invalid data should have failed.');
    } catch(err) {
      assert.equal(err, "Value ` ` for key `username` did not pass validation.");
    }

    // check mutation
    obj = store.getters.profile();
    obj.username = 'NewUser';
    obj = await store.dispatch("profile.update", obj);
    assert.equal(obj.username, 'newuser');

    // check required
    try {
      await store.dispatch("profile.update", {});
      assert.fail('Required check on update operation failed.');
    } catch(err) {
      assert.equal(err, "Key `username` is required for create and update actions.");
    }
  });
});
