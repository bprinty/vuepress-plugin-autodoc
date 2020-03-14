/**
 * Testing for package.
 */


// imports
// -------
import fs from 'fs';
import { assert } from 'chai';
import MarkdownIt from 'markdown-it';
import { autodoc } from '../src/index.js';


// api
// ---
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


// config
// ------
const md = MarkdownIt().use(autodoc);


// tests
// -----
describe("render", () => {
  let result;

  test("render.function", () => {
    result = md.render('/autodoc tests/index.test.js add');
    assert.isTrue(result.includes('<div class="autodoc"'));
    assert.isTrue(result.includes('<h3 id="add"'));
    assert.isTrue(result.includes('<style>'));
  });

  test("render.const", () => {
    result = md.render('/autodoc tests/index.test.js utils');
    assert.isTrue(result.includes('<div class="autodoc"'));
    assert.isTrue(result.includes('<h3 id="utils"'));
    assert.isTrue(result.includes('<h4 id="item"'));
    assert.isTrue(result.includes('<h4 id="echo"'));
    assert.isTrue(result.includes('<style>'));
  });

  test("render.class", () => {
    result = md.render('/autodoc tests/index.test.js Number');
    assert.isTrue(result.includes('<div class="autodoc"'));
    assert.isTrue(result.includes('<h3 id="Number"'));
    assert.isTrue(result.includes('<h4 id="value"'));
    assert.isTrue(result.includes('<h4 id="increment"'));
    assert.isTrue(result.includes('<style>'));
  });

  test("render.multiple", () => {
    result = md.render('/autodoc tests/index.test.js add Number');
    assert.isTrue(result.includes('<div class="autodoc"'));
    assert.isTrue(result.includes('<h3 id="Number"'));
    assert.isTrue(result.includes('<h4 id="value"'));
    assert.isTrue(result.includes('<h4 id="increment"'));
    assert.isTrue(result.includes('<h3 id="add"'));
    assert.isTrue(result.includes('<style>'));
  });

  test("render.module", () => {
    result = md.render('/autodoc tests/index.test.js');
    assert.isTrue(result.includes('<div class="autodoc"'));
    assert.isTrue(result.includes('<h3 id="Number"'));
    assert.isTrue(result.includes('<h4 id="value"'));
    assert.isTrue(result.includes('<h4 id="increment"'));
    assert.isTrue(result.includes('<h3 id="add"'));
    assert.isTrue(result.includes('<h3 id="utils"'));
    assert.isTrue(result.includes('<h4 id="item"'));
    assert.isTrue(result.includes('<h4 id="echo"'));
    assert.isTrue(result.includes('<style>'));

    // update readme to show rendered result
    let readme = fs.readFileSync(__dirname + '/../README.md', 'utf-8');
    let idx = readme.indexOf('<div class="autodoc"');
    idx = idx === -1 ? readme.length : idx;
    readme = readme.slice(0, idx);
    readme += result;
    fs.writeFileSync(__dirname + '/../README.md', readme, 'utf-8');
  });

});
