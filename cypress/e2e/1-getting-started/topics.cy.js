/// <reference types="cypress" />

describe('CampusLearn Topics Page UI & Functionality', () => {
  const url = 'http://localhost:3000/pages/topics.html';

  beforeEach(() => {
    cy.visit(url);
  });

  it('should display main topics section', () => {
    cy.get('.topics-container').should('be.visible');
    cy.get('.topic-card').should('have.length.greaterThan', 0);
  });

  it('should allow searching topics', () => {
    cy.get('input[type="search"]').type('Math');
    cy.get('button').contains('Search').click();
    cy.get('.topic-card').each(($el) => {
      cy.wrap($el).should('contain.text', 'Math');
    });
  });

  it('should navigate to topic detail page', () => {
    cy.get('.topic-card').first().click();
    cy.url().should('include', '/topic-detail.html');
    cy.get('.topic-title').should('exist');
    cy.get('.topic-content').should('exist');
  });

  it('should filter topics by category', () => {
    cy.get('select.category-filter').select('Science');
    cy.get('.topic-card').each(($el) => {
      cy.wrap($el).should('contain.text', 'Science');
    });
  });
});
