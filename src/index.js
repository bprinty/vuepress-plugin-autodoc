/**
 * Main entry point for module
 */


// imports
import { execSync } from 'child_process';
import Token from 'markdown-it/lib/token';
import CSS from './index.css';

/**
 * Return badge class for specific object type.
 *
 * @param type - Object type to document.
 */
function badgeClass(type) {
  const data = {
    class: 'tip',
    function: 'error',
    const: 'warning',
    member: 'warning',
  };
  return (type in data) ? data[type] : 'tip';
}


/**
 * Generate html formatting for single parameter.
 *
 * @param param - Object with param data structure.
 */
function formatParam(param) {
  const name = param.name ? `<code>${param.name}</code>` : '';
  const type = param.type ? ' (' + param.type.names.map(x => `<em>${x}</em>`).join(', ') + ')': '';
  const desc = param.description ? ` - ${param.description}` : '';
  return `${name}${type}${desc}`;
}


/**
 * Generate formatted html for single component.
 *
 * @param data - Structured data to generate html from.
 */
function html(data, nested) {
  nested = nested || false;
  const result = [];
  let cls = badgeClass(data.type);
  let call = `${data.name}`;
  if (['class', 'function'].includes(data.type)) {
    call += `(`;
    if (data.params) {
      call += data.params.map(x => x.name).join(', ');
    }
    call += `)`;
  }

  // header
  const htag = nested ? 'h4' : 'h3';
  const anchor = data.name.toLowerCase();
  result.push(`<${htag} id="${anchor}">`);
  result.push(` <a href="#${anchor}" class="header-anchor">#</a>`);
  result.push(` <span class="badge ${cls}" style="vertical-align: top;">${data.type}</span>`);
  result.push(` <code>${call}</code>`);
  result.push(`</${htag}>`);

  // description
  if (data.description) {
    result.push(`<blockquote><p>${data.description}</p></blockquote>`);
  }

  // parameters
  if (data.params && data.params.length > 0) {
    result.push(`<blockquote>`);
    result.push(`<p><strong>Parameters</strong></p>`);
    result.push(`<ul>`);
    data.params.forEach((param) => {
      const parsed = formatParam(param);
      result.push(`<li>${parsed}</li>`);
    });
    result.push(`</ul>`);
    result.push(`</blockquote>`);
  }

  // returns
  if (data.returns && data.returns.length > 0) {
    result.push(`<blockquote>`);
    result.push(`<p><strong>Returns</strong></p>`);
    result.push(`<ul>`);
    data.returns.forEach((param) => {
      const parsed = formatParam(param);
      result.push(`<li>${parsed}</li>`);
    });
    result.push(`</ul>`);
    result.push(`</blockquote>`);
  }

  // nested
  if (data.nested) {
    Object.keys(data.nested).forEach((key) => {
      cls = badgeClass(data.nested[key].type);
      result.push(`<blockquote class="scoped ${cls}">`);
      result.push(html(data.nested[key], true));
      result.push(`</blockquote>`);
    });
  }

  return result.join('\n');
}


/**
 * Use jsdoc cli to parse specified files.
 *
 * @param path - Path to file.
 */
function explain(path) {
  const proc = execSync(`jsdoc --explain ${path}`);
  return JSON.parse(proc.toString());
}


/**
 * Read file with jsdoc and return data structure
 * for formatting results. This method will automatically
 * nest configuration for related modules (classes with methods, etc...)
 *
 * @param {String} path - Path to file.
 */
function read(path) {
  const data = explain(path).filter(item => item.comment);
  const parsed = {};
  data.forEach((item) => {
    // construct data from item
    const obj = {
      name: item.name,
      type: item.kind,
      description: item.classdesc || item.description,
      line: item.meta.lineno,
      path: item.meta.path,
      filename: item.meta.filename,
      returns: item.returns,
      params: item.params,
      nested: {},
    };

    // handle constructor methods
    if (obj.name in parsed) {
      parsed[obj.name].type = item.kind ? item.kind : obj.type;
      parsed[obj.name].params = item.params ? item.params : obj.params;
      parsed[obj.name].returns = item.returns ? item.returns : obj.returns;
      parsed[obj.name].description = obj.description ? obj.description : item.description;

    // handle nesting
    } else if (item.memberof in parsed) {
      parsed[item.memberof].nested[obj.name] = obj;

    // save new base object
    } else {
      parsed[item.name] = obj;
    }
  });

  return parsed;
}


/**
 * Markdown-it plugin for automatic code documentation
 * using JSDoc3 conventions.
 * @param md - Markdown object to extend.
 * @param options - Options for plugin.
 */
function autodoc(md, options) {
  options = options || {};
  const cache = {};
  const regex = options.regex || /\/autodoc\s+(.+)$/;
  let css = options.css || CSS;
  css = `\n\n<style>\n${css}\n</style>\n\n`;
  let documented = false;

  // add markdown-it rule for plugin
  md.core.ruler.push('autodoc', (state) => {
    state.tokens.forEach((token, idx) => {
      // process inline tokens
      const match = token.content.match(regex);
      if (token.type === 'inline' && match) {
        let [path, ...modules] = match[1].trim().split(/[ ,;]/);

        // read data into cache
        if (!(path in cache)) {
          cache[path] = read(path);
        }

        // figure out modules to document
        const data = cache[path];
        if (!modules.length) {
          modules = Object.keys(data);
        }

        // render html for doc
        documented = true;
        token.content = modules.map((key) => {
          if (!(key in data)) {
            throw new Error(`Autodoc: could not find export \`${key}\` in file \`${path}\``);
          }
          return html(data[key]);
        }).join('\n');
        token.type = 'html_inline';
        token.markdown = modules.join(', ');
        token.children = null;

        // hide adjacent header items (used for sidebar)
        if ((idx - 4) >= 0) {
          if (
            (state.tokens[idx - 4].type === 'heading_open')
         && (state.tokens[idx - 3].type === 'inline')
         && (state.tokens[idx - 2].type === 'heading_close')) {
            let hide = false;
            state.tokens[idx - 3].children.forEach(({ content }) => {
              if (modules.includes(content)) {
                hide = true;
              }
            });
            if (hide) {
              state.tokens[idx - 3].children = [];
              state.tokens[idx - 4].hidden = true;
              state.tokens[idx - 2].hidden = true;
            }
          }
        }

        // hide outer paragraph tokens
        if (state.tokens[idx - 1].type === 'paragraph_open') {
          state.tokens[idx - 1].hidden = true;
        }
        if (state.tokens[idx + 1].type === 'paragraph_close') {
          state.tokens[idx + 1].hidden = true;
        }
      }
    });

    // add extra to ken for autodoc css
    if (documented) {
      const style = new Token('html_inline', '', 0);
      style.content = css;
      style.children = null;
      state.tokens.push(style);
    }
  });
}


// exports
export default (options) => {
  options = options || {};
  return {
    name: 'vuepress-autodoc',
    extendMarkdown: (md) => {
      md.set({ breaks: true });
      md.use(autodoc, { css: options.css || CSS });
    },
  };
};
