describe("Login Test", () => {
  it("should login successfully", () => {
    cy.visit("http://localhost:5173/#/login");

    cy.get("#username").type("torontobing2022@gmail.com");
cy.get("#password").type("Rocketbing1!");

    cy.get('button[type="submit"]').click();

    cy.url().should("include", "#/");
  });
});