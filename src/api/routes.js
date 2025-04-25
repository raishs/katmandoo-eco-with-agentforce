import express from 'express';
import { conn } from './salesforce-connection';

const router = express.Router();

// Get Contact ID by username
router.get('/contact', async (req, res) => {
  try {
    const { username } = req.query;
    const result = await conn.query(
      `SELECT Id FROM Contact WHERE User_Name__c = '${username}'`
    );
    
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ contactId: result.records[0].Id });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Get plants for a contact
router.get('/plants', async (req, res) => {
  try {
    const { contactId } = req.query;
    const result = await conn.query(
      `SELECT Id, Name, Plant_Name__c, Planting_Date__c 
       FROM Plant__c 
       WHERE Contact__c = '${contactId}'`
    );
    
    res.json(result.records);
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// Create a new plant
router.post('/plants', async (req, res) => {
  try {
    const { contactId, plantName, plantingDate } = req.body;
    
    const plant = {
      Contact__c: contactId,
      Plant_Name__c: plantName,
      Planting_Date__c: plantingDate
    };
    
    const result = await conn.sobject('Plant__c').create(plant);
    
    if (result.success) {
      res.json({ success: true, id: result.id });
    } else {
      throw new Error('Failed to create plant');
    }
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({ error: 'Failed to create plant' });
  }
});

// Get challenges for a contact
router.get('/challenges', async (req, res) => {
  try {
    const { contactId } = req.query;
    const result = await conn.query(
      `SELECT Id, Challenge__r.Challenge_Name__c, Challenge__r.Challenge_Description__c 
       FROM Contact_Challenge__c 
       WHERE Contact__c = '${contactId}'`
    );
    
    res.json(result.records);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

export default router; 