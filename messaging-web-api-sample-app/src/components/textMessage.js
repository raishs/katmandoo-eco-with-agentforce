import "./textMessage.css";
import { useState, useEffect } from "react";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { util } from "../helpers/common";
import DOMPurify from 'dompurify';
import QuickReplies from './QuickReplies';

export default function TextMessage({conversationEntry, onQuickReplySelect}) {
    const [isSent, setIsSent] = useState(false);
    const [isDelivered, setIsDelivered] = useState(false);
    const [isRead, setIsRead] = useState(false);
    const [acknowledgementTimestamp, setAcknowledgementTimestamp] = useState('');

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

    function generateMessageSenderContentClassName() {
        return `textMessageSenderContent ${conversationEntry.isEndUserMessage ? 'outgoing' : 'incoming'}`;
    }

    function generateMessageBubbleContainerClassName() {
        return 'textMessageBubbleContainer';
    }

    function generateMessageBubbleClassName() {
        return `textMessageBubble ${conversationEntry.isEndUserMessage ? 'outgoing' : 'incoming'}`;
    }

    function generateMessageContentClassName() {
        return 'textMessageContent';
    }

    function generateMessageSenderContentText() {
        const formattedTime = util.getFormattedTime(conversationEntry.transcriptedTimestamp);
        return `${conversationEntry.isEndUserMessage ? 'You' : conversationEntry.actorName} at ${formattedTime}`;
    }

    function generateMessageAcknowledgementContentText() {
        const formattedAcknowledgementTimestamp = util.getFormattedTime(acknowledgementTimestamp);

        if (conversationEntry.isEndUserMessage) {
            if (isRead) {
                return `Read at ${formattedAcknowledgementTimestamp} • `;
            } else if (isDelivered) {
                return `Delivered at ${formattedAcknowledgementTimestamp} • `;
            } else if (isSent) {
                return `Sent • `;
            }
        }
        return '';
    }

    function renderMessageContent(content) {
        // Handle Salesforce structured message format
        if (content && typeof content === 'object') {
            // If it's a structured message with quick replies
            if (content.type === 'quickReply' || content.quickReplies) {
                return (
                    <>
                        <div>{content.message || content.text}</div>
                        <QuickReplies 
                            options={content.quickReplies || content.options || []}
                            onSelect={onQuickReplySelect}
                        />
                    </>
                );
            }
            // If it's a regular message
            return <div>{content.message || content.text}</div>;
        }

        // Handle regular text messages with HTML sanitization
        const sanitizedHtml = DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br'],
            ALLOWED_ATTR: ['href', 'target']
        });
        return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
    }

    const messageContent = ConversationEntryUtil.getTextMessageContent(conversationEntry);

    return (
        <>
            <div className={generateMessageBubbleContainerClassName()}>
                <div className={generateMessageBubbleClassName()}>
                    <div className={generateMessageContentClassName()}>
                        {renderMessageContent(messageContent)}
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