function isInRange(num, min, max) {
  if (num >= min && num <= max) {
    return true;
  } else {
    return false;
  }
}

console.log(isInRange(7, 5, 10));

let bool = true;

console.log("Було:", bool);

bool = !bool;

console.log("Стало:", bool);
