const formatAndFilterRates = require('./formatAndFilterRates')
const formatAndFilterOne = require('./formatAndFilterOne')
const calcChain = require('./calcChain')
module.exports = async function formatOne ({
  ratesBuffer = [],
  chain = [],
  amount = 0
}) {
  const {
    byCurr
  } = await formatAndFilterRates({
    unformattedList: ratesBuffer
  })
  const result = await formatAndFilterOne({
    unformattedList: ratesBuffer,
    chain,
    amount,
    allRates: byCurr
  })
  let {
    profitArr
  } = result
  let hasEmptyLinks = false
  for (let i = 0; i < profitArr.length; i++) {
    if (!profitArr[i]) {
      hasEmptyLinks = true
      continue
    }
  }
  if (hasEmptyLinks || (profitArr.length !== chain.length)) return 'Chain has been not built'
  const chainFirstEl = profitArr[0]
  result.profitArr = []
  const chainsArray = [profitArr]
  const dolToInit = byCurr[40][chainFirstEl[0]]
  chainsArray.forEach(chain => {
    const profit = calcChain(chain, result.absCommis)
    result.profitArr.push(chain.concat([profit, dolToInit]))
  })
  return result
}
