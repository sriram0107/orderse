const assert = require("chai").assert;
function add(n1, n2) {
  return n1 + n2;
}
describe("Sample Tests", () => {
  it("Test 1", () => {
    assert.equal(add(1, 1), 2);
  });
  it("Test 2", () => {
    assert.equal(add(1, 3), 4);
  });
});
