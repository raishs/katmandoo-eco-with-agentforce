import { useEffect, useRef } from "react";
import "./messagingBody.css";
import { util } from "../helpers/common";
import { CONVERSATION_CONSTANTS } from "../helpers/constants";

// Import children components to plug in and render.
import ConversationEntry from "./conversationEntry";
import TypingIndicator from "./typingIndicator";

export default function MessagingBody({ conversationEntries, conversationStatus, typingParticipants, showTypingIndicator, onQuickReplySelect }) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversationEntries, showTypingIndicator]); // Scroll when new messages arrive or typing indicator changes

    useEffect(() => {
        if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION) {
            // Render conversation closed message.
            // Remove typing indicator.
            typingParticipants = [];
            showTypingIndicator = false;
        }
    }, [conversationStatus]);

    /**
     * Builds a list of conversation entries where each conversation-entry represents an object of type defined in constants#CONVERSATION_CONSTANTS.EntryTypes.
     * @returns {string}
     */
    const conversationEntriesListView = conversationEntries.map(conversationEntry =>
        <ConversationEntry
            key={conversationEntry.messageId} 
            conversationEntry={conversationEntry}
            onQuickReplySelect={onQuickReplySelect} />
    );

    /**
     * Generates a text with conversation start date and time.
     * @returns {string}
     */
    function generateConversationStartTimeText() {
        if (conversationEntries.length) {
            const conversationStartTimestamp = conversationEntries[0].transcriptedTimestamp;
            const startDate = util.getFormattedDate(conversationStartTimestamp);
            const startTime = util.getFormattedTime(conversationStartTimestamp);
            const conversationStartTimeText = `Conversation started: ${startDate} at ${startTime}`;
            return conversationStartTimeText;
        }
        return "";
    }

    /**
     * Generates a text with conversation end date and time.
     * @returns {string}
     */
    function generateConversationEndTimeText() {
        const conversationEndTimestamp = Date.now();
        const endDate = util.getFormattedDate(conversationEndTimestamp);
        const endTime = util.getFormattedTime(conversationEndTimestamp);
        const conversationEndTimeText = `Conversation ended: ${endDate} at ${endTime}`;

        return conversationEndTimeText;
    }

    return (
        <div className="messagingBody">
            <div className="conversationStartTimeText">{generateConversationStartTimeText()}</div>
            <ul className="conversationEntriesListView">
                {conversationEntriesListView}
                {showTypingIndicator && <TypingIndicator typingParticipants={typingParticipants} />}
            </ul>
            <div ref={messagesEndRef} /> {/* Anchor element for auto-scrolling */}
            {conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION && <p className="conversationEndTimeText">{generateConversationEndTimeText()}</p>}
        </div>
    );
}