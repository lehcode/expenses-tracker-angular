import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ExpensesFilterComponent } from './expenses-filter.component'

describe('ExpensesFilterComponent', () => {
  let component: ExpensesFilterComponent
  let fixture: ComponentFixture<ExpensesFilterComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesFilterComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ExpensesFilterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
