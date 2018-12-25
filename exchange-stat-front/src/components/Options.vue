<template>
  <div id="options">
    <div class="select">
      <select v-model="searchType">
        <option disabled value>Please select one</option>
        <option v-for="(option, i) in options" v-bind:value="option.value" v-bind:key="i">
            {{ option.text }}
        </option>
      </select>
      <button type="button" v-on:click="$emit('links-to-count', searchType)">ok</button>
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
.select {
    width: 90%;
    margin: 0 auto;
}
.select select {
  display: block;
}
</style>
