<script setup lang="ts">
import { data } from '/data/weekly.data'
import formatDate from '/.vitepress/theme/utils/formatDate'
import getSorted from '/.vitepress/theme/utils/getSorted'

const sortedData = getSorted(data)
</script>

<ul>
  <li v-for="item of sortedData">
    <strong><a :href="item.url.split('/').pop()">{{ item.frontmatter.title }}</a></strong><br/>
    <span>{{ formatDate(item.frontmatter.date) }}</span>
  </li>
</ul>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
  font-size: 1.125rem;
  line-height: 1.75;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

li span {
  font-family: var(--vp-font-family-mono);
  font-size: var(--vp-code-font-size);
}
</style>
