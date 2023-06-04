const app = require("./src/app.js");

const { port } = require("./config/index")

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
})