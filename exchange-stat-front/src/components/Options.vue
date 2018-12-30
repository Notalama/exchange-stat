<template>
  <div id="options">
    <div class="select">
      <select v-model="searchType">
        <option disabled value>Please select one</option>
        <option v-for="(option, i) in options" v-bind:value="option.value" v-bind:key="i">
            {{ option.text }}
        </option>
      </select>
      <button class="waves-effect waves-light btn inc" type="button" v-on:click="$emit('links-to-count', searchType)">ok</button>
    </div>
  </div>
</template>

<script>

export default {
  name: "Options",
  data: function() {
    return {
      options: [
        {
            text: "Find Three and Two",
            value: false
        }, {
            text: "Find Four Only",
            value: true
        }],
      searchType:  false
    };
  }
};
</script>

<style>
.select {
    width: 90%;
    margin: 0 auto;
}
</style>
