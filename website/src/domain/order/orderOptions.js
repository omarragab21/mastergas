// Chosen product options travel with an order inside its `notes`.
//
// The order API (POST /v1/site/orders) stores only product_id and quantity per
// item, ignores any option field, and rejects an order that lists the same
// product twice. So lines of one product are merged into a single item, and the
// per-line choices are appended to the notes as a tagged JSON block:
//
//   <customer notes>
//
//   [MG-OPTIONS]{"v":1,"items":[{"p":75,"q":1,"o":[119,121,123]}]}[/MG-OPTIONS]
//
// p = product id, q = quantity of that choice, o = chosen option ids. Order
// responses list every option of each product (items[].product.options), so
// readers resolve the ids to names in their own language.
//
// Keep in sync with admin/src/domain/orders/orderOptions.js.

const OPEN = '[MG-OPTIONS]';
const CLOSE = '[/MG-OPTIONS]';
const BLOCK = /\s*\[MG-OPTIONS\]([\s\S]*?)\[\/MG-OPTIONS\]\s*/;

const optionIdsOf = (line) => (Array.isArray(line?.selectedOptions) ? line.selectedOptions : [])
  .map((option) => Number(option?.id))
  .filter(Number.isFinite);

/**
 * Order items for the API: one item per product, quantities summed. The first
 * line of a product supplies its unit price and offer.
 */
export const mergeOrderItems = (items) => {
  const merged = new Map();
  items.forEach((item) => {
    const key = String(item.product_id);
    const existing = merged.get(key);
    if (existing) existing.quantity += item.quantity;
    else merged.set(key, { ...item });
  });
  return [...merged.values()];
};

const blockFor = (items) => `${OPEN}${JSON.stringify({ v: 1, items })}${CLOSE}`;
const joinNotes = (text, block) => (text ? `${text}\n\n${block}` : block);

/** Appends the options block for cart lines that have chosen options. */
export const appendOrderOptions = (notes, cartLines) => {
  const items = cartLines
    .map((line) => ({ p: Number(line.id), q: Math.max(1, Math.floor(Number(line.quantity) || 1)), o: optionIdsOf(line) }))
    .filter((entry) => Number.isFinite(entry.p) && entry.o.length);
  const text = stripOrderOptions(notes);
  return items.length ? joinNotes(text, blockFor(items)) : text;
};

/**
 * Fits notes into the API limit (1000 characters). The options block is kept
 * whole and the customer's text is shortened to the room left; only a block
 * that alone exceeds the limit (dozens of lines) loses its last entries.
 */
export const fitOrderNotes = (notes, limit) => {
  const text = stripOrderOptions(notes);
  let entries = parseOrderOptions(notes);
  if (!entries.length) return text.slice(0, limit);
  while (entries.length > 1 && blockFor(entries).length > limit) entries = entries.slice(0, -1);
  const block = blockFor(entries);
  if (block.length > limit) return text.slice(0, limit);
  return joinNotes(text.slice(0, Math.max(0, limit - block.length - 2)).trim(), block);
};

/** Notes without the options block (what the customer actually wrote). */
export const stripOrderOptions = (notes) => String(notes ?? '').replace(BLOCK, '\n').trim();

/** [{ p, q, o }] from an order's notes; [] when there is no valid block. */
export const parseOrderOptions = (notes) => {
  const match = String(notes ?? '').match(BLOCK);
  if (!match) return [];
  try {
    const data = JSON.parse(match[1]);
    return (Array.isArray(data?.items) ? data.items : [])
      .map((entry) => ({
        p: Number(entry?.p),
        q: Math.max(1, Math.floor(Number(entry?.q) || 1)),
        o: (Array.isArray(entry?.o) ? entry.o : []).map(Number).filter(Number.isFinite),
      }))
      .filter((entry) => Number.isFinite(entry.p) && entry.o.length);
  } catch {
    return [];
  }
};

/**
 * The chosen options of one order item, resolved against its product's options:
 * [{ quantity, options: [{ id, group, name, hex }] }]. Names come in the
 * language the order was fetched in.
 */
export const orderItemChoices = (orderItem, entries) => {
  const productId = Number(orderItem?.product_id ?? orderItem?.product?.id);
  const productOptions = orderItem?.product?.options ?? orderItem?.options;
  const available = new Map(
    (Array.isArray(productOptions) ? productOptions : [])
      .map((option) => [Number(option.id), option]),
  );
  return entries
    .filter((entry) => entry.p === productId)
    .map((entry) => ({
      quantity: entry.q,
      options: entry.o.map((id) => {
        const option = available.get(id);
        if (!option) return null;
        const code = String(option.value_code ?? '');
        return {
          id,
          group: String(option.attribute_name ?? ''),
          name: String(option.name ?? ''),
          hex: option.type === 'color_swatch' || /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(code) ? code : null,
        };
      }).filter(Boolean),
    }))
    .filter((choice) => choice.options.length);
};
