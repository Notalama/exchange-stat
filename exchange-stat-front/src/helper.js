export default {
    calcRate: function(give, receive, sum) {
        const res = receive > give ? sum * receive : sum / give
        return res.toFixed(4)
    },    
    getAgeOfChain: function(rowId, rows) {
        const pos = rows.find(el => el.id === rowId)
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
      getChainCol: function(row, toDolIndex, otherRates) {
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
          let items = '<li>'
          // other rates template fill
          otherRates[i].forEach(oRate => items += this.getChangerLink({rate: oRate, preLinkC, preLinkBC}) + '</li><li>')

          const others = '<ul class="others-list">' + items + '</ul>'
          const exch = ' <a target="_blank" href="'
          + preLinkBC + rate.changer + '&from=' + rate.from + '&to=' + rate.to + '&url=1">'
          + '<i class="fas fa-arrow-right"></i></a> - '
          + '<a target="_blank" href="' + preLinkC + rate.changer + '&from=' + rate.from + '&to=' + rate.to + '&url=1">'
          + rate.changerTitle + '</a> ' + '(' + rate.give + ':' + rate.receive + '; '
          + rate.amount.amount + ', ' + rate.amount.dollarAmount.toFixed(4) + '$) <br>' + others
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
      getChangerLink: function({rate, preLinkBC, preLinkC}) {
        return ' <a target="_blank" href="'
          + preLinkBC + rate.exch.exchangerId + '&from=' + rate.from + '&to=' + rate.to + '&url=1">'
          + '<i class="fas fa-arrow-right"></i></a> - '
          + '<a target="_blank" href="' + preLinkC + rate.exch.exchangerId + '&from=' + rate.from + '&to=' + rate.to + '&url=1">'
          + rate.exch.exchangerTitle + '</a> ' + '(' + rate.give + ':' + rate.receive + '; '
          + rate.amount + ', ' + rate.dollarAmount.toFixed(4) + '$) </br>'
      }
    }
