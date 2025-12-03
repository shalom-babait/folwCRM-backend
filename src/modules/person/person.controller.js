import * as personService from './person.service.js';

export async function createPersonController(req, res) {
  try {
    const personData = req.body;
    // ולידציה בסיסית
    const requiredFields = ['first_name', 'last_name', 'phone', 'city', 'gender'];
    for (const field of requiredFields) {
      if (!personData[field] || personData[field].trim() === '') {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    // ניקוי רווחים
    personData.first_name = personData.first_name.trim();
    personData.last_name = personData.last_name.trim();
    personData.phone = personData.phone.trim();
    personData.city = personData.city.trim();
    if (personData.address) personData.address = personData.address.trim();
    if (personData.teudat_zehut) personData.teudat_zehut = personData.teudat_zehut.trim();

    const newPerson = await personService.createPersonService(personData);
    res.status(201).json({ success: true, data: newPerson });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAllPersonsController(req, res) {
  try {
    const persons = await personService.getAllPersonsService();
    res.json({ success: true, data: persons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPersonByIdController(req, res) {
  try {
    const person = await personService.getPersonByIdService(req.params.person_id);
    if (!person) return res.status(404).json({ success: false, error: 'Person not found' });
    res.json({ success: true, data: person });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePersonController(req, res) {
  try {
    const updated = await personService.updatePersonService(req.params.person_id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Person not found or no changes made' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deletePersonController(req, res) {
  try {
    const deleted = await personService.deletePersonService(req.params.person_id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Person not found' });
    res.json({ success: true, message: 'Person deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
