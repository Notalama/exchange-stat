<template>
  <div class="hello">
    

  <!-- Modal Structure -->
    <div id="modal1" class="modal">
      <div class="modal-content">
        <h4>Заховати тимчасово</h4>
        <SettingsForm/>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect waves-green btn-flat">Заховати форму</a>
      </div>
    </div>


    <audio id="aud" type="audio/mp3">
      <source src="./../assets/to-the-point.mp3" type="audio/mp3">
    </audio>
    <h2>{{ 'Last update timer: ' + timer + ' seconds ago' }}</h2>
    <div class="settings">
      <div class="container">
        <div class="col s6">
          <p>Current interval is: {{interval / 1000}} s</p>
          <button class="waves-effect waves-light btn inc" v-on:click="updateInterval(1000)">+</button>
          <button class="waves-effect waves-light btn inc" v-on:click="updateInterval(-1000)">-</button>
        </div>
        <div class="col s6">
          <div class="input-field col s6">
            <input v-model="minBalance" id="first_name" type="number" class="validate" placeholder="Min Balance">
            <label for="first_name">Min Balance $</label>
          </div>
          <div class="input-field col s6">
            <input v-model="minProfit" id="last_name" type="number" class="validate" placeholder="Min Profit">
            <label for="last_name">Min Profit %</label>
          </div>
        </div>
        <div class="input-field col s6">
          <button class="btn waves-effect waves-light" type="button" name="action" v-on:click="loadItems()">Submit
            <i class="fas fa-arrow-right"></i>
          </button>
          <a class="waves-effect waves-light btn-flat modal-trigger settings-trigger" href="#modal1" v-on:click="showSettings = true">Settings</a>
        </div>
        
      </div>
    </div>
    
    <vue-good-table
      mode="remote"
      class="bc-table"
      :columns="columns"
      :rows="rows"
      :sort-options="{
        enabled: false
      }"
      @on-cell-click="pinToTop"
      />
  </div>
</template>

<script>
import axios from 'axios'
import SettingsForm from './Settings-form.vue'

