const getUsersByEmail = function(users, userEmail) { // function to check for users 
  for(let keys in users){
    if(users[keys].email === userEmail) {
      return users[keys];
    } 
  }
  return false;
}

module.exports = {
  getUsersByEmail
}