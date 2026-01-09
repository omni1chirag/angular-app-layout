import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import Inputmask from 'inputmask';
import { PlatformService } from '../service/platform.service';

interface InputMaskHTMLInputElement extends HTMLInputElement {
  inputmask?: Inputmask.Inputmask;
}
@Directive({
  selector: '[phoneNumberMask]',
})
export class PhoneNumberMaskDirective implements AfterViewInit {
  private im;
  private input!: InputMaskHTMLInputElement;

  private readonly el = inject(ElementRef);
  private readonly platform = inject(PlatformService);

  ngAfterViewInit(): void {
    if (!this.platform.isBrowser()) return; // Skip if not in browser
    this.input = this.getHTMLInput();
    this.input.maxLength = 11;

    this.im = new Inputmask(this.getPhoneMask());
    this.im.mask(this.input);
    this.disableArrowKeys();
    this.handleCursorPosition();
  }

  private handleCursorPosition() {
    this.input.addEventListener('focus', () => {
      setTimeout(() => {
        const imInstance = this.input.inputmask;
        if (!imInstance) return;

        const rawValue = imInstance.unmaskedvalue();
        const currentPosition = this.input.selectionStart ?? 0;

        if (rawValue.length > 5) {
          // Special handling for entries beyond first group
          const targetPosition = this.calculateCursorPosition(
            rawValue.length,
            currentPosition
          );
          this.input.setSelectionRange(targetPosition, targetPosition);
        }
      }, 0);
    });
  }

  private disableArrowKeys() {
    this.input.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          event.stopImmediatePropagation();
          return false;
        }
        return true;
      },
      true
    );
  }

  private calculateCursorPosition(
    rawLength: number,
    clickedPosition: number
  ): number {
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
    return (
      this.el.nativeElement.querySelector('input.p-inputtext') ??
      this.el.nativeElement.querySelector('input') ??
      this.el.nativeElement
    );
  }

  private getPhoneMask(): Record<string, unknown> {
    return {
      mask: '99999 99999',
      placeholder: '_',
      autoUnmask: true,
      showMaskOnHover: false,
      positionCaretOnClick: 'none',
      insertMode: false,
    };
  }
}
