describe('CampusLearn - Index Page Robust UI Tests', () => {

  const baseUrl = 'http://localhost:3000/index.html';

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  // -------------------- Basic UI Presence --------------------
  it('should display the site title or logo', () => {
    cy.contains(/CampusLearn/i).should('exist');
  });

  it('should contain a visible navigation bar with links', () => {
    cy.get('nav').should('exist').and('be.visible');
    cy.get('nav a')
      .should('have.length.greaterThan', 0)
      .each(($el) => {
        cy.wrap($el).should('have.attr', 'href').and('not.be.empty');
      });
  });

  it('should display a hero/welcome section with a clear heading', () => {
    cy.get('section, header, main').contains(/welcome|learn|start/i).should('exist');
  });

  it('should display key buttons like Get Started or Learn More', () => {
    cy.contains(/get started|learn more|join now/i).should('exist').and('be.visible');
  });

  it('should have at least one image loaded successfully', () => {
    cy.get('img')
      .should('have.length.greaterThan', 0)
      .each(($img) => {
        cy.wrap($img)
          .should('be.visible')
          .and(($el) => {
            expect($el[0].naturalWidth).to.be.greaterThan(0);
          });
      });
  });

  it('should have a visible footer with contact or copyright info', () => {
    cy.get('footer').should('exist').and('be.visible');
    cy.get('footer').contains(/©|copyright|contact/i);
  });

  // -------------------- Navigation Behavior --------------------
  it('should navigate correctly when clicking a nav link', () => {
    cy.get('nav a').first().then(($link) => {
      const href = $link.attr('href');
      if (href && !href.startsWith('#')) {
        cy.wrap($link).click();
        cy.url().should('include', href);
      }
    });
  });

  it('should return to the index page when clicking the logo or home link', () => {
    cy.visit(baseUrl);
    cy.get('a').contains(/home|CampusLearn/i).first().click({ force: true });
    cy.url().should('include', 'index.html');
  });

  // -------------------- Responsiveness --------------------
  context('Responsive layout checks', () => {
    const sizes = [
      [1920, 1080], // Desktop
      [1366, 768],  // Laptop
      [768, 1024],  // Tablet
      [375, 667],   // Mobile
    ];

    sizes.forEach((size) => {
      it(`should display main content correctly on ${size[0]}x${size[1]}`, () => {
        cy.viewport(size[0], size[1]);
        cy.visit(baseUrl);
        cy.get('nav').should('be.visible');
        cy.contains(/get started|learn more/i).should('be.visible');
      });
    });
  });

  // -------------------- Link & Performance Sanity --------------------
  it('should ensure all links are valid (not empty)', () => {
    cy.get('a').each(($link) => {
      const href = $link.attr('href');
      expect(href, 'Link should not be empty').to.not.be.oneOf([undefined, '']);
    });
  });

  it('should load within a reasonable time', () => {
    cy.visit(baseUrl, { timeout: 8000 });
    cy.title().should('not.be.empty');
  });

});
