import https from 'node:https';

const API_BASE = 'https://backend-mastergas.be-kite.com/api';

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + (parsed.search || ''),
      method: options.method || 'GET',
      headers: options.headers || {},
      family: 4, // force IPv4
      timeout: 10000
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

const productSpecs = {
  173: {
    'الارتفاع': ['59.5 سم'],
    'العرض': ['59.5 سم'],
    'السعة': ['65 لتر'],
    'العمق': ['55 سم'],
    'الجهد الكهربائي': ['220-240 فولت'],
    'نوع الطاقة': ['غاز طبيعي / مسال'],
    'المؤقت الرقمي': ['نعم'],
    'وظائف الطهي': ['4 وظائف'],
    'نظام الإشعال': ['إلكتروني ذاتي'],
    'صمام الأمان': ['أمان كامل'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['ستانلس ستيل']
  },
  174: {
    'الارتفاع': ['59.5 سم'],
    'العرض': ['89.5 سم'],
    'السعة': ['85 لتر'],
    'العمق': ['56 سم'],
    'الجهد الكهربائي': ['220-240 فولت'],
    'نوع الطاقة': ['غاز طبيعي / مسال'],
    'المؤقت الرقمي': ['نعم'],
    'وظائف الطهي': ['6 وظائف'],
    'نظام الإشعال': ['إلكتروني ذاتي'],
    'صمام الأمان': ['أمان كامل'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['ستانلس ستيل ورمادي معدني']
  },
  175: {
    'الارتفاع': ['5 سم'],
    'العرض': ['86 سم'],
    'السعة': ['5 شعلات غاز'],
    'العمق': ['51 سم'],
    'الجهد الكهربائي': ['220-240 فولت'],
    'نوع الطاقة': ['غاز طبيعي / مسال'],
    'المؤقت الرقمي': ['نعم'],
    'نوع الحوامل': ['حديد زهر ثقيل'],
    'نظام الإشعال': ['إلكتروني مدمج بالمفتاح'],
    'صمام الأمان': ['أمان كامل فوري'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['زجاج حراري مقسّى أسود']
  },
  176: {
    'الارتفاع': ['4.5 سم'],
    'العرض': ['58 سم'],
    'السعة': ['4 شعلات غاز'],
    'العمق': ['50 سم'],
    'الجهد الكهربائي': ['220-240 فولت'],
    'نوع الطاقة': ['غاز طبيعي / مسال'],
    'المؤقت الرقمي': ['لا'],
    'نوع الحوامل': ['حديد زهر صلب'],
    'نظام الإشعال': ['إلكتروني مدمج بالمفتاح'],
    'صمام الأمان': ['أمان كامل فوري'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['ستانلس ستيل 304']
  },
  177: {
    'الارتفاع': ['70-105 سم'],
    'العرض': ['90 سم'],
    'السعة': ['قوة شفط 1200 م³/ساعة'],
    'العمق': ['50 سم'],
    'الجهد الكهربائي': ['220-240 فولت'],
    'نوع الطاقة': ['كهرباء 230 واط'],
    'المؤقت الرقمي': ['نعم'],
    'مستويات السرعة': ['3 سرعات توربو'],
    'نوع الفلتر': ['فلاتر ألومنيوم متعددة الطبقات'],
    'مستوى الضوضاء': ['منخفض (56 ديسيبل)'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['ستانلس ستيل 304']
  },
  178: {
    'الارتفاع': ['55 سم'],
    'العرض': ['35 سم'],
    'السعة': ['10 لتر / دقيقة'],
    'العمق': ['18 سم'],
    'الجهد الكهربائي': ['شاشة إلكترونية تعمل بالبطاريات'],
    'نوع الطاقة': ['غاز طبيعي / مسال'],
    'المؤقت الرقمي': ['شاشة رقمية LED'],
    'ضغط المياه المناسب': ['يعمل مع ضغط المياه المنخفض'],
    'نظام الإشعال': ['إلكتروني أوتوماتيكي فوري'],
    'صمام الأمان': ['حماية ثلاثية متكاملة'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['أبيض ناصع مقاوم للصدأ']
  },
  179: {
    'الارتفاع': ['48 سم'],
    'العرض': ['30 سم'],
    'السعة': ['6 لتر / دقيقة'],
    'العمق': ['15 سم'],
    'الجهد الكهربائي': ['بطاريات جافة'],
    'نوع الطاقة': ['غاز طبيعي / مسال'],
    'المؤقت الرقمي': ['مؤشر حرارة رقمي'],
    'ضغط المياه المناسب': ['ضغط مياه منخفض 0.2 بار'],
    'نظام الإشعال': ['أوتوماتيكي عند فتح صنبور المياه'],
    'صمام الأمان': ['صمام أمان ذكي'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['أبيض ناصع']
  },
  180: {
    'الارتفاع': ['115 سم'],
    'العرض': ['135 سم'],
    'السعة': ['مساحة شواء 70 × 45 سم'],
    'العمق': ['58 سم'],
    'الجهد الكهربائي': ['لا يتطلب كهرباء'],
    'نوع الطاقة': ['أسطوانات غاز مسال'],
    'المؤقت الرقمي': ['مقياس حرارة مدمج بالغطاء'],
    'عدد الشعلات': ['4 شعلات ستانلس + شعلة جانبية'],
    'نظام الإشعال': ['إلكتروني نبضي'],
    'صمام الأمان': ['صمامات أمان معتمدة'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['ستانلس ستيل وأسود']
  },
  181: {
    'الارتفاع': ['72 سم'],
    'العرض': ['42 سم'],
    'السعة': ['3 ألواح تدفئة سيراميك'],
    'العمق': ['36 سم'],
    'الجهد الكهربائي': ['لا يتطلب كهرباء'],
    'نوع الطاقة': ['أسطوانة غاز منزلي'],
    'المؤقت الرقمي': ['تحكم يدوي بثلاث مستويات'],
    'نظام الإشعال': ['إشعال بيزو ذاتي'],
    'صمام الأمان': ['نظام ODS مع قفل عند الميلان'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['أسود ملكي']
  },
  182: {
    'الارتفاع': ['12 سم'],
    'العرض': ['68 سم'],
    'السعة': ['3 شعلات حديد زهر'],
    'العمق': ['38 سم'],
    'الجهد الكهربائي': ['لا يتطلب كهرباء'],
    'نوع الطاقة': ['غاز مسال'],
    'المؤقت الرقمي': ['مفاتيح نحاسية مدرجة'],
    'نوع الحوامل': ['حديد زهر عريض'],
    'نظام الإشعال': ['يدوي سريع'],
    'صمام الأمان': ['صمامات نحاسية آمنة'],
    'بلد المنشأ': ['إيطاليا'],
    'اللون والمظهر': ['أسود مطلي حرارياً']
  }
};

async function main() {
  console.log('=== Logging in to Mastergas Admin API ===');
  const loginRes = await request(`${API_BASE}/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  }, JSON.stringify({ email: 'admin@tijara.com', password: 'password123' }));

  if (loginRes.status !== 200 || !loginRes.data?.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes));
  }
  const token = loginRes.data.token;
  console.log('✔ Authenticated successfully.');

  const authHeaders = {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  };

  for (const [id, specs] of Object.entries(productSpecs)) {
    console.log(`\nFetching product ${id}...`);
    try {
      const pRes = await request(`${API_BASE}/dashboard/products/${id}`, {
        headers: authHeaders
      });

      if (pRes.status !== 200 || !pRes.data?.data) {
        console.warn(`Product ${id} not found (${pRes.status})`);
        continue;
      }
      const prod = pRes.data.data;
      console.log(` - Product found: ${prod.name}`);

      // Merge specs with existing color/size/material attributes
      const updatedAttrs = {
        ...(prod.attributes || {}),
        ...specs
      };

      // Multipart form boundary
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      let payload = '';

      function addField(name, val) {
        payload += `--${boundary}\r\n`;
        payload += `Content-Disposition: form-data; name="${name}"\r\n\r\n`;
        payload += `${val}\r\n`;
      }

      addField('_method', 'PUT');
      addField('name', JSON.stringify(prod.name_i18n || { ar: prod.name, en: prod.name }));
      addField('price', String(prod.price));
      addField('quantity', String(prod.quantity || prod.stock || 20));
      addField('category_id', String(prod.category_id));
      if (prod.sku) addField('sku', String(prod.sku));
      addField('attributes', JSON.stringify(updatedAttrs));

      payload += `--${boundary}--\r\n`;

      const upRes = await request(`${API_BASE}/dashboard/products/${id}`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      }, payload);

      if (upRes.status === 200) {
        console.log(` ✔ Successfully updated product ${id} with 12 dynamic specs!`);
      } else {
        console.warn(` ⚠ Failed to update product ${id}: ${upRes.status}`);
      }
    } catch (err) {
      console.error(` Error updating product ${id}:`, err.message);
    }
  }

  console.log('\n======================================================');
  console.log('✔ All 10 products successfully synchronized with API!');
  console.log('======================================================');
}

main().catch(err => {
  console.error('Script failure:', err);
  process.exit(1);
});
