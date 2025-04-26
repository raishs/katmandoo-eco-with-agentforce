import { CONVERSATION_CONSTANTS } from "./constants";

/**
 * Parses JSON data from a server-sent event.
 * @param {object} event - Server-sent event.
 * @returns {object} - Parsed server-sent event data.
 * @throws {Error} if event data is invalid.
 */
export function parseServerSentEventData(event) {
    if (event && event.data && typeof event.data === "string") {
        const data = JSON.parse(event.data);

        if (!data || typeof data !== "object") {
            throw new Error(`Error parsing data in server sent event.`);
        } else {
            return data;
        }
    } else {
        throw new Error(`Invalid data in server sent event.`);
    }
};

/**
 * Get the sender's display name from incoming typing started/stopped indicator events.
 * @param {Object} data - Data from typing indicator server-sent events.
 * @returns {String} - Parsed display name of sender.
 */
export function getSenderDisplayName(data) {
    return (data && data.conversationEntry && data.conversationEntry.senderDisplayName) || "";
};

/**
 * Get the sender's role from incoming typing started/stopped indicator events.
 * @param {Object} data - Data from typing indicator server-sent events.
 * @returns {String} - Parsed role of the sender.
 */
export function getSenderRole(data) {
    return (data && data.conversationEntry && data.conversationEntry.sender && data.conversationEntry.sender.role) || "";
};

/**
 * Parses JSON entry payload field from a server-sent event data.
 * @param {object} data - Server-sent event.
 * @returns {object} - Parsed server-sent event data.
 * @throws {Error} if event data is invalid.
 */
export function createConversationEntry(data) {
    try {
        if (typeof data === "object") {
            const entryPayload = JSON.parse(data.conversationEntry.entryPayload);

            // Do not create a conversation-entry for unknown/unsupported entryType.
            if (!Object.values(CONVERSATION_CONSTANTS.EntryTypes).includes(entryPayload.entryType)) {
                console.warn(`Unexpected and/or unsupported entryType: ${entryPayload.entryType}`);
                return;
            }
    
            return {
                conversationId: data.conversationId,
                messageId: data.conversationEntry.identifier,
                content: entryPayload.abstractMessage || entryPayload,
                messageType: entryPayload.abstractMessage ? entryPayload.abstractMessage.messageType : (entryPayload.routingType || entryPayload.entries[0].operation) ,
                entryType: entryPayload.entryType,
                sender: data.conversationEntry.sender,
                actorName: data.conversationEntry.senderDisplayName ? (data.conversationEntry.senderDisplayName || data.conversationEntry.sender.role) : (entryPayload.entries[0].displayName || entryPayload.entries[0].participant.role),
                actorType: data.conversationEntry.sender.role,
                transcriptedTimestamp: data.conversationEntry.transcriptedTimestamp,
                messageReason: entryPayload.messageReason
            };
        } else {
            throw new Error(`Expected an object to create a new conversation entry but instead, received ${data}`);
        }
    } catch (err) {
        throw new Error(`Something went wrong while creating a conversation entry: ${err}`);
    }
    
};

//============================================================== STATIC TEXT MESSAGE functions ==============================================================
/**
 * Validates whether the supplied object is a conversation-entry with entry type as CONVERSATION_MESSAGE.
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the conversation-entry is a CONVERSATION_MESSAGE and FALSE - otherwise.
 */
export function isConversationEntryMessage(conversationEntry) {
    if (conversationEntry) {
        return conversationEntry.entryType === CONVERSATION_CONSTANTS.EntryTypes.CONVERSATION_MESSAGE;
    }
    return false;
};

/**
 * Validates whether the supplied CONVERSATION_MESSAGE is originating from an end-user participant.
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the CONVERSATION_MESSAGE is sent by the end-user participant and FALSE - otherwise.
 */
export function isMessageFromEndUser(conversationEntry) {
    if (isConversationEntryMessage(conversationEntry)) {
        return conversationEntry.actorType === CONVERSATION_CONSTANTS.ParticipantRoles.ENDUSER;
    }
    return false;
};

/**
 * Validates whether the supplied CONVERSATION_MESSAGE is a STATIC_CONTENT_MESSAGE (i.e. messageType === "STATIC_CONTENT_MESSAGE").
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the CONVERSATION_MESSAGE is a STATIC_CONTENT_MESSAGE and FALSE - otherwise.
 */
