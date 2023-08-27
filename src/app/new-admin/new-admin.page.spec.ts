import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewAdminPage } from './new-admin.page';

describe('NewAdminPage', () => {
  let component: NewAdminPage;
  let fixture: ComponentFixture<NewAdminPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
