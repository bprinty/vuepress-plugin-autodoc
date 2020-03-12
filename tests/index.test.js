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
import { Profile } from './models/models';


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
  state: {
    ping: null,
  },
  mutations: {
    ping(state) {
      state.ping = 'pong';
    },
  },
  actions: {
    ping(context) {
      return new Promise((resolve) => {
        resolve('pong');
      });
    },
  },
  plugins: [Reflect({
    Profile,
    options: {
      axios: {
        baseUrl: '/missing',
      },
    }
  })],
});


// tests
// -----
describe("config", () => {

  test("config.constructs", () => {
    assert.equal(store.state.ping, null);
    store.commit('ping');
    assert.equal(store.state.ping, 'pong');
    store.dispatch('ping').then((data) => {
      assert.equal(data, 'pong');
    });
  });

  test("config.axios", async () => {
    try {
      await Profile.fetch();
      assert.fail('Axios instance not overridden in requests.');
    } catch (err) {
      assert.equal(err.message, 'URL `/profile` not in API');
    }
  });

});
