/// <reference types="cypress" />

describe("Testing batch create/edit/delete", () => {

    before(() => {
        cy.loginAsDeveloper();
        cy.wait(1000);
    });

    after(() => {
        cy.logout();
    });

    it("should see the batch management interface", () => {
        cy.contains('Batches');
        cy.contains('Add New Batch');
    });

    it("should be able to click and create new batch", () => {
        cy.contains('Add New Batch').click();
        cy.get("[data-cy='input-batch_name']").type("test batch");
        cy.get("[data-cy='input-batch_description']").type("test batch description");
        cy.get("[data-cy='input-batch_window_length']").clear().type(0.051);
        cy.get("[data-cy='input-batch_step_size']").clear().type(0.01955);
        cy.get('.annotator').first().click();
        cy.get("[data-cy='button-submit']").click();
        cy.wait(1000);
        cy.contains("test batch");
    });

    it("should be able to check the settings", () => {
        cy.get("[data-cy='button-batch_settings']").last().click();
        cy.contains('test batch');
        cy.contains('test batch description');
        cy.get("[data-cy='button-batch_cancel']").click();
    });

    it("should be able to delete the test batch", () => {
        cy.contains('test batch');
        cy.get("[data-cy='button-batch_delete']").last().click();
    });


});