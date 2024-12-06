import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { IExpense } from '../../interfaces/expenses.interfaces'

import { DeleteExpenseDialogComponent } from './delete-expense.component'

describe('DeleteExpenseDialogComponent', () => {
  let component: DeleteExpenseDialogComponent
  let fixture: ComponentFixture<DeleteExpenseDialogComponent>
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<DeleteExpenseDialogComponent>>
  let mockData: { selected: IExpense }

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close'])
    mockData = {
      selected: {
        id: 1, name: 'Test Expense', amount: 123.45, type: 'EXPENSE',
        category: {
          id: 1, name: 'Test Category', type: 'EXPENSE',
          color: '#ffcc00'
        },
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
    }

    await TestBed.configureTestingModule({
      imports: [DeleteExpenseDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(DeleteExpenseDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should correctly initialize selected property with data from MAT_DIALOG_DATA', () => {
    expect(component.selected).toEqual(mockData.selected)
  })
})
