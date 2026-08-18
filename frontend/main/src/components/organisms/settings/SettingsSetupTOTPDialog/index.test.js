import { shallowMount, flushPromises } from '@vue/test-utils';
import {
  getCurrentUser, setUpTOTP, verifyTOTPSetup, updateMFAPreference,
} from 'aws-amplify/auth';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import MFAType from '@/constants/multiFactorAuth';


vi.mock('aws-amplify/auth');
getCurrentUser.mockResolvedValue({ username: 'testuser' });
setUpTOTP.mockResolvedValue({ sharedSecret: 'abcd1234' });
verifyTOTPSetup.mockResolvedValue();
updateMFAPreference.mockResolvedValue();

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: {
    ...global,
    stubs: { 'dialog-template': false },
  },
  ...options,
});

const propsDefault = {};

describe('SettingsSetupTOTPDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if showManualSetup is true', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    wrapper.vm.showManualSetup = true;
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('generates the correct QR code string', () => {
    const baseMockUrl = 'https://example.com';
    const usernameMock = 'testuser';
    const secretMock = 'abcd1234';
    // eslint-disable-next-line no-undef
    process.env.VITE_VUE_APP_BASE_URL = baseMockUrl;
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.setData({
      user: { username: usernameMock },
      MFASecret: secretMock,
    });

    expect(wrapper.vm.qrCodeString).toBe(`otpauth://totp/AWSCognito:${usernameMock}?secret=${secretMock}&issuer=${baseMockUrl}`);
  });

  it('initializes 2FA setup and sets MFASecret', async () => {
    const mockUser = { username: 'testuser' };
    getCurrentUser.mockResolvedValue(mockUser);
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await flushPromises();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.user).toStrictEqual(mockUser);
    expect(setUpTOTP).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.MFASecret).toBe('abcd1234');
    expect(wrapper.vm.error).toBe(false);
  });

  it('sets error to true when there is an error in 2FA setup', async () => {
    getCurrentUser.mockRejectedValue(new Error('Test error'));
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await wrapper.vm.init2FASetup();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.user).toBe(null);
    expect(wrapper.vm.MFASecret).toBe('');
    expect(wrapper.vm.error).toBe(true);
  });

  it('verifies 2FA setup', async () => {
    const mockUser = { username: 'testuser' };
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.setData({
      user: mockUser,
      MFAToken: '123456',
    });

    const setMFAPreferenceSpy = vi.spyOn(wrapper.vm, 'setMFAPreference');
    const closeDialogSpy = vi.spyOn(wrapper.vm, 'closeDialog');

    await wrapper.vm.verify2FASetup();

    expect(wrapper.vm.loading).toBe(false);
    expect(verifyTOTPSetup).toHaveBeenCalledWith({ code: '123456' });
    expect(updateMFAPreference).toHaveBeenCalledWith({ [MFAType.TOTP]: 'PREFERRED' });
    expect(setMFAPreferenceSpy).toHaveBeenCalledWith(MFAType.TOTP);
    expect(closeDialogSpy).toHaveBeenCalled();
  });

  it('sets valid to false when there is an error in 2FA verification', async () => {
    const mockUser = { username: 'testuser' };
    verifyTOTPSetup.mockRejectedValue(new Error('Test error'));

    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    wrapper.setData({
      user: mockUser,
      MFAToken: '123456',
    });

    await wrapper.vm.verify2FASetup();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.valid).toBe(false);
  });
});
