/*
 * All factory functions for managing nested APIs.
 */


import _ from 'lodash';
import { getModel, fetchCollection, createModel, updateModel, deleteModel } from './actions';


/**
 * Factory function for creating store actions for
 * nested model relationships.
 *
 * @param {string} config - Model configuration.
 */
export function relationFactory(schema, model) {
  const methods = {};

  _.each(schema[model].relations, (config, name) => {
    // normalize inputs
    if (!_.isObject(config)) {
      config = { model: name, url: config };
    }

    // make sure related model is registered
    const relative = config.model;
    const target = config.url;
    if (!_.has(schema, relative)) {
      throw `No model configuration registered for relation \`${relative}\``;
    }

    // fetch/get
    methods[`${model}.${name}.fetch`] = (context, id) => {
      const endpoint = target.replace(':id', id);
      const config = _.clone(schema[relative]);
      config.api = { model: endpoint, collection: endpoint };
      return fetchCollection(context, config);
    };
    methods[`${model}.${name}.get`] = methods[`${model}.${name}.fetch`];

    // create
    methods[`${model}.${name}.create`] = (context, id, data) => {
      const endpoint = target.replace(':id', id);
      const config = _.clone(schema[relative]);
      config.api = { model: endpoint, collection: endpoint };
      return createModel(context, config, data);
    };

    // update
    methods[`${model}.${name}.update`] = (context, id, data) => {
      const endpoint = target.replace(':id', id);
      const config = _.clone(schema[relative]);
      config.api = { model: endpoint, collection: endpoint };
      return updateModel(context, config, data);
    };

    // delete
    methods[`${model}.${name}.delete`] = (context, id, data) => {
      const endpoint = target.replace(':id', id);
      const config = _.clone(schema[relative]);
      config.api = { model: endpoint, collection: endpoint };
      return deleteModel(context, config, data);
    };

  });

  return methods;
}


/**
 * Function for creating callable used by nested action.
 *
 * @param {object} config - Configuration for model.
 * @param {string} endpoint - Nested endpoint for action.
 * @param {string} method - Request method (or alias) to use.
 * @param {boolean} refresh - Boolean detailing if original model should
 *     be re-fetched and committed to store after action resolves.
 */
function constructActionPromise(config, endpoint, method, refresh) {
  if (_.isFunction(endpoint)) {
    return endpoint;
  }
  if (_.has(config.options.methods, method)) {
    method = config.options.methods[method];
  }
  return (context, id, data) => {

    // assertions
    data = data || {};
    if (_.isObject(id)) {
      id = id.id;
    }
    if (_.isUndefined(id)) {
      throw 'Model instance `id` required for dispatching nested action.';
    }

    // return promise
    const url = endpoint.replace(':id', id);
    return config.options.axios({ method, url, data }).then(async (response) => {
      if (refresh) {
        await getModel(context, config, id);
      }
      return response.data;
    });
    return;
  }
}


/**
* Factory function for creating store actions for
* nested model create/update/delete operations.
 *
 * @param {string} config - Model configuration.
 */
export function actionFactory(config) {
  const methods = {};
  const model = config.name;

  _.each(config.actions, (value, key) => {
    value = _.clone(value);

    // normalize inputs
    if (!_.isObject(value)) {
      value = { post: value };
    }

    // check for need to refresh model
    const refresh = Boolean(value.refresh);
    delete value.refresh;

    // create methods for actions
    _.each(value, (endpoint, method) => {
      methods[`${model}.${key}.${method}`] = constructActionPromise(config, endpoint, method, refresh);
    });

    // add default action
    if (Object.keys(value).length == 1) {
      const method = Object.keys(value)[0];
      methods[`${model}.${key}`] = methods[`${model}.${key}.${method}`];
    }
  });

  return methods;
}
