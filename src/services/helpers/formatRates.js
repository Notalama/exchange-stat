const hideParamsModel = require('./../../api/hide-params/model')
const formatAndFilterRates = require('./formatAndFilterRates')
const calcChain = require('./calcChain')
const calcAmountToDoll = require('./calcAmountToDoll')

module.exports = async function formatRates ({
  unformattedList,
  minAmount,
  minProfit,
  chainSubscriptions,
  ltThreeLinks
}) {
  try {
    const profitArr = []
    const omitValues = await hideParamsModel.find({}, (err, res) => {
      if (err) console.error(err, '--- omitValues err')
      else if (res === null) console.error('null hideparams found')
    })
    const subscriptionsU = chainSubscriptions ? chainSubscriptions.split('n') : null
    const subscriptions = subscriptionsU ? subscriptionsU.map(el => el.split(';')) : null // to return
    if (subscriptions) {
      // parse pairs to subscribe to
      for (let i = 0; i < subscriptions.length; i++) {
        subscriptions[i].forEach((el, j) => {
          subscriptions[i][j] = el.split(',')
        })
      }
    }
    let {
      byCurr,
      readySubs,
      absCommis
    } = await formatAndFilterRates({
      unformattedList,
      subscriptions,
      omitValues,
      minAmount
    })
    // **** two steps ****
    byCurr.forEach((currArr, a) => {
      currArr.forEach((firstEl, ind) => {
        if (firstEl && byCurr[firstEl[1]]) {
          byCurr[firstEl[1]].forEach((secondEl, j) => {
            if (secondEl && secondEl[1] === firstEl[0]) {
              let chain = [firstEl, secondEl]
              const profit = calcChain([firstEl, secondEl], absCommis)
              if ((firstEl[0] === '40' || secondEl[0] === '40') && (firstEl[2] === '1025' || secondEl[2] === '1025')) console.log(chain, ' - 47 chain fornmmatRates')
              if (profit > minProfit) {
                // *** Chain currencies to dollar compare ***
                const calcedAmount = calcAmountToDoll(chain, byCurr, minAmount)
                chain = calcedAmount.chain
                if (calcedAmount.exchHaveEnoughMoney) {
                  const dolToInit = byCurr[40][firstEl[0]]
                  profitArr.push(chain.concat([profit, dolToInit]))
                }
              } else if (profit < -8) byCurr[ind][j] = undefined
            }
          })
        } else byCurr[a][ind] = undefined
      })
    })
    // **** three steps ****
    byCurr.forEach(currArr => {
      currArr.forEach(firstEl => {
        if (firstEl && byCurr[firstEl[1]]) {
          byCurr[firstEl[1]].forEach(secondEl => {
            if (secondEl && byCurr[secondEl[1]]) {
              byCurr[secondEl[1]].forEach(thirdEl => {
                if (thirdEl && thirdEl[1] === firstEl[0]) {
                  let chain = [firstEl, secondEl, thirdEl]
                  const profit = calcChain([firstEl, secondEl, thirdEl], absCommis)
                  if (profit > minProfit) {
                    // *** Chain currencies to dollar compare ***
                    const calcedAmount = calcAmountToDoll(chain, byCurr, minAmount)
                    chain = calcedAmount.chain
                    if (calcedAmount.exchHaveEnoughMoney) {
                      const dolToInit = byCurr[40][firstEl[0]]
                      profitArr.push(chain.concat([profit, dolToInit]))
                    }
                  }
                }
              })
            }
          })
        }
      })
    })
    // **** four steps ****
    if (ltThreeLinks) {
      let n = []
      omitValues[0].fourLinks.forEach(id => {
        if (byCurr[id]) n[id] = byCurr[id]
      })
      n.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (firstEl && byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
              if (secondEl && byCurr[secondEl[1]]) {
                byCurr[secondEl[1]].forEach(thirdEl => {
                  if (thirdEl && byCurr[thirdEl[1]]) {
                    byCurr[thirdEl[1]].forEach(fourthEl => {
                      if (fourthEl && fourthEl[1] === firstEl[0]) {
                        const hasUniqCurrs = +firstEl[0] + +secondEl[0] === +thirdEl[0] + +fourthEl[0]
                        if (!hasUniqCurrs) {
                          let chain = [firstEl, secondEl, thirdEl, fourthEl]
                          const profit = calcChain(chain, absCommis)
                          if (profit > minProfit) {
                            // *** Chain currencies to dollar compare ***
                            const calcedAmount = calcAmountToDoll(chain, byCurr, minAmount)
                            chain = calcedAmount.chain
                            if (calcedAmount.exchHaveEnoughMoney) {
                              const dolToInit = byCurr[40][firstEl[0]]
                              profitArr.push(chain.concat([profit, dolToInit]))
                            }
                          }
                        }
                      }
                    })
                  }
                })
              }
            })
          }
        })
      })
    }
    // calc and format pairs for subscriptions
    if (subscriptions) {
      readySubs.forEach(chain => {
        // *** Chain currencies to dollar compare ***
        chain = calcAmountToDoll(chain, byCurr, minAmount).chain
        chain.push(calcChain(chain, absCommis), byCurr[40][chain[0][0]])
      })
    }
    const sorted = profitArr.sort((a, b) => +b[b.length - 2] - +a[a.length - 2])
    const filtered = []
    // hide clone chains
    sorted.forEach((el, i) => {
      const prevElProfit = sorted[i - 1] ? sorted[i - 1][sorted[i - 1].length - 2] : 0
      if (el[el.length - 2].toFixed(6) !== prevElProfit.toFixed(6)) filtered.push(el)
    })
    return {
      profitArr: readySubs.concat(filtered),
      subs: subscriptions ? readySubs.length : undefined
    }
  } catch (rejectedValue) {
    console.error('formatter err caught ---', rejectedValue)
  }
}
