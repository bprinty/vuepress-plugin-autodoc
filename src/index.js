/**
 * Main entry point for module
 */

// import fs from 'fs';
import jsdoc from 'jsdoc-api';
// import jsdoc from 'jsdoc-parse';
import doxdox from 'doxdox';

import Plugin from 'markdown-it-regexp';


// export const autodoc = Plugin(
//   /\w/,
//   function (match, utils) {
//     console.log('match', match);
//     const [path, ...modules] = match[1].trim().split(/[ ,;]/);
//     return `<h1>${path}<h1><p>${modules}</p>`;
//   }
// );

function document(path, ...items) {
  const data = jsdoc.explainSync({
    files: [path],
  }).filter(item => item.comment);
  // const data = jsdoc([{
  //   files: [path],
  // }]);
  // console.log(data[2].params);
  // console.log(data[2].params[0].type.names);
  // const elements = data
  //   .filter(item => item.comment);
  // elements.map(element => {
  //   console.log(element.meta.range);
  // });
  // console.log(elements[0].meta.code);
  // console.log(elements[0].meta.range);
  // // console.log(items.length === 0);
  // console.log(items.includes(elements[0].name));
  //   // .filter(item => items.length === 0 || items.includes(item.name));
  // console.log(elements);
  return `<h1>${path}<h1><p>${items}</p>`;
}


export function autodoc(md, options) {
  options  = options || {};
  const regex = options.regex || /\/autodoc\s+(.+)$/;

  md.core.ruler.push('autodoc', state => {
    let unwrap = [];
    state.tokens.forEach((token, idx) => {
      const match = token.content.match(regex);
      if (token.type === 'inline' && match) {

        // render html for doc
        const [path, ...modules] = match[1].trim().split(/[ ,;]/);
        token.type = 'html_inline';
        token.content = document(path, modules);
        token.children = null;

        // unwrap outer tokens
        if (state.tokens[idx-1].type === 'paragraph_open') {
          state.tokens[idx - 1].hidden = true;
        }
        if (state.tokens[idx+1].type === 'paragraph_close') {
          state.tokens[idx + 1].hidden = true;
        }
      }
    });
  });
}

// //
// export function autodoc(md, options) {
//   options  = options || {};
//   const regex = options.regex || /\/autodoc\s+(.+)$/;
//   md.use(Plugin(
//     /autodoc/,
//     function (match, utils) {
//       console.log(match);
//       const [path, ...modules] = match[1].trim().split(/[ ,;]/);
//       return `<h1>${path}<h1><p>${modules}</p>`;
//     }
//   ));
// }

//
//   function process(line) {
//     const m = line.match(regex);
//     const [path, ...modules] = m[1].trim().split(/[ ,;]/);
//     return `
//     <h1>${path}<h1>
//     <p>${modules}</p>
//     `;
//   }
//
//   md.core.ruler.after('inline', 'autodoc', (state) => {
//     state.tokens.forEach((block) => {
//       if (block.type === 'inline' && block.children) {
//         block.children.forEach((token) => {
//           if (token.type === 'text' && regex.test(token.content)) {
//               token.markdown = process(token.content);
//           }
//         });
//       }
//     });
//     let token = new state.Token('text', '', 0);
//     console.log(token);
//     token.content = '<h1>test</h2>';
//     state.tokens.push(token);
//     return true;
//   });
//
//   // md.core.textPostProcess.ruler.push('autodoc', {
//   //   matcher: regex,
//   //   onMatch: function(buffer, matches, state) {
//   //     let token = new state.Token('text', '', 0);
//   //     token.content = 'test' + matches[0];
//   //     buffer.push(token);
//   //   },
//   // });
//
//   return md;
// }


// exports
export default function (options, ctx) {
  return {
    name: 'vuepress-autodoc',

    async ready() {
      // write css for plugin
      // await context.writeTemp('plugins-autodoc.css', style)
    },

    extendMarkdown(md) {
      return md.use(autodoc);
    },
  };
};
