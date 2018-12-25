<template>
  <div id="options">
    <div class="select">
      <select v-model="searchType">
        <option disabled value>Please select one</option>
        <option v-for="(option, i) in options" v-bind:value="option.value" v-bind:key="i">
            {{ option.text }}
        </option>
      </select>
      option: {{searchType}}
    </div>
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
.select select {
  display: block;
}
</style>
