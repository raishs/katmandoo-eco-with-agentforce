import React, { useState } from 'react';
import TabNavigation from './components/TabNavigation';
import MyPlants from './components/MyPlants';
import MyChallenges from './components/MyChallenges';
import './styles/tabs.css';

function App({ username }) {
  const [activeTab, setActiveTab] = useState('plants');

  return (
    <div className="app">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'plants' ? (
          <MyPlants username={username} />
        ) : (
          <MyChallenges username={username} />
        )}
      </main>
    </div>
  );
}

export default App; 