require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,
    config: {
        authRequired: false,
        auth0Logout: true,
        secret: process.env.SECRET,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        issuerBaseURL: process.env.ISSUER_BASE_URL
    }
}