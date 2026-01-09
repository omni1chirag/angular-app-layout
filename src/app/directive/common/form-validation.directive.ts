/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AfterViewInit,
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Popover } from 'primeng/popover';
import { debounceTime, Subscription } from 'rxjs';

@Directive({
  selector: `
    :not(p-toggleswitch):not(p-selectbutton)[formControlName],
    :not(p-toggleswitch):not(p-selectbutton)[formControl]
    `,
  standalone: true,
})
export class FormValidationDirective implements AfterViewInit, OnDestroy {
  private readonly control = inject(NgControl, { optional: true });
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);

  private sub?: Subscription;
  private popoverRef?: ComponentRef<Popover>;
  private messageEl?: HTMLElement;
  private textEl?: HTMLElement;
  private iconEl?: HTMLElement;

  fieldName = input<string>('');

  eventType = 'focus';

  ngAfterViewInit(): void {
    const ctrl = this.control?.control;
    if (!ctrl) return;

    this.createPopover();
    this.prepareMessageDOM();
    const tag = (this.el.nativeElement as HTMLElement).tagName?.toLowerCase();

    this.eventType = this.isOverlayComponent(tag);
    if (!this.popoverRef) return;

    const innerInput =
      'input' === tag
        ? this.el.nativeElement
        : this.el.nativeElement.querySelector('input');

    innerInput?.addEventListener(this.eventType, () => {
      this.updateValidationState();
    });

    this.sub = ctrl.statusChanges?.pipe(debounceTime(120)).subscribe(() => {
      this.updateValidationState();
    });
  }

  private isOverlayComponent(tag: string): string {
    return [
      'p-datepicker',
      'p-autocomplete',
      'p-select',
      'p-multiselect',
    ].includes(tag)
      ? 'blur'
      : 'focus';
  }

  private createPopover(): void {
    if (this.popoverRef) return;

    this.popoverRef = this.vcr.createComponent(Popover);
    const popover = this.popoverRef.instance;

    Object.assign(popover, {
      appendTo: 'body',
      dismissable: false,
      autoZIndex: true,
      my: 'left top',
      at: 'right top',
      styleClass: 'p-popover-error',
    });
    popover.onShow.subscribe(() => {
      const container = this.popoverRef?.instance.container as HTMLElement;
      const content = container?.querySelector('.p-popover-content');

      if (content) {
        content.replaceChildren(this.messageEl);
        container.classList.add('validation-popover-container');
        content.classList.add('validation-popover-content');
      }
    });
  }

  private prepareMessageDOM(): void {
    this.messageEl = this.renderer.createElement('div');
    this.messageEl.classList.add('p-message', 'p-component', 'p-message-sm');

    const content = this.renderer.createElement('div');
    content.classList.add('p-message-content');

    this.iconEl = this.renderer.createElement('span');
    this.iconEl.classList.add('p-message-icon');

    this.textEl = this.renderer.createElement('span');
    this.textEl.classList.add('p-message-text');

    content.append(this.iconEl, this.textEl);
    this.messageEl.appendChild(content);
  }

  private updateValidationState(): void {
    const ctrl = this.control?.control;
    if (!ctrl) return;

    const invalidVisible = ctrl.invalid && (ctrl.touched || ctrl.dirty);
    const popover = this.popoverRef.instance;

    if (invalidVisible) {
      const metaData = this.resolveErrorMeta(ctrl.errors);
      if (!metaData) {
        return;
      }

      this.messageEl.className = `p-message p-component p-message-${metaData.severity} p-message-sm`;
      this.messageEl.replaceChildren(this.iconEl, this.textEl);
      this.iconEl.className = `p-message-icon ${metaData.icon}`;
      this.textEl.innerHTML  = metaData.message;
      if (metaData.severity === 'warn' || metaData.severity === 'info') {
        // outer message box
        this.messageEl.classList.add('validation-popover-message');
        this.iconEl.classList.add('validation-popover-icon');
        this.textEl.classList.add('validation-popover-text');
      }
      if (!popover.overlayVisible) {
        popover.show(undefined, this.el.nativeElement);
        popover.dismissable = false;
        setTimeout(() => {
          popover.dismissable = true;
          popover.hide();
        }, 2000);
      }
    } else {
      popover.hide();
    }
  }

  private resolveErrorMeta(errors: Record<string, any>): {
    severity: 'error' | 'warn' | 'info';
    icon: string;
    message: string;
  } {
    const name = this.fieldName() || 'field';

    if (errors['required']) {
      return undefined;
    }

    if (errors['customError']) {
      const customError = errors['customError'];
      return {
        severity: customError['severity'] ?? 'error',
        icon: customError['icon'] ?? 'pi pi-times-circle',
        message: customError['message'],
      };
    }

    if (errors['message']) {
      return {
        severity: errors['severity'] ?? 'error',
        icon: errors['icon'] ?? 'pi pi-times-circle',
        message: errors['message'],
      };
    }

    const map: Record<
      string,
      (err: any) => {
        severity: 'error' | 'warn' | 'info';
        icon: string;
        message: string;
      }
    > = {
      required: () => ({
        severity: 'warn',
        icon: 'pi pi-info-circle',
        message: `This ${name} is required.`,
      }),
      maxlength: (err) => ({
        severity: 'warn',
        icon: 'pi pi-times-circle',
        message: `This ${name} cannot exceed ${err.requiredLength} characters.`,
      }),
      minlength: (err) => ({
        severity: 'warn',
        icon: 'pi pi-times-circle',
        message: `This ${name} must be at least ${err.requiredLength} characters.`,
      }),
      email: () => ({
        severity: 'warn',
        icon: 'pi pi-info-circle',
        message: `Please enter a valid email.`,
      }),
      pattern: (error) => ({
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        message: this.getPatternMessage(error, name.toLowerCase()),
      }),

      // numeric validators
      min: (err) => ({
        severity: 'warn',
        icon: 'pi pi-info-circle',
        message: `${name} must be >= ${err.min}.`,
      }),
      max: (err) => ({
        severity: 'warn',
        icon: 'pi pi-info-circle',
        message: `${name} must be <= ${err.max}.`,
      }),

      // custom numeric ranges (most backends use this)
      minNumber: (err) => ({
        severity: 'warn',
        icon: 'pi pi-info-circle',
        message: err.message ?? `${name} must be >= ${err.value}.`,
      }),
      maxNumber: (err) => ({
        severity: 'warn',
        icon: 'pi pi-info-circle',
        message: err.message ?? `${name} must be <= ${err.value}.`,
      }),
      mobileNumber: () => ({
        severity: 'warn',
        icon: 'pi pi-info-circle',
        message: 'Mobile number must be 10 digits.',
      }),
      invalidAddress: () => ({
        severity: 'warn',
        icon: 'pi pi-info-circle',
        message: 'Invalid Address.',
      }),

      // async backend validation
      backend: (err) => ({
        severity: 'error',
        icon: 'pi pi-times-circle',
        message: err?.message ?? `Invalid ${name}.`,
      }),
    };

    const firstKey = Object.keys(errors)[0];
    const resolver = map[firstKey];

    if (resolver) return resolver(errors[firstKey]);

    return {
      severity: 'info',
      icon: 'pi pi-info-circle',
      message: `Invalid ${name.toLowerCase()}.`,
    };
  }
  private getPatternMessage(error: any, name: string): string {
    if(this.control?.name === 'gstin'){
      return `Invalid GSTIN format.`;
    }
    if (this.control?.name === 'website') {
      return `Please enter a valid website URL.`;
    }
    const pattern = error.requiredPattern ?? '';
    const regex = new RegExp(pattern.replace(/(^\/)|(\/$)/g, ''));
    const lowerName = name.toLowerCase();

    const specials = this.extractAllowedSpecialCharacters(pattern);

    if (specials.length > 0) {
      return `Allowed special characters: ${specials.join(', ')}`;
    }

    const allowsLetters = regex.test('a') || regex.test('A');
    const allowsDigits = regex.test('1');

    if (allowsLetters && allowsDigits)
      return `Only letters and numbers are allowed.`;
    if (allowsLetters) return `Only letters are allowed.`;
    if (allowsDigits) return `Only numbers are allowed.`;

    return `Invalid ${lowerName} format.`;
  }

  private extractAllowedSpecialCharacters(pattern: string): string[] {
    const regex = /\[([^\]]{0,256})\]/;
    const match = regex.exec(pattern);
    if (!match?.[1]) return [];
    let inside = match[1];
    const specials = new Set<string>();

    inside = inside.replace(/\\[swd]/g, '');

    const chars = inside.split('');

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];

      if (/[A-Za-z0-9]/.test(ch)) continue;

      if (ch === '\\') continue;

      if (ch === '-') {
        const isRange =
          /[A-Za-z0-9]/.test(chars[i - 1]) && /[A-Za-z0-9]/.test(chars[i + 1]);
        if (!isRange) specials.add(`<span class="validation-popover-chip">-</span>`);
        continue;
      }

      specials.add(`<span class="validation-popover-chip">${ch}</span>`);
    }

    return Array.from(specials);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.popoverRef?.destroy();
    this.messageEl?.remove();
  }
}
