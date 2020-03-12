/**
 * Testing for package.
 */


// imports
// -------
import Vue from 'vue';
import Vuex from 'vuex';
import { assert } from 'chai';
import server from './server';
import { Reflect } from '../src/index';
import { Profile, Post, Author } from './models/models';


// config
// ------
jest.mock('axios');
server.init();
beforeEach(() => {
  server.reset();
});


// plugin setup
// ------------
Vue.use(Vuex);
const store = new Vuex.Store({
  plugins: [Reflect({
    profile: Profile,
    modules: {
      blog: {
        authors: Author,
        posts: Post,
      }
    },
  })],
});


// tests
// -----
describe("module", () => {

  test("module.models", async () => {
    const profile = await Profile.fetch();
    assert.equal(profile.username, 'admin');

    const post = await Post.get(1);
    assert.equal(post.title, 'Foo');

    const author = await Author.get(1);
    const nested = await author.posts.fetch();
    assert.equal(nested[0].title, 'Foo');

    const action = await post.history.fetch();
    assert.equal(action.length, 2);
  });

  test("module.store", async () => {
    const profile = await store.dispatch('profile.fetch');
    assert.equal(profile.username, 'admin');

    const post = await store.dispatch('blog/posts.get', 1);
    assert.equal(post.title, 'Foo');

    const nested = await store.dispatch('blog/authors.posts.fetch', 1);
    assert.equal(nested[0].title, 'Foo');

    const action = await store.dispatch('blog/posts.history.fetch', 1);
    assert.equal(action.length, 2);
  });

});
