<template>
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
      class="btn waves-effect waves-light">Submit
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  </form>
</template>

<script>
import axios from 'axios'
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
        axios.post('http://localhost:9000/custom-chain', data).then(response => {
          // eslint-disable-next-line
          console.log(response)
          if (response.status === 200) {
            
            // this.$emit('hideform', false)
          }
        })
      }
    },
  getCurrencies: function() {
      axios.get('http://localhost:9000/currencies').then(response => {
        // eslint-disable-next-line
        // console.log(response.data)
        if (response.data && response.status === 200) this.currencies = response.data
      })
    },
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
      currencies: []
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
.btn {
  margin-left: 45%;
}
</style>
