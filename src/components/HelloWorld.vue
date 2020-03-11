<template>
  <section>
    <div style="width:500px;margin:auto">
      <label class="typo__label">Groups</label>
      <multiselect
        v-model="value"
        :options="options"
        group-values="libs"
        group-label="language"
        :group-select="false"
        placeholder="Type to search"
        track-by="name"
        :show-labels="false"
        label="name"
      >
        <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
      </multiselect>
      <pre class="language-json"><code>{{ value  }}</code></pre>
    </div>

    <div style="width:200px;">
      <b-field label="Budget" :type="errors.has('budget') ? 'is-danger' : ''" :message="errors.first('budget')">
        <MaskInput
          v-model="budget"
          v-validate="'min_value:0|max_value:100'"
          name="budget"
          decimal="."
          thousands=","
          prefix="$ "
          :precision="3"
        />
      </b-field>
      {{ hasChanged }}
    </div>
  </section>
</template>

<script>
import MaskInput from "./MaskInput";
export default {
  name: "HelloWorld",
  components: { MaskInput },
  data() {
    return {
      value: [],
      budget: 0,

      options: [
        {
          language: "Javascript",
          libs: [
            { name: "Vue.js", category: "Front-end" },
            { name: "Adonis", category: "Backend" }
          ]
        },
        {
          language: "Ruby",
          libs: [
            { name: "Rails", category: "Backend" },
            { name: "Sinatra", category: "Backend" }
          ]
        }
      ]
    };
  },

  computed: {
    hasChanged() {
      return this.fields;
    }
  },

  methods: {
    customLabel(value) {
      return value;
    }
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
