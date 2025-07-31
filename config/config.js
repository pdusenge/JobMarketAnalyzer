const { APP_ID, API_KEY } = require("../secretKeys");

// Configuration file for Job Market Analyzer
const CONFIG = {
    // Adzuna API Configuration
    // Get your free API key from: https://developer.adzuna.com/  
    ADZUNA: {
        APP_ID: APP_ID, 
        API_KEY: API_KEY,
        BASE_URL: 'https://api.adzuna.com/v1/api/jobs'
    },

    // REST Countries API (No key required)
    COUNTRIES: {
        BASE_URL: 'https://restcountries.com/v3.1'
    },

    // Application Settings
    SETTINGS: {
        RESULTS_PER_PAGE: 20,
        MAX_RESULTS: 100,
        CACHE_DURATION: 300000, // 5 minutes in milliseconds
        DEFAULT_COUNTRY: 'us',
        SUPPORTED_COUNTRIES: {
            'us': 'United States',
            'gb': 'United Kingdom',
            'ca': 'Canada',
            'au': 'Australia',
            'de': 'Germany',
            'fr': 'France',
            'nl': 'Netherlands',
            'nz': 'New Zealand',
            'za': 'South Africa',
            'in': 'India'
        }
    },

    // Chart Colors for consistent styling
    CHART_COLORS: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        gradients: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)'
        ]
    }
};

// Validation function to check if API keys are configured
function validateConfig() {
    console.log(APP_ID , API_KEY)
    if (CONFIG.ADZUNA.APP_ID ||
        CONFIG.ADZUNA.API_KEY ) {
        return true;
    }
    console.warn('⚠️  API keys not configured! Please update config.js with your Adzuna API credentials.');
    return false;
}

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, validateConfig };
}