module.exports = {
  extraWatchFiles: [
    '.vuepress/watch',
  ],
  locales: {
    '/': {
      lang: 'en-US',
      title: 'VuePress AutoDoc',
      description: 'Automatic code documentation for VuePress.'
    }
  },
  // plugins: ['../../../src/index.js'],
  theme: '@vuepress/theme-vue',
  themeConfig: {
    repo: 'bprinty/vuepress-autodoc',
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
