import React, { useState, useEffect } from 'react';
import { FaPlus, FaLeaf } from 'react-icons/fa';

const MyPlants = ({ username }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlant, setNewPlant] = useState({ plantName: '', plantingDate: '' });

  useEffect(() => {
    fetchPlants();
  }, [username]);

  const fetchPlants = async () => {
    try {
      // First, get the Contact ID
      const contactResponse = await fetch(`/api/contact?username=${encodeURIComponent(username)}`);
      const contactData = await contactResponse.json();
      
      if (!contactData.contactId) {
        throw new Error('Contact not found');
      }

      // Then fetch plants for this contact
      const plantsResponse = await fetch(`/api/plants?contactId=${contactData.contactId}`);
      const plantsData = await plantsResponse.json();
      
      setPlants(plantsData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    try {
      const contactResponse = await fetch(`/api/contact?username=${encodeURIComponent(username)}`);
      const contactData = await contactResponse.json();

      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: contactData.contactId,
          plantName: newPlant.plantName,
          plantingDate: newPlant.plantingDate,
        }),
      });

      if (!response.ok) throw new Error('Failed to add plant');

      // Refresh plants list
      fetchPlants();
      setShowAddForm(false);
      setNewPlant({ plantName: '', plantingDate: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading plants...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-plants">
      <div className="section-header">
        <h2>My Plants</h2>
        <button className="add-button" onClick={() => setShowAddForm(true)}>
          <FaPlus /> Add Plant
        </button>
      </div>

      {showAddForm && (
        <form className="add-plant-form" onSubmit={handleAddPlant}>
          <input
            type="text"
            placeholder="Plant Name"
            value={newPlant.plantName}
            onChange={(e) => setNewPlant({ ...newPlant, plantName: e.target.value })}
            required
          />
          <input
            type="date"
            value={newPlant.plantingDate}
            onChange={(e) => setNewPlant({ ...newPlant, plantingDate: e.target.value })}
            required
          />
          <div className="form-buttons">
            <button type="submit">Add Plant</button>
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {plants.length === 0 ? (
        <div className="empty-state">
          <FaLeaf className="empty-icon" />
          <p>No plants added yet. Start growing your garden!</p>
        </div>
      ) : (
        <div className="plants-grid">
          {plants.map((plant) => (
            <div key={plant.Id} className="plant-card">
              <FaLeaf className="plant-icon" />
              <h3>{plant.Plant_Name__c}</h3>
              <p className="plant-id">ID: {plant.Name}</p>
              <p className="planting-date">
                Planted: {new Date(plant.Planting_Date__c).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPlants; 