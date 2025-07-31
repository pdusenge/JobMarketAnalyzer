# Job Market Intelligence Dashboard

A comprehensive web application that analyzes job market trends, salary distributions, and provides valuable insights for job seekers and market researchers. Built with vanilla JavaScript and integrated with external APIs to deliver real-time job market data.

![Job Market Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![API](https://img.shields.io/badge/API-Adzuna-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![Docker](https://img.shields.io/badge/Docker-Enabled-blue)

## 🎞 Demo video
https://www.youtube.com/watch?v=-kJ8eeII8mA

## 🤞 Docker hub link
https://hub.docker.com/r/peggy100/job-market-web

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Docker & Docker Compose (for containerized deployment)
- Adzuna API credentials ([Get free account](https://developer.adzuna.com/))

### Local Development Setup

1. **Clone and configure**
   ```bash
   git clone https://github.com/pdusenge/JobMarketAnalyzer
   cd JobMarketAnalyzer
   ```

2. **Create API Keys File**
   Create `secretKeys.js` in the root directory:
   ```javascript
   const APP_ID = 'your_actual_app_id';
   const API_KEY = 'your_actual_api_key';
   
   module.exports = { APP_ID, API_KEY };
   ```

3. **Run with Docker Compose (Recommended)**
   ```bash
   # Start all services (2 web servers + load balancer)
   docker-compose up -d
   
   # Access the application
   # - Load Balancer: http://localhost:8080
   # - Web Server 1: http://localhost:8081
   # - Web Server 2: http://localhost:8082
   ```

4. **Or run locally without Docker**
   ```bash
   # Simple local server
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

## 🏗️ Architecture Overview

The application uses a **load-balanced architecture** with:

- **Load Balancer (nginx)** - Distributes traffic between web servers
- **Web Server 1 (web01)** - Primary application instance
- **Web Server 2 (web02)** - Secondary application instance for redundancy
- **Health Checks** - Monitors server availability

```
Internet → Load Balancer (:8080) → Web01 (:8081)
                                 → Web02 (:8082)
```

## 🌐 Production Deployment

Docker Compose Deployment

1. **Prepare environment**
   ```bash
   # Clone repository
   git clone https://github.com/pdusenge/JobMarketAnalyzer
   cd <your-repository-url>
   
   # Create API keys file
   echo "const APP_ID = 'your_app_id';
   const API_KEY = 'your_api_key';
   module.exports = { APP_ID, API_KEY };" > secretKeys.js
   ```

2. **Deploy with Docker Compose**
   ```bash
   # Build and start all services
   docker-compose up -d --build
   
   # Verify deployment
   docker-compose ps
   
   # Check logs
   docker-compose logs -f
   ```

3. **Test load balancer**
   ```bash
   # Test main application
   curl http://localhost:8080
   
   # Test health endpoints
   curl http://localhost:8080/health
   curl http://localhost:8081/health
   curl http://localhost:8082/health
   ```



## 📊 Features

- **🔍 Smart Job Search** - Multi-parameter search with real-time filtering
- **📈 Visual Analytics** - Interactive charts for salary and location distribution  
- **💼 Market Intelligence** - Top companies, locations, and salary insights
- **📱 Responsive Design** - Works seamlessly on all devices
- **📁 Data Export** - Export results in JSON/CSV formats
- **⚖️ Load Balancing** - High availability with automatic failover

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **APIs**: 
  - [Adzuna Job Search API](https://developer.adzuna.com/) - Primary job data
  - [REST Countries API](https://restcountries.com/) - Location data
- **Infrastructure**: Docker, Docker Compose, Nginx Load Balancer
- **Caching**: Browser localStorage + API response caching

## 📁 Project Structure

```
job-market-analyzer/
├── index.html                    # Main application
├── css/styles.css               # Application styling
├── js/
│   ├── main.js                  # Core application logic
│   ├── api.js                   # API integration
│   └── chart.js                 # Chart visualizations
├── config/config.js             # Configuration settings
├── secretKeys.js                # API credentials (create this)
├── nginx/
│   ├── nginx-lb.conf           # Load balancer config
│   ├── web1.conf               # Web server 1 config
│   └── web2.conf               # Web server 2 config
├── docker-compose.yml          # Multi-container setup
├── Dockerfile                  # Container definition
└── README.md                   # This file
```

## 🔗 API Documentation

### Adzuna Job Search API
- **Purpose**: Primary job data source with salary information
- **Rate Limit**: 1000 calls/month (free tier)
- **Documentation**: [Adzuna API Docs](https://developer.adzuna.com/)
- **Signup**: [developer.adzuna.com](https://developer.adzuna.com/)

**Example API Call:**
```javascript
GET https://api.adzuna.com/v1/api/jobs/us/search/1?
  app_id=your_app_id&
  app_key=your_api_key&
  what=javascript%20developer&
  where=new%20york&
  results_per_page=20
```

### REST Countries API
- **Purpose**: Country and location metadata
- **Rate Limit**: No limits
- **Documentation**: [REST Countries](https://restcountries.com/)

## 🧪 Testing & Monitoring

### Health Check Endpoints

```bash
# Load balancer health
curl http://localhost:8080/health

# Individual server health  
curl http://localhost:8081/health  # Web01
curl http://localhost:8082/health  # Web02
```

### Load Balancer Testing

1. **Test failover capability**
   ```bash
   # Stop one web server
   docker-compose stop web01
   
   # Verify load balancer redirects to web02
   curl -v http://localhost:8080
   
   # Restart web01
   docker-compose start web01
   ```

2. **Performance testing**
   ```bash
   # Install Apache Bench
   sudo apt-get install apache2-utils
   
   # Load test with 100 requests, 10 concurrent
   ab -n 100 -c 10 http://localhost:8080/
   ```

3. **Monitor logs**
   ```bash
   # Real-time log monitoring
   docker-compose logs -f lb
   docker-compose logs -f web01 web02
   ```

### Manual Testing Checklist

- [ ] Search functionality (keywords, location, salary)
- [ ] Chart rendering (salary distribution, location breakdown)
- [ ] Pagination and sorting
- [ ] Responsive design on mobile/tablet
- [ ] Load balancer failover
- [ ] Health check endpoints
- [ ] Export functionality (JSON/CSV)

## 🐛 Troubleshooting

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **API Authentication Error** | `401 Unauthorized` in console | Check `secretKeys.js` has correct credentials |
| **No jobs found** | Empty results | Try broader search terms or different locations |
| **Charts not rendering** | Blank chart areas | Check browser console for Chart.js errors |
| **Load balancer 502 error** | Gateway errors | Verify both web containers are running: `docker-compose ps` |
| **Container startup failure** | Exit codes in logs | Check Docker logs: `docker-compose logs [service]` |

### Debug Commands

```bash
# Check container status
docker-compose ps

# View service logs
docker-compose logs web01
docker-compose logs web02
docker-compose logs lb

# Test API connectivity
curl -v "https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=test&app_key=test"

# Restart services
docker-compose restart
```

## 🚧 Development Challenges & Solutions

### Challenge 1: API Rate Limiting & Caching
**Problem**: Free Adzuna API tier limited to 1000 calls/month  
**Solution**: Implemented intelligent caching system with 5-minute cache duration and rate limiting protection in `js/api.js`

### Challenge 2: Load Balancer Configuration
**Problem**: Ensuring proper traffic distribution and failover  
**Solution**: Configured nginx upstream with health checks and custom headers to identify serving backend

### Challenge 3: Container Orchestration
**Problem**: Managing multiple services (2 web servers + load balancer)  
**Solution**: Used Docker Compose with service dependencies and shared networks

### Challenge 4: API Key Security
**Problem**: Keeping credentials secure but accessible  
**Solution**: Externalized API keys to `secretKeys.js` (gitignored) with clear documentation

### Challenge 5: Cross-Origin Requests
**Problem**: CORS issues when calling external APIs from browser  
**Solution**: Configured proper CORS headers in nginx configuration files

## ⚡ Performance Optimizations

- **🗄️ Multi-level Caching**: API responses cached for 5 minutes, browser localStorage for preferences
- **⚖️ Load Distribution**: Traffic distributed across multiple backend servers
- **🔄 Lazy Loading**: Charts and heavy components load only when needed
- **⏱️ Debounced Input**: Search input debounced to prevent excessive API calls
- **📄 Pagination**: Large result sets split into manageable pages
- **💾 Compression**: Nginx gzip compression for static assets

## 🔒 Security Considerations

- **🔐 API Key Protection**: Credentials stored in separate file (not in git)
- **🛡️ Input Sanitization**: All user inputs sanitized to prevent XSS
- **🚦 Rate Limiting**: Built-in protection against API abuse
- **🌐 CORS Configuration**: Proper cross-origin resource sharing setup
- **🔒 HTTPS Ready**: Application designed for TLS deployment

## 📈 Future Enhancements

### Planned Features
- [ ] User authentication with saved searches
- [ ] Real-time job alerts via email/webhooks
- [ ] Advanced filtering (remote work, company size, benefits)
- [ ] Machine learning job recommendations
- [ ] Integration with additional job APIs (Indeed, LinkedIn)
- [ ] Elasticsearch for better search capabilities

### Technical Improvements
- [ ] Kubernetes deployment manifests
- [ ] CI/CD pipeline with automated testing
- [ ] Redis for distributed caching
- [ ] Database integration for historical data
- [ ] Progressive Web App (PWA) features

## 🙏 Credits & Acknowledgments

### APIs Used
- **[Adzuna](https://www.adzuna.com/)** - Comprehensive job search API with salary data and market insights
- **[REST Countries](https://restcountries.com/)** - Free, comprehensive country and location information API

### Libraries & Tools
- **[Chart.js](https://www.chartjs.org/)** - Beautiful, responsive charts for data visualization
- **[Nginx](https://nginx.org/)** - High-performance web server and load balancer
- **[Docker](https://www.docker.com/)** - Containerization platform for consistent deployments

### Development Resources
- **[MDN Web Docs](https://developer.mozilla.org/)** - Web API documentation and best practices
- **[Docker Documentation](https://docs.docker.com/)** - Container orchestration guidance

### Inspiration
This project addresses the real need for comprehensive job market analysis tools that provide actionable insights for career decisions, going beyond simple job listing aggregation.

## 📄 License

This project is created for educational purposes as part of a web development assignment. The code is available for learning and non-commercial use.

---

## ⚡ Quick Reference Commands

```bash
# pulling the docker images
docker pull peggy100/job-market-web:latest

# 🚀 Start the application
docker-compose up -d

# 🔍 Check service status  
docker-compose ps

# 📊 View logs
docker-compose logs -f

# 🛑 Stop services
docker-compose down

# 🔄 Restart specific service
docker-compose restart web01

# 🧪 Test load balancer
curl http://localhost:8080/health

# 📁 Export data (browser console)
exportJobData('csv')  // or 'json'
```

**🌟 Access Points:**
- **Main Application**: http://localhost:8080 (load balanced)
- **Direct Web01**: http://localhost:8081
- **Direct Web02**: http://localhost:8082

**Built with ❤️ for job seekers and market researchers**
