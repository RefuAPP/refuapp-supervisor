import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RefugeDetailPage } from './refuge-detail.page';

describe('RefugeDetailPage', () => {
  let component: RefugeDetailPage;
  let fixture: ComponentFixture<RefugeDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RefugeDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
