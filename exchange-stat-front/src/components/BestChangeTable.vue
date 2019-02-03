<template>
  <div class='hello'>
    <!-- Modal Structure -->
    <div id='modal1' class='modal'>
      <div class='modal-content'>
        <h4>Заховати тимчасово</h4>
        <SettingsForm/>
      </div>
      <div class='modal-footer'>
        <a href='#!' class='modal-close waves-effect waves-green btn-flat'>Заховати форму</a>
      </div>
    </div>

    <audio id='aud' type='audio/mp3'>
      <source src='./../assets/to-the-point.mp3' type='audio/mp3'>
    </audio>
    <div class='settings'>
      <div class='row'>
        <div class="col s3">
          <h5>{{ 'Last update timer: ' + timer + ' sec' }}</h5>
          <p>Current interval is: {{interval / 1000}} s</p>
        </div>
        <div class="col s1">
          <button class="waves-effect waves-light btn inc" v-on:click="updateInterval(1000)">+</button>
          <button class="minus waves-effect waves-light btn inc" v-on:click="updateInterval(-1000)">-</button>
        </div>
        <div class="settings-input col s4">
          <div class="input-field col s4">
            <input
              v-model="minBalance"
              id="first_name"
              type="number"
              class="validate"
              placeholder="Min Balance"
            >
            <label for="first_name">Min Balance $</label>
          </div>
          <div class="input-field col s4">
            <input
              v-model="minProfit"
              id="last_name"
              type="number"
              class="validate"
              placeholder="Min Profit"
            >
            <label for="last_name">Min Profit %</label>
          </div>
          <div class="input-field col s4">
            <input v-model="searchTerm" type="text" id="searchTerm">
            <label for="searchTerm">Search</label>
          </div>
        </div>
        <div class="input-field col s1">
          <label class="checkbox">
            <input
              id="indeterminate-checkbox"
              type="checkbox"
              v-model="showExmo"
              v-on:click="showExmo = !showExmo">
            <span class="checkbox-span">Exmo</span>
          </label>
          <label class="checkbox">
            <input
              id="indeterminate-checkbox"
              type="checkbox"
              v-model="links"
              v-on:click="links = !links"
            >
            <span class="checkbox-span">4 кроки</span>
          </label>
        </div>
        <div class="input-field col s3">
          <a
            class="waves-effect waves-light btn-flat modal-trigger settings-trigger"
            href="#modal1"
            v-on:click="showSettings = true"
          >Settings</a>
          <a
            class="waves-effect waves-light btn-flat custom-chain-link"
            href="custom-chain"
            v-on:click="go"
          >
            Побудувати ланцюжок
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
    <div class="container">
      <button v-on:click="loadItems">Load table</button>
    </div>
    <vue-good-table
      mode="remote"
      class="bc-table"
      :columns="columns"
      :rows="rows"
      :sort-options="{
        enabled: false
      }"
      :search-options="{
        enabled: true,
        placeholder: 'Пошук ...',
        externalQuery: searchTerm
      }"
      @on-search="searchTable"
      @on-cell-click="pinToTop"
    />
  </div>
</template>

