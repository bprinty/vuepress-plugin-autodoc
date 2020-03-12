
// imports
// -------
import _ from 'lodash';
import axios from 'axios';


// parsers
// -------
/**
 * Parse :id parameter from url (making the assumption
 * that an id is numeric), and return the id and associated
 * abstract endpoint.
 *
 * @param {string} url - Url to parse.
 */
function normalize(url) {
  let id = null;
  let endpoint = url;
  const re = /\/(\d+)/;
  const matches = url.match(re);
  if (matches !== null) {
    id = matches[1];
    endpoint = url.replace(re, '/:id');
  }
  return { id, endpoint };
}


/**
 * Generate promise response for missing resource.
 *
 * @param {string} url - Url to reject.
 */
function NotFound(url) {
  return {
    status: 404,
    message: `URL \`${url}\` not in API`,
  };
}


// classes
// -------
/**
 * Abstract base class for mocking server data. New mock servers
 * can be created by inheriting this class via `extends` and
 * overriding the `data()` and `api()` class methods.
 */
export class MockServer {

  constructor(name) {
    this.name = name || 'mock-server';
    this.db = {};

    // reformat data for internal storage
    _.each(this.data(), (val, key) => {

      // reduce list into dictionary with indices
      if (_.isArray(val)) {
        let idx = 1;
        this.db[key] = val.reduce((obj, item) => {
          item.id = idx;
          obj[idx] = item
          idx += 1;
          return obj;
        }, {});
      }

      // store singleton data
      else {
        this.db[key] = val;
      }

    });

    this._api = this.api();
    this._relationships = this.relationships();
  }

  /**
   * Get model data for specified id, accounting for relationship
   * definitions between models.
   *
   * @param {string} model - Model name.
   * @param {integer} id - Model key/identifier.
   */
  get(model, id) {
    let data = _.clone(this.db[model][id]);

    // nest related data based on relationships spec
    if (_.has(this._relationships, model)) {
      const mapping = _.isArray(this._relationships[model]) ? this._relationships[model] : [this._relationships[model]];
      mapping.forEach((spec) => {
        const collection = _.isString(spec.collection) ? this.db[spec.collection] : spec.collection;
        data[spec.to] = collection[data[spec.from]];
        delete data[spec.from];
      });
    }

    return data;
  }

  /**
   * Generate default request processors for collection
   * endpoints, overriding the `get` and `post` handlers.
   *
   * @param {object} table - MockServer database table to
   *     generate urls for.
   * @param {object} relationships - Relationships to other
   *     models. Takes the form {id_key: this.db.relatedModel}
   */
  collection(name) {
    return {
      get: () => {
        return Object.keys(this.db[name]).map((id) => {
          return this.get(name, id);
        });
      },
      post: (data) => {
        const id = Number(_.max(Object.keys(this.db[name]))) + 1;
        data.id = id;
        this.db[name][id] = data;
        return this.get(name, id);
      },
    };
  }

  /**
   * Generate default request processors for model
   * endpoints, overriding the `get`, `put`, and `delete`
   * handlers.
   *
   * @param {object} table - MockServer database table to
   *     generate urls for.
   */
  model(name) {
    return {
      get: (id) => this.get(name, id),
      put: (id, payload) => {
        const keys = Object.keys(this.db[name][id]);
        this.db[name][id] = Object.assign(this.db[name][id], _.pick(payload, keys));
        return this.get(name, id);
      },
      delete: (id) => {
        delete this.db[name][id];
      },
    };
  };


  /**
   * Method for defining internal database that will
   * be used throughout requests. This method allows
   * users to configure an initial `state` for the database
   * and all internal data models.
   */
  data() {
    return {};
  }

  /**
   * Method returning server endpoints with get/post/put/delete
   * request processing callables.
   */
  api() {
    return {};
  }

  /**
   * Reset internal database for server mock to original state.
   */
  reset() {
    let obj = new this.constructor();
    this.db = obj.db;
    obj = null;
  }

  /**
   * Initialize server mock and create fake callables for
   * all axios requests. This method should be called before tests
   * run or at the beginning of a test session.
   */
  init() {

    let baseUrl = '';

    // GET
    axios.get.mockImplementation((url) => {
      const { id, endpoint } = normalize(baseUrl + url);
      return new Promise((resolve, reject) => {

        // handle invalid urls
        if (!(endpoint in this._api) || this._api[endpoint] === null) {
          reject(NotFound(url));
        }

        // handle missing server methods
        const method = this._api[endpoint].get;
        if(method === undefined){
          reject(NotFound(url));
        }

        // collection request
        if (id === null) {
          resolve({
            status: 200,
            data: method(),
          });
        }

        // model request
        else {

          // reject on missing model
          const result = method(Number(id));
          if (_.isUndefined(result)) {
            reject({
              status: 404,
              message: `Record \`${id}\` not in API Database`,
            });
          }

          // return model
          else {
            resolve({
              status: 200,
              data: result,
            });
          }
        }
      });
    });

    // POST
    axios.post.mockImplementation((url, data) => {
      const { id, endpoint } = normalize(baseUrl + url);
      return new Promise((resolve, reject) => {

        // handle invalid urls
        if (!(endpoint in this._api) || this._api[endpoint] === null) {
          reject(NotFound(url));
        }

        // handle missing server methods
        const method = this._api[endpoint].post;
        if(method === undefined){
          reject(NotFound(url));
        }

        // collection request
        if (!id) {
          resolve({
            status: 201,
            data: method(data),
          });
        }

        // model request
        else {
          resolve({
            status: 200,
            data: method(Number(id), data),
          });
        }
      });
    });

    // PUT
    axios.put.mockImplementation((url, data) => {
      const { id, endpoint } = normalize(baseUrl + url);
      return new Promise((resolve, reject) => {

        // handle invalid urls
        if (!(endpoint in this._api) || this._api[endpoint] === null) {
          reject(NotFound(url));
        }

        // handle missing server methods
        const method = this._api[endpoint].put;
        if(method === undefined){
          reject(NotFound(url));
        }


        // model request
        if (id) {
          resolve({
            status: 200,
            data: method(Number(id), data),
          });
        }

        // singleton request
        else {
          resolve({
            status: 200,
            data: method(data),
          });
        }
      });
    });

    // DELETE
    axios.delete.mockImplementation((url) => {
      const { id, endpoint } = normalize(baseUrl + url);
      return new Promise((resolve, reject) => {

        // handle invalid urls
        if (!(endpoint in this._api) || this._api[endpoint] === null) {
          reject(NotFound(url));
        }

        // handle missing server methods
        const method = this._api[endpoint].delete;
        if(method === undefined){
          reject(NotFound(url));
        }

        // call method
        resolve({
          status: 204,
          data: this._api[endpoint].delete(Number(id))
        });
      });
    });

    // instance creation
    axios.create.mockImplementation((params) => {
      if (_.has(params, 'baseUrl')) {
        baseUrl = params.baseUrl;
      }
      return axios;
    });

    // base handler
    axios.mockImplementation((params) => {
      const before = baseUrl;
      if (_.has(params, 'baseUrl')) {
        baseUrl = params.baseUrl;
      }
      params = Object.assign({method: 'get', data: {}}, params);
      const method = axios[params.method];
      const result = method(params.url, params.data);
      baseUrl = before;
      return result;
    });

  }

}
