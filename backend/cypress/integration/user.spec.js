/// <reference types="cypress" />

describe("Testing user register/login/delete", () => {

    it("should redirect to login page", () => {
        cy.visit("/");
        cy.wait(1000);
        cy.url().should('include', '/sign-in');
        cy.get("[data-cy='link-sign-up']").click();
        cy.url().should('include', '/sign-up');

    });

    it("open the sign up page", () => {
        cy.get("[data-cy='input-email']").type("test@test.com");
        cy.get("[data-cy='input-username']").type("test");
        cy.get("[data-cy='input-password']").type("test@test.com");
    });


    it("should be able to login as developer", () => {
        cy.loginAsDeveloper();
        cy.wait(1000);
        cy.url().should('include', '/batch-dashboard');
        cy.contains('Manage batches');
        cy.contains('Manage data');
        cy.contains('Manage segments');
        cy.contains('Manage annotations');
        cy.logout();
        cy.url().should('include', '/sign-in');
    });

    it("should be able to login as annotator", () => {
        cy.loginAsAnnotator();
        cy.wait(1000);
        cy.url().should('include', '/batch-dashboard');
        cy.contains('Manage batches');
        cy.contains('Annotation panel');
        cy.logout();
        cy.url().should('include', '/sign-in');
    });



});