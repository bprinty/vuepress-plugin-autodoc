/**
 * Testing for package.
 */


// imports
// -------
import { assert } from 'chai';
import MarkdownIt from 'markdown-it';
import { autodoc } from '../src/index.js';


// api
// ---
/**
 * Number class.
 */
export class Number {
 /**
  * Create a new number
  * @param {Number} number - Input number.
  */
  constructor(number) {
    this.number = number || 0;
  }

  /**
   * Get the value for the number.
   * @return {Number} The number value.
   */
   value() {
     return this.number;
   }
}

/**
 * Example add function.
 * @param {Number} x - First number to add.
 * @param {Number} y - Second number to add.
 * @return {Number} Result of operation.
 */
export function add(x, y) {
  return x + y;
}

/**
 * Example object placeholder with arguments.
 */
const utils = {
  /**
   * Echo value.
   * @param {String} value - Value to echo.
   */
   echo: value => console.log(value),
}


// config
// ------
console.log(MarkdownIt().use);
const md = MarkdownIt().use(autodoc);


// tests
// -----
describe("render", () => {

  test("render.module", () => {
    console.log(md.render('/autodoc tests/index.test.js add Number'));
    assert.isTrue(false);
  });

  test("render.element", () => {
    assert.isTrue(true);
  });

});
