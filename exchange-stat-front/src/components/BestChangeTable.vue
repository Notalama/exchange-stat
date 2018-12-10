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
    const maxChainEfficiency = 'maxChainEfficiency Example - ' + maxChainEffSum + ' ' + row.in.fromTitle + ' -> '
    const rate = row.in.changerTitle + '(' + row.in.give + ':' + row.in.receive + ';' + row.in.amount + ')'
    const calculatedCurrency = maxChainEffSum * row.in.give * row.in.receive
    const result = maxChainEfficiency + rate + ' -> ' + row.in.toTitle + ' ' + calculatedCurrency
    const maxChainEffSumBack = 1000 
    const maxChainEfficiencyBack = 'maxChainEfficiency ExampleBack - ' + maxChainEffSumBack + ' ' + row.back.fromTitle + ' -> '
    const rateBack = row.back.changerTitle + '(' + row.back.give + ':' + row.back.receive + ';' + row.back.amount + ')'
    const calculatedCurrencyBack = maxChainEffSumBack * row.back.give * row.back.receive
    const resultBack = maxChainEfficiencyBack + rateBack + ' -> ' + row.back.toTitle + ' ' + calculatedCurrencyBack
    return result + '====> <br/>' + resultBack
  },
  loadItems: function() {
      axios
      .get('http://localhost:9000/best-change')
      .then(response => {
        console.log(response.data[1])
        // const firstItem = response.data.rates[0]
        this.info = response.data[1]
        // .givenCurrency.currencyTitle;
        
        const gainCol = this.getGainCol()
        this.rows = []
        response.data.slice(0, 10).forEach(element => {
          this.rows.push({ init:1, gain: gainCol, chain: this.getChainCol(element), createdAt: '201-10-31:9: 35 am', score: 0.03343 })
        }); 
        this.rows.push()
      });
    }
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
