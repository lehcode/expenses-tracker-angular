import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { IExpense } from '../../interfaces/expenses.interfaces'

import fabMenuAnimations from './fab-menu.animations'

@Component({
  selector: 'app-fab-menu',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="fixed bottom-8 right-8 flex flex-col-reverse gap-4">
      <!-- Action buttons, shown when expense is selected -->
      @if (selectedItem) {
        <div class="flex flex-col gap-2" @fadeInOut>
          <button mat-mini-fab color="warn" (click)="deleteItemEvent.emit(selectedItem)">
            <mat-icon>delete</mat-icon>
          </button>
          <button mat-mini-fab color="primary" (click)="editItemEvent.emit(selectedItem)">
            <mat-icon>edit</mat-icon>
          </button>
        </div>
      }

      <!-- Main FAB button -->
      <button mat-fab color="primary" (click)="addItemEvent.emit()">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  animations: fabMenuAnimations,
})
export class FabMenuComponent {
  @Input() selectedItem: IExpense | null = null
  @Output() addItemEvent = new EventEmitter<void>()
  @Output() editItemEvent = new EventEmitter<IExpense>()
  @Output() deleteItemEvent = new EventEmitter<IExpense>()
}
