// Configurações do site
const config = {
    // Informações da empresa
    company: {
        name: "SGaldino Imóveis",
        phone: "+55 11 93725-5009",
        email: "sgb.corretor@gmail.com",
        address: "Praça Juan Gris, 37 - Cidade Vargas, São Paulo - SP",
        whatsapp: "5511937255009"
    },

    // Configurações de SEO
    seo: {
        title: "SGaldino Imóveis | Seu Imóvel dos Sonhos em São Paulo",
        description: "Encontre o imóvel perfeito em São Paulo com a SGaldino Imóveis. Apartamentos, casas e coberturas em localizações privilegiadas.",
        keywords: "imóveis em são paulo, comprar casa, apartamentos à venda, imobiliária sp, cidade vargas, jabaquara",
        author: "Sergio Galdino",
        googleSiteVerification: "", // Adicionar código de verificação do Google Search Console
    },

    // Redes sociais
    social: {
        facebook: "",
        instagram: "",
        linkedin: "",
        youtube: ""
    },

    // Google Analytics (adicionar seu ID)
    googleAnalytics: {
        id: "" // Ex: "UA-XXXXXXXXX-X" ou "G-XXXXXXXXXX"
    }
};

// Exportar configurações
window.siteConfig = config;
