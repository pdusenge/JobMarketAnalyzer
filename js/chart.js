// Chart Visualization Module for Job Market Analyzer
class JobMarketCharts {
    constructor() {
        this.charts = {};
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 10 // Smaller font for legend
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        size: 10 // Smaller font for tooltips
                    },
                    titleFont: {
                        size: 12 // Slightly larger for titles
                    }
                }
            },
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            }
        };
    }

    // Create salary distribution chart (adjusted for small size)
    createSalaryChart(canvasId, salaryStats) {
        if (this.charts.salary) {
            this.charts.salary.destroy();
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas || !salaryStats || !salaryStats.distribution) {
            console.warn('Cannot create salary chart: missing data or canvas');
            return;
        }

        const ctx = canvas.getContext('2d');

        const data = {
            labels: salaryStats.distribution.map(bucket => bucket.range),
            datasets: [{
                label: 'Number of Jobs',
                data: salaryStats.distribution.map(bucket => bucket.count),
                backgroundColor: CONFIG.CHART_COLORS.gradients,
                borderColor: CONFIG.CHART_COLORS.primary,
                borderWidth: 1, // Thinner border
                borderRadius: 4, // Smaller radius
                borderSkipped: false,
            }]
        };

        const options = {
            ...this.defaultOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 9 // Smaller axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number of Jobs',
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 9 // Smaller axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Salary Range',
                        font: {
                            size: 10
                        }
                    }
                }
            },
            plugins: {
                ...this.defaultOptions.plugins,
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${percentage}% of all jobs`;
                        }
                    }
                }
            },
            barPercentage: 0.8, // Make bars slightly thinner
            categoryPercentage: 0.9 // Adjust spacing
        };

        this.charts.salary = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
    }

    // Create location distribution chart (adjusted for small size)
    createLocationChart(canvasId, locationStats) {
        if (this.charts.location) {
            this.charts.location.destroy();
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas || !locationStats || !locationStats.distribution) {
            console.warn('Cannot create location chart: missing data or canvas');
            return;
        }

        const ctx = canvas.getContext('2d');

        const topLocations = locationStats.distribution.slice(0, 8);

        const data = {
            labels: topLocations.map(item => {
                const location = item.location;
                return location.length > 12 ? location.substring(0, 12) + '...' : location;
            }),
            datasets: [{
                label: 'Jobs Available',
                data: topLocations.map(item => item.count),
                backgroundColor: CONFIG.CHART_COLORS.gradients,
                borderColor: CONFIG.CHART_COLORS.primary,
                borderWidth: 1 // Thinner border
            }]
        };

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const item = topLocations[context.dataIndex];
                            return [
                                `${item.location}: ${item.count} jobs`,
                                `${item.percentage}% of total`
                            ];
                        }
                    }
                }
            },
            cutout: '65%', // Make doughnut hole larger for small sizes
            radius: '90%' // Make chart slightly smaller within canvas
        };

        this.charts.location = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }

    // Create job trends chart (adjusted for small size)
    createTrendsChart(canvasId, trendsData) {
        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas || !trendsData) {
            console.warn('Cannot create trends chart: missing data or canvas');
            return;
        }

        const ctx = canvas.getContext('2d');

        const data = {
            labels: trendsData.map(item => item.month),
            datasets: [
                {
                    label: 'Job Postings',
                    data: trendsData.map(item => item.jobCount),
                    borderColor: CONFIG.CHART_COLORS.primary,
                    backgroundColor: CONFIG.CHART_COLORS.gradients[0],
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 1.5 // Thinner line
                },
                {
                    label: 'Average Salary',
                    data: trendsData.map(item => item.avgSalary),
                    borderColor: CONFIG.CHART_COLORS.secondary,
                    backgroundColor: CONFIG.CHART_COLORS.gradients[1],
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 1.5 // Thinner line
                }
            ]
        };

        const options = {
            ...this.defaultOptions,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        font: {
                            size: 9 // Smaller axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Month',
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        font: {
                            size: 9 // Smaller axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number of Jobs',
                        font: {
                            size: 10
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        font: {
                            size: 9 // Smaller axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Average Salary ($)',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            elements: {
                point: {
                    radius: 2, // Smaller points
                    hoverRadius: 4
                }
            }
        };

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
    }

    // Create skills demand chart (kept horizontal as requested)
    createSkillsChart(canvasId, skillsData) {
        if (this.charts.skills) {
            this.charts.skills.destroy();
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas || !skillsData) {
            console.warn('Cannot create skills chart: missing data or canvas');
            return;
        }

        const ctx = canvas.getContext('2d');

        const data = {
            labels: skillsData.map(skill => skill.name),
            datasets: [{
                label: 'Demand Level',
                data: skillsData.map(skill => skill.demand),
                backgroundColor: CONFIG.CHART_COLORS.gradients,
                borderColor: CONFIG.CHART_COLORS.primary,
                borderWidth: 1, // Thinner border
                borderRadius: 4 // Smaller radius
            }]
        };

        const options = {
            ...this.defaultOptions,
            indexAxis: 'y', // Horizontal bar chart
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 9 // Smaller axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Job Mentions',
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 9 // Smaller axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Skills',
                        font: {
                            size: 10
                        }
                    }
                }
            },
            barPercentage: 0.8, // Make bars slightly thinner
            categoryPercentage: 0.9 // Adjust spacing
        };

        this.charts.skills = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
    }

    // Extract skills from job descriptions (basic implementation)
    extractSkills(jobs) {
        const skillKeywords = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS',
            'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'Angular', 'Vue.js',
            'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch', 'GraphQL',
            'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin', 'C++', 'C#',
            'PHP', 'Ruby', 'Scala', 'R', 'MATLAB', 'Tableau', 'PowerBI',
            'Machine Learning', 'AI', 'Data Science', 'DevOps', 'Agile'
        ];

        const skillCounts = {};

        jobs.forEach(job => {
            const text = `${job.title} ${job.description}`.toLowerCase();
            skillKeywords.forEach(skill => {
                if (text.includes(skill.toLowerCase())) {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                }
            });
        });

        // Return top 10 skills
        return Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([name, demand]) => ({ name, demand }));
    }

    // Update all charts with new data
    updateCharts(jobData) {
        try {
            // Update salary chart
            if (jobData.salaryStats) {
                this.createSalaryChart('salary-chart', jobData.salaryStats);
            }

            // Update location chart
            if (jobData.locationStats) {
                this.createLocationChart('location-chart', jobData.locationStats);
            }

            // Create skills chart if we have enough job data
            if (jobData.jobs && jobData.jobs.length > 0) {
                const skillsData = this.extractSkills(jobData.jobs);
                if (skillsData.length > 0) {
                    // Add skills chart container if it doesn't exist
                    this.addSkillsChartContainer();
                    this.createSkillsChart('skills-chart', skillsData);
                }
            }

        } catch (error) {
            console.error('❌ Chart update error:', error);
        }
    }

    // Add skills chart container dynamically
    addSkillsChartContainer() {
        const chartsSection = document.querySelector('.charts-section');
        if (!chartsSection || document.getElementById('skills-chart')) {
            return; // Container already exists or charts section not found
        }

        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'chart-container';
        skillsContainer.innerHTML = `
            <h3>🛠️ Top Skills in Demand</h3>
            <canvas id="skills-chart"></canvas>
        `;

        chartsSection.appendChild(skillsContainer);
    }

    // Destroy all charts (cleanup)
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    // Resize all charts (for responsive design)
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }
}
window.jobCharts = new JobMarketCharts();




// Handle window resize
window.addEventListener('resize', () => {
    jobCharts.resizeCharts();
});