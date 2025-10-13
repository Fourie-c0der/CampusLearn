/// <reference types="cypress" />

describe('CampusLearn Login Page UI & Functionality', () => {
  const url = 'http://localhost:3000/pages/login.html';

  beforeEach(() => {
    cy.visit(url);
  });

  it('should display all login form elements', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Log in').should('be.visible');
    cy.get('a').contains('Register').should('be.visible');
  });

  it('should validate empty login fields', () => {
    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.match(/Please enter your email and password|Invalid login credentials/);
    });
  });

  it('should validate incorrect credentials', () => {
    cy.get('input[type="email"]').type('wrong@belgiumcampus.ac.za');
    cy.get('input[type="password"]').type('wrongpassword');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    cy.get('button[type="submit"]').click();
    cy.get('@alert').should('have.been.calledWith', 'Invalid login credentials');
  });

  it('should login successfully with correct credentials', () => {
    cy.get('input[type="email"]').type('test@belgiumcampus.ac.za');
    cy.get('input[type="password"]').type('123456');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    cy.get('button[type="submit"]').click();
    cy.get('@alert').should('have.been.calledWith', '✅ Login successful! Redirecting...');
  });
});
