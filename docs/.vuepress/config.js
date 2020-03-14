module.exports = {
  base: '/vuepress-plugin-autodoc/',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'VuePress AutoDoc',
      description: 'Automatic code documentation for VuePress.'
    }
  },
  theme: '@vuepress/theme-vue',
  plugins: [require('../../dist/index.js')],
  themeConfig: {
    repo: 'bprinty/vuepress-plugin/autodoc',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    sidebarDepth: 3,
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        lastUpdated: 'Last Updated',
        editLinkText: 'Edit this page on GitHub',
        sidebar: ['/'],
      }
    }
  }
}
