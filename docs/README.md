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

We can render pre-formatted code documentation for specific items using the following markdown syntax:

```markdown
// contents of docs/README.md

# API Documentation

Here is documentation for specific elements from our module:

/autodoc src/index.js add Number utils

And here are all of the documented elements:

/autodoc src/index.js

```

## Example

See below for rendered autodoc documentation from the code examples above:

<div class="autodoc">
<h3 id="Number">
 <a href="#Number" class="header-anchor">#</a>
 <span class="badge tip" style="vertical-align: top;">class</span>
 <code>Number(input, name)</code>
</h3>
<blockquote><p>Generic number class</p></blockquote>
<blockquote>
<p><strong>Parameters</strong></p>
<ul>
<li><code>input</code> (<em>Number</em>) - Number to add.</li>
<li><code>name</code> (<em>String</em>) - Name for number.</li>
</ul>
</blockquote>
<blockquote class="scoped error">
<div class="autodoc">
<h4 id="value">
 <a href="#value" class="header-anchor">#</a>
 <span class="badge error" style="vertical-align: top;">function</span>
 <code>value()</code>
</h4>
<blockquote><p>Return number from class.</p></blockquote>
<blockquote>
<p><strong>Returns</strong></p>
<ul>
<li> (<em>Number</em>) - The number value.</li>
</ul>
</blockquote>
</div>
</blockquote>
<blockquote class="scoped error">
<div class="autodoc">
<h4 id="increment">
 <a href="#increment" class="header-anchor">#</a>
 <span class="badge error" style="vertical-align: top;">function</span>
 <code>increment(other)</code>
</h4>
<blockquote><p>Add another number and return result.</p></blockquote>
<blockquote>
<p><strong>Parameters</strong></p>
<ul>
<li><code>other</code> (<em>Number</em>) - Other number to add.</li>
</ul>
</blockquote>
<blockquote>
<p><strong>Returns</strong></p>
<ul>
<li> (<em>Number</em>) - Other number to add.</li>
</ul>
</blockquote>
</div>
</blockquote>
</div>
<div class="autodoc">
<h3 id="add">
 <a href="#add" class="header-anchor">#</a>
 <span class="badge error" style="vertical-align: top;">function</span>
 <code>add(x, y)</code>
</h3>
<blockquote><p>Function for adding two numbers.</p></blockquote>
<blockquote>
<p><strong>Parameters</strong></p>
<ul>
<li><code>x</code> (<em>Number</em>) - Left operand.</li>
<li><code>y</code> (<em>Number</em>) - Right operand.</li>
</ul>
</blockquote>
</div>
<div class="autodoc">
<h3 id="utils">
 <a href="#utils" class="header-anchor">#</a>
 <span class="badge tip" style="vertical-align: top;">constant</span>
 <code>utils</code>
</h3>
<blockquote><p>Object with functions and data.</p></blockquote>
<blockquote class="scoped warning">
<div class="autodoc">
<h4 id="item">
 <a href="#item" class="header-anchor">#</a>
 <span class="badge warning" style="vertical-align: top;">member</span>
 <code>item</code>
</h4>
<blockquote><p>Item in utils array.</p></blockquote>
</div>
</blockquote>
<blockquote class="scoped error">
<div class="autodoc">
<h4 id="echo">
 <a href="#echo" class="header-anchor">#</a>
 <span class="badge error" style="vertical-align: top;">function</span>
 <code>echo(value)</code>
</h4>
<blockquote><p>Echo value.</p></blockquote>
<blockquote>
<p><strong>Parameters</strong></p>
<ul>
<li><code>value</code> (<em>Number</em>) - Value to echo.</li>
</ul>
</blockquote>
</div>
</blockquote>
</div>

<style>
.badge {
  display: inline-block;
  font-size: 20px;
  font-family: monospace;
  height: 28px;
  line-height: 28px;
  border-radius: 3px;
  padding: 0 6px;
  color: #fff;
  background-color: #42b983;
}
.scoped .badge,
blockquote .badge {
  font-size: 15px;
  height: 23px;
  line-height: 23px;
}
.badge.warning {
  background-color: #e7c000;
}
.badge.error {
  background-color: #da5961;
}
.badge.tip {
  background-color: #42b983;
}
blockquote.scoped.warning {
  border-color: #e7c000;
}
blockquote.scoped.error {
  border-color: #da5961;
}
blockquote.scoped.tip {
  border-color: #42b983;
}

</style>
