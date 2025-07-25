# Job Market Intelligence Dashboard

A comprehensive web application that analyzes job market trends, salary distributions, and provides valuable insights for job seekers and market researchers. Built with vanilla JavaScript and integrated with external APIs to deliver real-time job market data.

![Job Market Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![API](https://img.shields.io/badge/API-Adzuna-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 🎯 Purpose

This application serves job seekers, recruiters, and market researchers by providing:

- **Real-time job market analysis** across multiple countries
- **Salary insights and distributions** to inform career decisions
- **Location-based opportunity mapping** for relocation planning
- **Skills demand analysis** to guide professional development
- **Company hiring trends** to identify active employers

## ✨ Key Features

### 🔍 **Intelligent Job Search**
- Multi-parameter search (keywords, location, salary range, country)
- Real-time data from Adzuna API
- Advanced filtering and sorting options
- Pagination for large result sets

### 📊 **Visual Analytics**
- Interactive salary distribution charts
- Geographic job distribution analysis
- Skills demand visualization
- Company hiring activity tracking

### 💼 **Market Intelligence**
- Average salary calculations
- Top hiring companies identification
- Location-based opportunity mapping
- Historical trend analysis (mock data for demo)

### 🎨 **User Experience**
- Responsive design for all devices
- Modern, intuitive interface
- Fast loading with intelligent caching
- Export functionality (JSON/CSV)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **APIs**: 
  - Adzuna Job Search API (primary data source)
  - REST Countries API (location data)
- **Styling**: Modern CSS with Flexbox/Grid
- **Caching**: Browser localStorage for performance

## 🚀 Getting Started

### Prerequisites

1. Modern web browser (Chrome, Firefox, Safari, Edge)
2. Adzuna API credentials (free registration required)
3. Web server (for production deployment)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd job-market-analyzer
   ```

2. **Get API credentials**
   - Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
   - Register for a free account
   - Get your `APP_ID` and `API_KEY`

3. **Configure API keys**
   - Open `config/config.js`
   - Replace placeholder values:
   ```javascript
   ADZUNA: {
       APP_ID: 'your_actual_app_id',
       API_KEY: 'your_actual_api_key',
       // ... rest of config
   }
   ```

4. **Run locally**
   - Open `index.html` in your browser, or
   - Use a local server:
   ```bash
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

## 🌐 Deployment Instructions

### Part Two: Server Deployment

This application is designed to be deployed on the provided web servers with load balancing.

#### Step 1: Prepare Application Files

1. **Create deployment package**
   ```bash
   # Ensure all files are ready
   ls -la
   # Should see: index.html, css/, js/, config/, assets/
   ```

2. **Verify configuration**
   - Ensure `config/config.js` has correct API keys
   - Test locally before deployment

#### Step 2: Deploy to Web Servers

1. **Upload to Web01 server**
   ```bash
   scp -r * user@web01:/var/www/html/job-analyzer/
   ```

2. **Upload to Web02 server**
   ```bash
   scp -r * user@web02:/var/www/html/job-analyzer/
   ```

3. **Set proper permissions**
   ```bash
   chmod -R 755 /var/www/html/job-analyzer/
   ```

#### Step 3: Configure Load Balancer (Lb01)

1. **Update Nginx configuration**
   ```nginx
   upstream job_analyzer_backend {
       server web01:80;
       server web02:80;
   }

   server {
       listen 80;
       server_name your-domain.com;

       location /job-analyzer/ {
           proxy_pass http://job_analyzer_backend/job-analyzer/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

2. **Test load balancer**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Verify deployment**
   - Access application via load balancer IP
   - Test functionality on both servers
   - Monitor load distribution

#### Step 4: Health Checks and Monitoring

1. **Create health check endpoint** (optional)
   ```javascript
   // Add to main.js
   function healthCheck() {
       return {
           status: 'healthy',
           timestamp: new Date().toISOString(),
           api_status: validateConfig()
       };
   }
   ```

2. **Monitor server performance**
   ```bash
   # Check server logs
   tail -f /var/log/nginx/access.log
   
   # Monitor resource usage
   htop
   ```

## 📊 API Documentation

### Primary APIs Used

#### Adzuna Job Search API
- **Purpose**: Main job data source
- **Endpoint**: `https://api.adzuna.com/v1/api/jobs/{country}/search`
- **Rate Limit**: 1000 calls/month (free tier)
- **Documentation**: [Adzuna API Docs](https://developer.adzuna.com/)

**Example Request:**
```javascript
const params = {
    app_id: 'your_app_id',
    app_key: 'your_api_key',
    what: 'javascript developer',
    where: 'london',
    results_per_page: 20
};
```

#### REST Countries API
- **Purpose**: Country and location data
- **Endpoint**: `https://restcountries.com/v3.1/`
- **Rate Limit**: No limits
- **Documentation**: [REST Countries](https://restcountries.com/)

### Error Handling

The application implements comprehensive error handling:

- **Rate limiting protection**
- **Network failure recovery**
- **Invalid API response handling**
- **User-friendly error messages**

## 🧪 Testing

### Manual Testing Checklist

- [ ] Search with keywords only
- [ ] Search with location only
- [ ] Search with salary filters
- [ ] Test pagination
- [ ] Test sorting options
- [ ] Test responsive design
- [ ] Test error scenarios
- [ ] Test load balancer functionality

### Load Balancer Testing

1. **Test server failover**
   ```bash
   # Stop web01
   sudo systemctl stop nginx
   # Verify web02 handles requests
   
   # Restart web01
   sudo systemctl start nginx
   # Verify load distribution resumes
   ```

2. **Performance testing**
   ```bash
   # Use Apache Bench for load testing
   ab -n 100 -c 10 http://your-domain.com/job-analyzer/
   ```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**
   ```
   Error: API Error: 401 - Unauthorized
   Solution: Check API keys in config/config.js
   ```

2. **No Jobs Found**
   ```
   Issue: Empty search results
   Solution: Try broader search terms or different locations
   ```

3. **Charts Not Loading**
   ```
   Issue: Charts appear blank
   Solution: Check browser console for Chart.js errors
   ```

4. **Load Balancer Issues**
   ```
   Issue: 502 Bad Gateway
   Solution: Check if both web servers are running
   ```

### Debug Mode

Enable debug logging:
```javascript
// In config/config.js, add:
DEBUG: true
```

## 🔒 Security Considerations

- **API keys are not exposed** in client-side code (use environment variables in production)
- **Input validation** prevents XSS attacks
- **Rate limiting** prevents API abuse
- **HTTPS recommended** for production deployment

## 🚀 Performance Optimization

- **Caching**: API responses cached for 5 minutes
- **Lazy loading**: Charts load only when needed
- **Debounced input**: Prevents excessive API calls
- **Pagination**: Limits DOM elements for better performance

## 🎯 Future Enhancements

### Potential Features
- [ ] User authentication and saved searches
- [ ] Email alerts for new jobs
- [ ] Advanced filtering (company size, benefits)
- [ ] Machine learning job recommendations
- [ ] Real-time job notifications
- [ ] Integration with additional job APIs

### Technical Improvements
- [ ] Service worker for offline functionality
- [ ] Progressive Web App features
- [ ] Database for historical data
- [ ] API server for better security
- [ ] Automated testing suite

## 📝 Assignment Completion


## 👥 Credits

### APIs Used
- **Adzuna Job Search API** - Job data and salary information
- **REST Countries API** - Country and location data

### Libraries
- **Chart.js** - Data visualization
- **Modern CSS** - Styling and responsive design

### Inspiration
Built to address the real need for comprehensive job market analysis tools that go beyond simple job searching.

## 📄 License

This project is created for educational purposes as part of a web development assignment.

---

**Built with ❤️ for job seekers and market researchers**

For questions or issues, please check the troubleshooting section or contact me.