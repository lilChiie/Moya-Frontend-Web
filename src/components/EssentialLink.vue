<template>
  <q-expansion-item
    v-if="props.children && props.children.length"
    :icon="props.icon"
    :label="props.title"
    :caption="props.caption"
    group="menu"
    expand-separator
  >
    <q-list class="q-pl-sm">
      <EssentialLink
        v-for="child in props.children"
        :key="child.title"
        v-bind="child"
      />
    </q-list>
  </q-expansion-item>

  <q-item
    v-else
    clickable
    v-bind="linkProps"
  >
    <q-item-section
      v-if="props.icon"
      avatar
    >
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
      <q-item-label caption v-if="props.caption">{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'EssentialLink',
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: '',
  },

  link: {
    type: String,
    default: '#',
  },

  icon: {
    type: String,
    default: '',
  },

  children: {
    type: Array,
    default: () => [],
  },
})

const linkProps = computed(() => {
  if (props.link && props.link.startsWith('http')) {
    return {
      tag: 'a',
      target: '_blank',
      href: props.link,
    }
  }
  return {
    to: props.link,
  }
})
</script>
