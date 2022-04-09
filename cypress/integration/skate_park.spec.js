describe("Skate Park", () => {
    it("frontepage can be opened", () => {
        cy.visit("http://localhost:3000")
        cy.contains("Skate Park")
    })
    
    it("Click test ingresar", () => {
        cy.visit("http://localhost:3000")
        cy.contains("Iniciar Sesión").click()
    })
    
    it("click test input", () => {
        cy.visit("http://localhost:3000/login")
        cy.get("input:first").type("admin@admin.com")
        cy.get("input:last").type("123456")
        cy.contains("Ingresar").click()
    
    })
})