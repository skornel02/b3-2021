let relativePrimes = [];

const greatestCommonDivisor = (firstNum, secondNum) => {
  if (!secondNum) {
    return firstNum;
  }

  return greatestCommonDivisor(secondNum, firstNum % secondNum);
}

const writePrimaries = (num) => {
  document.getElementById("solution").innerHTML = "";
  relativePrimes = [];
  
  for (let i = 2; i < 101; i++) {
    if (greatestCommonDivisor(num, i) === 1) {
      relativePrimes.push(i);
    }
  }
  document.getElementById("solution").innerText = "Relatív prímek: " + relativePrimes.join(", ");
}

const solve = () => {
  let number = document.getElementById("numberInput").valueAsNumber;
  if (number < 2 || number > 100) {
    alert("A szám nem 2 és 100 között van!");
  } else {
    writePrimaries(number);
  }
}
