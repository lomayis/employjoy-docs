import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'EmployJoy Partner API',
  description: 'Partner API v1 documentation for integrating with EmployJoy',
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap', rel: 'stylesheet' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'EmployJoy API',
    nav: [
      { text: 'Docs', link: '/getting-started' },
      { text: 'API Reference', link: '/openapi' },
      { text: 'Changelog', link: '/changelog' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Authentication', link: '/authentication' },
        ],
      },
      {
        text: 'Endpoints',
        items: [
          { text: 'Jobs', link: '/jobs' },
          { text: 'Applications', link: '/applications' },
        ],
      },
      {
        text: 'Webhooks',
        items: [
          { text: 'Events & Verification', link: '/webhooks' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Errors', link: '/errors' },
          { text: 'Rate Limits', link: '/rate-limits' },
          { text: 'Pagination', link: '/pagination' },
          { text: 'Sandbox / Test Mode', link: '/sandbox' },
          { text: 'OpenAPI Spec', link: '/openapi' },
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lomayis/employjoy-docs' },
    ],
    footer: {
      message: 'Partner API v1',
      copyright: '© 2026 EmployJoy.ai · partnerships@employjoy.ai',
    },
    search: {
      provider: 'local',
    },
  },
})
