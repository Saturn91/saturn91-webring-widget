(function() {
    'use strict';

    const defaultDataSource = "https://saturn91.github.io/saturn91-webring-data/public/";
    
    // Get configuration from script tag data attributes
    function getWidgetConfig() {
        const config = {
            categories: [], // Default: empty array means all categories
            color: '#000000', // Default text/border color
            backgroundColor: '#ffffff', // Default background color
            dataSource: 'https://saturn91.github.io/saturn91-webring-data/public/', // Default data source
            maxLinks: 4, // Default maximum links per column
            border: '', // Default border
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
            
            // Get data source attribute
            const dataSourceAttr = scriptTag.getAttribute('data-source');
            if (dataSourceAttr) {
                // Ensure the data source ends with a slash
                config.dataSource = dataSourceAttr.endsWith('/') ? dataSourceAttr : dataSourceAttr + '/';
            }
            
            // Get max links attribute
            const maxLinksAttr = scriptTag.getAttribute('data-max-links');
            if (maxLinksAttr) {
                const maxLinks = parseInt(maxLinksAttr, 10);
                if (maxLinks > 0) {
                    config.maxLinks = maxLinks;
                } else {
                    console.warn('data-max-links must be a positive number > 0, using default value of 4');
                }
            }
            
            // Get border attribute
            const borderAttr = scriptTag.getAttribute('data-border');
            if (borderAttr) {
                config.border = borderAttr;
            }
        }
        
        console.log('Widget config:', config);
        return config;
    }
    
    // Match requested categories with available categories in data
    function matchCategories(requestedCategories, data) {
        // Get available categories from the data
        const availableCategories = data.categories || [];
        
        // If no categories requested, use the first available category
        if (!requestedCategories || requestedCategories.length === 0) {
            if (availableCategories.length > 0) {
                console.log('No categories specified, using first available category:', availableCategories[0]);
                return [availableCategories[0]];
            }
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
    
    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Fetch category data from individual JSON files
    async function fetchCategoryData(categories, dataSource = defaultDataSource, maxLinks = 4) {
        const categoryData = {};
        
        for (const category of categories) {
            try {
                const response = await fetch(`${dataSource}${category}.json`);
                const data = await response.json();
                
                // Transform and shuffle the data
                const allLinks = data.links.map(link => ({
                    title: link.owner,
                    url: link.url
                }));
                
                // Shuffle and take first maxLinks
                const shuffledLinks = shuffleArray(allLinks);
                const links = shuffledLinks.slice(0, maxLinks);
                
                categoryData[category] = links;
                console.log(`Fetched and shuffled ${links.length} links for category: ${category} from ${dataSource} (max: ${maxLinks})`);
                
            } catch (error) {
                console.error(`Error fetching category ${category} from ${dataSource}:`, error);
                categoryData[category] = []; // Empty array if fetch fails
            }
        }
        
        return categoryData;
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
        
        let realCategoryData = {};
        let hasError = false;
        
        try {
            // Fetch the index.json file
            const response = await fetch(`${config.dataSource}index.json`);
            const data = await response.json();
            
            // Match requested categories with available ones
            const categories = matchCategories(config.categories, data);
            
            console.log('Valid categories to fetch:', categories);
            console.log('Using data source:', config.dataSource);
            
            // Fetch real data for valid categories
            if (categories.length > 0) {
                realCategoryData = await fetchCategoryData(categories, config.dataSource, config.maxLinks);
                
                // Check if we actually got any data
                const hasAnyLinks = Object.values(realCategoryData).some(links => links.length > 0);
                if (!hasAnyLinks) {
                    hasError = true;
                }
            } else {
                hasError = true;
            }
            
        } catch (error) {
            console.error('Error fetching webring data:', error);
            hasError = true;
        }
        
        // Create modern webring widget with real data or error message
        const widget = document.createElement('div');
        widget.id = 'saturn91-webring-widget';
        widget.innerHTML = createWidgetHTML(realCategoryData, hasError);
        
        // Apply modern styles with custom colors
        applyWidgetStyles(config.color, config.backgroundColor, config.border);
        
        // Find target container or fall back to body
        const targetContainer = document.getElementById('saturn91-webring');
        if (targetContainer) {
            targetContainer.appendChild(widget);
            console.log('Saturn91\'s Webring Widget: initialized in #saturn91-webring container!');
        } else {
            document.body.appendChild(widget);
            console.log('Saturn91\'s Webring Widget: initialized in document body (no #saturn91-webring container found)!');
        }
    }
    
    // Create the widget HTML structure
    function createWidgetHTML(realData = {}, hasError = false) {
        // Handle error case
        if (hasError || Object.keys(realData).length === 0) {
            return `
                <div class="webring-header">
                    <h3>Saturn91's Webring</h3>
                </div>
                <div class="webring-error">
                    <p>Something went wrong</p>
                </div>
                <div class="webring-footer">
                    <a href="https://saturn91.github.io/saturn91-webring-widget/" class="join-link">Join the Webring</a>
                </div>
            `;
        }
        
        // Use real data
        console.log('Using real webring data:', realData);
        
        let html = `
            <div class="webring-header">
                <h3>Saturn91 Webring</h3>
            </div>
            <div class="webring-grid">
        `;
        
        // Generate columns for each category
        Object.entries(realData).forEach(([category, links]) => {
            // Skip categories with no links
            if (links.length === 0) return;
            
            // Format category name for display (replace hyphens with spaces and capitalize)
            const displayName = category.replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
                
            html += `
                <div class="webring-column">
                    <h4 class="category-title">${displayName}</h4>
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
                <a href="https://saturn91.github.io/saturn91-webring-widget/" class="join-link">Join the Webring</a>
            </div>
        `;
        
        return html;
    }
    
    // Apply modern responsive styles
    function applyWidgetStyles(color = '#000000', backgroundColor = '#ffffff', border = '1px solid var(--widget-color)') {
        // Check if styles are already applied
        if (document.getElementById('saturn91-webring-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'saturn91-webring-styles';
        styleElement.textContent = `
            #saturn91-webring-widget {
                --widget-color: ${color};
                --widget-bg-color: ${backgroundColor};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                width: 100%;
                margin: 0;
                padding: 15px;
                background: var(--widget-bg-color);
                border: ${border};
                color: var(--widget-color);
                line-height: 1.3;
                box-sizing: border-box;
            }
            
            .webring-header {
                text-align: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid var(--widget-color);
            }
            
            .webring-header h3 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: var(--widget-color);
            }
            
            .webring-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 15px;
            }
            
            .webring-column {
                border-right: 1px solid var(--widget-color);
                padding-right: 20px;
            }
            
            .webring-column:last-child {
                border-right: none;
            }
            
            .category-title {
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--widget-color);
                padding-bottom: 6px;
                border-bottom: 1px solid var(--widget-color);
            }
            
            .links-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .webring-link {
                display: block;
                padding: 4px 0;
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
                padding-top: 12px;
                border-top: 1px solid var(--widget-color);
            }
            
            .webring-error {
                text-align: center;
                padding: 20px 10px;
                margin-bottom: 15px;
            }
            
            .webring-error p {
                font-size: 16px;
                color: var(--widget-color);
                margin: 0;
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
                #saturn91-webring-widget {
                    margin: 0;
                    padding: 12px;
                    width: 100%;
                }
                
                .webring-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .webring-column {
                    border-right: none;
                    padding-right: 0;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--widget-color);
                }
                
                .webring-column:last-child {
                    border-bottom: none;
                }
                
                .webring-header h3 {
                    font-size: 18px;
                }
                
                .webring-header p {
                    font-size: 14px;
                }
                
                .category-title {
                    font-size: 15px;
                }
            }
            
            @media (max-width: 480px) {
                #saturn91-webring-widget {
                    padding: 10px;
                }
                
                .webring-header {
                    margin-bottom: 12px;
                }
                
                .webring-grid {
                    gap: 12px;
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
    window.Saturn91WebringWidget = true;
})();