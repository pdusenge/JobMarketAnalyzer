// Main Application Logic for Job Market Analyzer

class JobMarketApp {
    constructor() {
        this.currentData = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredJobs = [];
        this.sortBy = 'date';
        this.sortOrder = 'desc';
        
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        console.log('🚀 Initializing Job Market Analyzer...');
        
        // Validate configuration
        if (!validateConfig()) {
            this.showConfigurationError();
            return;
        }

        this.bindEventListeners();
        this.setupInitialState();
        
        console.log('✅ Application initialized successfully');
    }

    // Show configuration error message
    showConfigurationError() {
        const errorDiv = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        errorText.innerHTML = `
            <strong>Configuration Required:</strong><br>
            Please update your API keys in <code>config/config.js</code><br>
            <a href="https://developer.adzuna.com/" target="_blank">Get your free Adzuna API key here</a>
        `;
        
        this.showElement('error-message');
        this.hideElement('loading');
    }

    // Bind all event listeners
    bindEventListeners() {
        // Search button
        document.getElementById('search-btn').addEventListener('click', () => {
            this.performSearch();
        });

        // Enter key in search inputs
        const searchInputs = ['keywords', 'location', 'salary-min', 'salary-max'];
        searchInputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        });

        // Sort dropdown
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.sortAndDisplayJobs();
        });

        // Pagination buttons
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayJobs();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredJobs.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.displayJobs();
            }
        });

        // Retry button
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.hideElement('error-message');
            this.performSearch();
        });

        // Real-time search suggestions (debounced)
        let searchTimeout;
        document.getElementById('keywords').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // Could implement search suggestions here
            }, 500);
        });
    }

    // Setup initial application state
    setupInitialState() {
        this.hideElement('results-section');
        this.hideElement('loading');
        this.hideElement('error-message');
        
        // Set default values
        document.getElementById('country').value = CONFIG.SETTINGS.DEFAULT_COUNTRY;
        
        // Load saved preferences from localStorage if available
        this.loadUserPreferences();
    }

    // Load user preferences
    loadUserPreferences() {
        try {
            const prefs = localStorage.getItem('jobAnalyzer_preferences');
            if (prefs) {
                const preferences = JSON.parse(prefs);
                if (preferences.country) {
                    document.getElementById('country').value = preferences.country;
                }
                if (preferences.sortBy) {
                    document.getElementById('sort-by').value = preferences.sortBy;
                    this.sortBy = preferences.sortBy;
                }
            }
        } catch (error) {
            console.warn('Could not load user preferences:', error);
        }
    }

    // Save user preferences
    saveUserPreferences() {
        try {
            const preferences = {
                country: document.getElementById('country').value,
                sortBy: this.sortBy
            };
            localStorage.setItem('jobAnalyzer_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Could not save user preferences:', error);
        }
    }

    // Perform job search
    async performSearch() {
        console.log('🔍 Starting job search...');
        
        // Get search parameters
        const searchParams = this.getSearchParameters();
        
        // Validate required fields
        if (!searchParams.keywords && !searchParams.location) {
            alert('Please enter either keywords or location to search for jobs.');
            return;
        }

        // Show loading state
        this.showLoading();
        
        try {
            // Fetch job data
            const jobData = await jobAPI.searchJobs(searchParams);
            
            // Store current data
            this.currentData = jobData;
            this.filteredJobs = jobData.jobs;
            this.currentPage = 1;
            
            // Update UI
            this.displayResults(jobData);
            this.saveUserPreferences();
            
            console.log('✅ Search completed successfully');
            
        } catch (error) {
            console.error('❌ Search failed:', error);
            this.showError(error.message);
        }
    }

    // Get search parameters from form
    getSearchParameters() {
        return {
            keywords: document.getElementById('keywords').value.trim(),
            location: document.getElementById('location').value.trim(),
            country: document.getElementById('country').value,
            salaryMin: document.getElementById('salary-min').value,
            salaryMax: document.getElementById('salary-max').value
        };
    }

    // Display search results
    displayResults(jobData) {
        this.hideLoading();
        this.hideElement('error-message');
        
        if (!jobData.jobs || jobData.jobs.length === 0) {
            this.showError('No jobs found matching your criteria. Try different search parameters.');
            return;
        }        

        // Update statistics cards
        this.updateStatistics(jobData);
        
        // Update charts
        jobCharts.updateCharts(jobData);
        
        // Display job listings
        this.sortAndDisplayJobs();
        
        // Show results section
        this.showElement('results-section');
    }

    // Update statistics cards
    updateStatistics(jobData) {
        // Total jobs
        document.getElementById('total-jobs').textContent = jobData.totalJobs.toLocaleString();
        
        // Average salary
        if (jobData.salaryStats && jobData.salaryStats.average) {
            const avgSalary = Math.round(jobData.salaryStats.average);
            document.getElementById('avg-salary').textContent = `${avgSalary.toLocaleString()}`;
        } else {
            document.getElementById('avg-salary').textContent = 'N/A';
        }
        
        // Top company
        if (jobData.companyStats && jobData.companyStats.top.length > 0) {
            const topCompany = jobData.companyStats.top[0];
            document.getElementById('top-company').textContent = topCompany[0];
        } else {
            document.getElementById('top-company').textContent = 'Various';
        }
        
        // Top location
        if (jobData.locationStats && jobData.locationStats.top.length > 0) {
            const topLocation = jobData.locationStats.top[0];
            document.getElementById('top-location').textContent = topLocation[0];
        } else {
            document.getElementById('top-location').textContent = 'Various';
        }
    }

    // Sort and display jobs
    sortAndDisplayJobs() {
        if (!this.filteredJobs || this.filteredJobs.length === 0) {
            return;
        }

        // Sort jobs based on selected criteria
        this.filteredJobs.sort((a, b) => {
            let comparison = 0;
            
            switch (this.sortBy) {
                case 'salary':
                    const salaryA = a.salary ? a.salary.average : 0;
                    const salaryB = b.salary ? b.salary.average : 0;
                    comparison = salaryB - salaryA; // Descending by default
                    break;
                case 'company':
                    comparison = a.company.localeCompare(b.company);
                    break;
                case 'location':
                    comparison = a.location.localeCompare(b.location);
                    break;
                case 'date':
                default:
                    const dateA = new Date(a.created);
                    const dateB = new Date(b.created);
                    comparison = dateB - dateA; // Most recent first
                    break;
            }
            
            return this.sortOrder === 'asc' ? comparison : -comparison;
        });

        this.displayJobs();
    }

    // Display jobs with pagination
    displayJobs() {
        const jobsList = document.getElementById('jobs-list');
        const totalJobs = this.filteredJobs.length;
        const totalPages = Math.ceil(totalJobs / this.itemsPerPage);
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalJobs);
        const currentJobs = this.filteredJobs.slice(startIndex, endIndex);
        
        // Clear existing jobs
        jobsList.innerHTML = '';
        
        // Create job cards
        currentJobs.forEach(job => {
            const jobCard = this.createJobCard(job);
            jobsList.appendChild(jobCard);
        });
        
        // Update pagination
        this.updatePagination(totalPages);
    }

    // Create individual job card
    createJobCard(job) {
        const card = document.createElement('div');
        card.className = 'job-card';
        
        const timeAgo = this.getTimeAgo(job.created);
        const salaryDisplay = job.salary ? job.salary.formatted : 'Salary not specified';
        
        card.innerHTML = `
            <div class="job-header">
                <div class="job-info">
                    <div class="job-title">${this.escapeHtml(job.title)}</div>
                    <div class="job-company">${this.escapeHtml(job.company)}</div>
                </div>
                <div class="job-salary">${salaryDisplay}</div>
            </div>
            <div class="job-details">
                <span class="job-location">📍 ${this.escapeHtml(job.location)}</span>
                <span class="job-type">📋 ${this.escapeHtml(job.contractType)}</span>
                <span class="job-date">🕒 ${timeAgo}</span>
            </div>
            <div class="job-description">
                ${this.escapeHtml(job.description)}
            </div>
            <div class="job-actions">
                <a href="${job.url}" target="_blank" rel="noopener noreferrer" class="job-link">
                    View Job →
                </a>
            </div>
        `;
        
        return card;
    }

    // Update pagination controls
    updatePagination(totalPages) {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');
        
        // Update button states
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= totalPages;
        
        // Update page info
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    }

    // Get time ago string
    getTimeAgo(dateString) {
        if (!dateString) return 'Recently';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show loading state
    showLoading() {
        this.showElement('loading');
        this.hideElement('results-section');
        this.hideElement('error-message');
        
        // Disable search button
        const searchBtn = document.getElementById('search-btn');
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="search-icon">⏳</span> Searching...';
    }

    // Hide loading state
    hideLoading() {
        this.hideElement('loading');
        
        // Re-enable search button
        const searchBtn = document.getElementById('search-btn');
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<span class="search-icon">🔍</span> Analyze Market';
    }

    // Show error message
    showError(message) {
        this.hideLoading();
        this.hideElement('results-section');
        
        const errorText = document.getElementById('error-text');
        errorText.textContent = message;
        
        this.showElement('error-message');
    }

    // Utility methods for showing/hiding elements
    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    // Export data functionality
    exportData(format = 'json') {
        if (!this.currentData || !this.currentData.jobs) {
            alert('No data to export. Please perform a search first.');
            return;
        }

        try {
            let exportContent;
            let filename;
            let mimeType;

            switch (format.toLowerCase()) {
                case 'csv':
                    exportContent = this.convertToCSV(this.currentData.jobs);
                    filename = `job-market-data-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;
                case 'json':
                default:
                    exportContent = JSON.stringify(this.currentData, null, 2);
                    filename = `job-market-data-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;
            }

            // Create and trigger download
            const blob = new Blob([exportContent], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log(`📁 Data exported as ${filename}`);
        } catch (error) {
            console.error('❌ Export failed:', error);
            alert('Failed to export data. Please try again.');
        }
    }

    // Convert job data to CSV format
    convertToCSV(jobs) {
        const headers = ['Title', 'Company', 'Location', 'Salary Min', 'Salary Max', 'Contract Type', 'Created Date', 'URL'];
        const csvContent = [
            headers.join(','),
            ...jobs.map(job => [
                `"${(job.title || '').replace(/"/g, '""')}"`,
                `"${(job.company || '').replace(/"/g, '""')}"`,
                `"${(job.location || '').replace(/"/g, '""')}"`,
                job.salary ? job.salary.min : '',
                job.salary ? job.salary.max : '',
                `"${(job.contractType || '').replace(/"/g, '""')}"`,
                job.created || '',
                `"${(job.url || '').replace(/"/g, '""')}"`
            ].join(','))
        ];
        
        return csvContent.join('\n');
    }

    // Search suggestions (basic implementation)
    async getSearchSuggestions(query) {
        // This could be enhanced with a dedicated suggestions API
        const commonKeywords = [
            'Software Developer', 'Data Analyst', 'Product Manager', 'Designer',
            'Marketing Manager', 'Sales Representative', 'Customer Support',
            'DevOps Engineer', 'Full Stack Developer', 'Frontend Developer',
            'Backend Developer', 'Mobile Developer', 'QA Engineer'
        ];

        return commonKeywords.filter(keyword => 
            keyword.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobApp = new JobMarketApp();
});

// Add export functionality to window for easy access
window.exportJobData = (format) => {
    if (window.jobApp) {
        window.jobApp.exportData(format);
    }
};