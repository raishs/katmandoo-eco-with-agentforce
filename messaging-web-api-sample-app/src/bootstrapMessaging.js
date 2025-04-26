"use client";

import React, { useState, useEffect } from "react";

// Import children components to render.
import MessagingWindow from "./components/messagingWindow";
import MessagingButton from "./components/messagingButton";
import QuickStartButton from "./components/quickStartButton";
import TabNavigation from './components/TabNavigation';
import MyPlants from './components/MyPlants';
import MyChallenges from './components/MyChallenges';

import './bootstrapMessaging.css';
import './styles/tabs.css';

import { storeOrganizationId, storeDeploymentDeveloperName, storeSalesforceMessagingUrl } from './services/dataProvider';
import { determineStorageType, initializeWebStorage, getItemInWebStorageByKey, getItemInPayloadByKey } from './helpers/webstorageUtils';
import { APP_CONSTANTS, STORAGE_KEYS } from './helpers/constants';

import Draggable from "./ui-effects/draggable";

const BootstrapMessaging = ({ username }) => {
    const [activeTab, setActiveTab] = useState('plants');
    const [showMessagingButton, setShowMessagingButton] = useState(false);
    const [orgId, setOrgId] = useState('');
    const [deploymentDevName, setDeploymentDevName] = useState('');
    const [messagingURL, setMessagingURL] = useState('');
    const [shouldDisableMessagingButton, setShouldDisableMessagingButton] = useState(false);
    const [shouldShowMessagingWindow, setShouldShowMessagingWindow] = useState(false);
    const [showMessagingButtonSpinner, setShowMessagingButtonSpinner] = useState(false);
    const [isExistingConversation, setIsExistingConversation] = useState(false);

    // Move embedded service configuration into a function
    const configureEmbeddedService = () => {
        if (typeof window !== 'undefined') {
            console.log('=== Pre-Chat Configuration Debug Start ===');
            console.log('Username being configured:', username);

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
            window.embedded_svc.settings.extraPrechatFormDetails = [{
                "label": "Username",
                "name": "userName",
                "value": username,
                "displayToAgent": true,
                "transcriptFields": ["userName__c"]
            }];

            // Configure entity mapping
            window.embedded_svc.settings.extraPrechatInfo = [{
                "entityName": "MessagingSession",
                "showOnCreate": true,
                "saveToTranscript": "MessagingSession",
                "entityFieldMaps": [{
                    "isExactMatch": true,
                    "fieldName": "userName",
                    "doCreate": true,
                    "doFind": false,
                    "label": "Username"
                }]
            }];

            // Configure display settings
            window.embedded_svc.settings.defaultMinimizedText = 'Chat with Kat';
            window.embedded_svc.settings.displayHelpButton = true;

            // Add initialization event handlers
            window.addEventListener("onEmbeddedServiceInit", () => {
                console.log('=== Embedded Service Initialized ===');
                if (window.embedded_svc) {
                    console.log('Verifying pre-chat configuration:', {
                        enabled: window.embedded_svc.settings.enablePrechat,
                        prechatEnabled: window.embedded_svc.settings.prechatEnabled,
                        username: username,
                        formDetails: window.embedded_svc.settings.extraPrechatFormDetails,
                        entityInfo: window.embedded_svc.settings.extraPrechatInfo
                    });
                }
            });

            // Add pre-chat submission handler
            window.embedded_svc.onPrechatSubmit = function(prechatData) {
                console.log('=== Pre-Chat Form Submission ===', {
                    prechatData: prechatData,
                    username: username
                });
                return prechatData;
            };

            console.log('=== Event Listeners Configured ===');
        }
    };

    /**
     * Initialize the messaging client
     */
    async function initializeMessagingClient(ord_id, deployment_dev_name, messaging_url) {
        try {
            console.log('=== Messaging Client Initialization Debug ===');
            console.log('Current username:', username);
            
            // Configure embedded service first
            configureEmbeddedService();
            
            // Then initialize storage
            await initializeWebStorage(ord_id || orgId);
            await Promise.all([
                storeOrganizationId(ord_id || orgId),
                storeDeploymentDeveloperName(deployment_dev_name || deploymentDevName),
                storeSalesforceMessagingUrl(messaging_url || messagingURL)
            ]);

            console.log('=== Messaging Client Initialization Complete ===');
        } catch (error) {
            console.error('Error initializing messaging client:', error);
            throw new Error('Failed to initialize messaging client');
        }
    }

    useEffect(() => {
        const storage = determineStorageType();
        if (!storage) {
            console.error(`Cannot initialize the app. Web storage is required for the app to function.`);
            return;
        }

        // Configure embedded service first
        configureEmbeddedService();

        const messaging_webstorage_key = Object.keys(storage).filter(item => item.startsWith(APP_CONSTANTS.WEB_STORAGE_KEY))[0];

        if (messaging_webstorage_key) {
            const webStoragePayload = storage.getItem(messaging_webstorage_key);
            const orgId = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.ORGANIZATION_ID);
            const deploymentDevName = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.DEPLOYMENT_DEVELOPER_NAME);
            const messagingUrl = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.MESSAGING_URL);

            if (!isValidOrganizationId(orgId)) {
                console.warn(`Invalid organization id exists in the web storage: ${orgId}. Cleaning up the invalid object from the web storage.`);
                storage.removeItem(messaging_webstorage_key);
                setIsExistingConversation(false);
                return;
            }
            
            setOrgId(orgId);
            setDeploymentDevName(deploymentDevName);
            setMessagingURL(messagingUrl);

            // Initialize messaging client with pre-chat configuration
            initializeMessagingClient(orgId, deploymentDevName, messagingUrl);

            const messagingJwt = getItemInWebStorageByKey(STORAGE_KEYS.JWT);
            if (messagingJwt) {
                setIsExistingConversation(true);
                setShowMessagingButton(true);
                setShouldDisableMessagingButton(true);
                setShouldShowMessagingWindow(true);
            } else {
                setIsExistingConversation(false);
            }
        } else {
            setIsExistingConversation(false);
        }

        // Debug log for username prop
        console.log('Username prop received:', username);

        // Cleanup
        return () => {
            showMessagingWindow(false);
        };
    }, [username]);

    /**
     * Validates whether the supplied string is a valid Salesforce Organization Id.
     * @returns {boolean}
     */
    function isValidOrganizationId(id) {
        return typeof id === "string" && (id.length === 18 || id.length === 15) && id.substring(0, 3) === APP_CONSTANTS.ORGANIZATION_ID_PREFIX;
    }

    /**
     * Validates whether the supplied string is a valid Salesforce Embedded Service Deployment Developer Name.
     * @returns {boolean}
     */
    function isValidDeploymentDeveloperName(name) {
        return typeof name === "string" && name.length > 0;
    }

    /**
     * Determines whether the supplied url is a Salesforce Url.
     * @returns {boolean}
     */
    function isSalesforceUrl(url) {
        try {
            return typeof url === "string" && url.length > 0 && url.slice(-19) === APP_CONSTANTS.SALESFORCE_MESSAGING_SCRT_URL;
        } catch (err) {
            console.error(`Something went wrong in validating whether the url is a Salesforce url: ${err}`);
            return false;
        }
    }

    /**
     * Validates whether the supplied string has a valid protocol and is a Salesforce Url.
     * @returns {boolean}
     */
    function isValidUrl(url) {
        try {
            const urlToValidate = new URL(url);
            return isSalesforceUrl(url) && urlToValidate.protocol === APP_CONSTANTS.HTTPS_PROTOCOL;
        } catch (err) {
            console.error(`Something went wrong in validating the url provided: ${err}`);
            return false;
        }
    }

    /**
     * Handle a click action from the Deployment-Details-Form Submit Button. If the inputted parameters are valid, initialize the Messaging Client and render the Messaging Button.
     * @param {object} evt - button click event
     */
    function handleDeploymentDetailsFormSubmit(evt) {
        if (evt) {
            if(!isValidOrganizationId(orgId)) {
                alert(`Invalid OrganizationId Input Value: ${orgId}`);
                setShowMessagingButton(false);
                return;
            }
		    if(!isValidDeploymentDeveloperName(deploymentDevName)) {
                alert(`Expected a valid Embedded Service Deployment Developer Name value to be a string but received: ${deploymentDevName}.`);
                setShowMessagingButton(false);
                return;
            }
		    if(!isValidUrl(messagingURL)) {
                alert(`Expected a valid Salesforce Messaging URL value to be a string but received: ${messagingURL}.`);
                setShowMessagingButton(false);
                return;
            }

            // Initialize the Messaging Client.
            initializeMessagingClient();
            // New conversation.
            setIsExistingConversation(false);
            // Render the Messaging Button.
            setShowMessagingButton(true);
        }
    }

    /**
     * Determines whether the Deployment-Details-Form Submit Button should be enabled/disabled.
     * @returns {boolean} TRUE - disabled the button and FALSE - otherwise
     */
    function shouldDisableFormSubmitButton() {
        return (orgId && orgId.length === 0) || (deploymentDevName && deploymentDevName.length === 0) || (messagingURL && messagingURL.length === 0);
    }

    /**
     * Handle a click action from the Messaging Button.
     * @param {object} evt - button click event
     */
    function handleMessagingButtonClick(evt) {
        if (evt) {
            console.log("Messaging Button clicked.");
            setShowMessagingButtonSpinner(true);
            showMessagingWindow(true);
        }
    }

    /**
     * Determines whether to render the Messaging Window based on the supplied parameter.
     * @param {boolean} shouldShow - TRUE - render the Messaging WINDOW and FALSE - Do not render the Messaging Window & Messaging Button
     */
    function showMessagingWindow(shouldShow) {
        setShouldShowMessagingWindow(Boolean(shouldShow));
        if (!shouldShow) {
            // Enable Messaging Button again when Messaging Window is closed.
            setShouldDisableMessagingButton(false);
            // Remove the spinner on the Messaging Button.
            setShowMessagingButtonSpinner(false);
            // Hide Messaging Button to re-initialize the client with form submit.
            setShowMessagingButton(false);
        }
    }

    /**
     * Handles the app UI readiness i.e. Messaging Button updates based on whether the Messaging Window UI is rendered.
     * @param {boolean} isReady - TRUE - disable the Messaging Button & remove the spinner and FALSE - otherwise.
     */
    function appUiReady(isReady) {
        // Disable Messaging Button if the app is UI ready.
        setShouldDisableMessagingButton(isReady);
        // Remove the spinner on the Messaging Button if the app is UI ready.
        setShowMessagingButtonSpinner(!isReady);
    }

    /**
     * Handle quick start initialization with predefined values
     * @param {object} config - Configuration object containing orgId, deploymentDevName, and messagingURL
     */
    async function handleQuickStart(config) {
        try {
            if (!config || !config.orgId || !config.deploymentDevName || !config.messagingURL) {
                throw new Error('Invalid configuration provided');
            }

            const { orgId: quickOrgId, deploymentDevName: quickDevName, messagingURL: quickUrl } = config;
            
            // Validate inputs
            if (!isValidOrganizationId(quickOrgId)) {
                throw new Error(`Invalid Organization ID: ${quickOrgId}`);
            }
            if (!isValidDeploymentDeveloperName(quickDevName)) {
                throw new Error(`Invalid Deployment Developer Name: ${quickDevName}`);
            }
            if (!isValidUrl(quickUrl)) {
                throw new Error(`Invalid Messaging URL: ${quickUrl}`);
            }

            // Set form values
            setOrgId(quickOrgId);
            setDeploymentDevName(quickDevName);
            setMessagingURL(quickUrl);

            // Initialize the Messaging Client with pre-chat configuration
            await initializeMessagingClient(quickOrgId, quickDevName, quickUrl);
            
            // New conversation
            setIsExistingConversation(false);
            
            // Show messaging button and window
            setShowMessagingButton(true);
            setShowMessagingButtonSpinner(true);
            showMessagingWindow(true);
        } catch (error) {
            console.error('Error during quick start initialization:', error);
            setShowMessagingButtonSpinner(false);
            alert('Failed to initialize chat. Please try again.');
            showMessagingWindow(false);
        }
    }

    return (
        <div className="katmandooContainer">
            <header className="header">
                <div className="headerContent">
                    <div className="logoContainer">
                        <img src={require('./assets/temple-logo.png')} alt="Temple Logo" className="templeLogo" />
                    </div>
                    <div className="userWelcome">
                        Welcome, {username}!
                    </div>
                </div>
            </header>
            <main>
                <section className="heroSection">
                    <div className="heroContent">
                        <div className="heroText">
                            <h1 className="display-large">Transform Your Garden with Kat Agent</h1>
                            <p className="body-large">Your Plant Care Companion Powered by <span className="brand-text">Agentforce</span></p>
                            <div className="body-medium description">
                                Experience personalized gardening guidance powered by <span className="brand-text">Agentforce</span>'s advanced AI. Get expert advice, monitor plant health, and create a thriving eco-friendly garden.
                            </div>
                            <QuickStartButton onInitialize={handleQuickStart} />
                        </div>
                        <div className="mascotSection">
                            <img src={require('./assets/cat-mascot.png')} alt="KatManDoo Eco Mascot" className="mascotImage" />
                        </div>
                    </div>
                </section>

                <section className="featuresSection">
                    <div className="featuresGrid">
                        <div className="featureCard">
                            <div className="featureIcon">🌱</div>
                            <h3 className="title-medium">Smart Plant Care</h3>
                            <p className="body-small"><span className="brand-text">Agentforce</span> learns your garden's unique needs to provide personalized care schedules and growth monitoring.</p>
                        </div>
                        <div className="featureCard">
                            <div className="featureIcon">🌍</div>
                            <h3 className="title-medium">Sustainable Gardening</h3>
                            <p className="body-small">Get <span className="brand-text">Agentforce</span>-driven recommendations for water conservation and eco-friendly practices that support local biodiversity.</p>
                        </div>
                        <div className="featureCard">
                            <div className="featureIcon">📱</div>
                            <h3 className="title-medium">24/7 Garden Assistant</h3>
                            <p className="body-small">Track your plants' progress and receive timely care alerts powered by <span className="brand-text">Agentforce</span>'s intelligent monitoring.</p>
                        </div>
                    </div>
                </section>

                <div className="waveDivider"></div>
                
                <section className="trustSection">
                    <h2 className="display-medium">Growing a Greener Future Together</h2>
                    <p className="body-medium">Join thousands of gardeners creating sustainable, thriving gardens with KatManDoo Eco</p>
                    
                    <div className="trustGrid">
                        <div className="trustItem">
                            <div className="trustNumber">10,000+</div>
                            <div className="body-small">Plants Monitored</div>
                        </div>
                        <div className="trustItem">
                            <div className="trustNumber">30%</div>
                            <div className="body-small">Water Saved on Average</div>
                        </div>
                        <div className="trustItem">
                            <div className="trustNumber">5,000+</div>
                            <div className="body-small">Eco-friendly Gardens</div>
                        </div>
            </div>
                </section>

                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
                
                <div className="tab-content">
                    {activeTab === 'plants' ? (
                        <MyPlants username={username} />
                    ) : (
                        <MyChallenges username={username} />
                    )}
                </div>
            </main>

            {shouldShowMessagingWindow && (
                <Draggable intitialPosition={{ x: window.innerWidth - 420, y: 100 }}>
                    <div className="messagingWindow">
                    <MessagingWindow
                        isExistingConversation={isExistingConversation}
                        showMessagingWindow={showMessagingWindow}
                            deactivateMessagingButton={appUiReady} 
                        username={username} />
                    </div>
                </Draggable>
            )}

            {showMessagingButton && (
                <button
                    className="chat-button"
                    onClick={() => setShouldShowMessagingWindow(!shouldShowMessagingWindow)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 999
                    }}
                >
                    {showMessagingButtonSpinner ? (
                        <span className="spinner"></span>
                    ) : (
                        'Chat with Kat'
                    )}
                </button>
            )}
        </div>
    );
}

export default BootstrapMessaging;