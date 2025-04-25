import React from 'react';
import { FaSeedling, FaTrophy } from 'react-icons/fa';

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="tab-navigation">
      <button 
        className={`tab-button ${activeTab === 'plants' ? 'active' : ''}`}
        onClick={() => onTabChange('plants')}
      >
        <FaSeedling className="tab-icon" />
        <span>My Plants</span>
      </button>
      <button 
        className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
        onClick={() => onTabChange('challenges')}
      >
        <FaTrophy className="tab-icon" />
        <span>My Challenges</span>
      </button>
    </div>
  );
};

export default TabNavigation; 