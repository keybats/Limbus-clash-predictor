import { useState } from 'react'
import { subtract, multiply, pow, identity, index, matrix } from "mathjs";

const App = () => {

  const [playerBaseValue, setPlayerBaseValue] = useState(6)
  const [playerCoinValue, setPlayerCoinValue] = useState(4)
  const [playerSanity, setPlayerSanity] = useState(0)
  const [playerCoins, setPlayerCoins] = useState(2)
  
  const [enemyBaseValue, setEnemyBaseValue] = useState(6)
  const [enemyCoinValue, setEnemyCoinValue] = useState(3)
  const [enemySanity, setEnemySanity] = useState(0)
  const [enemyCoins, setEmemyCoins] = useState(2)
  
  const HandleInputChange = (event, state) => {
    if (event.target.value !== "") {
      state(parseInt(event.target.value))
    }
    else {
      state(0)
    }
    
  }

  const factorial = (num) => {
    if(num === 0) {
      return 1
    }
    if (num < 0) {
      return "No"
    }
    let ans = num
    for (let i = 1; i < num; i++) {
      ans = ans * (num - i)
    }
    return ans
  }

  const nCk = (n, k) => {
    return factorial(n)/(factorial(k)*factorial(n-k))
  }

  const calculateSkillValue = (baseValue, coinValue, coins) => {
    let finalSkillValue = new Array(coins + 1)
    for (let i = 0; i < finalSkillValue.length; i++) {
      finalSkillValue[i] = baseValue + coinValue * (i)
      
    }
    return finalSkillValue
  }

  const calculateProbabilites = (sanity, coins) => {
    if(coins > 5 || coins < 0) {
      console.log('error, bad number of coins')
      return
    }
    
    let percentages = new Array(coins + 1)
    //const possibilities = Math.pow(2, coins)
    const coinHeadChance = 0.5 + sanity/100
    const coinTailsChance = 1 - coinHeadChance

    for (let i = 0; i < percentages.length; i++) {
      
      const heads = i
      const tails = coins - i
      
      const probability = nCk(coins, i) * Math.pow(coinHeadChance, heads) * Math.pow(coinTailsChance, tails)

      percentages[i] = probability 
      
    }
    return percentages
  }

  let coinValue = new Array(playerCoins + enemyCoins )
  let coinValueIndex = 0
  for (let i = 0; i < playerCoins + enemyCoins - 1; i++) {
    const baseObject = {ECoins: enemyCoins, PCoins: playerCoins}
    for (let j = 0; j < i+1; j++) {
      //console.log('here', j, baseObject.PCoins, i)
      let tempObject = { PCoins: baseObject.PCoins - j, ECoins: baseObject.ECoins - i + j} 
      if(tempObject.PCoins >= 0 && tempObject.ECoins >= 0) {
        console.log('test', tempObject.PCoins, tempObject.ECoins)
        coinValue[coinValueIndex] = tempObject
        coinValueIndex++
      }
    }
  }

  const possibleClashes = playerCoins * enemyCoins
  let Qmatrix = new Array(coinValue.length)
  for (let i = 0; i < Qmatrix.length; i++) {
    Qmatrix[i] = new Array(coinValue.length)
    for (let j = 0; j < Qmatrix[i].length; j++) {
      Qmatrix[i][j] = {value: 0, PCoins: coinValue[j].PCoins, ECoins: coinValue[j].ECoins}
    }
  }

  let Rmatrix = new Array(coinValue.length)
  for (let i = 0; i < Rmatrix.length; i++) {
    Rmatrix[i] = new Array(2)
    Rmatrix[i].fill(0)
  }

  console.log('Q', Qmatrix)

  let playerFinalSkillValuesList = new Array(playerCoins)
  let enemyFinalSkillValuesList = new Array(enemyCoins)

  let playerProbabilitiesList = new Array(playerCoins)
  let enemyProbabilitiesList = new Array(enemyCoins)


  for (let i = 0; i < playerCoins; i++) {
    
    playerFinalSkillValuesList[i] = calculateSkillValue(playerBaseValue, playerCoinValue, playerCoins - i)
    playerProbabilitiesList[i] = calculateProbabilites(playerSanity, playerCoins - i)

  }

  for (let j = 0; j < enemyCoins; j++) {
      
      
    enemyFinalSkillValuesList[j] = calculateSkillValue(enemyBaseValue, enemyCoinValue, enemyCoins - j)
    enemyProbabilitiesList[j] = calculateProbabilites(enemySanity, enemyCoins - j)
  }

  console.log('fsv', playerFinalSkillValuesList, enemyFinalSkillValuesList)


  let singleClashWinPercentages = new Array(playerCoins * enemyCoins)
  let finalClashWinPercentage = 0
  let ClashIndex = 0

  if (playerProbabilitiesList[0] && playerFinalSkillValuesList[0]) {


    for (let k = 0; k < coinValue.length; k++) {
      console.log('clash index', ClashIndex)
      console.log('coinvalue', coinValue[k])
      console.log('state', playerFinalSkillValuesList[coinValue[0].PCoins - coinValue[k].PCoins], enemyFinalSkillValuesList[coinValue[0].ECoins - coinValue[k].ECoins])


      let tieChance = 0
      let winChance = 0
      let loseChance = 0
      if(coinValue[k].PCoins === 0){
        Qmatrix[ClashIndex].map(index =>{
          if(index.PCoins === 0 && index.ECoins === Qmatrix[ClashIndex][ClashIndex].ECoins -  1){
            index.value = 1
          }
        })
      }
      else if (coinValue[k].ECoins === 0){
        Qmatrix[ClashIndex].map(index =>{
          if(index.ECoins === 0 && index.PCoins === Qmatrix[ClashIndex][ClashIndex].PCoins -  1){
            index.value = 1
          }
        })
      }
      else{
        for (let i = 0; i < coinValue[k].PCoins + 1; i++) {
          for (let j = 0; j < coinValue[k].ECoins + 1; j++) {
            if (playerFinalSkillValuesList[coinValue[0].PCoins - coinValue[k].PCoins][i] > enemyFinalSkillValuesList[coinValue[0].ECoins - coinValue[k].ECoins][j]) {
              winChance += playerProbabilitiesList[coinValue[0].PCoins - coinValue[k].PCoins][i] * enemyProbabilitiesList[coinValue[0].ECoins - coinValue[k].ECoins][j]
            }
            else if (playerFinalSkillValuesList[coinValue[0].PCoins - coinValue[k].PCoins][i] === enemyFinalSkillValuesList[coinValue[0].ECoins - coinValue[k].ECoins][j]) {
              tieChance += playerProbabilitiesList[coinValue[0].PCoins - coinValue[k].PCoins][i] * enemyProbabilitiesList[coinValue[0].ECoins - coinValue[k].ECoins][j]
            }
            else {
              loseChance += playerProbabilitiesList[coinValue[0].PCoins - coinValue[k].PCoins][i] * enemyProbabilitiesList[coinValue[0].ECoins - coinValue[k].ECoins][j]
            }
            console.log('win:', winChance)
            console.log('tie:', tieChance)
            console.log('lose:', loseChance)
          }  
        }
        Qmatrix[ClashIndex][ClashIndex].value = tieChance


        Qmatrix[ClashIndex].map(index => {
          if(index.PCoins === Qmatrix[ClashIndex][ClashIndex].PCoins && index.ECoins === Qmatrix[ClashIndex][ClashIndex].ECoins -  1) {
              index.value = winChance
            }
        })
  
        Qmatrix[ClashIndex].map(index => {
          if(index.PCoins === (Qmatrix[ClashIndex][ClashIndex].PCoins - 1) && index.ECoins === Qmatrix[ClashIndex][ClashIndex].ECoins) {
              index.value = loseChance
            }
        })
      }
      console.log(Qmatrix[ClashIndex])
      ClashIndex++
      
    }

    const playerLastSkillValues = playerFinalSkillValuesList[playerFinalSkillValuesList.length - 1]
    const enemyLastSkillValues = enemyFinalSkillValuesList[enemyFinalSkillValuesList.length - 1]

    console.log('Last', enemyLastSkillValues, playerLastSkillValues)

    let targetRindex
    if(coinValue[0].PCoins > 1 && coinValue[0].ECoins < 2){
      targetRindex = Rmatrix.length - 1

      Rmatrix[targetRindex-1][0] = 1 
    }
    else if (coinValue[0].PCoins < 2 && coinValue[0].ECoins > 1) {
      targetRindex = Rmatrix.length - 2
      Rmatrix[targetRindex + 1][1] = 1
    }
    else if (coinValue[0].PCoins < 2 && coinValue[0].ECoins < 2){
      targetRindex = Rmatrix.length - 1
    }
    else {
      targetRindex = Rmatrix.length - 2
      Rmatrix[targetRindex + 1][1] = 1
      Rmatrix[targetRindex-1][0] = 1 
    }

    for (let i = 0; i < playerLastSkillValues.length; i++) {
      for (let j = 0; j < enemyLastSkillValues.length; j++) {
        if (playerLastSkillValues[i] > enemyLastSkillValues[j]) {
          Rmatrix[targetRindex][0] += playerProbabilitiesList[playerProbabilitiesList.length-1][i] * enemyProbabilitiesList[enemyProbabilitiesList.length-1][j] 
        }
        else if (playerLastSkillValues[i] < enemyLastSkillValues[j]) {
          console.log('here')
          Rmatrix[targetRindex][1] += playerProbabilitiesList[playerProbabilitiesList.length-1][i] * enemyProbabilitiesList[enemyProbabilitiesList.length-1][j] 
        }
      }
    }
    
    console.log('R', Rmatrix)

    singleClashWinPercentages.forEach(percentage => {console.log('%', percentage)})

    console.log('Q after', Qmatrix)

    let realQmatrix = Qmatrix
    realQmatrix.forEach(index => {
      for (let i = 0; i < index.length; i++) {
        index[i] = index[i].value
      }
    })

    console.log('real Q', realQmatrix)

    let Nmatrix = pow(subtract(identity(coinValue.length), realQmatrix), -1)   

    console.log('N', Nmatrix)

    let Bmatrix = multiply(Nmatrix, Rmatrix)

    console.log('B', Bmatrix, Bmatrix._data)

    //const testQmatrix = matrix([[0.13, 0.75, 0.13], [0, 0, 0], [0, 0, 0.25]])
    let testQmatrix = new Array(3)

    testQmatrix[0] = [0.13, 0.75, 0.13]
    testQmatrix[1] = [0, 0, 0]
    testQmatrix[2] = [0, 0, 0.25]

    console.log('test Q', testQmatrix)

    const testRmatrix = matrix([[0, 0], [1, 0], [0.5, 0.25]])

    const testNmatrix = pow(subtract(identity(3), testQmatrix), -1)
    const testBmatrix = multiply(testNmatrix, testRmatrix)
    console.log('testB', testBmatrix)

    finalClashWinPercentage = Bmatrix._data[0][0]
  }
  
  return (
    <div>
      <h1>Limbus Clash Calculator</h1>
      <form>
        Player skill base value <input value={(playerBaseValue)} onChange={(event) => {HandleInputChange(event, setPlayerBaseValue)}}/> <br />
        Player skill coin value <input value={(playerCoinValue)} onChange={(event) => {HandleInputChange(event, setPlayerCoinValue)}}/> <br />
        Player Sanity <input value={(playerSanity)} onChange={(event) => {HandleInputChange(event, setPlayerSanity)}}/> <br />
        Number of coins in player skill <input value={(playerCoins)} onChange={(event) => {HandleInputChange(event, setPlayerCoins)}}/> <br />
        <br/>
        Enemy skill base value <input value={enemyBaseValue} onChange={(event) => {HandleInputChange(event, setEnemyBaseValue)}}/> <br />
        Enemy coin value <input value={enemyCoinValue} onChange={(event) => {HandleInputChange(event, setEnemyCoinValue)}}/> <br />
        Enemy sanity <input value={enemySanity} onChange={(event) => {HandleInputChange(event, setEnemySanity)}}/> <br />
        Number of coins in enemy skill <input value={enemyCoins} onChange={(event) => {HandleInputChange(event, setEmemyCoins)}}/>
      </form>
      <p>Clash win percentage: {finalClashWinPercentage * 100} %</p>
    </div>
  )
}


export default App