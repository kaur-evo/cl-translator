import {
  isValidEmail, isRequired, isUsername, isCognitoPassword,
} from './index';

describe('validationRules', () => {
  describe('isValidEmail', () => {
    it('returns true when email is empty', () => {
      const result = isValidEmail('');
      expect(result).toBe(true);
    });
    it('returns true when email is valid', () => {
      const result = isValidEmail('doris@test.com');
      expect(result).toBe(true);
    });
    it('returns provided error message when email is invalid', () => {
      const result = isValidEmail('doristest.com', 'Please enter valid email');
      expect(result).toBe('Please enter valid email');
    });
    it('returns default error message when email is invalid', () => {
      const result = isValidEmail('doristest.com');
      expect(result).toBe('Please enter valid {fieldName}');
    });
  });

  describe('isRequired', () => {
    it('returns error message when value is empty string', () => {
      const result = isRequired('', 'Test');
      expect(result).toBe('Please enter {fieldName}');
    });
    it('returns error message when value is empty array', () => {
      const result = isRequired([], 'Test');
      expect(result).toBe('Please enter {fieldName}');
    });
    it('returns true when value exists', () => {
      const result = isRequired('test', 'Test');
      expect(result).toBe(true);
    });
  });

  describe('isUsername', () => {
    it('returns error message when there is space in username', () => {
      const result = isUsername('asdsad as@dasd');
      expect(result).toBe('Username should be in name{at}company format');
    });
    it('returns error message when there is no @ in username', () => {
      const result = isUsername('asdsaddasd');
      expect(result).toBe('Username should be in name{at}company format');
    });
    it('returns true on any other username input', () => {
      const result = isUsername('123123asd#"@¤%!"&//()))(//)(=');
      expect(result).toBe(true);
    });
  });

  describe('isCognitoPassword', () => {
    it('returns true when password is empty', () => {
      const result = isCognitoPassword('');
      expect(result).toBe(true);
    });
    it('returns true when password is valid', () => {
      const result = isCognitoPassword('Aa1!Aa1!Aa1!Aa1!');
      expect(result).toBe(true);
    });
    it('returns error message when password is shorter than 16 characters', () => {
      const result = isCognitoPassword('Aa1!Aa1!Aa1!Aa1');
      expect(result).toBe('Use at least 16 characters. Include UPPER and lower case letters, numbers and symbols.');
    });
    it('returns error message when password does not contain UPPER case letters', () => {
      const result = isCognitoPassword('aa1!aa1!aa1!aa1!');
      expect(result).toBe('Use at least 16 characters. Include UPPER and lower case letters, numbers and symbols.');
    });
    it('returns error message when password does not contain lower case letters', () => {
      const result = isCognitoPassword('AA1!AA1!AA1!AA1!');
      expect(result).toBe('Use at least 16 characters. Include UPPER and lower case letters, numbers and symbols.');
    });
    it('returns error message when password does not contain any numbers', () => {
      const result = isCognitoPassword('Aai!Aai!Aai!Aai!');
      expect(result).toBe('Use at least 16 characters. Include UPPER and lower case letters, numbers and symbols.');
    });
    it('returns error message when password does not contain any symbols', () => {
      const result = isCognitoPassword('Aa1iAa1iAa1iAa1i');
      expect(result).toBe('Use at least 16 characters. Include UPPER and lower case letters, numbers and symbols.');
    });
  });
});