export function isConversationEntryStaticContentMessage(conversationEntry) {
    if (isConversationEntryMessage(conversationEntry)) {
        return conversationEntry.content && conversationEntry.content.messageType === CONVERSATION_CONSTANTS.MessageTypes.STATIC_CONTENT_MESSAGE;
    }
    return false;
};

/**
 * Gets the supplied STATIC_CONTENT_MESSAGE's payload.
 * @param {object} conversationEntry
 * @returns {object|undefined}
 */
export function getStaticContentPayload(conversationEntry) {
    if (isConversationEntryStaticContentMessage(conversationEntry)) {
        return conversationEntry.content && conversationEntry.content.staticContent;
    }
    return undefined;
};

/**
 * Validates whether the supplied STATIC_CONTENT_MESSAGE is a Text Message (i.e. formatType === "Text").
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the STATIC_CONTENT_MESSAGE is a Text Message and FALSE - otherwise.
 */
export function isTextMessage(conversationEntry) {
    if (isConversationEntryStaticContentMessage(conversationEntry)) {
        return getStaticContentPayload(conversationEntry).formatType === CONVERSATION_CONSTANTS.FormatTypes.TEXT;
    }
};

/**
 * Format text with rich formatting
 * @param {string} text - Raw text content
 * @returns {string} Formatted HTML content
 */
function formatRichText(text) {
    if (!text) return '';

    // First handle bullet points and numbered lists
    let formatted = text;
    
    // Check if we have any bullet points or numbered lists
    const hasBullets = /^[-*•]\s+/m.test(text);
    const hasNumbers = /^\d+\.\s+/m.test(text);
    
    if (hasBullets || hasNumbers) {
        // Split into lines
        const lines = formatted.split('\n');
        let inList = false;
        let currentListType = null;
        
        formatted = lines.map(line => {
            // Check for bullet points
            if (line.match(/^[-*•]\s+/)) {
                if (!inList || currentListType !== 'ul') {
                    // Start new unordered list
                    const prefix = inList ? '</ul><ul>' : '<ul>';
                    inList = true;
                    currentListType = 'ul';
                    return prefix + `<li>${line.replace(/^[-*•]\s+/, '')}</li>`;
                }
                return `<li>${line.replace(/^[-*•]\s+/, '')}</li>`;
            }
            // Check for numbered lists
            else if (line.match(/^\d+\.\s+/)) {
                if (!inList || currentListType !== 'ol') {
                    // Start new ordered list
                    const prefix = inList ? '</ol><ol>' : '<ol>';
                    inList = true;
                    currentListType = 'ol';
                    return prefix + `<li>${line.replace(/^\d+\.\s+/, '')}</li>`;
                }
                return `<li>${line.replace(/^\d+\.\s+/, '')}</li>`;
            }
            // Regular line
            else {
                if (inList) {
                    inList = false;
                    currentListType = null;
                    return `</${currentListType}>${line}`;
                }
                return line;
            }
        }).join('\n');
        
        // Close any open list at the end
        if (inList) {
            formatted += `</${currentListType}>`;
        }
    }

    // Convert remaining line breaks to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');

    // Convert URLs to links
    formatted = formatted.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    return formatted;
}

/**
 * Gets the text message content from the conversation entry.
 * @param {object} conversationEntry - conversation entry object
 * @returns {string|object}
 */
