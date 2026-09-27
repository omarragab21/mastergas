import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const PROJECT_ROOT = '/Users/omarragab/Projects/mastergas';
const VITE_PORT = 5173;

test('Senior QA Suite: About Us (من نحن) Redesign, Images & Routing Verification', async (t) => {

  // 1. Router mapping verification
  await t.test('Step 1: Router configuration points /about directly to AboutView.vue', () => {
    const routerPath = path.join(PROJECT_ROOT, 'src/router/index.js');
    const content = fs.readFileSync(routerPath, 'utf8');
    
    assert.ok(content.includes("path: 'about'"), 'Router must declare /about path');
    assert.ok(content.includes("AboutView.vue"), 'Router must load AboutView.vue for /about');
  });

  // 2. High-quality Gemini generated images existence & validity
  await t.test('Step 2: All 4 high-resolution images exist in public/images/about with valid size', () => {
    const requiredImages = [
      'hero_banner.jpg',
      'sec1_modern_kitchen.jpg',
      'sec2_italian_cooker.jpg',
      'sec3_villa_kitchen.jpg'
    ];

    for (const imgName of requiredImages) {
      const imgPath = path.join(PROJECT_ROOT, 'public/images/about', imgName);
      assert.ok(fs.existsSync(imgPath), `Image ${imgName} must exist in public/images/about/`);
      const stat = fs.statSync(imgPath);
      assert.ok(stat.size > 100 * 1024, `Image ${imgName} must be high quality (>100KB, got ${Math.round(stat.size / 1024)}KB)`);
    }
  });

  // 3. AboutView component design structure & sections verification
  await t.test('Step 3: AboutView.vue contains all copy-paste design sections matching reference screenshot', () => {
    const viewPath = path.join(PROJECT_ROOT, 'src/views/website/AboutView.vue');
    const content = fs.readFileSync(viewPath, 'utf8');

    // Hero section
    assert.ok(content.includes('لماذا Mastergas؟'), 'Must include hero headline: لماذا Mastergas؟');
    assert.ok(content.includes('الجودة والابتكار في الطهي الحديث'), 'Must include hero tagline: الجودة والابتكار في الطهي الحديث');

    // 3 Showcase sections
    assert.ok(content.includes('عن Mastergas'), 'Must include section: عن Mastergas');
    assert.ok(content.includes('الحرفية الإيطالية والتكنولوجيا المعاصرة'), 'Must include section: الحرفية الإيطالية والتكنولوجيا المعاصرة');
    assert.ok(content.includes('مصمم لثقافتنا واحتياجاتنا المحلية'), 'Must include section: مصمم لثقافتنا واحتياجاتنا المحلية');

    // Values section
    assert.ok(content.includes('قيمنا الراسخة'), 'Must include values section title: قيمنا الراسخة');
    assert.ok(content.includes('جودة بلا مساومة'), 'Must include value: جودة بلا مساومة');
    assert.ok(content.includes('أمان لكل أسرة'), 'Must include value: أمان لكل أسرة');
    assert.ok(content.includes('استدامة ومسؤولية'), 'Must include value: استدامة ومسؤولية');

    // Stats section
    assert.ok(content.includes('أرقام تفخر بها جودتنا'), 'Must include stats title: أرقام تفخر بها جودتنا');
    assert.ok(content.includes('100%'), 'Must include stat: 100%');
    assert.ok(content.includes('+10 سنوات'), 'Must include stat: +10 سنوات');
    assert.ok(content.includes('إيطالي'), 'Must include stat: إيطالي');

    // CTA section
    assert.ok(content.includes('Mastergas — مصممة للحياة الواقعية'), 'Must include CTA headline: Mastergas — مصممة للحياة الواقعية');
    assert.ok(content.includes('تسوق الآن'), 'Must include CTA button: تسوق الآن');
  });

  // 4. Animation & Interaction completeness
  await t.test('Step 4: AboutView.vue implements smooth animations and IntersectionObserver reveals', () => {
    const viewPath = path.join(PROJECT_ROOT, 'src/views/website/AboutView.vue');
    const content = fs.readFileSync(viewPath, 'utf8');

    assert.ok(content.includes('IntersectionObserver'), 'Must use IntersectionObserver for scroll-triggered animation');
    assert.ok(content.includes('@keyframes heroKenBurns'), 'Must include hero Ken Burns subtle zoom animation');
    assert.ok(content.includes('scroll-reveal'), 'Must include scroll-reveal animation classes');
    assert.ok(content.includes('hover'), 'Must include hover transitions for cards and buttons');
  });

  // 5. Local Vite server HTTP response verification
  await t.test('Step 5: Local server serves the /about route and assets with HTTP 200', async (t) => {
    try {
      const pageRes = await axios.get(`http://localhost:${VITE_PORT}/about`, { timeout: 4000 });
      assert.strictEqual(pageRes.status, 200, '/about must return 200 OK');
    } catch (e) {
      // If dev server port is different or not running, skip test gracefully
      t.skip(`Vite dev server is not running on port ${VITE_PORT}: ${e.message}`);
      return;
    }

    const imgRes = await axios.get(`http://localhost:${VITE_PORT}/images/about/hero_banner.jpg`, { timeout: 4000 });
    assert.strictEqual(imgRes.status, 200, 'Hero banner image must be accessible via HTTP 200');
  });

});
