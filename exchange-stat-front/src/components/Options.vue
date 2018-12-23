<template>
  <div id="options">
    <div class="input-field col s12">
      <select v-model="searchType">
        <option v-for="(option, i) in options" v-bind:value="option.value" v-bind:key="i">
            {{ option.text }}
        </option>
      </select>
      <label>Materialize Select</label>
    </div>
    option: {{searchType}}
  </div>
</template>

<script>
export default {
  name: "Options",
  components: {
  },
  data: function() {
    return {
      options: [
        {
            text: "Find Four Only",
            value: false
        }, {
            text: "Find Three and Two",
            value: true
        }],
      searchType:  true
    };
  }
};
</script>

<style>
</style>
