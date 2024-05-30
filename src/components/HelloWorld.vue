<template>
  <h1>{{ msg }}</h1>
</template>

<script lang="ts" setup>
  defineOptions({
    name: 'HelloWorld',
  });

  defineProps<{ msg: string }>();
</script>
