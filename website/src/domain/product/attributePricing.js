const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const toList = (value) => {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
};

/**
 * Initial price of a product = sum of the prices of every selected option.
 *
 * attributes: [{ key, multi, options: [{ value, price }] }]
 * selections: { [attributeKey]: value | value[] }
 */
export const calculateAttributesPrice = (attributes = [], selections = {}) => {
  const selectedOptions = [];

  for (const attribute of attributes) {
    const chosen = toList(selections[attribute.key]);

    if (chosen.length > 1 && !attribute.multi) {
      throw new Error(`Attribute "${attribute.key}" accepts a single value`);
    }

    for (const value of chosen) {
      const option = attribute.options.find((item) => item.value === value);
      if (!option) {
        throw new Error(`Unknown option "${value}" for attribute "${attribute.key}"`);
      }
      selectedOptions.push(option);
    }
  }

  const total = selectedOptions.reduce((sum, option) => sum + (Number(option.price) || 0), 0);

  return { total: roundMoney(total), selectedOptions };
};
