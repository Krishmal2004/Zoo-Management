const TicketCatalog = require('../models/TicketCatalog.model');

const DEFAULT_CATALOG = [
  { code: 'localChild', name: 'Local Child', category: 'entry', priceLkr: 450 },
  { code: 'localAdult', name: 'Local Adult', category: 'entry', priceLkr: 900 },
  { code: 'foreignChild', name: 'Foreign Child', category: 'entry', priceLkr: 1800 },
  { code: 'foreignAdult', name: 'Foreign Adult', category: 'entry', priceLkr: 3500 },
  {
    code: 'birds_of_prey',
    name: 'Birds of prey flight',
    category: 'show',
    priceLkr: 200,
    meta: { timeLabel: '10:00 AM' },
  },
  {
    code: 'elephant_care_bath',
    name: 'Elephant care & bath',
    category: 'show',
    priceLkr: 250,
    meta: { timeLabel: '2:30 PM' },
  },
  {
    code: 'sea_lion_splash',
    name: 'Sea lion splash',
    category: 'show',
    priceLkr: 200,
    meta: { timeLabel: '4:00 PM' },
  },
  {
    code: 'reptile_encounter',
    name: 'Reptile encounter',
    category: 'show',
    priceLkr: 150,
    meta: { timeLabel: '11:30 AM' },
  },
];

async function seedTicketCatalog() {
  for (const item of DEFAULT_CATALOG) {
    await TicketCatalog.updateOne(
      { code: item.code },
      {
        $set: {
          name: item.name,
          category: item.category,
          priceLkr: item.priceLkr,
          active: true,
          meta: item.meta || {},
        },
      },
      { upsert: true }
    );
  }
  console.log('[seedCatalog] Ticket catalog seeded/updated.');
}

module.exports = { seedTicketCatalog, DEFAULT_CATALOG };
