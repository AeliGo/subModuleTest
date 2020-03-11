<template>
  <input class="input" v-model="inputValue" v-money="money" autocomplete="none" tabindex="1" />
</template>

<script>
import { VMoney } from "v-money";
export default {
  props: ["value"],
  data() {
    return {
      inputValue: this.value,

      money: {
        ...this.$attrs
      }
    };
  },

  watch: {
    value() {
      this.inputValue = String(this.value);
    },

    inputValue() {
      const { precision = 2 } = this.$attrs;
      this.$emit("input", Number(this.inputValue.match(/\d+/gi).join("")) / Math.pow(10, precision));
    }
  },

  directives: { money: VMoney }
};
</script>
