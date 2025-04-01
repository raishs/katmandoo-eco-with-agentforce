import { useState } from 'react';
import './quickStartButton.css';

export default function QuickStartButton({ onInitialize }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleQuickStart = async (evt) => {
        if (evt) {
            setIsLoading(true);
            const config = {
                orgId: "00DGA00000A6Cqe",
                deploymentDevName: "KathManDoo_Eco_App_Custom_Client",
                messagingURL: "https://orgfarm-6fd85ebc13-dev-ed.develop.my.salesforce-scrt.com"
            };
            
            await onInitialize(config);
            setIsLoading(false);
        }
    };

    return (
        <button
            className="quickStartButton"
            onClick={handleQuickStart}
            disabled={isLoading}
        >
            Start Chatting with Kat
            {isLoading && <span className="messagingButtonLoadingUI loadingBalls"></span>}
        </button>
    );
} 