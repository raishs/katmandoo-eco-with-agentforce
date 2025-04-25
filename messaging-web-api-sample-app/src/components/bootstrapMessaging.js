import React from 'react';
import MessagingWindow from './messagingWindow';

const BootstrapMessaging = (props) => {
    const [isExistingConversation, setIsExistingConversation] = React.useState(false);
    const [showMessagingWindow, setShowMessagingWindow] = React.useState(false);
    const [deactivateMessagingButton, setDeactivateMessagingButton] = React.useState(false);

    return (
        <div>
            <MessagingWindow
                isExistingConversation={isExistingConversation}
                showMessagingWindow={showMessagingWindow}
                deactivateMessagingButton={deactivateMessagingButton}
                username={props.username} />
        </div>
    );
};

export default BootstrapMessaging; 