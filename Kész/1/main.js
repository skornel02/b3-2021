let relativePrimes = [];

const greatestCommonDivisor = (firstNum, secondNum) => {
  if (!secondNum) {
    return firstNum;
  }
  
  return greatestCommonDivisor(secondNum, firstNum % secondNum);
}

console.log(greatestCommonDivisor(6, 3));

const solve = () => {
  let number = document.getElementById("numberInput").valueAsNumber;
  console.log(number);
  document.getElementById("solution").innerHTML = "";
  relativePrimes = [];
  for (let i = 2; i < 101; i++) {
    if (greatestCommonDivisor(number, i) === 1) {
        relativePrimes.push(i);
      }
    }
    
    document.getElementById("solution").innerText = "Relatív prímek: " + relativePrimes.join(", ");
}