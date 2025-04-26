import "./conversationEntry.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { CONVERSATION_CONSTANTS } from "../helpers/constants";

// Import children components to plug in and render.
import TextMessage from "./textMessage";
import ParticipantChange from "./participantChange";

export default function ConversationEntry({ conversationEntry, onQuickReplySelect }) {
    /**
     * Renders a conversation entry based on its type.
     * @returns {JSX.Element}
     */
    function renderConversationEntry() {
        if (ConversationEntryUtil.isConversationEntryMessage(conversationEntry)) {
            return <TextMessage 
                conversationEntry={conversationEntry} 
                onQuickReplySelect={onQuickReplySelect} />;
        }
        return null;
    }

    return (
        <li className="conversationEntry">
            {renderConversationEntry()}
        </li>
    );
}