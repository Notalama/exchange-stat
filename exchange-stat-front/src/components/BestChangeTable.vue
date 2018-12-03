<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
      <vue-good-table
      class="bc-table"
      :columns="columns"
      :rows="rows"/>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: "BestChangeTable",
  props: {
    msg: String
  },
  mounted: function() {
    axios
      .get('http://localhost:9000/best-change')
      .then((response) => {
        console.log(response.data)
        this.info = response;
      });
  },
  data: function() {
    return {
      info: null,
      columns: [
        {
          label: '',
          field: 'init'
        },
        {
          label: 'Дохід',
          field: 'gain',
        },
        {
          label: 'Ланцюжки',
          field: 'age',
          type: 'number',
        },
        {
          label: 'Дата',
          field: 'createdAt',
          type: 'date',
          dateInputFormat: 'YYYY-MM-DD',
          dateOutputFormat: 'MMM Do YY',
        },
        {
          label: '',
          field: 'score',
          type: 'percentage',
        },
      ],
      rows: [
        { init:1, gain: this.info[0].givenCurrency.title, age: 20, createdAt: '201-10-31:9: 35 am',score: 0.03343 },
        { init:2, gain:"Jane", age: 24, createdAt: '2011-10-31', score: 0.03343 },
        { init:3, gain:"Susan", age: 16, createdAt: '2011-10-30', score: 0.03343 },
        { init:4, gain:"Chris", age: 55, createdAt: '2011-10-11', score: 0.03343 },
        { init:5, gain:"Dan", age: 40, createdAt: '2011-10-21', score: 0.03343 },
        { init:6, gain:"John", age: 20, createdAt: '2011-10-31', score: 0.03343 },
      ]
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bc-table {
  width: 100%;
  display: flex;
  justify-content: center;
}
.bc-table tr.v-table-row td {
  border: 1px solid #000;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
