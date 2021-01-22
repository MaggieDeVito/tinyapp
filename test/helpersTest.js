const { assert } = require('chai');

const { getUsersByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUsersByEmail(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    assert.deepEqual('userRandomID', expectedOutput);
  });
  it('should return a user with valid email', function() {
    const user = getUsersByEmail(testUsers, "user3@example.com")
    const expectedOutput = undefined;
    assert.deepEqual(undefined, expectedOutput);
  });
});