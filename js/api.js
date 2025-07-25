// API Integration Module for Job Market Analyzer

class JobMarketAPI {
    constructor() {
        this.cache = new Map();
        this.rateLimiter = new Map();
    }

    // Check if we're hitting rate limits
    checkRateLimit(endpoint) {
        const now = Date.now();
        const key = `${endpoint}_${Math.floor(now / 60000)}`; // Per minute key
        const count = this.rateLimiter.get(key) || 0;
        
        if (count >= 10) { // 10 requests per minute limit
            return false;
        }
        
        this.rateLimiter.set(key, count + 1);
        return true;
    }

    // Cache management
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < CONFIG.SETTINGS.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Search jobs using Adzuna API
    async searchJobs(params) {
        const cacheKey = `jobs_${JSON.stringify(params)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            console.log('📦 Using cached job data');
            return cached;
        }

        if (!this.checkRateLimit('jobs')) {
            throw new Error('Rate limit exceeded. Please wait a moment before searching again.');
        }

        try {
            const queryParams = this.buildJobSearchParams(params);
            const url = `${CONFIG.ADZUNA.BASE_URL}/${params.country}/search/1?${queryParams}`;
            
            console.log('🔍 Fetching jobs from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Process and enhance the job data
            const processedData = this.processJobData(data);
            
            this.setCachedData(cacheKey, processedData);
            return processedData;
            
        } catch (error) {
            console.error('❌ Job search error:', error);
            throw new Error(`Failed to fetch jobs: ${error.message}`);
        }
    }

    // Build query parameters for job search
    buildJobSearchParams(params) {
        const queryParams = new URLSearchParams();
        
        // Required parameters
        queryParams.append('app_id', CONFIG.ADZUNA.APP_ID);
        queryParams.append('app_key', CONFIG.ADZUNA.API_KEY);
        queryParams.append('results_per_page', CONFIG.SETTINGS.RESULTS_PER_PAGE);
        queryParams.append('content-type', 'application/json');
        
        // Optional parameters
        if (params.keywords) {
            queryParams.append('what', params.keywords);
        }
        
        if (params.location) {
            queryParams.append('where', params.location);
        }
        
        if (params.salaryMin) {
            queryParams.append('salary_min', params.salaryMin);
        }
        
        if (params.salaryMax) {
            queryParams.append('salary_max', params.salaryMax);
        }
        
        // Sort by relevance by default
        queryParams.append('sort_by', 'relevance');
        
        return queryParams.toString();
    }

    // Process and clean job data
    processJobData(rawData) {
        if (!rawData || !rawData.results) {
            return {
                totalJobs: 0,
                jobs: [],
                salaryStats: null,
                locationStats: {},
                companyStats: {},
                processed: true
            };
        }

        const jobs = rawData.results.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company?.display_name || 'Company not specified',
            location: job.location?.display_name || 'Location not specified',
            salary: this.processSalary(job),
            description: this.cleanDescription(job.description),
            url: job.redirect_url,
            created: job.created,
            contractType: job.contract_type || 'Not specified',
            category: job.category?.label || 'General'
        }));

        return {
            totalJobs: rawData.count || jobs.length,
            jobs: jobs,
            salaryStats: this.calculateSalaryStats(jobs),
            locationStats: this.calculateLocationStats(jobs),
            companyStats: this.calculateCompanyStats(jobs),
            processed: true
        };
    }

    // Process salary information
    processSalary(job) {
        if (job.salary_min && job.salary_max) {
            const min = parseFloat(job.salary_min);
            const max = parseFloat(job.salary_max);
            return {
                min: min,
                max: max,
                average: (min + max) / 2,
                formatted: this.formatSalary(min, max)
            };
        } else if (job.salary_min) {
            const salary = parseFloat(job.salary_min);
            return {
                min: salary,
                max: salary,
                average: salary,
                formatted: this.formatSalary(salary)
            };
        }
        return null;
    }

    // Format salary for display
    formatSalary(min, max = null) {
        const formatNumber = (num) => {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(0) + 'K';
            }
            return num.toLocaleString();
        };

        if (max && max !== min) {
            return `$${formatNumber(min)} - $${formatNumber(max)}`;
        }
        return `$${formatNumber(min)}`;
    }

    // Clean and truncate job descriptions
    cleanDescription(description) {
        if (!description) return 'No description available';
        
        // Remove HTML tags
        const cleanText = description.replace(/<[^>]*>/g, '');
        
        // Truncate to reasonable length
        if (cleanText.length > 300) {
            return cleanText.substring(0, 300) + '...';
        }
        
        return cleanText;
    }

    // Calculate salary statistics
    calculateSalaryStats(jobs) {
        const salaries = jobs
            .filter(job => job.salary && job.salary.average)
            .map(job => job.salary.average);

        if (salaries.length === 0) {
            return null;
        }

        const sorted = salaries.sort((a, b) => a - b);
        
        return {
            count: salaries.length,
            min: Math.min(...salaries),
            max: Math.max(...salaries),
            average: salaries.reduce((a, b) => a + b, 0) / salaries.length,
            median: sorted[Math.floor(sorted.length / 2)],
            distribution: this.createSalaryDistribution(sorted)
        };
    }

    // Create salary distribution for charts
    createSalaryDistribution(salaries) {
        const min = Math.min(...salaries);
        const max = Math.max(...salaries);
        const range = max - min;
        const bucketSize = range / 6; // 6 buckets

        const buckets = Array(6).fill(0).map((_, i) => ({
            range: `${this.formatSalary(min + i * bucketSize)} - ${this.formatSalary(min + (i + 1) * bucketSize)}`,
            count: 0,
            min: min + i * bucketSize,
            max: min + (i + 1) * bucketSize
        }));

        salaries.forEach(salary => {
            const bucketIndex = Math.min(Math.floor((salary - min) / bucketSize), 5);
            buckets[bucketIndex].count++;
        });

        return buckets;
    }

    // Calculate location statistics
    calculateLocationStats(jobs) {
        const locationCounts = {};
        
        jobs.forEach(job => {
            const location = job.location;
            locationCounts[location] = (locationCounts[location] || 0) + 1;
        });

        // Sort by count and return top 10
        const sorted = Object.entries(locationCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            top: sorted,
            total: Object.keys(locationCounts).length,
            distribution: sorted.map(([location, count]) => ({
                location,
                count,
                percentage: (count / jobs.length * 100).toFixed(1)
            }))
        };
    }

    // Calculate company statistics
    calculateCompanyStats(jobs) {
        const companyCounts = {};
        
        jobs.forEach(job => {
            const company = job.company;
            if (company !== 'Company not specified') {
                companyCounts[company] = (companyCounts[company] || 0) + 1;
            }
        });

        // Sort by count and return top 10
        const sorted = Object.entries(companyCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            top: sorted,
            total: Object.keys(companyCounts).length,
            distribution: sorted.map(([company, count]) => ({
                company,
                count,
                percentage: (count / jobs.length * 100).toFixed(1)
            }))
        };
    }

    // Get country information from REST Countries API
    async getCountryInfo(countryCode) {
        const cacheKey = `country_${countryCode}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(`${CONFIG.COUNTRIES.BASE_URL}/alpha/${countryCode}`);
            if (!response.ok) {
                throw new Error(`Country API Error: ${response.status}`);
            }
            
            const data = await response.json();
            const countryInfo = {
                name: data[0].name.common,
                currency: Object.keys(data[0].currencies || {})[0] || 'USD',
                region: data[0].region,
                population: data[0].population
            };
            
            this.setCachedData(cacheKey, countryInfo);
            return countryInfo;
            
        } catch (error) {
            console.error('❌ Country info error:', error);
            return {
                name: CONFIG.SETTINGS.SUPPORTED_COUNTRIES[countryCode] || 'Unknown',
                currency: 'USD',
                region: 'Unknown',
                population: 0
            };
        }
    }

    // Get historical job trends (mock implementation for demo)
    async getJobTrends(params) {
        // This would typically involve multiple API calls over time
        // For now, we'll generate mock trending data
        return this.generateMockTrends(params);
    }

    // Generate mock trending data for demonstration
    generateMockTrends(params) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const baseValue = Math.floor(Math.random() * 1000) + 500;
        
        return months.map((month, index) => ({
            month,
            jobCount: baseValue + Math.floor(Math.random() * 200) - 100,
            avgSalary: 50000 + Math.floor(Math.random() * 20000)
        }));
    }
}

// Create global API instance
const jobAPI = new JobMarketAPI();