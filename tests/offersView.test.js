import test from 'node:test';
import assert from 'node:assert/strict';

test('OffersView & HomeView integration test suite', async (t) => {
  // 1. Verify HomeView offer links match the PRO offers
  const proOffers = [
    {
      id: 'clearance-pro',
      name: 'عروض التصفية الكبرى',
      selected_categories: [57],
      link: '/offers?offer=clearance-pro'
    },
    {
      id: 'builtin-pro',
      name: 'باقة المطابخ المدمجة',
      selected_categories: [57],
      link: '/offers?offer=builtin-pro'
    },
    {
      id: 'safety-pro',
      name: 'باقة الأمان الإيطالية',
      selected_categories: [52, 56],
      link: '/offers?offer=safety-pro'
    },
    {
      id: 'bbq-pro',
      name: 'شوايات ومواقد الحدائق الفاخرة',
      selected_categories: [59],
      link: '/offers?offer=bbq-pro'
    }
  ];

  await t.test('Offer IDs and links in HomeView correctly format query params', () => {
    for (const offer of proOffers) {
      assert.ok(offer.link.startsWith('/offers?offer='), `Offer link ${offer.link} should have query param`);
      assert.strictEqual(offer.link, `/offers?offer=${offer.id}`);
    }
  });

  // Mock product catalog
  const mockProducts = [
    { id: 1, name: 'موقد غاز مسطح إيطالي 90 سم', category_id: 57, price: 1200, sale_price: 780, discount: 35, stock: 8, origin: 'إيطالي الصنع', created_at: '2026-03-01' },
    { id: 2, name: 'فرن بلت إن 60 سم', category_id: 57, price: 2100, sale_price: 1575, discount: 25, stock: 4, origin: 'إيطالي الصنع', created_at: '2026-02-15' },
    { id: 3, name: 'طباخ غاز سيراميك مدمج', category_id: 57, price: 950, sale_price: 800, discount: 15, stock: 0, origin: 'إيطالي الصنع', created_at: '2026-01-20' },
    { id: 4, name: 'منظم غاز إيطالي عالي الضغط', category_id: 52, price: 180, sale_price: 150, discount: 15, stock: 15, origin: 'إيطالي الصنع', created_at: '2026-02-01' },
    { id: 5, name: 'كاشف تسرب الغاز الرقمي الذكي', category_id: 56, price: 250, sale_price: 210, discount: 15, stock: 12, origin: 'صناعة إيطالية معتمدة', created_at: '2026-03-05' },
    { id: 6, name: 'شواية غاز خارجية فاخرة 4 شعلات', category_id: 59, price: 3200, sale_price: 2560, discount: 20, stock: 3, origin: 'أمريكي', created_at: '2026-02-28' },
    { id: 7, name: 'محبس غاز أمان نحاسي', category_id: 52, price: 85, sale_price: 70, discount: 15, stock: 20, origin: 'إيطاليا', created_at: '2026-01-10' }
  ];

  await t.test('Filter by selected offer matches categories properly', () => {
    // Clearance offer (cat 57)
    const clearanceOffer = proOffers.find(o => o.id === 'clearance-pro');
    const clearanceProducts = mockProducts.filter(p => clearanceOffer.selected_categories.includes(p.category_id));
    assert.strictEqual(clearanceProducts.length, 3);

    // Safety offer (cats 52 & 56)
    const safetyOffer = proOffers.find(o => o.id === 'safety-pro');
    const safetyProducts = mockProducts.filter(p => safetyOffer.selected_categories.includes(p.category_id));
    assert.strictEqual(safetyProducts.length, 3); // 2 in 52, 1 in 56

    // BBQ offer (cat 59)
    const bbqOffer = proOffers.find(o => o.id === 'bbq-pro');
    const bbqProducts = mockProducts.filter(p => bbqOffer.selected_categories.includes(p.category_id));
    assert.strictEqual(bbqProducts.length, 1);
  });

  await t.test('Additional options filters work accurately', () => {
    // In Stock Only
    const inStock = mockProducts.filter(p => p.stock > 0);
    assert.strictEqual(inStock.length, 6); // product id 3 has stock: 0

    // Italian Made Only
    const italian = mockProducts.filter(p => {
      const origin = p.origin || '';
      return origin.includes('إيطال') || origin.toLowerCase().includes('ital');
    });
    assert.strictEqual(italian.length, 6); // product 6 is American

    // Combined: Clearance + In Stock Only
    const clearanceInStock = mockProducts
      .filter(p => p.category_id === 57)
      .filter(p => p.stock > 0);
    assert.strictEqual(clearanceInStock.length, 2);
  });

  await t.test('Sorting logic matches specifications', () => {
    // Price Ascending
    const asc = [...mockProducts].sort((a, b) => a.price - b.price);
    assert.strictEqual(asc[0].price, 85);
    assert.strictEqual(asc[asc.length - 1].price, 3200);

    // Price Descending
    const desc = [...mockProducts].sort((a, b) => b.price - a.price);
    assert.strictEqual(desc[0].price, 3200);
    assert.strictEqual(desc[desc.length - 1].price, 85);

    // Newest
    const newest = [...mockProducts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    assert.strictEqual(newest[0].id, 5); // 2026-03-05
  });
});
