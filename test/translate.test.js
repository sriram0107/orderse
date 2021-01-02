const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");

chai.should();
chai.use(chaiHttp);

describe("Language Conversion Tests - IBM Watson Language Translator", () => {
  it("English to English", (done) => {
    chai
      .request(server)
      .get("/translate/en/en/This is a sample text")
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.be.eq("This is a sample text");
        done();
      });
  });

  it("Spanish to Spanish", (done) => {
    chai
      .request(server)
      .get("/translate/es/es/Hola")
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.be.eq("Hola");
        done();
      });
  });

  it("English to Spanish", (done) => {
    chai
      .request(server)
      .get("/translate/en/es/This is a sample text")
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.be.eq("Este es un texto de ejemplo");
        done();
      });
  });

  it("Spanish to English", (done) => {
    chai
      .request(server)
      .get("/translate/es/en/Este es un texto de ejemplo")
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.be.eq("This is a sample text");
        done();
      });
  });
});
