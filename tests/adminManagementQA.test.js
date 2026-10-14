import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import {
  toAdminSlider,
  toAdminSliderPayload,
  toAdminUser,
  toAdminUserPayload,
  toAdminUserUpdatePayload,
} from '../admin/src/domain/adminManagement.js';

class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = { location: { pathname: '/admin/admins', replace() {}, href: 'http://localhost/admin/admins' } };

let viteServer;
let api;
let tijaraAdminApi;
let calls;

const captureAdapter = async (config) => {
  calls.push(config);
  return { data: { data: [] }, status: 200, statusText: 'OK', headers: {}, config };
};

before(async () => {
  viteServer = await createServer({
    root: new URL('../admin', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  api = (await viteServer.ssrLoadModule('/src/config/axios.js')).default;
  tijaraAdminApi = (await viteServer.ssrLoadModule('/src/infrastructure/api/tijaraAdminApi.js')).default;
  api.defaults.adapter = captureAdapter;
});

after(async () => { await viteServer?.close(); });

beforeEach(() => {
  calls = [];
  storage.clear();
  storage.setItem('token', 'admin-token');
});

test('ADMIN management mappers follow the collection field names and normalize IDs/images', () => {
  assert.deepEqual(toAdminUserPayload({ name: 'مدير', email: 'admin@example.com', role: 'admin', is_active: true }), {
    name_en: 'مدير',
    name_ar: 'مدير',
    email: 'admin@example.com',
    role: 'admin',
    status: 1,
  });
  assert.deepEqual(toAdminUserUpdatePayload({ name: 'مدير', email: 'admin@example.com', role: 'admin', is_active: false }), {
    name: 'مدير',
    email: 'admin@example.com',
    role: 'admin',
    status: 0,
  });
  assert.deepEqual(toAdminUser({ id: 7, name: 'A', status: 0, image_url: 'https://cdn.test/storage/admin.jpg' }), {
    id: 7,
    name: 'A',
    name_i18n: { ar: 'A', en: 'A' },
    email: '',
    phone: '',
    role: 'admin',
    status: 0,
    image_url: 'https://cdn.test/storage/admin.jpg',
    is_active: false,
    avatar: 'https://cdn.test/public/storage/admin.jpg',
    createdAt: '',
  });

  assert.deepEqual(toAdminSliderPayload({
    title_ar: 'العنوان', title_en: 'Title', description_ar: 'الوصف', description_en: 'Description',
    link: '/products', status: 'active', order: '3',
  }), {
    title_en: 'Title', title_ar: 'العنوان', description_en: 'Description', description_ar: 'الوصف',
    link: '/products', status: 1, order: 3,
  });
  assert.equal(toAdminSlider({ id: 9, status: 0, image_url: '/storage/slide.jpg' }).status, 'inactive');
  assert.equal(toAdminSlider({ id: 9, status: 0, image_url: '/storage/slide.jpg' }).image, '/storage/slide.jpg');
  assert.deepEqual(toAdminSliderPayload({
    title_ar: 'العنوان', title_en: 'Title', description_ar: '', description_en: '',
    link: 'https://www.google.com/?zx=1791969512201', status: 'active', order: 1,
  }).link, 'https://www.google.com/?zx=1791969512201');
  assert.doesNotThrow(() => toAdminSlider(null));
});

test('ADMIN management API uses the collection /v1 users and sliders routes with multipart payloads', async () => {
  const image = new Blob(['image'], { type: 'image/jpeg' });

  await tijaraAdminApi.listUsers({ search: 'admin' });
  await tijaraAdminApi.createUser({ name_en: 'Admin', name_ar: 'مدير', email: 'admin@example.com', role: 'admin', status: 1 }, image);
  await tijaraAdminApi.updateUser(7, { name: 'Admin', email: 'admin@example.com', role: 'admin' }, image);
  await tijaraAdminApi.getUser(7);
  await tijaraAdminApi.deleteUser(7);
  await tijaraAdminApi.listSliders({ search: 'hero' });
  await tijaraAdminApi.createSlider({ title_en: 'Title', title_ar: 'عنوان', description_en: 'Desc', description_ar: 'وصف', link: '/', status: 1, order: 1 }, image);
  await tijaraAdminApi.updateSlider(9, { title_en: 'Title', title_ar: 'عنوان', description_en: 'Desc', description_ar: 'وصف', link: '/', status: 0, order: 1 }, image);
  await tijaraAdminApi.getSlider(9);
  await tijaraAdminApi.deleteSlider(9);

  assert.deepEqual(calls.map(({ method, url }) => [method, url]), [
    ['get', '/v1/users'], ['post', '/v1/users'], ['put', '/v1/users/7'], ['get', '/v1/users/7'], ['delete', '/v1/users/7'],
    ['get', '/v1/sliders'], ['post', '/v1/sliders'], ['put', '/v1/sliders/9'], ['get', '/v1/sliders/9'], ['delete', '/v1/sliders/9'],
  ]);
  assert.ok(calls.every((config) => !config.__localApi), 'Admin collection resources bypass local snapshot data');
  assert.equal(calls[0].params.search, 'admin');
  assert.ok(calls[1].data instanceof FormData);
  assert.equal(calls[1].data.get('name_en'), 'Admin');
  assert.equal(calls[1].data.get('name_ar'), 'مدير');
  assert.equal(calls[1].data.get('image_file').name, 'blob');
  assert.equal(calls[5].params.search, 'hero');
  assert.equal(calls[6].data.get('status'), '1');
  assert.equal(calls[7].data.get('status'), '0');
});
