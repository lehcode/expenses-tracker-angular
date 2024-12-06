import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { Store } from '@ngrx/store'
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs'

import { IExpenseCategory, IExpenseFilters } from '../../interfaces/expenses.interfaces'
import { ExpensesActions } from '../../store/actions/expenses.actions'
import { selectCategories, selectFilters } from '../../store/selectors/expenses.selectors'

@Component({
  selector: 'app-expenses-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="bg-white dark:bg-gray-800 p-3">
      <form [formGroup]="filterForm" class="flex flex-wrap items-center gap-2">
        <!-- Search -->
        <mat-form-field appearance="outline" class="w-full sm:w-48">
          <mat-label>Search</mat-label>
          <input matInput formControlName="search" placeholder="Search..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <!-- Category Filter -->
        <mat-form-field appearance="outline" class="w-full sm:w-40">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option [value]="null">All</mat-option>
            @for (category of categories$ | async; track category.id) {
              <mat-option [value]="'cat_' + category.id">{{ category.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Type Filter -->
        <mat-form-field appearance="outline" class="w-full sm:w-32">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="INCOME">Income</mat-option>
            <mat-option value="EXPENSE">Expense</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Date Fields -->
        <div class="flex gap-2 w-full sm:w-auto">
          <mat-form-field appearance="outline" class="w-full sm:w-36">
            <mat-label>Start</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="dateStart" />
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full sm:w-36">
            <mat-label>End</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="dateEnd" />
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <!-- Sort Controls -->
        <div class="flex gap-2 items-center ml-auto">
          <mat-form-field appearance="outline" class="w-28">
            <mat-label>Sort By</mat-label>
            <mat-select formControlName="sortBy">
              <mat-option value="date">Date</mat-option>
              <mat-option value="amount">Amount</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-32">
            <mat-label>Order</mat-label>
            <mat-select formControlName="sortOrder">
              <mat-option value="asc">Ascending</mat-option>
              <mat-option value="desc">Descending</mat-option>
            </mat-select>
          </mat-form-field>

          <button 
            mat-icon-button 
            color="warn" 
            type="button" 
            (click)="resetFilters()"
            class="ml-2"
            matTooltip="Reset filters">
            <mat-icon>restart_alt</mat-icon>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
    }
    :host ::ng-deep .mat-mdc-text-field-wrapper {
      padding-top: 8px;
      padding-bottom: 8px;
    }
    :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `]
})
export class ExpensesFilterComponent implements OnInit {
  filterForm: FormGroup
  categories$: Observable<IExpenseCategory[]>
  currentFilters$: Observable<IExpenseFilters>

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.categories$ = this.store.select(selectCategories)
    this.currentFilters$ = this.store.select(selectFilters)

    this.filterForm = this.fb.group({
      search: [''],
      category: [null],
      type: [null],
      sortBy: ['date'],
      sortOrder: ['desc'],
      dateStart: [null],
      dateEnd: [null]
    })
  }

  ngOnInit() {
    this.store.dispatch(ExpensesActions.loadCategories())

    this.currentFilters$.subscribe(filters => {
      this.filterForm.patchValue({
        search: filters.search || '',
        category: filters.category || null,
        type: filters.type || null,
        sortBy: filters.sortBy || 'date',
        sortOrder: filters.sortOrder || 'desc',
        dateStart: filters.dateRange?.start || null,
        dateEnd: filters.dateRange?.end || null
      }, { emitEvent: false })
    })

    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(formValue => {
        const filters: IExpenseFilters = {
          search: formValue.search || undefined,
          category: formValue.category || undefined,
          type: formValue.type || undefined,
          sortBy: formValue.sortBy,
          sortOrder: formValue.sortOrder,
          dateRange: {
            start: formValue.dateStart ? new Date(formValue.dateStart).toISOString() : undefined,
            end: formValue.dateEnd ? new Date(formValue.dateEnd).toISOString() : undefined
          }
        }

        this.store.dispatch(ExpensesActions.setFilters({ filters }))
        this.store.dispatch(ExpensesActions.loadExpenses({}))
      })
  }

  resetFilters() {
    this.filterForm.reset({
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }
}