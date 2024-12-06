import { animate, style, transition, trigger } from "@angular/animations"

export default [
  trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))]),
  ]),
]