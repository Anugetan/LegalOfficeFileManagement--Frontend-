import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofOfServiceComponent } from './proof-of-service';

describe('ProofOfServiceComponent', () => {
  let component: ProofOfServiceComponent;
  let fixture: ComponentFixture<ProofOfServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofOfServiceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProofOfServiceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
