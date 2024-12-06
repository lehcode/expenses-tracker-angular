import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `<router-outlet></router-outlet>`,
})
export class AppLayoutComponent {}
