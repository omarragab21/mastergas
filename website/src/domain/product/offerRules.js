// Whether an offer is running now (status, flag and start/end dates).

export const isOfferDateValid = (offer) => {
  if (!offer) return false;
  const now = new Date();
  const startRaw = offer.start_date || offer.starts_at || offer.valid_from || offer.from_date;
  const endRaw = offer.end_date || offer.ends_at || offer.expires_at || offer.valid_to || offer.to_date;

  if (startRaw) {
    const startDate = new Date(startRaw);
    if (!Number.isNaN(startDate.getTime())) {
      if (!String(startRaw).includes('T') && !String(startRaw).includes(' ')) startDate.setHours(0, 0, 0, 0);
      if (now < startDate) return false;
    }
  }
  if (endRaw) {
    const endDate = new Date(endRaw);
    if (!Number.isNaN(endDate.getTime())) {
      if (!String(endRaw).includes('T') && !String(endRaw).includes(' ')) endDate.setHours(23, 59, 59, 999);
      else if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) endDate.setHours(23, 59, 59, 999);
      if (now > endDate) return false;
    }
  }
  return true;
};

export const isOfferActive = (offer) => Boolean(
  offer &&
  (!offer.status || offer.status === 'active') &&
  offer.is_active !== 0 && offer.is_active !== false && offer.is_active !== '0' &&
  isOfferDateValid(offer)
);
