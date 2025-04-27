import { useState } from 'react';

export default function MessagingInputFooter({ conversationStatus, sendTextMessage, sendTypingIndicator }) {
    const [message, setMessage] = useState('');

    return (
        <div className="messaging-input-footer">
            <div className="input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && message.trim()) {
                            sendTextMessage(message.trim());
                            setMessage('');
                        }
                    }}
                    placeholder="Type a message..."
                    disabled={conversationStatus !== CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION}
                />
            </div>
        </div>
    );
} 