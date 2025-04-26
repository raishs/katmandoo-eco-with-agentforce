import { useState, useRef } from "react";

import "./messagingInputFooter.css";
import { FaPaperPlane, FaMicrophone, FaImage, FaStop } from "react-icons/fa";
import CountdownTimer from "../helpers/countdownTimer";
import { util } from "../helpers/common";
import { CONVERSATION_CONSTANTS, CLIENT_CONSTANTS } from '../helpers/constants';
import { getConversationId } from '../services/dataProvider';

export default function MessagingInputFooter(props) {
    const [textareaContent, setTextareaContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const fileInputRef = useRef(null);

    // Initialize whether end user is actively typing. 
    // This holds a reference to a CountdownTimer object.
    let [typingIndicatorTimer, setTypingIndicatorTimer] = useState(undefined);

    /**
     * Handle 'change' event in Textarea to reactively update the Textarea value.
     * @param {object} event
     */
    function handleTextareaContentChange(evt) {
        if (evt && evt.target) {
            setTextareaContent(evt.target.value);
        }
    }

    /**
     * Handle 'key' event in Textarea. If the key is 'Enter', send a message.
     * @param {object} event
     */
    function handleTextareaKeyChange(evt) {
        if (evt && evt.key === 'Enter' && !evt.shiftKey) {
            evt.preventDefault();
            handleSendButtonClick();
        }
    }

    /**
     * Handle 'click' event in Textarea to put focus on Textarea.
     * @param {object} event
     */
    function handleTextareaClick(evt) {
        if (evt && evt.target) {
            evt.target.focus();
        }
    }

    /**
     * Clears the Textarea i.e. resets to empty.
     */
    function clearMessageContent() {
        setTextareaContent("");
    }

    /**
     * Determines whether to disable the Textarea.
     * TRUE - disables if the conversation is either closed or not started and FALSE - otherwise.
     */
    function shouldDisableTextarea() {
        return props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION || props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.NOT_STARTED_CONVERSATION;
    }

    /**
     * Determines whether to disable the Send Button.
     * TRUE - disables if the Textarea is either empty or if the conversation is not open and FALSE - otherwise.
     */
    function shouldDisableSendButton() {
        return textareaContent.trim().length === 0 || shouldDisableTextarea();
    }

    /**
     * Handle Send Button click. If the Button is enabled, send a message.
     */
    function handleSendButtonClick() {
        if (!shouldDisableSendButton()) {
            handleSendMessage();
        }
    }

    /**
     * Handle sending a text message
     */
    function handleSendMessage() {
        const conversationId = getConversationId();
        if (!conversationId) {
            console.warn('No conversation ID available');
            return;
        }

        const messageId = util.generateUUID();
        
        // Send just the text content as the API expects a string
        props.sendTextMessage(conversationId, textareaContent, messageId)
            .then(() => {
                console.log(`Successfully sent a text message to conversation: ${conversationId}`);
                clearMessageContent();
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
    }

    /**
     * Handle calling a sendTypingIndicator when the timer fires with started/stopped indicator.
     * @param {string} typingIndicator - whether to send a typing started or stopped indicator.
     */
    function handleSendTypingIndicator(typingIndicator) {
        const conversationId = getConversationId();
        
        // Only send typing indicator if we have a valid conversation ID
        if (!conversationId) {
            console.warn('No conversation ID available for typing indicator');
            return;
        }

        // Make sure we pass the entryType parameter as required by the API
        props.sendTypingIndicator(conversationId, {
            entryType: typingIndicator,
            // Add any other required parameters for the typing indicator
            messageType: CONVERSATION_CONSTANTS.MessageTypes.TYPING_INDICATOR
        })
        .then(() => {
            console.log(`Successfully sent ${typingIndicator} to conversation: ${conversationId}`);
        })
        .catch(error => {
            console.error(`Something went wrong while sending a typing indicator to conversation ${conversationId}: ${error}`);
        });
    }

    // Handle image upload
    async function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                try {
                    const conversationId = getConversationId();
                    const messageId = util.generateUUID();
                    
                    // Create proper message payload
                    const messagePayload = {
                        id: messageId,
                        messageType: CONVERSATION_CONSTANTS.MessageTypes.STATIC_CONTENT_MESSAGE,
                        text: `Image uploaded: ${file.name}`,
                        entryType: CONVERSATION_CONSTANTS.EntryTypes.CONVERSATION_MESSAGE
                    };

                    await props.sendTextMessage(
                        conversationId,
                        messagePayload,
                        messageId
                    );
                    
                    console.log('Image message sent successfully');
                } catch (error) {
                    console.error('Error sending image message:', error);
                    alert('Failed to send image message. Please try again.');
                }
            } else {
                alert('Please select an image file.');
            }
        }
    }

    // Handle voice recording
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                try {
                    const conversationId = getConversationId();
                    const messageId = util.generateUUID();
                    
                    // Create proper message payload
                    const messagePayload = {
                        id: messageId,
                        messageType: CONVERSATION_CONSTANTS.MessageTypes.STATIC_CONTENT_MESSAGE,
                        text: 'Voice message recorded',
                        entryType: CONVERSATION_CONSTANTS.EntryTypes.CONVERSATION_MESSAGE
                    };

                    await props.sendTextMessage(
                        conversationId,
                        messagePayload,
                        messageId
                    );
                    
                    console.log('Voice message sent successfully');
                } catch (error) {
                    console.error('Error sending voice message:', error);
                    alert('Failed to send voice message. Please try again.');
                }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check your permissions.');
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    }

    return(
        <div className="messagingFooter">
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageUpload}
            />
            <button 
                className="mediaButton"
                onClick={() => fileInputRef.current.click()}
                disabled={shouldDisableTextarea()}>
                <FaImage className="mediaButtonIcon" />
            </button>
            <button 
                className="mediaButton"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={shouldDisableTextarea()}>
                {isRecording ? 
                    <FaStop className="mediaButtonIcon recording" /> :
                    <FaMicrophone className="mediaButtonIcon" />
                }
            </button>
            <textarea 
                className="messagingInputTextarea" 
                placeholder="Type to send a message"
                value={textareaContent}
                onChange={handleTextareaContentChange}
                onKeyDown={handleTextareaKeyChange}
                onClick={handleTextareaClick}
                autoFocus
                disabled={shouldDisableTextarea()} />
            <button 
                className="sendButton"
                onClick={handleSendButtonClick}
                disabled={shouldDisableSendButton()}>
                <FaPaperPlane className="sendButtonIcon" />
            </button>
        </div>
    );
}