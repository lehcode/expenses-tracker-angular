import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BalanceSummaryComponent } from './balance-summary.component'

describe('BalanceSummaryComponent', () => {
  let component: BalanceSummaryComponent
  let fixture: ComponentFixture<BalanceSummaryComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceSummaryComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(BalanceSummaryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
