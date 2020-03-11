<template>
  <div id="app">
    <button @click="open = !open">open</button>
    <markdown-markup-input v-if="open" v-model="text" :isEditing="isEditing" />
    <markdown-markup-input v-model="text1" :isEditing="isEditing" />
  </div>
</template>

<script>
import MarkdownMarkupInput from "./components/MarkdownMarkupInput";
export default {
  name: "app",
  components: {
    MarkdownMarkupInput
  },
  data() {
    return {
      open: true,
      text: "2222",
      text1: null,
      isEditing: true
    };
  },

  created() {
    setTimeout(() => {
      this.text1 = "# aaaaaa";
      this.text = "# nnnnnnn";
    });
  }
};
</script>
