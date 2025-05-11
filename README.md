NOTE: This repository currently only has the web application's metadata and not Salesforce's metadata.

# Inspiration
I've been extremely excited to be part of the AI revolution with Agentforce. After achieving Agentforce Specialist certification and participating in the Mini Hack at TDX 2025, I was ready to put my creativity and knowledge to the test. This led me to build KatAgent - an Agentforce-enabled onboarding assistant that demonstrates how AI can transform customer experiences while solving real business problems.

# What it does
KatAgent streamlines the onboarding experience for KatManDoo Eco App, a fictional consumer SaaS product for gardening enthusiasts. Through natural conversation, KatAgent:
- Personalizes the user journey by gathering information about gardening experience, location, and available space
- Creates a comprehensive plant inventory through friendly dialogue instead of form-filling
- Simultaneously enriches Salesforce CRM data with every interaction
- This approach transforms traditional onboarding from a transactional form-filling exercise into a conversational experience that delivers value to both users and the business.

# How I built it
Cloned [Web App sample provided by Salesforce](https://github.com/Salesforce-Async-Messaging/messaging-web-api-sample-app) to create and modify to create “KatManDoo Eco App” that I enhanced to turn it into proof-of-concept SaaS app integrated with Agentforce. Here are the SFDC Platform Capabilities I used:

Agentforce Service Agent with Custom Topics with Custom Actions (with Autolaunched Flow & Invocable Methods)
Standard & Custom Objects
Embedded Service Deployments
Messaging Settings
Messaging for In-App and Web User Verification
Permission Sets
CORS
Connected App
My Domain URL
Routing Configuration
Omnichannel Flow
Challenges we ran into
The majority of development time was spent on standing up the web app, enhancing its functionality, and establishing the integration with Agentforce. The second most significant challenge was building the custom actions for the service agent that would update Salesforce records based on conversation data. Creating seamless data flows between the conversational interface and the CRM required careful planning and testing.

# Accomplishments that we're proud of
I'm very thankful to be part of this hackathon. I'm proud that my vision of how consumer apps can integrate with Agentforce has come to fruition, and that I was able to meet the deadline! Seeing the conversational interface smoothly update Salesforce data while providing an engaging user experience validated the approach and demonstrated the potential of Agentforce for enhancing SaaS applications.

# What we learned
This project provided numerous learning opportunities. The biggest unlock was mastering the integration between a web application and Agentforce. Heavily used Cursor to build the web application. I also rediscovered that invocable Apex can be part of custom actions and that Agentforce can communicate with it through JSON! The project reinforced how conversational AI can transform data collection from a necessary evil into a value-adding experience.
