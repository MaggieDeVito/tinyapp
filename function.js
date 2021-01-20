function generateRandomString(length=6) {
  return Math.random().toString(20).substr(2, length);
}

console.log(generateRandomString());