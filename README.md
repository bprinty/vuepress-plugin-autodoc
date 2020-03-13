# Vuepress Autodoc

## Overview

VuePress plugin for automatic code documentation via [JSDoc](https://jsdoc.app/) with an API similar to [`sphinx.ext.autodoc`](http://www.sphinx-doc.org/en/master/usage/extensions/autodoc.html).


## Installation

### Install in Project

To use this library in a Vue project, add the package to your package dependencies via:

```bash
npm install --save-dev vuepress-autodoc
```

Or, with [yarn](https://yarnpkg.com/):

```bash
yarn add -D vuepress-autodoc
```


## Quickstart

### Configuration

To use this in documentation for a project, follow the VuePress [guidelines](https://vuepress.vuejs.org/plugin/using-a-plugin.html#use-plugins-from-a-dependency). Here is a quick example:

```javascript
module.exports = {
  plugins: [ 'vuepress-autodoc' ]
}
```

### Referencing Code

Once you've configured VuePress to use this plugin, you can automatically generate API documentation for code in your project using:


```markdown
# API Section

## Full Documentation

::: autodoc

src/index.js

:::


## Documentat Specific Objects

::: autodoc

src/index.js(myFunction)
src/index.js(MyClass)

:::

```

This will automatically render styled API documentation for code elements with JSDoc-compatible docstrings.

This type of dynamic auto-documentation allows developers to be clear in how their API is structured, providing context alongside their API documentation. For example, let's say we have a file in our project that looks like:

```javascript
// contents of src/index.js

/**
 * Example class.
 * @constructor
 * @param {number} number Input number.
 */
export default class Number {
  constructor(number) {
    this.number = number || 0;
  }
}


/**
 * Example add function.
 * @param {number} x First number to add.
 * @param {number} y Second number to add.
 * @return {number} Result of operation.
 */
export function add(x, y) {
  return x + y;
}
```

We can use this plugin to create API docs like:

```markdown
// contents of docs/README.md

...

## API Documentation

Below is a function for adding two numbers:

::: autodoc
src/index.js(add)
:::

And here are number objects you can pass into the function:

::: autodoc
src/index.js(Number)
:::
```
