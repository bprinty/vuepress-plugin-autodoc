

import _ from 'lodash';
import axios from 'axios';
import { Singleton } from './model';
import getterFactory from './constructs/getters';
import mutationFactory from './constructs/mutations';
import dispatchFactory from './constructs/actions';
import { relationFactory, actionFactory, queryFactory } from './constructs/relationships';


/**
 * Parse and normalize option inputs.
 *
 * @params {object} options - Object with options to parse.
 */
function parseOptions(options) {

  // request methods
  options.methods = _.mapValues(options.methods, _.method('toLowerCase'));

  // axios
  if (!_.has(options.axios, 'request')) {
    if (_.isPlainObject(options.axios)) {
      const opts = _.clone(options.axios);
      options.axios = () => opts;
    }
    const getAxiosConfig = options.axios;
    options.axios = (param) => {
      const config = getAxiosConfig();
      return axios({...config, ...param})
    };
  }

  return options;
}


/**
 * Main entrypoint for Vuex Reflect plugin.
 */
export default function Reflect(args) {
  // pull models form input
  let modules = {'_': {}};
  modules._ = args.models || _.omit(args, ['modules', 'options']);
  _.each(args.modules || {}, (models, namespace) => {
    modules[namespace] = _.clone(models);
  });

  // configure global option defaults
  const options = Object.assign({
    axios: {},
    methods: {
      'create': 'post',
      'update': 'put',
      'fetch': 'get',
      'get': 'get',
      'delete': 'delete',
      'patch': 'patch',
    }
  }, args.options || {});

  // default config for model
  const defaults = {
    name: null,
    singleton: false,
    api: {},
    contract: {},
    relations: {},
    actions: {},
    queries: {},
  };

  return (store) => {

    // process each module
    _.each(modules, (models, namespace) => {

      // prefix for namespacing
      const prefix = namespace === '_' ? '' : namespace + '/';

      // global schema for module
      let schema = {};

      // populate initial schema
      Object.keys(models).forEach((key) => {

        // model-based definition
        if (!_.isPlainObject(models[key])) {
          models[key].__store__ = store;
          models[key].__name__ = key;
          models[key].__prefix__ = prefix;
          schema[key] = {
            singleton: models[key].prototype instanceof Singleton,
            api: models[key].api(),
            contract: models[key].props(),
            relations: models[key].relations(),
            actions: models[key].actions(),
            queries: models[key].queries(),
            options: models[key].options(),
          }
        }

        // store-based definition
        else {
          schema[key] = Object.assign(_.clone(defaults), models[key]);
        }
        schema[key].prefix = prefix;
        schema[key].name = key;
        schema[key].options = parseOptions(Object.assign(_.clone(options), schema[key].options));
      });

      // normalize configuration
      schema = _.reduce(schema, (result, config, name) => {

        // normalize contract key definitions into object
        _.each(config.contract, (value, key) => {
          if (!_.isObject(value)) {
            config.contract[key] = { default: value };
          }
        });

        // sanitize contract inputs (accounting for different naming)
        _.each(config.contract, (spec, param) => {
          if (_.has(spec, 'collapse') && _.isBoolean(spec.collapse)) {
            spec.collapse = 'id';
          }
          if (!_.has(spec, 'validate') && _.has(spec, 'validation')) {
            spec.validate = spec.validation;
          }
          if (!_.has(spec, 'mutate') && _.has(spec, 'mutation')) {
            spec.mutate = spec.mutation;
          }
        });

        // normalize queries/actions into single data structure
        _.each(config.queries || {}, (value, key) => {
          if (_.has(config.actions, key)) {
            if (!_.isObject(config.actions[key])) {
              config.actions[key] = {
                create: config.actions[key],
                update: config.actions[key],
                delete: config.actions[key],
              };
            }
            if (!_.isObject(value)) {
              value = { get: value, fetch: value };
            }
            config.actions[key] = Object.assign(config.actions[key], value);
          } else {
            if (!_.isObject(value)) {
              value = { fetch: value };
            }
            config.actions[key] = value;
          }
        });
        delete config.queries;

        // normalize relation inputs
        _.each(config.relations, (value, key) => {
          if (!_.isObject(value)) {
            value = { model: key, url: value };
          }
          if (!_.isString(value.model)) {
            value.model = value.model.__name__
          }
          if (_.isUndefined(value.model)) {
            throw `Invalid model configuration for \`${key}\` relation on \`${name}\` model.`;
          }
          config.relations[key] = value;
        });

        result[name] = config;
        return result;
      }, {});

      // initialize store constructs
      const state = {};
      const getters = {};
      const mutations = {};
      let actions = {};

      // create store modules for each model
      _.map(schema, (config, model) => {

        // create contextualized helpers
        const get = getterFactory(config);
        const mutate = mutationFactory(config);
        const act = dispatchFactory(config);

        // state
        state[model] = config.singleton ? config.default || null : {};

        // getters
        getters[`${model}`] = state => input => get.base(state, config, input);
        getters[`${model}.one`] = state => input => get.base(state, config, input);
        getters[`${model}.all`] = state => input => get.base(state, config, input);
        getters[`${model}.sample`] = state => n => get.sample(state, config, n);
        getters[`${model}.template`] = state => () => get.template(config);
        getters[`${model}.defaults`] = state => () => get.defaults(config);

        // mutations
        mutations[`${model}.clear`] = (state, data) => mutate.clear(state, config, data);
        mutations[`${model}.sync`] = (state, data) => mutate.sync(state, config, data);
        mutations[`${model}.reset`] = (state, id) => mutate.reset(state, config, id);
        mutations[`${model}.remove`] = (state, id) => mutate.remove(state, config, id);

        // actions
        actions[`${model}.fetch`] = context => act.fetch(context, config);
        actions[`${model}.create`] = (context, data) => act.create(context, config, data);
        actions[`${model}.update`] = (context, data) => act.update(context, config, data);
        actions[`${model}.get`] = (context, id) => act.get(context, config, id);
        actions[`${model}.delete`] = (context, id) => act.delete(context, config, id);

        // relations
        actions = _.assign(actions, relationFactory(schema, model), actionFactory(config));
      });

      // register constructs
      store.registerModule(namespace === '_' ? 'models' : namespace, {
        namespaced: namespace !== '_',
        state,
        getters,
        mutations,
        actions,
      });

    });

    return store;
  };
}
