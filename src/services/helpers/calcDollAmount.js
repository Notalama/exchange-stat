module.exports = function calcDollAmount (amount, dollRate) {
  return +dollRate[4] > 1 ? +amount * +dollRate[4] : +amount / +dollRate[3]
}
