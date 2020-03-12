/*
 * All store getters and getter factories assocaited with library.
 */

import _ from 'lodash';

/**
 * Getter for single model definition, supporting
 * multiple, single, or all model retrieval from store.
 *
 * @param {object} state - Store state snapshot.
 * @param {object} config - Configuration for model.
 * @param {integer, array} input - Input to getter. If returning
 *     single instance, this should be the instance id to query.
 *     If returning multiple instances, this should be an array
 *     of instance ids. If not specified, all instances are returned.
 */
export function getCollection(state, config, input) {
  const model = config.name;

  // single
  if ( _.isInteger(input) || _.isString(input) ) {
    return state[model][input];
  }

  // query
  else if (_.isPlainObject(input)) {
    // TODO: QUERY USING PROPERTIES
    throw 'Not Yet Implemented';
  }

  // subset
  else if ( _.isArray(input) ) {
    return input.map(item => state[model][item]);
  }

  // all
  else if (_.isUndefined(input) || _.isNull(input)) {
    return _.values(state[model]);
  }

  // invalid
  else {
    throw `Invalid input to ${model} getter: ${input}`;
  }
}


/**
 * Getter for sampling model definitions from store.
 *
 * @param {object} state - Store state snapshot.
 * @param {object} config - Configuration for model.
 * @param {integer} n - Number of records to sample from store.
 *     Default is `1`.
 */
export function getCollectionSample(state, config, n) {
  const model = config.name;
  n = n || 1;

  // one
  if (n === 1) {
    const idx = _.sample(Object.keys(state[model]));
    return state[model][idx];
  }

  // many
  else {
    const records = _.sampleSize(Object.keys(state[model]), n);
    return records.map(idx => state[model][idx]);
  }
}


/**
 * Getter for returning singleton models from store.
 *
 * @param {object} state - Store state snapshot.
 * @param {object} config - Configuration for model.
 */
export function getSingleton(state, config) {
  return state[config.name];
}


/**
 * Getter for model template, using contract for defaults.
 *
 * @param {object} config - Configuration for model.
 */
export function getTemplate(config) {
  return _.mapValues(config.contract, 'default');
}


/**
 * Getter for model template, using contract for defaults.
 *
 * @param {object} config - Configuration for model.
 */
export function getDefaults(config) {
  return _.reduce(config.contract, (result, spec, key) => {
    if (_.has(spec, 'default')) {
      result[key] = spec.default;
    }
    return result;
  }, {});
}



/**
 * Getter factory function for returning get methods based
 * on model config.
 */
export default function getterFactory(config) {
  return {
    base: config.singleton ? getSingleton : getCollection,
    sample: config.singleton ? getSingleton : getCollectionSample,
    template: getTemplate,
    defaults: getDefaults,
  };
}
