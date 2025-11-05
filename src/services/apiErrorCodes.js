export const ERROR_CODES = {
  MISSING_ADDRESS: 'MISSING_ADDRESS',
  TABLE_CLOSED: 'TABLE_CLOSED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN: 'UNKNOWN',
};

const MESSAGE_CODE_MATCHERS = [
  {
    code: ERROR_CODES.MISSING_ADDRESS,
    test: (message) =>
      /direccion/i.test(message) && /(delivery|entrega)/i.test(message),
  },
  {
    code: ERROR_CODES.TABLE_CLOSED,
    test: (message) =>
      /mesa/i.test(message) &&
      /(cerrad|no est[a\u01cd] ocupada|libre|no disponible)/i.test(message),
  },
  {
    code: ERROR_CODES.UNAUTHORIZED,
    test: (message) =>
      /solo\s*(los\s*)?admin/i.test(message) ||
      /only admins/i.test(message) ||
      /autorizaci[o\u00f3]n requerid/i.test(message),
  },
];

export function resolveErrorCode({ code, status, message }) {
  if (code) {
    return code;
  }

  for (const matcher of MESSAGE_CODE_MATCHERS) {
    if (matcher.test(message)) {
      return matcher.code;
    }
  }

  if (status === 401) {
    return ERROR_CODES.UNAUTHORIZED;
  }

  if (status === 419) {
    return ERROR_CODES.SESSION_EXPIRED;
  }

  if (status === 403) {
    return ERROR_CODES.SESSION_EXPIRED;
  }

  if (status === 422 || status === 409) {
    return ERROR_CODES.VALIDATION_ERROR;
  }

  return ERROR_CODES.UNKNOWN;
}
