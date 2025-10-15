import React, { useState, useEffect } from 'react';

const SettingsRow: React.FC<{ label: string, description: string, children: React.ReactNode }> = ({ label, description, children }) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-secondary">
        <div className="mb-2 sm:mb-0">
            <h3 className="text-lg font-medium text-text-primary">{label}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <div>
            {children}
        </div>
    </div>
);

const QRCodeDisplay: React.FC<{ dataUrl: string | null }> = ({ dataUrl }) => {
    if (!dataUrl) {
        return (
            <div className="bg-white p-2 rounded-md w-40 h-40 mx-auto animate-pulse"></div>
        );
    }
    return (
        <div className="bg-white p-2 rounded-md w-40 h-40 mx-auto">
           <img src={dataUrl} alt="WhatsApp QR Code" />
        </div>
    );
};

export const Settings: React.FC = () => {
    const [digestTime, setDigestTime] = useState('07:00');
    const [notifications, setNotifications] = useState(true);
    const [whatsAppStatus, setWhatsAppStatus] = useState<'initializing' | 'unscanned' | 'connected' | 'disconnected'>('initializing');
    const [qrCode, setQrCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/whatsapp/status');
                if (response.ok) {
                    const data = await response.json();
                    setWhatsAppStatus(data.status);
                    setQrCode(data.qr);
                } else {
                    setWhatsAppStatus('disconnected');
                    setQrCode(null);
                }
            } catch (error) {
                console.error("Failed to fetch WhatsApp status:", error);
                setWhatsAppStatus('disconnected');
                setQrCode(null);
            }
        };

        fetchStatus();
        const intervalId = setInterval(fetchStatus, 3000);

        return () => clearInterval(intervalId);
    }, []);
    
    const handleDisconnect = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/whatsapp/disconnect', { method: 'POST' });
            if (response.ok) {
                setWhatsAppStatus('disconnected');
                setQrCode(null);
                alert("WhatsApp has been disconnected. You may need to restart the backend to reconnect.");
            } else {
                 alert("Failed to disconnect. Please try again.");
            }
        } catch (error) {
            console.error("Error during disconnect:", error);
            alert("An error occurred while trying to disconnect.");
        }
    };

    const renderWhatsAppButton = () => {
        switch (whatsAppStatus) {
            case 'initializing':
                 return <button disabled className="px-4 py-2 font-semibold text-primary bg-text-secondary rounded-lg opacity-70">Initializing...</button>;
            case 'unscanned':
                return <button disabled className="px-4 py-2 font-semibold text-primary bg-highlight rounded-lg opacity-70">Awaiting Scan</button>;
            case 'connected':
                return <button onClick={handleDisconnect} className="px-4 py-2 font-semibold text-primary bg-danger rounded-lg hover:opacity-90 transition-opacity">Disconnect</button>;
            case 'disconnected':
                 return <button disabled className="px-4 py-2 font-semibold text-primary bg-secondary rounded-lg opacity-70">Disconnected</button>;
        }
    };

    const renderConnectionStatusText = () => {
        switch (whatsAppStatus) {
            case 'initializing':
                return "Initializing connection...";
            case 'unscanned':
                return "Scan the QR code to connect.";
            case 'connected':
                return "Your assistant is connected and ready on WhatsApp.";
             case 'disconnected':
                return "Connection lost. Restart the backend to reconnect.";
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-text-secondary mb-8">Configure your AI assistant to fit your needs.</p>

            <div className="bg-secondary p-6 rounded-xl max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-2 text-highlight">Preferences</h2>
                
                <SettingsRow
                    label="Daily Digest Time"
                    description="Set the time you receive your daily summary."
                >
                    <input 
                        type="time"
                        value={digestTime}
                        onChange={(e) => setDigestTime(e.target.value)}
                        className="px-3 py-2 bg-primary border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </SettingsRow>

                <SettingsRow
                    label="Push Notifications"
                    description="Enable or disable push notifications for reminders."
                >
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                </SettingsRow>
                
                <h2 className="text-2xl font-semibold mt-8 mb-2 text-highlight">Integrations</h2>
                
                {whatsAppStatus === 'unscanned' && (
                    <div className="my-6 p-6 bg-primary rounded-lg text-center">
                        <h3 className="text-xl font-semibold mb-2">Scan to Connect WhatsApp</h3>
                        <p className="text-text-secondary mb-4">Open WhatsApp on your phone, go to Settings &gt; Linked Devices, and scan this code.</p>
                        <QRCodeDisplay dataUrl={qrCode} />
                         <div className="mt-4 flex items-center justify-center text-sm text-highlight">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Waiting for connection...
                        </div>
                    </div>
                )}

                <SettingsRow
                    label="WhatsApp Integration"
                    description={renderConnectionStatusText()}
                >
                    {renderWhatsAppButton()}
                </SettingsRow>

                <h2 className="text-2xl font-semibold mt-8 mb-2 text-highlight">Data Management</h2>

                 <SettingsRow
                    label="Clear Conversation History"
                    description="Deletes your chat history with the assistant."
                >
                    <button className="px-4 py-2 font-semibold text-primary bg-danger rounded-lg hover:opacity-90 transition-opacity">
                        Clear
                    </button>
                </SettingsRow>
            </div>
        </div>
    );
};