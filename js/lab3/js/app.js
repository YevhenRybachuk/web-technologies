function sumFibonacci() {
  let a = 0;
  let b = 1;
  let count = 0;
  let sum = 0;

  while (count < 10) {
    sum += a;

    let next = a + b;
    a = b;
    b = next;

    count++;
  }

  return sum;
}

function isPrime(num) {
  if (num < 2) return false;

  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }

  return true;
}

function sumPrimes() {
  let sum = 0;

  for (let i = 1; i <= 1000; i++) {
    if (isPrime(i)) {
      sum += i;
    }
  }

  return sum;
}

function getDayOfWeek(num) {
  let day;

  switch (num) {
    case 1: day = "Понеділок"; break;
    case 2: day = "Вівторок"; break;
    case 3: day = "Середа"; break;
    case 4: day = "Четвер"; break;
    case 5: day = "П’ятниця"; break;
    case 6: day = "Субота"; break;
    case 7: day = "Неділя"; break;
    default: day = "Такого дня не існує";
  }

  return day;
}

function oddLengthStrings(arr) {
  let result = [];

  for (let str of arr) {
    if (str.length % 2 !== 0) {
      result.push(str);
    }
  }

  return result;
}

const addOne = (arr) => arr.map(num => num + 1);

function checkNumbers(a, b) {
  return (a + b === 10) || (Math.abs(a - b) === 10);
}



console.log("Завдання 1: ", sumFibonacci());
console.log("Завдання 2:", sumPrimes());
console.log("Завдання 3:", getDayOfWeek(3));
console.log("Завдання 4:", oddLengthStrings(["aaaaa", "bbb", "cc", "dddd"]));
console.log("Завдання 5:", addOne([1, 2, 3, 4]));
console.log("Завдання 6:", checkNumbers(5, 5));
