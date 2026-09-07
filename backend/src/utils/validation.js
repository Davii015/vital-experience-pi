const ApiError = require('../errors/ApiError');

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, `O campo ${field} é obrigatório`);
  }
  return value.trim();
}

function optionalString(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new ApiError(400, 'Valor textual inválido');
  return value.trim();
}

function positiveInt(value, field, { optional = false } = {}) {
  if ((value === undefined || value === null || value === '') && optional) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, `O campo ${field} deve ser um inteiro positivo`);
  }
  return parsed;
}

function numberInRange(value, field, min, max, { optional = true } = {}) {
  if ((value === undefined || value === null || value === '') && optional) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new ApiError(400, `O campo ${field} deve estar entre ${min} e ${max}`);
  }
  return parsed;
}

function integerInRange(value, field, min, max, { optional = true } = {}) {
  const parsed = numberInRange(value, field, min, max, { optional });
  if (parsed === null) return null;
  if (!Number.isInteger(parsed)) throw new ApiError(400, `O campo ${field} deve ser um número inteiro`);
  return parsed;
}

function dateValue(value, field, { optional = false } = {}) {
  if ((value === undefined || value === null || value === '') && optional) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new ApiError(400, `O campo ${field} contém uma data inválida`);
  return parsed;
}

function enumValue(value, field, allowed, { optional = true } = {}) {
  if ((value === undefined || value === null || value === '') && optional) return null;
  if (!allowed.includes(value)) {
    throw new ApiError(400, `O campo ${field} deve ser um dos valores: ${allowed.join(', ')}`);
  }
  return value;
}

function requestValue(body, camelCase, snakeCase) {
  return body[camelCase] !== undefined ? body[camelCase] : body[snakeCase];
}

module.exports = {
  requiredString,
  optionalString,
  positiveInt,
  numberInRange,
  integerInRange,
  dateValue,
  enumValue,
  requestValue,
};
