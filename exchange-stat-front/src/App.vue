<template>
  <div id="app">
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
body {
  background-color: lightgrey
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
