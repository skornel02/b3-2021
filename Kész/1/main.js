let number = document.getElementById("numberInput").valueAsNumber;
let relativePrimes = [];

function gcd_two_numbers(x, y) {
    x = Math.abs(x);
    y = Math.abs(y);
    while(y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
  }
  
function solve() {
    document.getElementById("solution").innerHTML = "";
    relativePrimes = [];
    for (let i = 2; i < 101; i++) {
         if (gcd_two_numbers(number, i) === 1) {
            relativePrimes.push(i);
        }
    }
    
    document.getElementById("solution").innerHTML = relativePrimes.join(", ");
}