/// <reference types="cypress" />

describe('CampusLearn Registration Page UI', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5000/pages/register.html'); // Replace with your local server URL
  });

  it('checks presence of form fields', () => {
    cy.get('input[type="text"]').should('have.length', 2); // First & Last name
    cy.get('input[type="email"]').should('exist');
    cy.get('select').should('exist');
    cy.get('input[type="password"]').should('have.length', 2);
    cy.get('button[type="submit"]').contains('Sign Up').should('exist');
    cy.get('a.btn-outline-secondary').contains('Log In').should('exist');
  });
});
