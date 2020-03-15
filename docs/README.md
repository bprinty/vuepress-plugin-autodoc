# Vuepress Autodoc Plugin

## Overview

VuePress plugin for automatic code documentation via [JSDoc](https://jsdoc.app/) with an API similar to [`sphinx.ext.autodoc`](http://www.sphinx-doc.org/en/master/usage/extensions/autodoc.html).


## Installation

### Install in Project

To use this library in a Vue project, add the package to your package dependencies via:

```bash
npm install --save-dev vuepress-plugin-autodoc
```

Or, with [yarn](https://yarnpkg.com/):

```bash
yarn add -D vuepress-plugin-autodoc
```


## Quickstart

### Configuration

To use this in documentation for a project, follow the VuePress [guidelines](https://vuepress.vuejs.org/plugin/using-a-plugin.html#use-plugins-from-a-dependency). Here is a quick example:

```javascript
module.exports = {
  plugins: [ 'vuepress-plugin-autodoc' ]
}
```

### Referencing Code

Once you've configured VuePress to use this plugin, you can automatically generate API documentation for code in your project using:


```markdown
# API Section

## Full Documentation

/autodoc src/index.js


## Document Specific Objects

/autodoc src/index.js myFunction MyClass myConst

```

This will automatically render styled API documentation for code elements with JSDoc-compatible docstrings.

This type of dynamic auto-documentation allows developers to be clear in how their API is structured, providing context alongside their API documentation. For example, let's say we have a file in our project that looks like:

```javascript
// contents of src/index.js

/**
* Generic number class
*/
export class Number {

 /**
  * Constructor for object.
  * @param {Number} input - Number to add.
  * @param {String} name - Name for number.
  */
  constructor(input) {
    this.number = input || 0;
    this.name = name;
  }

  /**
   * Return number from class.
   * @return {Number} The number value.
   */
   value() {
     return this.number;
   }

   /**
    * Add another number and return result.
    * @param {Number} other - Other number to add.
    * @return {Number} Other number to add.
    */
    increment(other) {
      return this.number + other;
    }
}

/**
 * Function for adding two numbers.
 * @param {Number} x - Left operand.
 * @param {Number} y - Right operand.
 */
export function add(x, y) {
  return x + y;
}


/**
 * Object with functions and data.
 */
const utils = {
  /**
   * Item in utils array.
   */
   item: false,
  /**
   * Echo value.
   *
   * @param {Number} value - Value to echo.
   */
   echo: value => console.log(value),
}
```

We can render pre-formatted code documentaton for specific items using the following markdown syntax:

```markdown
// contents of docs/README.md

# API Documentation

Here is documentation for specific elements from our module:

/autodoc src/index.js add Number utils

And here are all of the documented elements:

/autodoc src/index.js

```

To show sidebar links for auto-documented items, place a header tag with the name of the item immediately before the `/autodoc` statement:

```markdown
# Classes

## Number

/autodoc src/index.js Number

# Functions

## add

/autodoc src/index.js add

## subtract

/autodoc src/index.js subtract

```

## Example

Here is an example of a class definition:

### Number

/autodoc tests/index.test.js Number

And here is an example of a function definition:

### add

/autodoc tests/index.test.js add

And finally, a constatnt definition:

### utils

/autodoc tests/index.test.js utils

