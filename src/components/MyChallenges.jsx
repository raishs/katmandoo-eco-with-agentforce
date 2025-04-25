import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';

const MyChallenges = ({ username }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChallenges();
  }, [username]);

  const fetchChallenges = async () => {
    try {
      // First, get the Contact ID
      const contactResponse = await fetch(`/api/contact?username=${encodeURIComponent(username)}`);
      const contactData = await contactResponse.json();
      
      if (!contactData.contactId) {
        throw new Error('Contact not found');
      }

      // Then fetch challenges for this contact
      const challengesResponse = await fetch(`/api/challenges?contactId=${contactData.contactId}`);
      const challengesData = await challengesResponse.json();
      
      setChallenges(challengesData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading challenges...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-challenges">
      <div className="section-header">
        <h2>My Challenges</h2>
        <FaTrophy className="section-icon" />
      </div>

      {challenges.length === 0 ? (
        <div className="empty-state">
          <FaMedal className="empty-icon" />
          <p>No active challenges. Join a challenge to start earning rewards!</p>
        </div>
      ) : (
        <div className="challenges-grid">
          {challenges.map((challenge) => (
            <div key={challenge.Id} className="challenge-card">
              <FaMedal className="challenge-icon" />
              <h3>{challenge.Challenge__r.Challenge_Name__c}</h3>
              <p className="challenge-description">
                {challenge.Challenge__r.Challenge_Description__c}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChallenges; 