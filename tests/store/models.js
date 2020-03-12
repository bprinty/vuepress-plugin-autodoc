
// import
import Vue from 'vue';
import Vuex from 'vuex';
import v from 'validator';
import { Model, Reflect } from '../../src/index';


/**
 * Profile store model.
 *
 * @param {string} username - Profile username.
 */
export const profile = {
  singleton: true,
  default: {},
  api: {
    fetch: '/profile',
    update: '/profile',
    delete: '/profile',
  },
  contract: {
    /**
     * Profile username
     */
     username: {
       required: true,
       default: '<anonymous>',
       validate: value => !/\s/g.test(value),
       mutate: value => value.toLowerCase(),
       type: String,
     }
  }
}


/**
 * Author store model.
 *
 * @param {string} name - Author name.
 * @param {string} email - Author email.
 */
export const authors = {
  api: {
    fetch: '/authors',
    create: '/authors',
    get: '/authors/:id',
    update: '/authors/:id',
  },
  contract: {
    /**
     * Author name.
     */
    name: {
      default: null,
      required: true,
      type: String,
    },
    /**
     * Author email.
     */
    email: {
      type: String,
      validate: {
        check: v.isEmail,
        message: '`${value}` is not a valid email.',
      },
    },
  },
  relations: {
    posts: {
      model: 'posts',
      url: '/authors/:id/posts',
    }
  }
};


/**
 * Post model.
 *
 * @param {string} title - Post title.
 * @param {string} body - Post body text.
 * @param {string} author_id - ID for linked post author.
 */
export const posts = {
  api: {
    collection: '/posts',
    model: '/posts/:id',
  },
  contract: {
    /**
     * Local parameter (not sent to server but available in store)
     */
    slug: {
      parse: value => value.toLowerCase().replace(' ', '-'),
      from: 'title',
      to: false,
    },
    /**
     * Post title.
     */
    title: {
      default: 'My Post Title',
      required: true,
      type: String,
    },
    /**
     * Post body
     */
    body: {
      type: String,
      mutate: value => `<div>${value}</div>`,
    },
    /**
     * Local parameter for testing defaults.
     */
    footer: {
      default: 'footer',
      to: false,
    },
    /**
     * Linked post author. On the client side, this property
     * will contain a nested Author model. During post requests,
     * this property will collapse the nested model into `author_id`.
     */
    author: {
      required: true,
      model: 'authors',
      to: 'author_id',
      collapse: true,
    },
  },
  relations: {
    author: {
      model: 'authors',
      url: '/posts/:id/author',
    }
  },
  actions: {
    archive: {
      post: '/posts/:id/archive',
      refresh: true,
    },
    history: '/posts/:id/history',
  },
  queries: {
    history: '/posts/:id/history',
  },
};

// store
Vue.use(Vuex);
export default new Vuex.Store({
  plugins: [
    Reflect({
      profile,
      authors,
      posts,
    })
  ],
});
