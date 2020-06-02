<template>
  <div id="app">
    <meta name="appleid-signin-client-id" content="com.kukatree.platform">
    <meta name="appleid-signin-scope" content="">
    <meta name="appleid-signin-redirect-uri" content="https://exchange-stat.herokuapp.com/auth-apple">
    <meta name="appleid-signin-state" content="1">
    <meta name="appleid-signin-use-popup" content="true">
    <meta name="appleid-signin-use-popup" content="true">
    <meta name="appleid-signin-response-mode" content="query">
    <meta name="appleid-signin-response-type" content="id_token">
    <BestChangeTable v-bind:links="linksAmount" v-on:links-to-count="changeLinksAmout"/>
  </div>
</template>

<script>
import BestChangeTable from './components/BestChangeTable.vue'
import './assets/styles/materialize.min.css';
import './assets/styles/all.min.css';
// import M from './assets/styles/materialize.min.js';
// console.log(M)

export default {
  name: 'app',
  components: {
    BestChangeTable
  },
  mounted: function() {
    // eslint-disable-next-line
    // M.AutoInit()
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
.fa-arrow-right, .fa-times {
  cursor: pointer
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
