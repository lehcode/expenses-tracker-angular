import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export default class HomePage {
  title = 'accountant'

  links = [
    { title: 'Expenses List', link: '/expenses' },
  ]
}
