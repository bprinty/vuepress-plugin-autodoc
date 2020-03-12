
import _ from 'lodash';

/**
 * Factory function for creating filter callable using
 * specified filter parameters.
 */
function filterFactory(params) {
  return (input) => {
    let match = true;
    _.map(params, (value, key) => {
      if (_.has(input, key)) {
        if(value instanceof RegExp) {
          match &= value.test(input[key]);
        } else {
          match &= input[key] === value;
        }
      }
    });
    return Boolean(match);
  }
}


/**
 * Factory function for creating sort callable using
 * specified sort parameters.
 */
function sortFactory(params) {
  return (a, b) => {
    let diff = 0;
    _.transform(params, (result, key) => {
      if (a[key] < b[key]) {
        diff = -1;
      } else if (a[key] > b[key]) {
        diff = 1;
      }
      return diff == 0;
    }, 0);
    return diff;
  }
}



/**
 * Query clojure operator that allows for a fluid query API.
 *
 * @param {Model} model - Model class to instantiate results with.
 * @param {array} data - Array of query results to operate on.
 */
export function operator(model, data) {
  const cls = model;
  let current = data;

  function operate() {}

  /**
   * Filter data with specified object or filter function.
   *
   * @param {object, function} filter - Filter to apply to data.
   */
  operate.filter = (filter) => {
    // convert input to filter function
    if (_.isPlainObject(filter)) {
      filter = filterFactory(filter);
    }

    // process data
    if (_.isFunction(filter)) {
      current = current.filter(filter);
    }

    // unknown filter
    else {
      throw `No rule for filtering data with input \`${filter}\``;
    }

    return operate;
  };

  /**
   * Filter data that has defined data for specified keys.
   *
   * @param {string, array} keys - Key or array of keys to check
   *     for in model instances.
   */
  operate.has = (keys) => {
    if (!_.isArray(keys)) {
      keys = [keys];
    }
    current = current.filter((item) => {
      let match = true;
      _.map(keys, (key) => {
          match &= !_.isUndefined(item[key]);
      });
      return Boolean(match);
    });
    return operate;
  }

  /**
   * Offset current query by a specified number of records.
   *
   * @param {integer} n - Number of records to offset query by.
   */
  operate.offset = (n) => {
    current = current.slice(n, current.length);
    return operate;
  };

  /**
   * Limit current query by specified number of records.
   *
   * @param {integer} n - Number of records to limit query by.
   */
  operate.limit = (n) => {
    current = current.slice(0, n);
    return operate;
  };

  /**
   * Sort current query records using keys or comparator function.
   *
   * @param {string, array, function} comparator - Key, array of keys,
   *     or comparator function to sort records with.
   */
  operate.order = (comparator) => {
    if (!_.isFunction(comparator)) {
      if (!_.isArray(comparator)) {
        comparator = [comparator];
      }
      comparator = sortFactory(comparator);
    }
    current.sort(comparator);
    return operate;
  };

  /**
   * Shuffle query records.
   */
  operate.shuffle = () => {
    current = _.sampleSize(current, current.length);
    return operate;
  }

  /**
   * Resolve query with all data.
   */
  operate.all = () => {
    return current.map(item => new cls(item));
  };

  /**
   * Resolve query with first item in dataset.
   */
  operate.first = () => {
    if (!current.length) {
      return undefined;
    }
    return new cls(current[0]);
  };

  operate.one = operate.first;

  /**
   * Resolve query with last item in dataset.
   */
  operate.last = () => {
    if (!current.length) {
      return undefined;
    }
    return new cls(current[current.length - 1]);
  };

  /**
   * Resolve query by sampling number of records.
   *
   * @param {integer} n - Number of records to sample.
   */
  operate.sample = (n) => {
    return _.sampleSize(current, n).map(item => new cls(item));
  }

  /**
   * Resolve query by randomly sampling a single record.
   */
   operate.random = () => {
     const result = _.sample(current);
     if (_.isUndefined(result)) {
       return undefined;
     }
     return new cls(result);
   };

   /**
    * Resolve query by returning count of results.
    */
   operate.count = () => {
     return current.length;
   }

   /**
    * Resolve query by returning count of results.
    */
   operate.sum = (name) => {
     return _.sum(_.values(_.mapValues(current, name)));
   }

   /**
    * Resolve query by returning count of results.
    */
   operate.max = (name) => {
     return _.max(_.values(_.mapValues(current, name)));
   }

   /**
    * Resolve query by returning count of results.
    */
   operate.min = (name) => {
     return _.min(_.values(_.mapValues(current, name)));
   }

  return operate;
}
