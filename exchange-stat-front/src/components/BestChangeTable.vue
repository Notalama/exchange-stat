<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>{{ 'Last update timer: ' + timer + ' seconds ago' }}</h2>
      <p>Current interval is: {{interval / 1000}} s</p>
      <button class="waves-effect waves-light btn inc" v-on:click="interval += 1000">+</button>
      <button class="waves-effect waves-light btn inc" v-on:click="interval -= 1000">-</button>
      <vue-good-table
      mode="remote"
      class="bc-table"
      :columns="columns"
      :rows="rows"
      :line-numbers="true"
      :sort-options="{
        enabled: false,
      }"/>
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
    setInterval(() => {
      this.timer++
    }, 1000);
    this.loadItems()
    // this.reloadInterval()
  },
  methods: {
  reloadInterval: function() {
    this.loadItems()
    setTimeout(() => {
      this.reloadInterval()
    }, this.interval);
  },
  getGainCol: function() {
    return 'getCol'
  },
  calcRate: function(give, receive, sum) {
    return receive > give ? sum * receive : sum / give
  },
  getChainCol: function(row, toDolIndex) {
    const sum = this.calcRate(+row[toDolIndex][3], +row[toDolIndex][4], 1000)
    const calcFirst = this.calcRate(+row[0].give, +row[0].receive, sum)
    const calcSecond = this.calcRate(+row[1].give, +row[1].receive, calcFirst)
    const calcThird = toDolIndex >= 3 ? this.calcRate(+row[2].give, +row[2].receive, calcSecond) : null
    const calcFourth = toDolIndex >= 4 ? this.calcRate(+row[3].give, +row[3].receive, calcThird) : null

    const currOne = sum + ' ' + row[0].fromTitle
    const exchOne = ' <a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row[0].changer + '">'
    + ' <i class="fas fa-arrow-right"></i> - ' + row[0].changerTitle + '</a> ' + '(' + row[0].give + ':' + row[0].receive + '; ' + row[0].amount + ') <br>'
    const currTwo = '<i class="fas fa-arrow-right"></i> ' + calcFirst + ' ' + row[1].fromTitle 
    const exchTwo = ' <a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row[1].changer + '">'
    + ' <i class="fas fa-arrow-right"></i> - ' + row[1].changerTitle + '</a> ' + '(' + row[1].give + ':' + row[1].receive + '; ' + row[1].amount + ') <br>'
    const currThree = toDolIndex >= 4 ? '<i class="fas fa-arrow-right"></i> ' + calcSecond + ' ' + row[2].fromTitle : ''
    const exchThree = toDolIndex >= 4 ? ' <a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row[2].changer + '">'
    + ' <i class="fas fa-arrow-right"></i> - ' + row[2].changerTitle + '</a> ' + '(' + row[2].give + ':' + row[2].receive + '; ' + row[2].amount + ') <br>' : ''
    
    const currFour = toDolIndex === 5 ? '<i class="fas fa-arrow-right"></i> ' + calcSecond + ' ' + row[3].fromTitle : ''
    const exchFour = toDolIndex === 5 ? ' <a target="_blank" href="https://www.bestchange.ru/click.php?id=' + row[3].changer + '">'
    + ' <i class="fas fa-arrow-right"></i> - ' + row[3].changerTitle + '</a> ' + '(' + row[3].give + ':' + row[3].receive + '; ' + row[3].amount + ') <br>' : ''
    
    const exitSum = toDolIndex === 3 ? calcSecond : toDolIndex === 4 ? calcThird : calcFourth
    const endChain = '<span style="color: green"><i class="fas fa-arrow-right"></i> ' + exitSum + ' ' + row[0].fromTitle + '</span>'

    return currOne + exchOne + currTwo + exchTwo + currThree + exchThree + currFour + exchFour + endChain
  },
  loadItems: function() {
      axios
      .get('http://localhost:9000/best-change')
      .then(response => {
        /* eslint-disable */ console.log(response.data) 
        const gainCol = this.getGainCol()
        this.rows = []
        let timer = 
        response.data.forEach(element => {
          const toDolIndex = element.length - 1
          this.rows.push({
            gain: (element[toDolIndex - 1] * 10) + ' $',
            chain: this.getChainCol(element, toDolIndex),
            score: element[toDolIndex - 1] / 100
          })
        }); 
        this.rows.push()
      });
    
    }
  },
  data: function() {
    return {
      timer: 0,
      interval: 10000,
      loadTime: new Date(),
      columns: [
        {
          label: 'Дохід з 1000$',
          field: 'gain',
        },
        {
          label: 'Ланцюжки',
          field: 'chain',
          type: 'string',
          html: true
        },
        {
          label: '%',
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
.inc {
  margin: 10px
}
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
