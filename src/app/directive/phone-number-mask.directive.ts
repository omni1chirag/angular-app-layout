import { Directive, ElementRef} from '@angular/core';
import Inputmask from 'inputmask';
import { PlatformService } from '../service/platform.service';

@Directive({
  selector: '[phoneNumberMask]'
})
export class PhoneNumberMaskDirective {
  private im: any;
  private input!: HTMLInputElement;

  constructor(private el: ElementRef, private platform: PlatformService) { }

  ngAfterViewInit() {
    if (!this.platform.isBrowser()) return; // Skip if not in browser
    this.input = this.getHTMLInput();
    this.input.maxLength = 11;
    
    this.im = new Inputmask(this.getPhoneMask());
    this.im.mask(this.input);

    this.handleCursorPosition();
  }

  private handleCursorPosition() {
    this.input.addEventListener('focus', () => {
      setTimeout(() => {
        const rawValue = this.im.unmaskedvalue();
        const currentPosition = this.input.selectionStart ?? 0;
        
        if (rawValue.length > 5) {
          // Special handling for entries beyond first group
          const targetPosition = this.calculateCursorPosition(rawValue.length, currentPosition);
          this.input.setSelectionRange(targetPosition, targetPosition);
        }
      }, 0);
    });
  }

  private calculateCursorPosition(rawLength: number, clickedPosition: number): number {
    if (rawLength <= 5) return clickedPosition; // Allow natural navigation
    
    // When field has 6-10 digits, calculate visual position
    const maskedValue = this.input.value;
    const visualPosition = Math.min(
      maskedValue.replace(/_/g, '').length, // Count of filled characters
      maskedValue.length // Total mask length
    );
    
    return visualPosition;
  }

  private getHTMLInput(): HTMLInputElement {
    return this.el.nativeElement.querySelector('input');
  }

  private getPhoneMask(): any {
    return {
      mask: '99999 99999',
      placeholder: '_',
      autoUnmask: true,
      showMaskOnHover: false,
      positionCaretOnClick: 'none',
      insertMode: false
    };
  }
}