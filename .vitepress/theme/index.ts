import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CustomLayout from './layouts/CustomLayout.vue'
import Figure from './components/Figure.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app, router, siteData }) {
    app.component('Figure', Figure)
  },
} satisfies Theme
