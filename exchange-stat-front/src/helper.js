export default {   
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
    calcRate: function(give, receive, sum) {
        const res = receive > give ? sum * receive : sum / give
        return res.toFixed(4)
    },    
    getAgeOfChain: function(rowId) {
        const pos = this.rows.find(el => el.id === rowId)
        if (pos) return pos.age || 0
        else return 0
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
        
        const preLinkC = 'https://www.bestchange.ru/click.php?id='
        const preLinkBC = 'https://www.bestchange.ru/index.php?id='
        const compiledChain = []
        for (let i = 0; i < row.length - 3; i++) {
          const rate = row[i];
          const exch = ' <a target="_blank" href="'
          + preLinkBC + rate.changer + '&from=' + rate.from + '&to=' + rate.to + '&url=1">'
          + '<i class="fas fa-arrow-right"></i></a> - '
          + '<a target="_blank" href="' + preLinkC + rate.changer + '&from=' + rate.from + '&to=' + rate.to + '&url=1">'
          + rate.changerTitle + '</a> ' + '(' + rate.give + ':' + rate.receive + '; '
          + rate.amount.amount + ', ' + rate.amount.dollarAmount.toFixed(4) + '$) <br>'
          compiledChain.push(exch)
        }
        const currOne = sum + ' ' + row[0].fromTitle
        const exchOne = compiledChain[0]
        const currTwo = '<i class="fas fa-arrow-right"></i> ' + calcFirst + ' ' + row[1].fromTitle
        const exchTwo = compiledChain[1]
        const currThree = toDolIndex >= 3 ? '<i class="fas fa-arrow-right"></i> ' + calcSecond + ' ' + row[2].fromTitle : ''
        const exchThree = toDolIndex >= 3 ? compiledChain[2] : ''
        
        const currFour = toDolIndex === 4 ? '<i class="fas fa-arrow-right"></i> ' + calcSecond + ' ' + row[3].fromTitle : ''
        const exchFour = toDolIndex === 4 ? compiledChain[3] : ''
        
        const exitSum = toDolIndex === 2 ? calcSecond : toDolIndex === 3 ? calcThird : calcFourth
        const endChain = '<span style="color: green"><i class="fas fa-arrow-right"></i> ' + exitSum + ' ' + row[0].fromTitle + '</span>'
        return currOne + exchOne + currTwo + exchTwo + currThree + exchThree + currFour + exchFour + endChain
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
    }