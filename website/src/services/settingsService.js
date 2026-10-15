import api from '../config/axios';
import { API_TTL, getCached, parseCollectionResponse, parseDataResponse } from './apiClient';
import { normalizeSiteSlider } from './siteDataMappers';

const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''));

export const settingsService = {
  async getSettings(options = {}) {
    const body = await getCached('/frontend/settings', {}, {
      ttl: options.ttl ?? API_TTL.settings,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 4000,
    });
    return parseDataResponse(body);
  },

  async getSliders(params = { is_active: 1 }, options = {}) {
    const body = await getCached('/v1/site/sliders', clean(params), {
      ttl: options.ttl ?? API_TTL.settings,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 4000,
    });
    return parseCollectionResponse(body).items.map(normalizeSiteSlider);
  },

  async getCountries(options = {}) {
    const body = await getCached('/frontend/countries', {}, { signal: options.signal, retries: 2 });
    return parseCollectionResponse(body).items;
  },

  async getCities(countryId = null, options = {}) {
    const params = countryId ? { country_id: countryId } : {};
    const body = await getCached('/frontend/cities', params, { signal: options.signal, retries: 2 });
    return parseCollectionResponse(body).items;
  },

  async getShippingRates(options = {}) {
    const body = await getCached('/frontend/city-shipping-rates', {}, { signal: options.signal, retries: 2 });
    return parseCollectionResponse(body).items;
  },

  async getTopics(params = { status: 'published' }, options = {}) {
    const body = await getCached('/frontend/topics', clean(params), { signal: options.signal, retries: 2 });
    return parseCollectionResponse(body).items;
  },

  async getTopicBySlug(slug, options = {}) {
    const body = await getCached(`/frontend/topics/${encodeURIComponent(slug)}`, {}, { signal: options.signal, retries: 2 });
    return parseDataResponse(body);
  },

  async sendContactMessage(messageData) {
    const response = await api.post('/v1/site/contacts', {
      name: messageData.name,
      email: messageData.email,
      phone: messageData.phone,
      type: messageData.type || messageData.subject || 'Inquiry',
      message: messageData.message,
    });
    return response.data;
  },
};

export default settingsService;
