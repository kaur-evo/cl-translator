/* eslint-disable sonarjs/slow-regex */
/* eslint-disable sonarjs/concise-regex */

import i18n from '../../services/i18n';

// eslint-disable-next-line sonarjs/regex-complexity
const rfc5322email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const cognitoPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ])[A-Za-z0-9^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{16,99}$/;

export const timeInput12h = /^(0?[1-9]|1[0-2]):[0-5][0-9]([A|P]M)$/;
export const timeInput24h = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const isEmptyString = (val) => !val && val !== 0;
const isEmptyArray = (val) => Array.isArray(val) && !val.length;
const isEmpty = (val) => isEmptyArray(val) || isEmptyString(val);

export function isValidEmail(val, message) {
  if (isEmpty(val)) return true;
  if (rfc5322email.test(val)) return true;
  if (message) return message;
  return i18n.global.t('Please enter valid {fieldName}', { fieldName: i18n.global.t('Email').toLowerCase() });
}

export function isRequired(val, fieldName) {
  if (!isEmpty(val)) return true;
  return i18n.global.t('Please enter {fieldName}', { fieldName: fieldName.toLowerCase() });
}

export function isUsername(val) {
  return (/^\S+@\S+$/).test(val) || i18n.global.t('Username should be in name{at}company format', { at: '@' });
}

export function isCognitoPassword(val) {
  if (isEmpty(val)) return true;
  if (cognitoPassword.test(val)) return true;
  return i18n.global.t('Use at least 16 characters. Include UPPER and lower case letters, numbers and symbols.');
}