export function getTextMessageContent(conversationEntry) {
    // Handle choices messages (quick replies)
    if (isConversationEntryChoicesMessage(conversationEntry)) {
        const content = conversationEntry.content;
        return {
            type: 'quickReply',
            text: content.message || content.text,
            quickReplies: content.choices.map(choice => ({
                label: choice.text || choice.label,
                value: choice.value || choice.text || choice.label
            }))
        };
    }
    
    // Handle static content messages (initial messages)
    if (isConversationEntryStaticContentMessage(conversationEntry)) {
        const staticContent = getStaticContentPayload(conversationEntry);
        if (staticContent.formatType === CONVERSATION_CONSTANTS.FormatTypes.QUICK_REPLIES) {
            return {
                type: 'quickReply',
                text: staticContent.text,
                quickReplies: staticContent.quickReplies || []
            };
        }
        
        // Check if this is a chatbot message with bullet points
        const messageText = staticContent?.text || '';
        if (conversationEntry.sender?.role === CONVERSATION_CONSTANTS.ParticipantRoles.CHATBOT && 
            /^[-*•]\s+/m.test(messageText)) {
            
            // Split into main message and options
            const lines = messageText.split('\n');
            const mainMessage = lines.filter(line => !line.match(/^[-*•]\s+/)).join('\n');
            const options = lines
                .filter(line => line.match(/^[-*•]\s+/))
                .map(line => line.replace(/^[-*•]\s+/, '').trim())
                .filter(option => option);

            if (options.length > 0) {
                return {
                    type: 'quickReply',
                    text: mainMessage,
                    quickReplies: options.map(option => ({
                        label: option,
                        value: option
                    }))
                };
            }
        }
        
        return formatRichText(messageText);
    }
    
    // Handle regular text messages
    if (conversationEntry.entryType === CONVERSATION_CONSTANTS.EntryTypes.TEXT_MESSAGE || 
        conversationEntry.entryType === CONVERSATION_CONSTANTS.EntryTypes.CONVERSATION_MESSAGE) {
        const messageContent = conversationEntry.content?.text || conversationEntry.content;
        
        // Check if this is a chatbot message with bullet points
        if (conversationEntry.sender?.role === CONVERSATION_CONSTANTS.ParticipantRoles.CHATBOT && 
            typeof messageContent === 'string' && 
            /^[-*•]\s+/m.test(messageContent)) {
            
            // Split into main message and options
            const lines = messageContent.split('\n');
            const mainMessage = lines.filter(line => !line.match(/^[-*•]\s+/)).join('\n');
            const options = lines
                .filter(line => line.match(/^[-*•]\s+/))
                .map(line => line.replace(/^[-*•]\s+/, '').trim())
                .filter(option => option);

            if (options.length > 0) {
                return {
                    type: 'quickReply',
                    text: mainMessage,
                    quickReplies: options.map(option => ({
                        label: option,
                        value: option
                    }))
                };
            }
        }
        
        // Apply rich formatting for all messages except end user messages
        if (conversationEntry.sender?.role !== CONVERSATION_CONSTANTS.ParticipantRoles.ENDUSER) {
            return formatRichText(messageContent);
        }
        return messageContent;
    }
    
    return '';
}

//============================================================== CHOICES MESSAGE functions ==============================================================
/**
 * Validates whether the supplied CONVERSATION_MESSAGE is a CHOICES_MESSAGE (i.e. messageType === "ChoicesMessage").
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the CONVERSATION_MESSAGE is a CHOICES_MESSAGE and FALSE - otherwise.
 */
export function isConversationEntryChoicesMessage(conversationEntry) {
    if (isConversationEntryMessage(conversationEntry)) {
        return conversationEntry.content && conversationEntry.content.messageType === CONVERSATION_CONSTANTS.MessageTypes.CHOICES_MESSAGE;
    }
    return false;
};

/**
 * Validates whether the supplied CHOICES_MESSAGE is QUICK_REPLIES (i.e. formatType === "QuickReplies") or BUTTONS (i.e. formatType === "Buttons").
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the CHOICES_MESSAGE is a QUICK_REPLIES or BUTTONS format type and FALSE - otherwise.
 */
export function isChoicesMessage(conversationEntry) {
    if (isConversationEntryChoicesMessage(conversationEntry)) {
        return getStaticContentPayload(conversationEntry).formatType === CONVERSATION_CONSTANTS.FormatTypes.QUICK_REPLIES 
            || getStaticContentPayload(conversationEntry).formatType === CONVERSATION_CONSTANTS.FormatTypes.BUTTONS;
    }
    return false;
};

//============================================================== PARTICIPANT CHANGE functions ==============================================================
/**
 * Validates whether the supplied object is a conversation-entry with entry type as PARTICIPANT_CHANGED.
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the conversation-entry is a PARTICIPANT_CHANGED event and FALSE - otherwise.
 */
export function isParticipantChangeEvent(conversationEntry) {
    return conversationEntry.entryType === CONVERSATION_CONSTANTS.EntryTypes.PARTICIPANT_CHANGED;
};

/**
 * Validates whether the supplied PARTICIPANT_CHANGED conversation-entry's participant joined the conversation. 
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the participant joined and FALSE - if the participant left.
 */
export function hasParticipantJoined(conversationEntry) {
    return isParticipantChangeEvent(conversationEntry) && conversationEntry.content.entries[0].operation === CONVERSATION_CONSTANTS.ParticipantChangedOperations.ADD;
};

/**
 * Gets the supplied PARTICIPANT_CHANGED conversation-entry's participant name.
 * @param {object} conversationEntry
 * @returns {string}
 */
export function getParticipantChangeEventPartcipantName(conversationEntry) {
    return isParticipantChangeEvent(conversationEntry) && (conversationEntry.content.entries[0].displayName || conversationEntry.content.entries[0].participant.role);
};