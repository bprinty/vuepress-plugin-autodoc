/**
 * Testing for api actions and data retrieval.
 */

// imports
// -------
import { assert } from 'chai';
import server from '../server';
import { Profile, Post, Author } from './models';
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
describe("model.actions", () => {
  let collection;
  let model;

  test("model.fetch", async () => {
    // assert pre-fetch
    collection = Post.query().all();
    assert.equal(collection.length, 0);

    // fetch collection
    collection = await Post.fetch();
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // get post count
    collection = Post.query().all();
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // check nested payloads
    assert.equal(collection[0].author.id, 1);

    // get single post
    model = Post.query(1);
    assert.equal(model.id, 1);
  });

  test("model.create", async () => {
    const author = await Author.get(1);

    // create new item with id
    model = new Post({
      title: 'a',
      body: 'aaa',
      author_id: author.id,
    });
    assert.isUndefined(model.id);
    assert.isUndefined(model.$.title);
    assert.equal(model.title, 'a');
    assert.equal(model.footer, 'footer');
    assert.equal(model.author_id, 1);
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');
    await model.commit();
    assert.equal(model.id, 3);
    assert.equal(model.$.title, 'a');
    assert.equal(model.title, 'a');
    assert.equal(model.footer, 'footer');
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');

    // create new item with nested data
    model = new Post({
      title: 'b',
      body: 'bbb',
      author: { id: author.id },
    });
    assert.isUndefined(model.id);
    // here
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');
    await model.commit();
    assert.equal(model.id, 4);
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');

    // create new item with nested object
    model = new Post({
      title: 'b',
      body: 'bbb',
      author: author,
    });
    assert.isUndefined(model.id);
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');
    await model.commit();
    assert.equal(model.id, 5);
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');

  });

  test("model.update", async () => {

    // verify existing
    await Author.fetch()
    model = Author.query(1);
    assert.equal(model.name, 'Jane Doe');
    assert.equal(model.$.name, 'Jane Doe');

    // update
    model.name = 'a';
    assert.equal(model.name, 'a');
    assert.equal(model.$.name, 'Jane Doe');
    await model.commit();
    assert.equal(model.name, 'a');
    assert.equal(model.$.name, 'a');

    // update nested item with id
    model = await Post.get(1);
    assert.equal(model.title, 'Foo')
    assert.equal(model.$.title, 'Foo')
    assert.equal(model.author.id, 1);
    assert.equal(model.$.author.id, 1);
    model.update({
      title: 'a',
      body: 'aaa',
      author_id: 2,
    });
    assert.equal(model.title, 'a');
    assert.equal(model.$.title, 'Foo');
    assert.equal(model.author.id, 2);
    assert.equal(model.$.author.id, 1);
    await model.commit();
    assert.equal(model.title, 'a');
    assert.equal(model.$.title, 'a');
    assert.equal(model.author.id, 2);
    assert.equal(model.$.author.id, 2);


    // update nested item with model instance
    model = await Post.get(2);
    assert.equal(model.title, 'Bar')
    assert.equal(model.$.title, 'Bar')
    model.update({
      title: 'b',
      body: 'bbb',
      author: Author.query(2),
    });
    assert.equal(model.title, 'b');
    assert.equal(model.$.title, 'Bar');
    assert.equal(model.author.id, 2);
    assert.equal(model.$.author.id, 1);
    await model.commit();
    assert.equal(model.title, 'b');
    assert.equal(model.$.title, 'b');
    assert.equal(model.author.id, 2);
    assert.equal(model.$.author.id, 2);
  });

  test("model.get", async () => {
    // fetch item
    model = await Author.get(1);
    assert.equal(model.name, 'Jane Doe');

    // fetch nested item
    model = await Post.get(1);
    assert.equal(model.title, 'Foo');
    assert.equal(model.author.id, 1);
  });

  test("model.delete", async () => {
    // fetch collection
    await Post.fetch();

    // verify existing
    model = Post.query(2);
    assert.equal(model.id, 2);
    assert.equal(model.title, 'Bar');

    // delete
    await model.delete();

    // verify store update
    model = Post.query(2);
    assert.isUndefined(model);
  });

  test("model.remove", async () => {
    // fetch collection
    await Post.fetch();

    // verify existing
    model = Post.query(2);
    assert.equal(model.id, 2);
    assert.equal(model.title, 'Bar');

    // delete
    await model.remove();

    // verify store update
    model = Post.query(2);
    assert.isUndefined(model);
  });

});

