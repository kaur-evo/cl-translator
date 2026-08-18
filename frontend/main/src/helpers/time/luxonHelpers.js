import useProfileStore from '@/stores/profile';

export function luxonApplyLocale(date) {
  const profileStore = useProfileStore();
  const locale = Number(profileStore.firstDayOfWeek) === 1 ? 'en-GB' : 'en-US';
  return date.setLocale(locale);
}
