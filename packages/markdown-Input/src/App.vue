<template>
  <div class="v-editor">
    <div class="ve-body">
      <div class="ve-editor">
        <pre
          class="editor-inner markdown-highlighting"
          @keyup="handleInputChange"
          @focus="$emit('focus')"
          @blur="$emit('blur')"
        ></pre>
      </div>
    </div>
  </div>
</template>
<script>
import "./extensions";
import "./services/optional";
import editorSvcFun from "./services/editorSvc";

export default {
  name: "markdown-markup-input",

  props: {
    value: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      editorSvc: new editorSvcFun()
    };
  },

  methods: {
    getContent() {
      return this.editorSvc.clEditor.getContent();
    },

    setContent(text) {
      this.editorSvc.clEditor.setContent(text);
    },

    handleInputChange(e) {
      //esc,left,up,right,down key
      if ([27, 37, 38, 39, 40].includes(e.keyCode)) return;
      this.$emit("input", this.getContent());
    }
  },

  watch: {
    value() {
      this.setContent(this.value || "");
    }
  },

  mounted() {
    const editorElt = this.$el.querySelector(".ve-editor .editor-inner");
    this.editorSvc.init(editorElt);

    this.setContent(this.value || "");
  }
};
</script>
<style type="text/less" lang="less">
@import "less/prism.css";
@import "less/style";
</style>
