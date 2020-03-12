module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vuepress Autodoc',
      description: 'Automatic code documentation for vuepress.'
    }
  },
  plugins: {
    '@vuepress/pwa': {
      serviceWorker: true,
      updatePopup: {
        '/': {
          message: "New content is available.",
          buttonText: "Refresh"
        }
      }
    }
  },
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
      }
    }
  }
}
