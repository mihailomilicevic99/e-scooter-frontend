import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAdminComponent } from './new-admin.component';

describe('NewAdminComponent', () => {
  let component: NewAdminComponent;
  let fixture: ComponentFixture<NewAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewAdminComponent]
    });
    fixture = TestBed.createComponent(NewAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
