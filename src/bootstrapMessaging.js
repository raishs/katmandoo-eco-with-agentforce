// Initialize embedded_svc settings
window.embedded_svc = window.embedded_svc || {};
window.embedded_svc.settings = window.embedded_svc.settings || {};

// Configure core settings
window.embedded_svc.settings.enabledFeatures = ['LiveAgent'];
window.embedded_svc.settings.entryFeature = 'LiveAgent';
window.embedded_svc.settings.language = 'en-US';

// Configure pre-chat settings
window.embedded_svc.settings.enablePrechat = true;
window.embedded_svc.settings.prechatEnabled = true;
window.embedded_svc.settings.forms = [{
    "formFields": [
        {
            "label": "Name",
            "name": "name",
            "value": username,
            "displayToAgent": true,
            "required": true,
            "isHidden": false,
            "type": "text"
        },
        {
            "label": "Username",
            "name": "userName",
            "value": username,
            "displayToAgent": true,
            "required": true,
            "isHidden": true,
            "type": "hidden"
        }
    ]
}];

// Configure entity mapping for routing
window.embedded_svc.settings.extraPrechatInfo = [{
    "entityName": "MessagingSession",
    "showOnCreate": true,
    "entityFieldMaps": [{
        "isExactMatch": true,
        "fieldName": "userName",
        "doCreate": true,
        "doFind": false,
        "label": "Username"
    }]
}];

// Initialize embedded service settings
window.embeddedservice_bootstrap = window.embeddedservice_bootstrap || {};
window.embeddedservice_bootstrap.settings = window.embeddedservice_bootstrap.settings || {};

// Configure core settings
window.embeddedservice_bootstrap.settings.language = 'en-US';

// Initialize the embedded service
try {
    window.embeddedservice_bootstrap.init(
        orgId,
        deploymentDevName,
        messagingURL,
        {
            scrt2URL: messagingURL
        }
    );
} catch (err) {
    console.error('Error initializing Embedded Messaging:', err);
}

// Add initialization event handlers
window.addEventListener("onEmbeddedMessagingReady", () => {
    console.log('=== Embedded Messaging Ready ===');
    console.log('Username configured for routing:', username);
    
    // Set routing attributes for the conversation
    window.embeddedservice_bootstrap.settings.routingAttributes = {
        userName: username
    };
});

// Add pre-chat submission handler for debugging
window.embedded_svc.onPrechatSubmit = function(prechatData) {
    console.log('=== Pre-Chat Form Submission Debug ===', {
        prechatData: prechatData,
        username: username,
        settings: {
            forms: window.embedded_svc.settings.forms
        }
    });
    return prechatData;
};

// Initialize the embedded service
if (typeof window.embedded_svc.init === 'function') {
    window.embedded_svc.init();
} 