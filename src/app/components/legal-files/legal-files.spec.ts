import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalFiles } from './legal-files';

describe('LegalFiles', () => {
  let component: LegalFiles;
  let fixture: ComponentFixture<LegalFiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalFiles],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalFiles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
