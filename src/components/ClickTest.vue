<template>
  <div id="app">
    <markdown-markup-input v-model="md_text" />
  </div>
</template>
<script>
export default {
  name: 'app',
  data() {
    return {
      md_text: '# Title',
    };
  },
};
</script>

<style lang="scss" scoped>
.markdown-highlighting {
  .h1,
  .h2,
  .h3,
  .h4,
  .h5,
  .h6 {
    font-weight: bold;
  }

  .h1 {
    font-size: 2em;
  }

  .h2 {
    font-size: 1.5em;
  }

  .h3 {
    font-size: 1.17em;
  }

  .h4 {
    font-size: 1em;
  }

  .h5 {
    font-size: 0.83em;
  }

  .h6 {
    font-size: 0.75em;
  }
}
</style>
