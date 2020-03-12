/*
 * All store mutations and mutation factories assocaited with library.
 */


import _ from 'lodash';


/**
 * Action for updating model data and committing
 * results to store.
 *
 * @param {object} state - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} data - Data to use for updating existing model.
 */
function syncModel(state, config, data) {

  // TODO: NEED TO FIGURE OUT HOW TO IMPUTE DEFAULTS FROM CONFIG
  const model = config.name;
  const defaults = {};

  if (!_.isArray(data)) {
    data = [data];
  }
  _.each(data, (item) => {
    if(!_.has(item, 'id')) {
      throw `Sync mutation for model ${model} must include 'id' key in mutation inputs.`;
    }
    state[model][item.id] = Object.assign(
      defaults,              // defaults are overriden by
      state[model][item.id], // current store data, which is overriden by
      item                   // new data inputs
    );
  });

}


/**
 * Action for updating singleton data and committing
 * results to store.
 *
 * @param {object} state - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} data - Data to use for updating existing model.
 */
function syncSingleton(state, config, data) {

  // TODO: NEED TO FIGURE OUT HOW TO IMPUTE DEFAULTS FROM CONFIG
  const model = config.name;
  const defaults = {};

  state[model] = Object.assign(
    defaults,      // defaults are overriden by
    state[model],  // current store data, which is overriden by
    data           // new data inputs
  );
}


/**
 * Action for removing model data from collection,
 * committing changes to store.
 *
 * @param {object} state - Store action context.
 * @param {string} config - Model configuration.
 * @param {integer} data - Id(s) for model to remove from store.
 */
function removeModel(state, config, data) {
  const model = config.name;
  if (!_.isArray(data)) {
    data = [data];
  }
  _.each(data, (id) => {
    if (_.isPlainObject(id)) {
      if (!_.has(id, 'id')) {
        throw `Object ${id} must have 'id' property to be removed from store.`;
      }
      id = id.id;
    }
    delete state[model][id];
  });
}


/**
 * Action for resetting model data from collection to defaults,
 * committing changes to store.
 *
 * @param {object} state - Store action context.
 * @param {string} config - Model configuration.
 * @param {integer} data - Id(s) for model to reset in store.
 */
function resetModel(state, config, data) {

  // TODO: NEED TO FIGURE OUT HOW TO IMPUTE DEFAULTS FROM CONFIG
  const model = config.name;
  const defaults = {};

  if (!_.isArray(data)) {
    data = [data];
  }
  _.each(data, (id) => {
    if (_.isPlainObject(id)) {
      if (!_.has(id, 'id')) {
        throw `Object ${id} must have 'id' property to update record in store.`;
      }
      id = id.id;
    }
    state[model][id] = Object.assign({ id }, defaults);
  });

}


/**
 * Action for removing data and committing singleton
 * defaults back to to store.
 *
 * @param {object} state - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} data - Data to use for updating existing model.
 */
function resetSingleton(state, config, data) {

  // TODO: NEED TO FIGURE OUT HOW TO IMPUTE DEFAULTS FROM CONFIG
  const defaults = {};

  state[config.name] = Object.assign({}, defaults);
}


/**
 * Action for removing all collection data from store.
 *
 * @param {object} state - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} data - Data to use for updating existing model.
 */
function clearCollection(state, config, data) {
  state[config.name] = {};
}


/**
 * Action factory function for returning get methods based
 * on model config.
 */
export default function mutationFactory(config) {
  return {
    sync: config.singleton ? syncSingleton : syncModel,
    remove: config.singleton ? resetSingleton : removeModel,
    reset: config.singleton ? resetSingleton : resetModel,
    clear: config.singleton ? resetSingleton : clearCollection,
  };
}
