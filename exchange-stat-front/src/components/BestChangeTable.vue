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
    const calculatedCurrencyIn = row.in.give > 1 ?
    maxChainEffSum / row.in.give :
    maxChainEffSum * row.in.receive
    const inCurr = maxChainEffSum + ' ' + row.in.fromTitle 
    const inChanger = ' <a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row.in.changer + '">'
     + ' <i class="fas fa-arrow-right"></i> - ' + row.in.changerTitle
     + '</a> ' + '(' + row.in.give + ':' + row.in.receive + '; ' + row.in.amount + ') <br>'
    const back = calculatedCurrencyIn + ' ' + row.in.toTitle
    const backChanger = '<a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row.back.changer + '">'
     + ' <i class="fas fa-arrow-right"></i>  -' + row.back.changerTitle + '</a> ' + '(' + row.back.give + ':' + row.back.receive + '; ' + row.back.amount + ') <br>'
    const achievmentCurr = ' ' + row.back.toTitle + ' '
    const achivement = row.back.give < row.back.receive ? 
    calculatedCurrencyIn * row.back.receive :
    calculatedCurrencyIn / row.back.give
    return inCurr + inChanger + back + backChanger + '<span style="color: green">' + achivement + achievmentCurr + '</span>'
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
            gain: element.profit * 1000,
            chain: this.getChainCol(element),
            score: element.profit.toFixed(6)
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
