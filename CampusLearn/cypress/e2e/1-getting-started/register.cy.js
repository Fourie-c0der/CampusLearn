/// <reference types="cypress" />

describe('CampusLearn Register Page UI & Functionality', () => {
  const url = 'http://localhost:3000/pages/register.html'; // Update if different

  beforeEach(() => {
    cy.visit(url);
  });

  it('should display all form elements', () => {
    cy.get('input[type="text"]').should('have.length', 2); // First & Last Name
    cy.get('input[type="email"]').should('be.visible');
    cy.get('select').should('be.visible');
    cy.get('input[type="password"]').should('have.length', 2); // Password + Confirm
    cy.get('button[type="submit"]').contains('Sign Up').should('be.visible');
    cy.get('a').contains('Log In').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.match(/Please use a valid Belgium Campus email address|Passwords do not match|Password must be at least 6 characters long/);
    });
  });

  it('should validate email domain', () => {
    cy.get('input[type="email"]').type('wrongemail@gmail.com');
    cy.get('input[type="text"]').first().type('Oarabile');
    cy.get('input[type="text"]').last().type('Mbewe');
    cy.get('input[type="password"]').first().type('123456');
    cy.get('input[type="password"]').last().type('123456');
    cy.get('select').select('BIT');

    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Please use a valid Belgium Campus email address.');
    });
  });

  it('should validate password match', () => {
    cy.get('input[type="email"]').type('test@belgiumcampus.ac.za');
    cy.get('input[type="text"]').first().type('Oarabile');
    cy.get('input[type="text"]').last().type('Mbewe');
    cy.get('input[type="password"]').first().type('123456');
    cy.get('input[type="password"]').last().type('654321');
    cy.get('select').select('BIT');

    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Passwords do not match.');
    });
  });

  it('should validate password length', () => {
    cy.get('input[type="email"]').type('test@belgiumcampus.ac.za');
    cy.get('input[type="text"]').first().type('Oarabile');
    cy.get('input[type="text"]').last().type('Mbewe');
    cy.get('input[type="password"]').first().type('123');
    cy.get('input[type="password"]').last().type('123');
    cy.get('select').select('BIT');

    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Password must be at least 6 characters long.');
    });
  });

  it('should register successfully with valid data', () => {
    cy.get('input[type="email"]').type('test@belgiumcampus.ac.za');
    cy.get('input[type="text"]').first().type('Oarabile');
    cy.get('input[type="text"]').last().type('Mbewe');
    cy.get('input[type="password"]').first().type('123456');
    cy.get('input[type="password"]').last().type('123456');
    cy.get('select').select('BIT');

    // Intercept alert to simulate successful registration
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    cy.get('button[type="submit"]').click();
    cy.get('@alert').should('have.been.calledWith', '✅ Registration successful! Redirecting to login...');
  });
});
