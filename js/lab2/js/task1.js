function findMinMax(arr) {
  let min = arr[0];
  let max = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i];
    }

    if (arr[i] > max) {
      max = arr[i];
    }
  }

  return { min: min, max: max };
}

let numbers = [5, 8, 2, 15, 1, 9];
let result = findMinMax(numbers);

console.log("Мінімальне:", result.min);
console.log("Максимальне:", result.max);


function compareObjects(obj1, obj2) {
  if (obj1.age > obj2.age) {
    return obj1.name + " старший";
  } else if (obj1.age < obj2.age) {
    return obj2.name + " старший";
  } else {
    return "Вони одного віку";
  }
}

let person1 = { name: "Денис", age: 24 };
let person2 = { name: "Максим", age: 27 };

console.log(compareObjects(person1, person2));
