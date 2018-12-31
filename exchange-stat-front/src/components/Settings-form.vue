

<template>
  <form
    @submit="checkForm"
    method="post">
    <div class="row">
      <div class="input-field col s6">
        <p class="s-label">Вхідна валюта</p>
        <select
          class="browser-default"
          v-model="formData.inCurr">
          <option value="" disabled selected>Вхідна валюта</option>
          <option v-for="currency in currencies" :value="currency" :key="currency.currencyId">{{currency.currencyTitle}}</option>
        </select>
      </div>
      <div class="input-field col s6">
        <p class="s-label">Вихідна валюта</p>
        <select
          class="browser-default"
          v-model="formData.outCurr">
          <option value="" disabled selected>Вихідна валюта</option>
          <option v-for="currency in currencies" :value="currency" :key="currency.currencyId">{{currency.currencyTitle}}</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <p class="s-label">Обмінник</p>
        <select
          class="browser-default"
          v-model="formData.changer"
          @change="onSelectChange()">
          <option value="" disabled selected>Обмінник</option>
          <option v-for="exchanger in exchangers"
            v-bind:value="exchanger"
            v-bind:key="exchanger.exchangerId">
            {{exchanger.exchangerTitle}}
          </option>
        </select>
        <p :if="error" style="color: red">Необхідно обрати обмінник</p>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s4">
        <input
          type="number"
          v-model="formData.days">
        <label for="blockTime">Днів</label>
      </div>
      <div class="input-field col s4">
        <input
          type="number"
          v-model="formData.hours">
        <label for="blockTime">Годин</label>
      </div>
      <div class="input-field col s4">
        <input
          type="number"
          v-model="formData.minutes">
        <label for="blockTime">Хвилин</label>
      </div>
    </div>
    <div class="row">
      <!-- <a href="#!"> -->
        <button :disabled="isDisabled" class="btn waves-effect waves-light" type="submit" name="action">Submit
          <i class="fas fa-arrow-right"></i>
        </button>
      <!-- </a> -->
    </div>
  </form>
  
</template>
<script src="/path/to/vue-router.js"></script>
<script>
import axios from 'axios'

export default {
  name: "SettingsForm",
  methods: {
    checkForm: function(event) {
      event.preventDefault()
      if (!this.formData.changer) {
        this.error = true
      } else {
        const params = {
          inCurrencyTitle: this.formData.inCurr.currencyTitle,
          inCurrencyId: this.formData.inCurr.currencyId,
          outCurrencyTitle: this.formData.outCurr.currencyTitle,
          outCurrencyId: this.formData.outCurr.currencyId,
          changerTitle: this.formData.changer.exchangerTitle,
          changerId: this.formData.changer.exchangerId,
          hidePeriod: this.formData.days * 86400000 + this.formData.hours * 3600000 + this.formData.minutes * 60000
        }
        axios.post('http://localhost:9000/temp-hide', params).then(response => {
          router.push('/')
        })
      }
    },
    onSelectChange: function () {
      this.error = false
      this.isDisabled()
    },
    getCurrencies: function () {
      axios.get('http://localhost:9000/currencies').then(response => {
        // eslint-disable-next-line
        // console.log(response.data)
        if (response.data && response.status === 200) this.currencies = response.data
      })
    },
    getExchangers: function () {
      axios.get('http://localhost:9000/exchangers').then(response => {
        // eslint-disable-next-line
        // console.log(response.data)
        if (response.data && response.status === 200) this.exchangers = response.data
      })
    }
  },
  computed: {
    isDisabled: function () {
      return !this.formData.changer.exchangerId
    }
  },
  data: function() {
    return {
      formData: {
        inCurr: {
          currencyId: null,
          currencyTitle: null
        },
        outCurr: {
          currencyId: null,
          currencyTitle: null
        },
        changer: {
          exchangerId: null,
          exchangerTitle: null
        },
        days: null,
        hours: null,
        minutes: null
      },
      error: false,
      exchangers: [],
      currencies: []
    };
  },
  created: function() {
    this.getCurrencies()
    this.getExchangers()
    this.formData.hours = 1
  }
};
</script>

<style>
.s-label {
  color: #9e9e9e
}
</style>
