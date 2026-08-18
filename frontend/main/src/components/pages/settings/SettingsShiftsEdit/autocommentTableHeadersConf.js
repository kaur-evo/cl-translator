import { useI18n } from 'vue-i18n';

import useCommonColumns from '@/components/pages/settings/SettingsShiftsEdit/useCommonColumns';


export default function getAutoCommentTableHeaders(hasActions = true) {
  const { t } = useI18n();
  const { getRowActionsColumn, getPrimaryColumn } = useCommonColumns();
  const headers = [
    getPrimaryColumn({
      text: t('Stop reason'),
      value: 'comment',
      textKey: 'comment',
    }),
    {
      text: t('Time window'),
      value: 'range',
      textKey: 'range',
    },
    {
      text: t('Machine location'),
      value: 'position',
      textKey: 'position',
      formatFn: (val) => val || '-',
    },
  ];
  if (hasActions) {
    headers.push(getRowActionsColumn());
  }
  return headers;
}
