<template>
<div>
  <form
    @submit="sendForm"
    method="post">
      <h2>Редактор ланцюжків</h2>
    <div class="row">
      <div class="container">
      <div class="input-field col s4">
        <p class="s-label">Перший крок</p>
        <select class="browser-default" v-model="formData.firstStep">
          <option value="" disabled selected>Перший крок</option>
          <option v-for="currency in currencies" :value="currency" :key="currency.currencyId">{{currency.currencyTitle}}</option>
        </select>
      </div>
      </div>
      <div class="container">
      <div class="input-field col s4">
        <p class="s-label">Другий крок</p>
        <select class="browser-default" v-model="formData.secondStep">
          <option value="" disabled selected>Другий крок</option>
          <option v-for="currency in currencies" :value="currency" :key="currency.currencyId">{{currency.currencyTitle}}</option>
        </select>
      </div>
      </div>
      <div class="container">
      <div class="input-field col s4">
        <p class="s-label">Третій крок</p>
        <select class="browser-default" v-model="formData.thirdStep">
          <option value="" >Третій крок</option>
          <option v-for="currency in currencies" :value="currency" :key="currency.currencyId">{{currency.currencyTitle}}</option>
        </select>
      </div>
      </div>
    </div>
    <div class="container">
      <div class="input-field col s6">
        <input id="first_name" type="number" class="validate" placeholder="Min Balance" v-model="formData.minBalance">
        <label for="first_name">Min Balance $</label>
      </div>
    </div>
    <div class="row">
      <button type="submit" v-bind:disabled="!formData.secondStep.currencyId && !formData.thirdStep.currencyId || !formData.firstStep.currencyId || !formData.minBalance" 
      class="submit-btn btn waves-effect waves-light" >Submit
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  </form>
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
import helper from '../helper.js';
import axios from 'axios'
export default {
  name: "CustomChain",
  mounted: function() {
    this.minBalance = 100
    this.minProfit = 0.4
    setInterval(() => {
      this.timer++
      this.rows.forEach(el => el.age++)
    }, 997);
    // this.loadItems()
    this.reloadInterval()
  },
  methods: {
    pinToTop: function(params) {
      const chainRates = this.currentDataArr[params.row.originalIndex]
      if (params.column.field === 'links') {
        const preLinkC = 'https://www.bestchange.ru/index.php?from='
        const preLinkBC = 'https://www.bestchange.ru/click.php?id='
        for (let i = 0; i < chainRates.length - 3; i++) {
          const element = chainRates[i];
          window.open(preLinkC + element.from + '&to=' + element.to)
          window.open(preLinkBC + element.changer + '&from=' + element.from + '&to=' + element.to + '&url=1')
        }
      }
    },
    sendForm: function(event) {
      event.preventDefault()
      if (!this.formData.firstStep.currencyId && !this.formData.secondStep.currencyId && !this.formData.thirdStep.currencyId) {
        this.error = true
      } else {
        const data = {
          firstStepTitle: this.formData.firstStep.currencyTitle,
          firstStepId: this.formData.firstStep.currencyId,
          secondStepTitle: this.formData.secondStep.currencyTitle,
          secondStepId: this.formData.secondStep.currencyId,
          thirdStepTitle: this.formData.thirdStep.currencyTitle,
          thirdStepId: this.formData.thirdStep.currencyId,
          minBalance: this.formData.minBalance
        }
        var chain = [data.firstStepId, data.secondStepId, data.thirdStepId]
        if(data.thirdStepId === undefined){
          chain.pop()
        }
        // eslint-disable-next-line
        console.log(chain)
        axios.post('https://exchange-stat.herokuapp.com/custom-chain', {chain: chain, amount: data.minBalance}).then(response => {
          // eslint-disable-next-line
          console.log(response)
          this.currentDataArr = response.data.chain
          this.rows = response.data.chain.map((element, i) => {

            if (this.notif && element) document.getElementById('aud').play()
            const toDolIndex = element.length - 3
            return {
              gain: helper.calcChainProfit(element, element[element.length - 2]),
              chain: helper.getChainCol(element, toDolIndex, response.data.otherRates),
              score: element[element.length - 2] / 100,
              age: this.rows.length ? helper.getAgeOfChain(helper.genId(element), this.rows) : 0,
              links: '<i class="fas fa-arrow-right" style="color: #039be5"></i>',
              id: helper.genId(element)
            }
          })
          
          if (response.data.chain.length) {
            this.notif = false
          } else {
            this.rows = []
            this.notif = true
          }
          this.rowsCopy = this.rows
        }, () => {
          alert('Неможливо знайти ланцюжок')
        })
      }
    },
    getCurrencies: function() {
      axios.get('https://exchange-stat.herokuapp.com/currencies').then(response => {
        if (response.data && response.status === 200) this.currencies = response.data
      })
    },
    reloadInterval: function() {
      // this.loadItems()
      setTimeout(() => {
        this.reloadInterval()
      }, this.interval);
    }
  },
  data: function() {
    return {
      formData: {
        firstStep: {
          currencyId: undefined,
          currencyTitle: undefined
        },
        secondStep: {
          currencyId: undefined,
          currencyTitle: undefined
        },
        thirdStep: {
          currencyId: undefined,
          currencyTitle: undefined
        },
        minBalance: null
      },
      error: false,
      getHiddenCurrencies: false,
      currencies: [],
      showSettings: false,
      notif: false,
      chainSubscriptions: '',
      maxChainProfits: [],
      currentDataArr: null,
      timer: 0,
      interval: 5000,
      columns: [
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
  },
  created: function() {
    this.getCurrencies()
  }
};
</script>

<style>
h2 {
  text-align: center;
}
.submit-btn {
  margin: 0 auto;
  display: block;
}
</style>
