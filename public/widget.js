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
        
        // Create widget container (keeping the hello world for now)
        const widget = document.createElement('div');
        widget.id = 'saturn-webring-widget';
        widget.innerHTML = '<h2>Hello World!</h2>';
        
        // Add some basic styling
        widget.style.cssText = `
            padding: 20px;
            margin: 20px auto;
            max-width: 300px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;
        
        // Add to page
        document.body.appendChild(widget);
        
        console.log('Saturn Webring Widget: initialized!');
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