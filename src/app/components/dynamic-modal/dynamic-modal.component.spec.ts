import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicModalCreateComponent } from './dynamic-modal.component';

describe('DynamicModalComponent', () => {
  let component: DynamicModalCreateComponent;
  let fixture: ComponentFixture<DynamicModalCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicModalCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicModalCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
