<template>
  <div id="app">
    <Options v-on:links-to-count="changeLinksAmout"/>
    <BestChangeTable v-bind:links="linksAmount"/>
  </div>
</template>

<script>
import BestChangeTable from './components/BestChangeTable.vue'
import Options from './components/Options.vue'

export default {
  name: 'app',
  components: {
    BestChangeTable,
    Options
  },
  methods: {
    changeLinksAmout: function(amount) {
      this.linksAmount = amount
    }
  },
  data: function() {
    return {
      linksAmount: false,
      message: 'Welcome to Exchange-Stat App'
    }
  }
}
</script>

<style>
body {
  background-color: lightgrey
}
.pl-btn {
  text-align: center
}
.fa-arrow-right {
  cursor: pointer
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
