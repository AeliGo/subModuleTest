<template>
  <div id="app">
    <div class="container">
      <div id="md" class="col-md-6">
        <h2 class="text-success text-center">Enter Markdown Text</h2>
        <textarea style="height:auto" rows="16" class="form-control markdown-highlighting" v-model="md_text"></textarea>
      </div>
      <div id="preview" class="col-md-6">
        <h2 class="text-success text-center">Preview</h2>
        <div class="well well-sm pre-scrollable" v-html="previewText"></div>
      </div>
    </div>
  </div>
</template>
<script>
let marked = require('marked');

export default {
  name: 'app',
  data() {
    return {
      md_text: '# Title',
    };
  },
  computed: {
    previewText() {
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
      });
      return marked(this.md_text);
    },
  },
};
</script>

<style lang="scss" scoped>
.markdown-highlighting{
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