<script>
import axios from "axios";
import SettingsForm from "./Settings-form.vue";
import routes from "../routes";
export default {
  name: "BestChangeTable",
  components: {
    SettingsForm
  },
  mounted: function() {
    this.minBalance = 100;
    this.minProfit = 0.4;
    setInterval(() => {
      this.timer++;
      this.rows.forEach(el => el.age++);
    }, 997);
    this.loadItems();
    this.reloadInterval();
  },
  methods: {
    searchTable: function() {
      this.rows = this.rowsCopy.filter(el => {
        return el.chain.search(this.searchTerm) >= 0;
      });
    },
    pinToTop: function(params) {
      const chainRates = this.currentDataArr[params.row.originalIndex];
      if (params.column.field === "pin") {
        this.buildChainSubscriptions(chainRates);
        // this.loadItems()
      } else if (params.column.field === "links") {
        console.log(params, chainRates)
        // rate.changer === '899' ? 'https://exmo.me/uk/trade#?pair=' : 'https://www.bestchange.ru/click.php?id='
        
        for (let i = 0; i < chainRates.length - 3; i++) {
          const element = chainRates[i];
          let preLinkC = element.changer === '899' ? 'https://exmo.me/uk/trade#?pair=' : 'https://www.bestchange.ru/click.php?id='
          const preLinkBC = 'https://www.bestchange.ru/click.php?id='
          window.open(preLinkC + element.from + "&to=" + element.to);
          window.open(
            preLinkBC +
              element.changer +
              "&from=" +
              element.from +
              "&to=" +
              element.to +
              "&url=1"
          );
        }
      }
    },
    buildChainSubscriptions: function(chainRates) {
      if (chainRates[chainRates.length - 1]) {
        let removeParams = "";
        // this.chainSubscriptions ? 'n' : ''
        for (let i = 0; i < chainRates.length - 3; i++) {
          removeParams +=
            (removeParams.length <= 1 ? "" : ";") +
            chainRates[i].from +
            "," +
            chainRates[i].to +
            "," +
            chainRates[i].changer;
        }
        let removeIndex = this.chainSubscriptions.search(removeParams);
        let removeCount = removeParams.length;
        if (this.chainSubscriptions[removeIndex - 1] === "n") {
          removeIndex -= 1;
          removeCount += 1;
        }
        this.chainSubscriptions = this.chainSubscriptions.split("");
        this.chainSubscriptions.splice(removeIndex, removeCount);
        this.chainSubscriptions = this.chainSubscriptions.join("");
        if (this.chainSubscriptions[0] === "n") {
          this.chainSubscriptions = this.chainSubscriptions.split("");
          this.chainSubscriptions.shift();
          this.chainSubscriptions.join();
        }
      } else {
        let getParams = this.chainSubscriptions ? "n" : "";
        for (let i = 0; i < chainRates.length - 3; i++) {
          getParams +=
            (getParams.length <= 1 ? "" : ";") +
            chainRates[i].from +
            "," +
            chainRates[i].to +
            "," +
            chainRates[i].changer;
        }
        if (this.chainSubscriptions.search(getParams) < 0)
          this.chainSubscriptions += getParams;
      }
    },
    updateInterval: function(interval) {
      if (interval >= 0 || this.interval >= this.minInterval)
        this.interval += interval;
    },
    reloadInterval: function() {
      // this.loadItems()
      setTimeout(() => {
        this.reloadInterval();
      }, this.interval);
    },
    getAgeOfChain: function(rowId) {
      const pos = this.rows.find(el => el.id === rowId);
      if (pos) return pos.age || 0;
      else return 0;
    },
    genId: function(chain) {
      return chain.slice(0, chain.length - 3).reduce((rateAcc, rateCur) => {
        let accSum = "";
        if (rateAcc.from) {
          accSum = rateAcc.from + rateAcc.to + rateAcc.changer;
        }
        const currSum = accSum + rateCur.from + rateCur.to + rateCur.changer;
        return accSum + currSum;
      });
    },
    calcRate: function(give, receive, sum) {
      const res = receive > give ? sum * receive : sum / give;
      return res.toFixed(4);
    },
    calcChainProfit: function(row, profit) {
      const rateAmounts = [];
      for (let i = 0; i < row.length - 3; i++) {
        const rate = row[i];
        rateAmounts.push(+rate.amount.dollarAmount);
      }
      const minAmount = Math.min(...rateAmounts);
      return ((minAmount / 100) * profit).toFixed(2) + " $";
    },
    getChainCol: function(row, toDolIndex) {
      // eslint-disable-next-line
      if (row.some(el => el.from === '899')) console.log(row)
      let sum = row[toDolIndex]
        ? this.calcRate(+row[toDolIndex][3], +row[toDolIndex][4], 1000)
        : 1;
      const calcFirst = this.calcRate(+row[0].give, +row[0].receive, +sum);
      const calcSecond = this.calcRate(
        +row[1].give,
        +row[1].receive,
        +calcFirst
      );
      const calcThird =
        toDolIndex >= 3
          ? this.calcRate(+row[2].give, +row[2].receive, +calcSecond)
          : null;
      const calcFourth =
        toDolIndex >= 4
          ? this.calcRate(+row[3].give, +row[3].receive, +calcThird)
          : null;
      const compiledChain = [];
      for (let i = 0; i < row.length - 3; i++) {
        const rate = row[i];
        const preLinkC = rate.changer === '899' ? 'https://exmo.me/uk/trade#?pair=' : 'https://www.bestchange.ru/click.php?id='
        const preLinkBC = 'https://www.bestchange.ru/index.php?id='
        let exmoPair = '';
        if (rate.changer === '899') {
          exmoPair = (rate.toTitle[rate.toTitle.length - 1] === ')' ? 
          rate.toTitle.substring(rate.toTitle.search('\\(') + 1, rate.toTitle.length - 1) :
          rate.toTitle.substring(rate.toTitle.length - 3, rate.toTitle.length)) + '_' +
          (rate.fromTitle[rate.fromTitle.length - 1] === ')' ? 
          rate.fromTitle.substring(rate.fromTitle.search('\\(') + 1, rate.fromTitle.length - 1) :
          rate.fromTitle.substring(rate.fromTitle.length - 3, rate.fromTitle.length))
        }
        const arrowLinkParams = "&from=" + rate.from + "&to=" + rate.to + '&url=1">'
        const changerLinkParams = rate.changer === '899' ? exmoPair + '">' : rate.changer + "&from=" + rate.from + "&to=" + rate.to + '&url=1">'
        const exch = ' <a target="_blank" href="' + preLinkBC + arrowLinkParams +
          '<i class="fas fa-arrow-right"></i></a> - ' +
          '<a target="_blank" href="' + preLinkC + changerLinkParams + rate.changerTitle + '</a> ' +
          '(' +
          rate.give +
          ':' +
          rate.receive +
          '; ' +
          rate.amount.amount +
          ', ' +
          rate.amount.dollarAmount.toFixed(4) +
          '$) <br>';
        compiledChain.push(exch);
      }
      const currOne = sum + ' ' + row[0].fromTitle;
      const exchOne = compiledChain[0];
      const currTwo =
        '<i class="fas fa-arrow-right"></i> ' +
        calcFirst +
        ' ' +
        row[1].fromTitle;
      const exchTwo = compiledChain[1];
      const currThree =
        toDolIndex >= 3
          ? '<i class="fas fa-arrow-right"></i> ' +
            calcSecond +
            ' ' +
            row[2].fromTitle
          : '';
      const exchThree = toDolIndex >= 3 ? compiledChain[2] : '';

      const currFour =
        toDolIndex === 4
          ? '<i class="fas fa-arrow-right"></i> ' +
            calcSecond +
            ' ' +
            row[3].fromTitle
          : '';
      const exchFour = toDolIndex === 4 ? compiledChain[3] : '';

      const exitSum =
        toDolIndex === 2
          ? calcSecond
          : toDolIndex === 3
          ? calcThird
          : calcFourth;
      const endChain =
        '<span style="color: green"><i class="fas fa-arrow-right"></i> ' +
        exitSum +
        ' ' +
        row[0].fromTitle +
        '</span>';
      return (
        currOne +
        exchOne +
        currTwo +
        exchTwo +
        currThree +
        exchThree +
        currFour +
        exchFour +
        endChain
      );
    },
    loadItems: function() {
      this.maxChainProfits = [];
      if (this.links) {
        this.minInterval = 17000;
        if (this.interval < 17000) this.interval = 17000;
      } else {
        this.minInterval = 5000;
      }
      if (!this.wait) {
        this.wait = true;
        let subcribeParam = this.chainSubscriptions
          ? '&chainSubscriptions=' + this.chainSubscriptions
          : '';
        axios
          .get(
            'http://localhost:9000/best-change?minBalance=' +
              this.minBalance +
              '&minProfit=' +
              this.minProfit +
              '&showExmo=' +
              this.showExmo +
              '&ltThreeLinks=' +
              this.links +
              subcribeParam
          )
          .then(
            response => {
              this.wait = false;
              // eslint-disable-next-line
              console.log(response.data);
              this.currentDataArr = response.data;
              this.rows = response.data
                .sort((a, b) => a.length - b.length)
                .map((element, i) => {
                  if (this.notif && element)
                    document.getElementById('aud').play();
                  const toDolIndex = element.length - 3;
                  const btnText = element[element.length - 1] ? '-' : '+';
                  const btnClass = element[element.length - 1] ? 'red' : 'blue';
                  return {
                    pin:
                      '<a class="btn-floating waves-effect waves-light ' +
                      btnClass +
                      ' btn-small pl-btn">' +
                      btnText +
                      '</a>',
                    gain: this.calcChainProfit(
                      element,
                      element[element.length - 2]
                    ),
                    chain: this.getChainCol(element, toDolIndex, i),
                    score: element[element.length - 2] / 100,
                    age: this.rows.length
                      ? this.getAgeOfChain(this.genId(element))
                      : 0,
                    links:
                      '<i class="fas fa-arrow-right" style="color: #039be5"></i>',
                    id: this.genId(element)
                  };
                });
              if (response.data.length) {
                this.notif = false;
              } else {
                this.rows = [];
                this.notif = true;
              }

              this.timer = 0;
              this.rowsCopy = this.rows;
              this.searchTable();
            },
            () => {
              this.wait = false;
              alert('Something went wrong');
            }
          );
          // eslint-disable-next-line
      } else console.log('waiting response...');
    },
    go: function(event) {
      event.preventDefault();
      const route = event.target.pathname;
      this.$root.currentRoute = route;
      window.history.pushState(null, routes[route], route);
    }
  },
  data: function() {
    return {
      links: false,
      searchType: true,
      wait: false,
      searchTerm: '',
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
      showExmo: false,
      columns: [
        {
          label: 'Pin',
          field: 'pin',
          html: true
        },
        {
          label: 'Max Profit',
          field: 'gain',
          html: true,
          globalSearchDisabled: true,
          width: '125px'
        },
        {
          label: 'Ланцюжки',
          field: 'chain',
          type: 'string',
          html: true,
          globalSearchDisabled: false
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
      rows: [],
      rowsCopy: []
    };
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>Ґ
.hideModal {
  display: none;
}
.hideModalOverlay .modal-overlay {
  display: none;
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
  margin-right: 100px;
  margin-top: 5px;
}
.bc-table {
  width: 100%;
  display: flex;
  justify-content: center;
}
.bc-table tr.v-table-row td {
  border: 1px solid #000;
}
.custom-chain-link {
  position: absolute;
  top: 30px;
  right: 0px;
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
.settings-input {
  margin-top: 1%;
}
.minus {
  padding: 0 18px;
}
.checkbox {
  position: relative;
  padding: 15px;
}
.checkbox-span {
  color: #000;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 150px;
}
</style>