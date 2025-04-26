import "./textMessage.css";
import { useState, useEffect } from "react";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { util } from "../helpers/common";
import DOMPurify from 'dompurify';

export default function TextMessage({conversationEntry}) {
    // Initialize acknowledgement status.
    let [isSent, setIsSent] = useState(false);
    let [isDelivered, setIsDelivered] = useState(false);
    let [isRead, setIsRead] = useState(false);
    let [acknowledgementTimestamp, setAcknowledgementTimestamp] = useState('');

    useEffect(() => {
        if (conversationEntry.isRead) {
            setIsRead(conversationEntry.isRead);
            setAcknowledgementTimestamp(conversationEntry.readAcknowledgementTimestamp);
        } else if (conversationEntry.isDelivered) {
            setIsDelivered(conversationEntry.isDelivered);
            setAcknowledgementTimestamp(conversationEntry.deliveryAcknowledgementTimestamp);
        } else if (conversationEntry.isSent) {
            setIsSent(conversationEntry.isSent);
            setAcknowledgementTimestamp(conversationEntry.transcriptedTimestamp);
        }
    }, [conversationEntry]);

    /**
     * Generates a classname for Text Message metadata such as sender text.
     * @returns {string}
     */
    function generateMessageSenderContentClassName() {
        const className = `textMessageSenderContent ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`}`;
        return className;
    }

    /**
     * Generates a classname for Text Message bubble container.
     * @returns {string}
     */
    function generateMessageBubbleContainerClassName() {
        const className = `textMessageBubbleContainer`;
        return className;
    }

    /**
     * Generates a classname for Text Message bubble ui.
     * @returns {string}
     */
    function generateMessageBubbleClassName() {
        const className = `textMessageBubble ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`}`;
        return className;
    }

    /**
     * Generates a classname for Text Message content (i.e. actual text).
     * @returns {string}
     */
    function generateMessageContentClassName() {
        const className = `textMessageContent`;
        return className;
    }

    /**
     * Generates a text with the message sender information.
     * @returns {string}
     */
    function generateMessageSenderContentText() {
        const formattedTime = util.getFormattedTime(conversationEntry.transcriptedTimestamp);
        return `${conversationEntry.isEndUserMessage ? `You` : conversationEntry.actorName} at ${formattedTime}`;
    }

    /**
     * Generates text content with the message acknowledgement information.
     * @returns {string}
     */
    function generateMessageAcknowledgementContentText() {
        const formattedAcknowledgementTimestamp = util.getFormattedTime(acknowledgementTimestamp);

        if (conversationEntry.isEndUserMessage) {
            if (isRead) {
                return `Read at ${formattedAcknowledgementTimestamp} • `;
            } else if (isDelivered) {
                return `Delivered at ${formattedAcknowledgementTimestamp} • `;
            } else if (isSent) {
                return `Sent • `;
            } else {
                return ``;
            }
        }
    }

    /**
     * Safely renders HTML content from the message
     * @param {string} content - The message content
     * @returns {string} Sanitized HTML content
     */
    function renderMessageContent(content) {
        // Sanitize the HTML content
        const sanitizedContent = DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'img'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title']
        });
        
        return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
    }

    return (
        <>
            <div className={generateMessageBubbleContainerClassName()}>
                <div className={generateMessageBubbleClassName()}>
                    <div className={generateMessageContentClassName()}>
                        {renderMessageContent(ConversationEntryUtil.getTextMessageContent(conversationEntry))}
                    </div>
                </div>
            </div>
            <p className={generateMessageSenderContentClassName()}>
                {generateMessageAcknowledgementContentText()}
                {generateMessageSenderContentText()}
            </p>
        </>
    );
}