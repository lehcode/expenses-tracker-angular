import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IExpense } from '../../interfaces/expenses.interfaces';

@Component({
  selector: 'app-fab-menu',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="fixed bottom-6 right-6 flex flex-col gap-4">
      <!-- Edit FAB -->
      @if (selectedItem) {
        <button
          mat-fab
          color="primary"
          (click)="onEdit()"
          class="animate-fade-in"
          matTooltip="Edit selected item">
          <mat-icon>edit</mat-icon>
        </button>

        <button
          mat-fab
          color="warn"
          (click)="onDelete()"
          class="animate-fade-in"
          matTooltip="Delete selected item">
          <mat-icon>delete</mat-icon>
        </button>
      }

      <!-- Add FAB -->
      <button
        mat-fab
        color="accent"
        (click)="onAdd()"
        matTooltip="Add new item">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class FabMenuComponent {
  @Input() selectedItem: IExpense | null = null;
  @Output() addItemEvent = new EventEmitter<void>();
  @Output() editItemEvent = new EventEmitter<IExpense>();
  @Output() deleteItemEvent = new EventEmitter<IExpense>();

  onAdd(): void {
    this.addItemEvent.emit();
  }

  onEdit(): void {
    if (this.selectedItem) {
      this.editItemEvent.emit(this.selectedItem);
    }
  }

  onDelete(): void {
    if (this.selectedItem) {
      this.deleteItemEvent.emit(this.selectedItem);
    }
  }
}
