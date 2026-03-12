function studentGrade(score) {
  if (score >= 90) {
    return "Відмінно";
  } else if (score >= 75) {
    return "Добре";
  } else if (score >= 60) {
    return "Задовільно";
  } else {
    return "Незадовільно";
  }
}

console.log(studentGrade(82));

function studentGrade2(score) {
  return (score >= 90) ? "Відмінно" :
    (score >= 75) ? "Добре" :
      (score >= 60) ? "Задовільно" :
        "Незадовільно";
}

console.log(studentGrade2(82));

function getSeason(month) {

  if (month >= 1 && month <= 12) {

    if (month == 12 || month == 1 || month == 2) {
      return "Зима";
    }
    else if (month >= 3 && month <= 5) {
      return "Весна";
    }
    else if (month >= 6 && month <= 8) {
      return "Літо";
    }
    else {
      return "Осінь";
    }

  } else {
    return "Неправильний номер місяця";
  }

}

console.log(getSeason(4));

function getSeason2(mounth) {
  return (mounth == 12 || mounth == 1 || mounth == 2) ? "Зима" :
    (mounth >= 3 && mounth <= 5) ? "Весна" :
    (mounth >= 6 && mounth <= 8) ? "Літо" :
    "Осінь";
}

console.log(getSeason2(2));
