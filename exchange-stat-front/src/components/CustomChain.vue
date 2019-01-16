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
          <option value="" disabled selected>Третій крок</option>
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
      <button type="submit" v-bind:disabled="!formData.secondStep.currencyId || !formData.thirdStep.currencyId || !formData.firstStep.currencyId || !formData.minBalance" 
      class="submit-btn btn waves-effect waves-light" v-on:click="loadItems()" >Submit
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
      />
  </div>
</template>

<script>
import helper from '../helper.js';
import axios from 'axios'
const test = [[{
        "from": "174",
        "fromTitle": "Augur (REP)",
        "to": "99",
        "toTitle": "Litecoin (LTC)",
        "changer": "89",
        "changerTitle": "Changer",
        "give": "3.05991636",
        "receive": "1",
        "amount": {
            "amount": "2054.48",
            "dollarAmount": 65535.5288032
        }
    }, {
        "from": "99",
        "fromTitle": "Litecoin (LTC)",
        "to": "6",
        "toTitle": "Яндекс.Деньги",
        "changer": "438",
        "changerTitle": "WestChange",
        "give": "1",
        "receive": "2163.2661",
        "amount": {
            "amount": "17398.46",
            "dollarAmount": 255.87064058943457
        }
    }, {
        "from": "6",
        "fromTitle": "Яндекс.Деньги",
        "to": "174",
        "toTitle": "Augur (REP)",
        "changer": "473",
        "changerTitle": "ImExchanger",
        "give": 705.865103685,
        "receive": "1",
        "amount": {
            "amount": "920.7",
            "dollarAmount": 9851.707763964001
        }
    },
    ["40", "174", "473", 11.03825469, "1", "920.7"], 0.1563933408430364, false
]]
export default {
  name: "CustomChain",
  methods: {
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
        // axios.post('http://localhost:9000/custom-chain', data).then(response => {
        //   // eslint-disable-next-line
        //   console.log(response)
        //   if (response.status === 200) {
            
        //     // this.$emit('hideform', false)
        //   }
        // })
      }
    },
  getCurrencies: function() {
      axios.get('http://localhost:9000/currencies').then(response => {
        // eslint-disable-next-line
        // console.log(response.data)
        if (response.data && response.status === 200) this.currencies = response.data
      })
    },
  loadItems: function() {
    axios.post('http://localhost:9000/custom-chain', {chain: ['88', '165', '93'], amount: 5})
      .then(response => {
        // eslint-disable-next-line 
        console.log(response.data)
        this.currentDataArr = test
        this.rows = test.map((element, i) => {
          if (this.notif && element) document.getElementById('aud').play()
          const toDolIndex = element.length - 3
          // const btnText = element[element.length - 1] ? '-' : '+'
          // const btnClass = (element[element.length - 1] ? 'red' : 'blue')
          // const maxChainGain = element
          return {
            gain: helper.calcChainProfit(element, element[element.length - 2]),
            chain: helper.getChainCol(element, toDolIndex, i),
            score: element[element.length - 2] / 100,
            age: this.rows.length ? helper.getAgeOfChain(helper.genId(element)) : 0,
            links: '<i class="fas fa-arrow-right" style="color: #039be5"></i>',
            id: helper.genId(element)
          }
        })
        // this.insertChainProfit()
        if (test.length) {
          this.notif = false
        } else {
          this.rows = []
          this.notif = true
        }
        this.rowsCopy = this.rows
      }, 
      (e) => {
        this.currentDataArr = test
        this.rows = test.map((element, i) => {

          if (this.notif && element) document.getElementById('aud').play()
          const toDolIndex = element.length - 3
          // const btnText = element[element.length - 1] ? '-' : '+'
          // const btnClass = (element[element.length - 1] ? 'red' : 'blue')
          // const maxChainGain = element
          return {
            gain: helper.calcChainProfit(element, element[element.length - 2]),
            chain: helper.getChainCol(element, toDolIndex, i),
            score: element[element.length - 2] / 100,
            age: this.rows.length ? helper.getAgeOfChain(helper.genId(element)) : 0,
            links: '<i class="fas fa-arrow-right" style="color: #039be5"></i>',
            id: helper.genId(element)
          }
        })
        // this.insertChainProfit()
        if (test.length) {
          this.notif = false
        } else {
          this.rows = []
          this.notif = true
        }
        this.rowsCopy = this.rows
      })
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
      currencies: [],
      showSettings: false,
      notif: false,
      chainSubscriptions: '',
      maxChainProfits: [],
      currentDataArr: null,
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
