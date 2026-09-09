import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationRequestsComponent  } from './register-request';

describe('Register', () => {
  let component: RegistrationRequestsComponent ;
  let fixture: ComponentFixture<RegistrationRequestsComponent >;
RegistrationRequestsComponent 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationRequestsComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationRequestsComponent );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