describe("model.invalid.actions", () => {
  let err;
  let model;

  test("model.invalid.create", async () => {
    // check validation
    try {
      model = new Author({ name: 'a', email: 'a' });
      model.commit();
      assert.fail('Create with invalid data should have failed.');
    } catch(err) {
      assert.equal(err, "`a` is not a valid email.");
    }

    // check mutation
    model = new Post({ title: 'aaa', body: 'a', author_id: 1 });
    await model.commit();
    assert.equal(model.body, '<div>a</div>');

    // check required
    try {
      model = new Post({ title: 'aaa', body: 'a' });
      model.commit();
      assert.fail('Required check on create operation failed.');
    } catch(err) {
      assert.equal(err, "Key `author` is required for create and update actions.");
    }
  });

  test("model.invalid.update", async () => {
    await Author.fetch();
    await Post.fetch();

    // check validation
    try {
      model = Author.query(1);
      model.email = 'a';
      await model.commit();
      throw 'Create with invalid data should have failed.';
    } catch(err) {
      assert.equal(err, "`a` is not a valid email.");
    }

    // check mutation
    model = Post.query(1);
    model.body = 'a'
    await model.commit();
    assert.equal(model.body, '<div>a</div>');

    // check required
    try {
      model = Post.query(1);
      delete model.author;
      await model.commit();
      throw 'Required check on create operation failed.';
    } catch(err) {
      assert.equal(err, "Key `author` is required for create and update actions.");
    }
  });

});


describe("model.singleton.actions", () => {
  let obj;

  test("model.singleton.fetch", async () => {
    // assert pre-fetch
    obj = new Profile();
    assert.equal(obj.username, '<anonymous>');

    // fetch singleton
    obj = await Profile.fetch();
    assert.equal(obj.username, 'admin');

    // get singleton
    obj = new Profile();
    assert.equal(obj.username, 'admin');
  });


  test("singleton.update", async () => {
    // fetch collection
    obj = await Profile.fetch();
    assert.equal(obj.username, 'admin');
    assert.equal(obj.$.username, 'admin');

    // update
    obj.username = 'other';
    assert.equal(obj.username, 'other');
    assert.equal(obj.$.username, 'admin');
    await obj.commit();
    assert.equal(obj.username, 'other');
    assert.equal(obj.$.username, 'other');

    // verify store update
    obj = new Profile();
    assert.equal(obj.username, 'other');
    assert.equal(obj.$.username, 'other');
  });

  test("singleton.get", async () => {
    // get singleton
    obj = await Profile.get();
    assert.equal(obj.username, 'admin');

    // singleton getter
    obj = new Profile();
    assert.equal(obj.username, 'admin');
  });

  test("singleton.delete", async () => {
    // fetch singleton
    obj = await Profile.fetch();
    assert.equal(obj.username, 'admin');

    // delete
    await obj.delete();

    // verify store update
    obj = new Profile();
    assert.equal(obj.username, '<anonymous>');
  });

  test("singleton.remove", async () => {
    // fetch singleton
    obj = await Profile.fetch();
    assert.equal(obj.username, 'admin');

    // remove from store
    obj.remove();

    // verify store update
    obj = new Profile();
    assert.equal(obj.username, '<anonymous>');
  });

});

describe("singleton.invalid.actions", () => {
  let err;
  let obj;

  test("singleton.invalid.update", async () => {
    await Profile.fetch();

    // check validation
    obj = new Profile();
    obj.username = ' ';
    try {
      await obj.commit();
      assert.fail('Create with invalid data should have failed.');
    } catch(err) {
      assert.equal(err, "Value ` ` for key `username` did not pass validation.");
    }

    // check mutation
    obj = new Profile();
    obj.username = 'NewUser';
    await obj.commit();
    assert.equal(obj.username, 'newuser');

    // check required
    try {
      obj = new Profile();
      delete obj.username;
      await obj.commit();
      assert.fail('Required check on update operation failed.');
    } catch(err) {
      assert.equal(err, "Key `username` is required for create and update actions.");
    }
  });
});
