(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.SaturnWebringWidget) {
        return;
    }
    
    // Simple Hello World widget
    function createWidget() {
        // Create widget container
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
        
        console.log('Saturn Webring Widget: Hello World!');
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