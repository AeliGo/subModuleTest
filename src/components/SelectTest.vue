<template>
  <div style="width:500px">
    <single-select
      v-model="form.board_stage_id"
      :data="stageOptions"
      field="name"
      track-by="id"
      group-by="board_name"
      sort-by="weight"
      :filtered="true"
      :open-on-focus="true"
      :keep-first="true"
      :custom-formatter="option => `${option.board_name} > ${option.name}`"
    />
  </div>
</template>

<script>
import SingleSelect from "./SingleSelect";
export default {
  components: { SingleSelect },

  data() {
    return {
      form: {},
      stageOptions: []
    };
  },

  created() {
    setTimeout(() => {
      this.stageOptions = [
        { id: "01", name: "AAA", board_name: "Board-A", weight: 50000 },
        { id: "02", name: "BBB", board_name: "Board-A", weight: 100000 },
        { id: "03", name: "CCC", board_name: "Board-A", weight: 150000 },
        { id: "04", name: "DDD", board_name: "Board-B", weight: 50000 },
        { id: "05", name: "EEE", board_name: "Board-B", weight: 100000 },
        { id: "06", name: "FFF", board_name: "Board-B", weight: 150000 },
        { id: "07", name: "GGG", board_name: "Board-C", weight: 50000 },
        { id: "08", name: "HHH", board_name: "Board-C", weight: 100000 }
      ];
    }, 2000);
  }
};
</script>
