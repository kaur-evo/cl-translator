import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

import colorConstants from '@/constants/colorConstants';

export const settings = {
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    variations: {
      colors: [...new Set([...Object.keys(colorConstants.dark), ...Object.keys(colorConstants.light)])],
    },
    themes: {
      dark: {
        dark: true,
        colors: colorConstants.dark,
        variables: {
          'high-emphasis-opacity': 1,
          'theme-on-white': 'var(--v-theme-primary-dark)',
          'theme-on-quaternary-dark': 'var(--v-theme-primary-dark)',
        },
      },
      light: {
        dark: false,
        colors: colorConstants.light,
        variables: {
          'high-emphasis-opacity': 1,
          'theme-on-background': 'var(--v-theme-primary-dark)',
          'theme-on-white': 'var(--v-theme-primary-dark)',
          'theme-on-quaternary-dark': 'var(--v-theme-primary-dark)',
          'theme-on-surface-variant': 'var(--v-theme-white)',
        },
      },
    },
  },
  defaults: {
    VTextField: {
      filled: true,
      color: 'primary',
      persistentCounter: true,
    },
    VTextarea: {
      filled: true,
      color: 'primary',
    },
    VComboBox: {
      filled: true,
      color: 'primary',
      persistentCounter: true,
    },
    VSwitch: {
      color: 'primary',
      inset: true,
    },
    VSelect: {
      color: 'primary',
      filled: true,
    },
    VIcon: {
      color: 'icon-default',
    },
    VBtn: {
      VIcon: {
        color: '',
      },
    },
    VCheckbox: {
      VIcon: {
        color: '',
      },
    },
    VSnackbar: {
      // removing will cause navigations not working while snackbar is open
      // https://github.com/vuetifyjs/vuetify/issues/18283
      closeOnBack: false,
    },
    VRadio: {
      color: 'primary',
      VIcon: {
        color: '',
      },
    },
    VSheet: {
      rounded: true,
      elevation: 2,
    },
    VDatePicker: {
      VSheet: {
        elevation: 0,
      },
    },
  },
  locale: {
    rtl: false,
  },
};
export default createVuetify(settings);
