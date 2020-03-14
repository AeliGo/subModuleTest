<template>
  <div id="app">
    <ClickTest/>
  </div>
</template>

<script>
import ClickTest from "./components/ClickTest.vue";
export default {
  name: "app",
  components: {
    ClickTest
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
