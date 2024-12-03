import { Provider } from '@angular/core'
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox'
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field'
import { MAT_PAGINATOR_DEFAULT_OPTIONS } from '@angular/material/paginator'
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio'
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS } from '@angular/material/slide-toggle'
import { MAT_TABS_CONFIG } from '@angular/material/tabs'
import {
  LuxonDateAdapter,
  MAT_LUXON_DATE_ADAPTER_OPTIONS,
  MAT_LUXON_DATE_FORMATS,
} from '@angular/material-luxon-adapter'

export const provideMaterialConfig = (): Provider[] => {
  return [
    {
      provide: MAT_RADIO_DEFAULT_OPTIONS,
      useValue: { color: 'primary' },
    },

    { provide: MAT_TABS_CONFIG, useValue: { animationDuration: '0ms' } },

    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: { color: 'primary' },
    },
    {
      provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS,
      useValue: { color: 'toggle' },
    },

    {
      provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
      useValue: {
        pageSize: 20,
        pageSizeOptions: [5, 10, 15, 20],
        showFirstLastButtons: true,
        // hidePageSize: true,
        // formFieldAppearance: 'standart'
      },
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        hideRequiredMarker: true,
        floatLabel: 'auto',
      },
    },

    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: MAT_LUXON_DATE_FORMATS },
    { provide: MAT_LUXON_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
  ]
}
