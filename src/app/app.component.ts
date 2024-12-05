import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

import { AppLayoutComponent } from './app-layout.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppLayoutComponent],
  template: `
    <app-layout>
      <router-outlet />
    </app-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
