function processFruitArray(fruits) {
  console.log(fruits);
  fruits.pop();
  console.log(fruits);
  fruits.unshift("pineapple");
  console.log(fruits);
  fruits.sort().reverse();
  console.log(fruits);
  console.log(fruits.indexOf("apple"));
}

function processColorArray(colors) {
  console.log(colors);
  const longestColor = colors.reduce((a, b) => a.length >= b.length ? a : b);
  const shortestColor = colors.reduce((a, b) => a.length <= b.length ? a : b);
  console.log("Longest: " + longestColor);
  console.log("Shortest: " + shortestColor);
  let newColors = colors.filter(color => color.includes("blue"));
  console.log(newColors);
  const colorsString = colors.join(", ");
  console.log("Result string:", colorsString);
}

function processEmployeeArray(employees) {
  console.log(employees);
  employees.sort((a, b) => a.name.localeCompare(b.name));
  console.log(employees);
  const developers = employees.filter(emp => emp.position === "developer");
  console.log("Only developers:", developers);
  employees = employees.filter(emp => emp.age <= 30);
  console.log("Delete who > 30:", employees);
  const newEmployee = { name: "Elena", age: 27, position: "QA engineeer" };
  employees.push(newEmployee);
  console.log(employees);
}

function processStudentArray(students) {
  console.log(students);
  students = students.filter(student => student.name !== "Alex");
  let newStudent = {name: "Dima", age: 19, course: 5}
  students.push(newStudent);
  students.sort((a, b) => b.age - a.age);
  console.log(students);
  const studentOnThirdCourse = students.find(student => student.course === 3);
  console.log(studentOnThirdCourse ? studentOnThirdCourse.name : "Student not exist")
}

function processNumberArray(numbers) {
  console.log(numbers);
  numbers = numbers.map(num => num**2);
  console.log(numbers);
  numbers = numbers.filter(num => num % 2 === 0);
  console.log(numbers);
  let sum = numbers.reduce((sum, a) => sum + a, 0);
  console.log("Sum: " + sum);
  const additionalNumbers = [10, 20, 30, 40, 50];
  numbers = [...numbers, ...additionalNumbers];
  console.log("With additions ", numbers);
  numbers.splice(0, 3);
  console.log("Without first 3 elements ", numbers);
}

const libraryManagement = {
  books: [
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", pages: 310, isAvailable: true },
    { title: "1984", author: "George Orwell", genre: "Dystopian", pages: 328, isAvailable: false },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", pages: 180, isAvailable: true }
  ],

  addBook(title, author, genre, pages) {
    const newBook = {
      title,
      author,
      genre,
      pages,
      isAvailable: true
    };
    this.books.push(newBook);
    console.log(`Book "${title}" add to list.`);
  },

  removeBook(title) {
    this.books = this.books.filter(book => book.title !== title);
    console.log(`Book "${title}" remove (if it exist in list).`);
  },

  findBooksByAuthor(author) {
    return this.books.filter(book => book.author === author);
  },

  toggleBookAvailability(title, isBorrowed) {
    const book = this.books.find(b => b.title === title);
    if (book) {
      book.isAvailable = !isBorrowed;
      console.log(`Book status "${title}" update. Available: ${book.isAvailable}`);
    } else {
      console.log("Book not found.");
    }
  },

  sortBooksByPages() {
    this.books.sort((a, b) => a.pages - b.pages);
    console.log("Books are sorted by number of pages.");
  },

  getBooksStatistics() {
    const totalBooks = this.books.length;
    const availableBooks = this.books.filter(b => b.isAvailable).length;
    const borrowedBooks = totalBooks - availableBooks;

    const totalPages = this.books.reduce((sum, book) => sum + book.pages, 0);
    const averagePages = totalBooks > 0 ? (totalPages / totalBooks).toFixed(2) : 0;

    return {
      totalBooks,
      availableBooks,
      borrowedBooks,
      averagePages: Number(averagePages)
    };
  }
};

function task7() {
  const student = {
    name: "John",
    age: 20,
    course: 2
  };
  console.log("Initial obj:", student);
  student.subjects = ["Mathematics", "Computer Science", "Physics"];
  delete student.age;
  console.log("Updated obj:");
  console.log(student);
}

console.log("\nTask 1");
let fruits = ["apple", "banana", "pear", "orange", "cherry"];
processFruitArray(fruits);

console.log("\nTask 2");
let colors = ["red", "dark blue", "green", "light blue", "yellow", "blue", "purple"];
processColorArray(colors);

console.log("\nTask 3");
let employees = [
  { name: "John", age: 28, position: "developer" },
  { name: "Alice", age: 24, position: "designer" },
  { name: "Bob", age: 32, position: "developer" },
  { name: "Diana", age: 30, position: "manager" },
  { name: "Chris", age: 22, position: "developer" }
];
processEmployeeArray(employees);

console.log("\nTask 4");
let students = [
  { name: "Andrew", age: 21, course: 3 },
  { name: "Alex", age: 19, course: 2 },
  { name: "Maria", age: 22, course: 4 },
  { name: "Kate", age: 20, course: 3 },
  { name: "Peter", age: 18, course: 1 }
];
processStudentArray(students);

console.log("\nTask 5");
let numbers = [2, 4, 2, 6, 8, 3, 5];
processNumberArray(numbers);

console.log("\nTask 6")
libraryManagement.addBook("Harry Potter", "J.K. Rowling", "Fantasy", 500);
libraryManagement.toggleBookAvailability("The Hobbit", true);
libraryManagement.sortBooksByPages();
console.log("Books by George Orwell:", libraryManagement.findBooksByAuthor("George Orwell"));
console.log("Library statistic:", libraryManagement.getBooksStatistics());
console.log(libraryManagement.books);

console.log("\nTask 7");
task7();
