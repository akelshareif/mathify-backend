const app = require('./app');

// Load config variables
require('dotenv').config({ path: './config/config.env' });

// Set the port app will run on
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
