/*
 * All store actions and action factories assocaited with library.
 */


// imports
import _ from 'lodash';


// config
_.templateSettings.interpolate = /\${([\s\S]+?)}/g;


/**
 * Helper function for processing data payload according
 * to contract spec. This function will traverse data entries,
 * applying both validation and mutations specified in the
 * contract definition. Validation failures will throw a validation
 * error.
 *
 * @param {object} contract - Contract specifying how data should
 *     be processed.
 * @param {object} data - Data to process.
 */
function formatPush(contract, data) {
  return _.reduce(contract, (result, spec, key) => {

    // check required keys
    if (_.has(spec, 'required') && spec.required) {
      if (_.isNil(result[key] || result[spec.to])) {
        throw `Key \`${key}\` is required for create and update actions.`;
      }
    }

    // return if contract param not in data
    if (!_.has(result, key)) {
      return result;
    }
    let value = result[key];

    // if collapse is specified and the data has the key
    if (_.has(spec, 'collapse') && _.isObject(value)) {

      // input doesn't have collapseable data
      if (!_.has(value, spec.collapse)) {
        const msg = _.template('Could not collapse input for `${key}` using key `${collapse}` from data `${value}`');
        throw msg({ key, value, collapse: spec.collapse });
      }

      // collapse and remove original data
      value = value[spec.collapse];
      result[key] = value;
    }

    // cast type (if not model type)
    if (_.has(spec, 'type')) {
      if (_.isFunction(spec.type) && !_.isUndefined(value)) {
        // TODO: ADD NESTED PAYLOAD TO THE STORE see Post.author
        value = spec.type(value);
      }
    }

    // validate inputs
    if (_.has(spec, 'validate')){
      const check = spec.validate.check || spec.validate;
      const msg = _.template(spec.validate.message || 'Value `${value}` for key `${key}` did not pass validation.');
      const valid = check instanceof RegExp ? check.test(value) : check(value);
      if (!valid) {
        throw msg({ value, key });
      }
    }

    // mutation
    if (_.has(spec, 'mutate')) {
      if (!_.isUndefined(value)) {
        value = spec.mutate(value);
        result[key] = value;
      }
    }

    // rename request param via `to` configuration
    if (_.has(spec, 'to')) {
      if (spec.to) {
        result[spec.to] = value;
      }
      delete result[key];
      key = spec.to;
    }

    return result;
  }, _.clone(data));
}


/**
 * Helper function for processing data payload according
 * to contract spec. This function will apply parsing rules
 * and name remapping logic to data received from requests..
 *
 * @param {object} contract - Contract specifying how data should
 *     be processed.
 * @param {object} data - Data to process.
 */
function formatPull(contract, data) {

  // expand data with contract renaming
  const mapping = _.reduce(contract, (result, spec, param) => {
    result[spec.from || param] = param;
    data[param] = data[spec.from || param] || spec.default;
    return result;
  }, {});

  // process payload from defaults
  const processed = _.reduce(data, (result, value, key) =>{

    // process from
    const target = mapping[key] || key;

    // parse result
    if (_.has(contract[target], 'parse')) {
      value = contract[target].parse(value);
    }

    // store reformatted result
    result[target] = value;
    return result;
  }, _.mapValues(contract, 'default'));

   return processed;
}


/**
 * Action for fetching model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 */
export function fetchCollection(context, config) {

  // use fetch or collection config
  const model = config.name;
  let action = config.api.fetch || config.api.collection;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'fetch' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    const params = { method: 'get', url: action };
    action = config.options.axios(params).then(response => response.data);
  }

  // commit data after promise resolves with data
  function commit(item) {
    const processed = formatPull(config.contract, item);
    context.commit(`${model}.sync`, processed);
    return context.getters[model](processed.id);
  }
  return action.then((collection) => {
    if (!_.isArray(collection)) {
      return commit(collection);
    }
    return collection.map(data => commit(data));
  });

}

/**
 * Action for fetching singleton model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 */
export function fetchSingleton(context, config) {

  // use fetch, get, or model config
  const model = config.name;
  let action = config.api.fetch || config.api.get || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'fetch' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    const params = { method: 'get', url: action };
    action = config.options.axios(params).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
    return context.getters[model]();
  });

}


/**
 * Action for creating model and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} data - Data to use for creating model.
 */
export function createModel(context, config, data) {

  // use create or collection config
  const model = config.name;
  let action = config.api.create || config.api.collection;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'create' option.`;
  }

  // process inputs and apply mutations
  const payload = formatPush(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    const params = { method: 'post', url: action, data: payload };
    action = config.options.axios(params).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
    return context.getters[model](processed.id);
  });
}


/**
 * Action for fetching model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} id - Id for model to get.
 */
export function getModel(context, config, id) {

  // use get or model config
  const model = config.name;
  let action = config.api.get || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'get' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    action = action.replace(':id', id)
    const params = { method: 'get', url: action };
    action = config.options.axios(params).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
    return context.getters[model](id);
  });
}

/**
 * Action for updating model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} data - Data to use for updating existing model.
 */
export function updateModel(context, config, data) {

  // use update or model config
  const model = config.name;
  let action = config.api.update || config.api.model;

  // assert id and actions exist
  if (!_.has(data, 'id')) {
    throw `Update action for model ${model} must include 'id' key.`;
  }
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'update' option.`;
  }

  // process inputs and apply mutations
  const payload = formatPush(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    action = action.replace(':id', data.id)
    const params = { method: 'put', url: action, data: payload };
    action = config.options.axios(params).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
    return context.getters[model](processed.id);;
  });
}


/**
 * Action for updating singleton data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} data - Data to use for updating existing model.
 */
export function updateSingleton(context, config, data) {

  // use update or model config
  const model = config.name;
  let action = config.api.update || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Singleton '${model}' has no configuration for 'update' option.`;
  }

  // process inputs and apply mutations
  const payload = formatPush(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    const params = { method: 'put', url: action, data: payload };
    action = config.options.axios(params).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
    return context.getters[model]();
  });
}


/**
 * Action for updating model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {integer} id - Id of model to delete.
 */
export function deleteModel(context, config, id) {

  // use update or model config
  const model = config.name;
  let action = config.api.delete || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'delete' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    action = action.replace(':id', id)
    const params = { method: 'delete', url: action };
    action = config.options.axios(params).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.remove`, id);
    return;
  });
}


/**
 * Action for deleting singleton data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {integer} id - Id of model to delete.
 */
export function deleteSingleton(context, config) {

  // use delete or model config
  const model = config.name;
  let action = config.api.delete || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Singleton '${model}' has no configuration for 'delete' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    const params = { method: 'delete', url: action };
    action = config.options.axios(params).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.reset`);
    return;
  });
}


/**
 * Action factory function for returning get methods based
 * on model config.
 */
export default function dispatchFactory(config) {
  return {
    fetch: config.singleton ? fetchSingleton : fetchCollection,
    create: config.singleton ? createModel : createModel,
    get: config.singleton ? fetchSingleton : getModel,
    update: config.singleton ? updateSingleton : updateModel,
    delete: config.singleton ? deleteSingleton : deleteModel,
  };
}
