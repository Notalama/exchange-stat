<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>{{ 'Last update timer: ' + timer + ' seconds ago' }}</h2>
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
    setInterval(() => {
      this.timer++
    }, 1000);
  },
  methods: {
  getGainCol: function() {
    return 'getCol'
  },
  getChainCol: function(row) {
    const maxChainEffSum = 1000
    const calculatedCurrencyIn = row[0].give > 1 ?
    maxChainEffSum / row[0].give :
    maxChainEffSum * row[0].receive
    const inCurr = maxChainEffSum + ' ' + row[0].fromTitle 
    const inChanger = ' <a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row[0].changer + '">'
     + ' <i class="fas fa-arrow-right"></i> - ' + row[0].changerTitle
     + '</a> ' + '(' + row[0].give + ':' + row[0].receive + '; ' + row[0].amount + ') <br>'
    const secondStep = calculatedCurrencyIn + ' ' + row[0].toTitle
    const secondStepChanger = '<a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row[1].changer + '">'
     + ' <i class="fas fa-arrow-right"></i>  -' + row[1].changerTitle + '</a> ' + '(' + row[1].give + ':' + row[1].receive + '; ' + row[1].amount + ') <br> '
    const secondActCurr = ' ' + row[1].toTitle + ' '
    const secondAct = 1 < row[1].receive ? 
    calculatedCurrencyIn * row[1].receive :
    calculatedCurrencyIn / row[1].give

    const thirdStepChanger = '<a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row[2].changer + '">'
     + ' <i class="fas fa-arrow-right"></i>  -' + row[2].changerTitle + '</a> ' + '(' + row[2].give + ':' + row[2].receive + '; ' + row[2].amount + ') <br> '
    const thirdActCurr = ' ' + row[2].toTitle + ' '
    const thirdAct = 1 < row[2].receive ? 
    calculatedCurrencyIn * row[2].receive :
    calculatedCurrencyIn / row[2].give
    const thirdStep = calculatedCurrencyIn + ' ' + row[2].toTitle
    return inCurr + inChanger + secondStep + secondStepChanger + '<span style="color: green">' + secondAct + secondActCurr + '</span>' + thirdStepChanger + thirdAct + thirdActCurr +
      '<span style="color: blue">' + thirdStep + '</span>'
  },
  loadItems: function() {
      axios
      .get('http://localhost:9000/best-change')
      .then(response => {
        /* eslint-disable */ console.log(response.data) 
        const gainCol = this.getGainCol()
        this.rows = []
        let timer = 
        response.data.slice(0, 30).forEach(element => {
          this.rows.push({
            gain: element[3] * 1000,
            chain: this.getChainCol(element),
            score: element[3].toFixed(6)
          })
        }); 
        this.rows.push()
      });
    }
  },
  data: function() {
    return {
      timer: 0,
      loadTime: new Date(),
      columns: [
        {
          label: 'Дохід',
          field: 'gain',
        },
        {
          label: 'Ланцюжки',
          field: 'chain',
          type: 'string',
          html: true
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
