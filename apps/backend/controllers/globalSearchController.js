// Controller for global search
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import Emergency from '../models/Emergency.js';

// GET /api/v1/global-search?q=searchTerm
export const globalSearch = async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) return res.json({ data: { results: [] } });

  // Search hospitals, patients (users with role: 'patient'), emergencies in parallel
  const [hospitals, patients, emergencies] = await Promise.all([
    Hospital.find({ name: { $regex: q, $options: 'i' } }).limit(5),
    User.find({
      role: 'patient',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    }).limit(5),
    Emergency.find({ description: { $regex: q, $options: 'i' } }).limit(5),
  ]);

  // Format results for frontend
  const results = [
    ...hospitals.map(h => ({
      id: h._id,
      type: 'Hospital',
      name: h.name,
      link: `/dashboard/hospitals/${h._id}`
    })),
    ...patients.map(p => ({
      id: p._id,
      type: 'Patient',
      name: p.name,
      link: `/dashboard/patients/${p._id}`
    })),
    ...emergencies.map(e => ({
      id: e._id,
      type: 'Emergency',
      name: e.description,
      link: `/dashboard/emergencies/${e._id}`
    })),
  ];

  res.json({ data: { results } });
};
