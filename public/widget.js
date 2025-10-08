(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.SaturnWebringWidget) {
        return;
    }
    
    // Get configuration from script tag data attributes
    function getWidgetConfig() {
        const config = {
            categories: [], // Default: empty array means all categories
            color: '#000000', // Default text/border color
            backgroundColor: '#ffffff', // Default background color
        };
        
        // Check script tag data attributes
        const scriptTag = document.querySelector('script[src*="widget.js"]');
        if (scriptTag) {
            const categoriesAttr = scriptTag.getAttribute('data-categories');
            if (categoriesAttr) {
                try {
                    config.categories = JSON.parse(categoriesAttr);
                } catch (e) {
                    // Fallback: split by comma for simple strings
                    config.categories = categoriesAttr.split(',').map(c => c.trim());
                }
            }
            
            // Get color attributes
            const colorAttr = scriptTag.getAttribute('data-color');
            if (colorAttr) {
                config.color = colorAttr;
            }
            
            const bgColorAttr = scriptTag.getAttribute('data-background-color');
            if (bgColorAttr) {
                config.backgroundColor = bgColorAttr;
            }
        }
        
        console.log('Widget config:', config);
        return config;
    }
    
    // Match requested categories with available categories in data
    function matchCategories(requestedCategories, data) {
        // Get available categories from the data
        const availableCategories = data.categories || [];
        
        // If no categories requested, return empty array
        if (!requestedCategories || requestedCategories.length === 0) {
            return [];
        }
        
        const validCategories = [];
        
        // Check each requested category
        requestedCategories.forEach(category => {
            if (availableCategories.includes(category)) {
                validCategories.push(category);
            } else {
                console.error(`Category "${category}" does not exist in the webring data. Available categories:`, availableCategories);
            }
        });
        
        return validCategories;
    }
    
    // Filter webring data by categories
    function filterByCategories(data, categories) {
        if (!categories || categories.length === 0) {
            return data; // Return all if no categories specified
        }
        
        // Assuming the data structure has sites with category information
        // This will need to be adjusted based on actual data structure
        if (data.sites) {
            const filteredSites = data.sites.filter(site => {
                if (!site.categories) return false;
                return categories.some(cat => site.categories.includes(cat));
            });
            
            return {
                ...data,
                sites: filteredSites
            };
        }
        
        return data;
    }
    
    // Fetch webring data and create widget
    async function createWidget() {
        // Get widget configuration
        const config = getWidgetConfig();
        
        try {
            // Fetch the index.json file
            const response = await fetch('https://saturn91.github.io/saturn91-webring-data/public/index.json');
            const data = await response.json();
            
            // Match requested categories with available ones
            const categories = matchCategories(config.categories, data);
            
            // Filter by categories if specified
            const filteredData = filterByCategories(data, categories);            
        } catch (error) {
            console.error('Error fetching webring data:', error);
        }
        
        // Create modern webring widget with mockup data
        const widget = document.createElement('div');
        widget.id = 'saturn-webring-widget';
        widget.innerHTML = createWidgetHTML();
        
        // Apply modern styles with custom colors
        applyWidgetStyles(config.color, config.backgroundColor);
        
        // Add to page
        document.body.appendChild(widget);
        
        console.log('Saturn91\'s Webring Widget: initialized!');
    }
    
    // Create the widget HTML structure
    function createWidgetHTML() {
        // Mockup data for 3 categories
        const mockupData = {
            'Web Dev': [
                { title: 'Awesome Portfolio Site', url: 'https://link1.com' },
                { title: 'Modern Web Studio', url: 'https://link2.com' },
                { title: 'Creative Agency Hub', url: 'https://link3.com' },
                { title: 'Frontend Showcase', url: 'https://link4.com' }
            ],
            'Game Dev': [
                { title: 'Indie Game Studio', url: 'https://link5.com' },
                { title: 'Pixel Art Games', url: 'https://link6.com' },
                { title: 'Adventure Quest Hub', url: 'https://link7.com' },
                { title: 'Retro Game Archive', url: 'https://link8.com' }
            ],
            'Art & Design': [
                { title: 'Digital Art Gallery', url: 'https://link9.com' },
                { title: 'Illustration Studio', url: 'https://link10.com' },
                { title: 'Creative Workshop', url: 'https://link11.com' },
                { title: 'Design Inspiration', url: 'https://link12.com' }
            ]
        };
        
        let html = `
            <div class="webring-header">
                <h3>Join Saturn91's Webring</h3>
            </div>
            <div class="webring-grid">
        `;
        
        // Generate columns for each category
        Object.entries(mockupData).forEach(([category, links]) => {
            html += `
                <div class="webring-column">
                    <h4 class="category-title">${category}</h4>
                    <div class="links-container">
            `;
            
            links.forEach(link => {
                html += `
                    <a href="${link.url}" class="webring-link" target="_blank" rel="noopener">
                        <span class="link-title">${link.title}</span>
                        <span class="link-arrow">→</span>
                    </a>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="webring-footer">
                <a href="#" class="join-link">Join the Webring</a>
            </div>
        `;
        
        return html;
    }
    
    // Apply modern responsive styles
    function applyWidgetStyles(color = '#000000', backgroundColor = '#ffffff') {
        // Check if styles are already applied
        if (document.getElementById('saturn-webring-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'saturn-webring-styles';
        styleElement.textContent = `
            #saturn-webring-widget {
                --widget-color: ${color};
                --widget-bg-color: ${backgroundColor};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                max-width: 1000px;
                margin: 30px auto;
                padding: 30px;
                background: var(--widget-bg-color);
                border: 1px solid var(--widget-color);
                color: var(--widget-color);
                line-height: 1.5;
            }
            
            .webring-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid var(--widget-color);
            }
            
            .webring-header h3 {
                margin: 0 0 8px 0;
                font-size: 24px;
                font-weight: 600;
                color: var(--widget-color);
            }
            
            .webring-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .webring-column {
                border-right: 1px solid var(--widget-color);
                padding-right: 20px;
            }
            
            .webring-column:last-child {
                border-right: none;
            }
            
            .category-title {
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 600;
                color: var(--widget-color);
                padding-bottom: 8px;
                border-bottom: 1px solid var(--widget-color);
            }
            
            .links-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .webring-link {
                display: block;
                padding: 8px 0;
                color: var(--widget-color);
                text-decoration: underline;
                font-size: 14px;
                transition: color 0.2s ease;
            }
            
            .webring-link:hover {
                color: var(--widget-color);
            }
            
            .link-title {
                font-weight: 400;
            }
            
            .link-arrow {
                display: none;
            }
            
            .webring-footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid var(--widget-color);
            }
            
            .join-link {
                display: inline-block;
                padding: 8px 16px;
                background: var(--widget-bg-color);
                color: var(--widget-color);
                text-decoration: none;
                border: 1px solid var(--widget-color);
                font-weight: 400;
                font-size: 14px;
                transition: all 0.2s ease;
            }
            
            .join-link:hover {
                background: var(--widget-color);
                color: var(--widget-bg-color);
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                #saturn-webring-widget {
                    margin: 20px auto;
                    padding: 20px;
                    max-width: 95%;
                }
                
                .webring-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .webring-column {
                    border-right: none;
                    padding-right: 0;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--widget-color);
                }
                
                .webring-column:last-child {
                    border-bottom: none;
                }
                
                .webring-header h3 {
                    font-size: 20px;
                }
                
                .webring-header p {
                    font-size: 14px;
                }
                
                .category-title {
                    font-size: 16px;
                }
            }
            
            @media (max-width: 480px) {
                #saturn-webring-widget {
                    padding: 16px;
                }
                
                .webring-header {
                    margin-bottom: 20px;
                }
                
                .webring-grid {
                    gap: 16px;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
    
    // Mark as initialized
    window.SaturnWebringWidget = true;
})();