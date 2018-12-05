<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div>
      {{info}}
    </div>
      <vue-good-table
      mode="remote"
      class="bc-table"
      :columns="columns"
      :rows="rows"
      :line-numbers="true"/>
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
    this.loadItems()
  },
  methods: {
  getGainCol: function() {
    return 'getCol'
  },
  getChainCol: function(row) {
    const maxChainEffSum = 1000 
    const maxChainEfficiency = 'maxChainEfficiency Example - ' + maxChainEffSum + ' ' + row.givenCurrency.currencyTitle + ' -> '
    const rate = row.changer.exchangerTitle + '(' + row.rateToGive + ':' + row.rateToReceive + ';' + row.fullChangerCapital + ')'
    const calculatedCurrency = maxChainEffSum * row.rateToGive * row.rateToReceive
    const result = maxChainEfficiency + rate + ' -> ' + row.receivedCurrency.currencyTitle + ' ' + calculatedCurrency
    return result
  },
  loadItems: function() {
      axios
      .get('http://localhost:9000/best-change')
      .then(response => {
        console.log(response)
        // const firstItem = response.data.rates[0]
        this.info = response.data.rates[0]
        // .givenCurrency.currencyTitle;
        const chainCol = this.getChainCol(this.info)
        const gainCol = this.getGainCol()
        this.rows = [
          { init:1, gain: gainCol, chain: chainCol, createdAt: '201-10-31:9: 35 am', score: 0.03343 },
          { init:2, gain:"Jane", chain: 24, createdAt: '2011-10-31', score: 0.03343 },
          { init:3, gain:"Susan", chain: 16, createdAt: '2011-10-30', score: 0.03343 },
          { init:4, gain:"Chris", chain: 55, createdAt: '2011-10-11', score: 0.03343 },
          { init:5, gain:"Dan", chain: 40, createdAt: '2011-10-21', score: 0.03343 },
          { init:6, gain:"John", chain: 20, createdAt: '2011-10-31', score: 0.03343 },
        ]
      });
    }
  },
  data: function() {
    return {
      info: null,
      row: [],
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
          field: 'chain',
          type: 'string',
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
      rows: []
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
