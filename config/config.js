const fs = require('fs');
const path = require('path');


// Read the content of config.json
const configPath = path.resolve(__dirname, 'config.json');
let config = {};
try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error('Error reading config.json:', error);
}

// Determine environment
const env = process.env.NODE_ENV || 'development';
const environmentConfig = config[env];

// Override configuration with environment variables if they exist
const finalConfig = {
    ...environmentConfig,
    username: process.env.DB_USERNAME || environmentConfig.username,
    password: process.env.DB_PASSWORD || environmentConfig.password,
    database: process.env.DB_DATABASE || environmentConfig.database,
    host: process.env.DB_HOST || environmentConfig.host,
    dialect: process.env.DB_DIALECT || environmentConfig.dialect || 'mysql'
};

// Update the 'production' configuration in config.json with environment variables
if (env === 'production') {
    config.production = {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql'
    };
}

// Write the updated configuration back to config.json
try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Config updated successfully.');
} catch (error) {
    console.error('Error updating config.json:', error);
}

module.exports = finalConfig;
