<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <BestChangeTable v-bind:msg="message"/>
  </div>
</template>

<script>
import BestChangeTable from './components/BestChangeTable.vue'

export default {
  name: 'app',
  components: {
    BestChangeTable
  },
  data: function() {
    return {
      message: 'Welcome to Exchange-Stat App'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