export default {
  name: "BestChangeTable",
  props: {
    links: Boolean
  },
  components: {
    SettingsForm
  },
  mounted: function() {
    this.minBalance = 100
    this.minProfit = -1
    setInterval(() => {
      this.timer++
      this.rows.forEach(el => el.age++)
    }, 997);
    // this.loadItems()
    this.reloadInterval()
  },
  methods: {
  // hideSettings: function(e) {
  //   console.log(e)
  //   this.showSettings = false
  // },
  pinToTop: function(params) {
    const chainRates = this.currentDataArr[params.row.originalIndex]
    if (params.column.field === 'pin') {
      this.buildChainSubscriptions(chainRates)
      // this.loadItems()
    } else if (params.column.field === 'links') {
      const preLinkC = 'https://www.bestchange.ru/index.php?from='
      const preLinkBC = 'https://www.bestchange.ru/click.php?id='
      for (let i = 0; i < chainRates.length - 3; i++) {
        const element = chainRates[i];
        window.open(preLinkC + element.from + '&to=' + element.to)
        window.open(preLinkBC + element.changer + '&from=' + element.from + '&to=' + element.to + '&url=1')
      }
    }
  },
  buildChainSubscriptions: function(chainRates) {
    if (chainRates[chainRates.length - 1]) {
      let removeParams = ''
      // this.chainSubscriptions ? 'n' : ''
      for (let i = 0; i < chainRates.length - 3; i++) {
        removeParams += (removeParams.length <= 1 ? '' : ';') + chainRates[i].from + ',' + chainRates[i].to + ',' + chainRates[i].changer
      }
      let removeIndex = this.chainSubscriptions.search(removeParams)
      let removeCount = removeParams.length
      if (this.chainSubscriptions[removeIndex - 1] === 'n') {
        removeIndex -= 1
        removeCount += 1
      }
      this.chainSubscriptions = this.chainSubscriptions.split('')
      this.chainSubscriptions.splice(removeIndex, removeCount)
      this.chainSubscriptions = this.chainSubscriptions.join('')
      if (this.chainSubscriptions[0] === 'n') {
        this.chainSubscriptions = this.chainSubscriptions.split('')
        this.chainSubscriptions.shift()
        this.chainSubscriptions.join()
      }
      // eslint-disable-next-line
    } else {
      let getParams = this.chainSubscriptions ? 'n' : ''
      for (let i = 0; i < chainRates.length - 3; i++) {
        getParams += (getParams.length <= 1 ? '' : ';') + chainRates[i].from + ',' + chainRates[i].to + ',' + chainRates[i].changer
      }
      if (this.chainSubscriptions.search(getParams) < 0) this.chainSubscriptions += getParams
    }
  },
  updateInterval: function(interval) {
    if (interval >= 0 || this.interval >= this.minInterval) this.interval += interval
  },
  reloadInterval: function() {
    this.loadItems()
    setTimeout(() => {
      this.reloadInterval()
    }, this.interval);
  },
  getAgeOfChain: function(rowId) {
    const pos = this.rows.find(el => el.id === rowId)
    if (pos) return pos.age || 0
    else return 0
  },
  genId: function(chain) {
    return chain.slice(0, chain.length - 3).reduce((rateAcc, rateCur) => {
      let accSum = ''
      if (rateAcc.from) {
        accSum = rateAcc.from + rateAcc.to + rateAcc.changer
      }
      const currSum = accSum + rateCur.from + rateCur.to + rateCur.changer
      return accSum + currSum
    })
  },
  calcRate: function(give, receive, sum) {
    const res = receive > give ? sum * receive : sum / give
    return res.toFixed(4)
  },
  calcChainProfit: function(row, profit) {
    const rateAmounts = []
    for (let i = 0; i < row.length - 3; i++) {
      const rate = row[i];
      rateAmounts.push(+rate.amount.dollarAmount)
    }
    const minAmount = Math.min(...rateAmounts)
    return (minAmount / 100 * profit).toFixed(2) + ' $'
  },
  getChainCol: function(row, toDolIndex) {
    let sum = row[toDolIndex] ? this.calcRate(+row[toDolIndex][3], +row[toDolIndex][4], 1000) : 1
    const calcFirst = this.calcRate(+row[0].give, +row[0].receive, sum)
    const calcSecond = this.calcRate(+row[1].give, +row[1].receive, calcFirst)
    const calcThird = toDolIndex >= 3 ? this.calcRate(+row[2].give, +row[2].receive, calcSecond) : null
    const calcFourth = toDolIndex >= 4 ? this.calcRate(+row[3].give, +row[3].receive, calcThird) : null

    const currOne = sum + ' ' + row[0].fromTitle
    const exchOne = ' <a target="_blank" href="https://www.bestchange.ru/index.php?id=' + row[0].changer + '&from=' + row[0].from + '&to=' + row[0].to + '&url=1">'
    + ' <i class="fas fa-arrow-right"></i> - ' + row[0].changerTitle + '</a> ' + '(' + row[0].give + ':' + row[0].receive + '; '
    + row[0].amount.amount + ', ' + row[0].amount.dollarAmount.toFixed(4) + '$) <br>'
    const currTwo = '<i class="fas fa-arrow-right"></i> ' + calcFirst + ' ' + row[1].fromTitle
    const exchTwo = ' <a target="_blank" href="https://www.bestchange.ru/index.php?id=' + row[1].changer + '&from=' + row[1].from + '&to=' + row[1].to + '&url=1">'
    + ' <i class="fas fa-arrow-right"></i> - ' + row[1].changerTitle + '</a> ' + '(' + row[1].give + ':' + row[1].receive + '; '
    + row[1].amount.amount + ', ' + row[1].amount.dollarAmount.toFixed(4) + '$) <br>'
    const currThree = toDolIndex >= 3 ? '<i class="fas fa-arrow-right"></i> ' + calcSecond + ' ' + row[2].fromTitle : ''
    const exchThree = toDolIndex >= 3 ? ' <a target="_blank" href="https://www.bestchange.ru/index.php?id=' + row[2].changer + '&from=' + row[2].from + '&to=' + row[2].to + '&url=1">'
    + ' <i class="fas fa-arrow-right"></i> - ' + row[2].changerTitle + '</a> ' + '(' + row[2].give + ':' + row[2].receive + '; '
    + row[2].amount.amount + ', ' + row[2].amount.dollarAmount.toFixed(4) + '$) <br>' : ''
    
    const currFour = toDolIndex === 4 ? '<i class="fas fa-arrow-right"></i> ' + calcSecond + ' ' + row[3].fromTitle : ''
    const exchFour = toDolIndex === 4 ? ' <a target="_blank" href="https://www.bestchange.ru/index.php?id=' + row[3].changer + '&from=' + row[3].from + '&to=' + row[3].to + '&url=1">'
    + ' <i class="fas fa-arrow-right"></i> - ' + row[3].changerTitle + '</a> ' + '(' + row[3].give + ':' + row[3].receive + '; '
    + row[3].amount.amount + ', ' + row[3].amount.dollarAmount.toFixed(4) + '$) <br>' : ''
    
    const exitSum = toDolIndex === 2 ? calcSecond : toDolIndex === 3 ? calcThird : calcFourth
    const endChain = '<span style="color: green"><i class="fas fa-arrow-right"></i> ' + exitSum + ' ' + row[0].fromTitle + '</span>'
    return currOne + exchOne + currTwo + exchTwo + currThree + exchThree + currFour + exchFour + endChain
  },
  loadItems: function() {
      this.maxChainProfits = []
      if (this.links) {
        this.minInterval = 14000
        if (this.interval < 14000) this.interval = 14000
      } else {
        this.minInterval = 5000
      }
      let subcribeParam = this.chainSubscriptions ? '&chainSubscriptions=' + this.chainSubscriptions : ''
      const ltThree = '&ltThreeLinks=' + this.links
      axios
      .get('http://localhost:9000/best-change?minBalance=' + this.minBalance + '&minProfit=' + this.minProfit + subcribeParam + ltThree)
      .then(response => {
        // eslint-disable-next-line 
        console.log(response.data)

        this.currentDataArr = response.data
        this.rows = response.data.sort((a, b) => a.length - b.length).map((element, i) => {

          if (this.notif && element) document.getElementById('aud').play()
          const toDolIndex = element.length - 3
          const btnText = element[element.length - 1] ? '-' : '+'
          const btnClass = (element[element.length - 1] ? 'red' : 'blue')
          // const maxChainGain = element
          return {
            pin: '<a class="btn-floating waves-effect waves-light ' + btnClass + ' btn-small pl-btn">' + btnText + '</a>',
            gain: (element[element.length - 2] * 10).toFixed(4) + ' $ <br>' + this.calcChainProfit(element, element[element.length - 2]),
            chain: this.getChainCol(element, toDolIndex, i),
            score: element[element.length - 2] / 100,
            age: this.rows.length ? this.getAgeOfChain(this.genId(element)) : 0,
            links: '<i class="fas fa-arrow-right" style="color: #039be5"></i>',
            id: this.genId(element)
          }
        })
        // this.insertChainProfit()
        
        if (response.data.length) {
          this.notif = false
        } else {
          this.rows = []
          this.notif = true
        }
        
        this.timer = 0
      });
    
    }
  },
  data: function() {
    return {
      showSettings: false,
      notif: false,
      chainSubscriptions: '',
      minBalance: null,
      minProfit: null,
      timer: 0,
      interval: 10000,
      minInterval: 5000,
      maxChainProfits: [],
      currentDataArr: null,
      columns: [
        {
          label: 'Pin',
          field: 'pin',
          html: true
        },
        {
          label: '1000$ / ланцюжок',
          field: 'gain',
          html: true,
          globalSearchDisabled: true,
          width: '125px'
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
          globalSearchDisabled: true
        },
        {
          label: 'Час с',
          field: 'age',
          tdClass: 'age',
          globalSearchDisabled: true
        },
        {
          label: '',
          field: 'links',
          html: true
        }
      ],
      rows: []
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hideModal {
  display: none
}
.hideModalOverlay .modal-overlay {
  display: none
}
.settings-trigger {
  position: absolute;
  right: 0;
}
.age {
  text-align: center;
  width: 80px;
}
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
