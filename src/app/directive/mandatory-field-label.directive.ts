import { AfterViewInit, Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[mandatoryFieldLabel]'
})
export class MandatoryFieldLabelDirective implements AfterViewInit {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  private _isMandatory = true;

  @Input() set mandatoryFieldLabel(value: boolean | string) {
    this._isMandatory = value === '' || value === true || value === 'true';
  }

  ngAfterViewInit(): void {
    if (this._isMandatory) {
      this.addMandatoryAsterisk();
    }
  }

  addMandatoryAsterisk(): void {
    const element = this.el.nativeElement;
    for (let i = element.childNodes.length - 1; i >= 0; i--) {
      const node = element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
        this.renderer.removeChild(element, node);
      } else {
        break;
      }
    }

    if (!element.querySelector('.mandatory-asterisk')) {
      const asterisk = this.renderer.createElement('span');
      this.renderer.addClass(asterisk, 'mandatory-asterisk');
      this.renderer.setStyle(asterisk, 'color', 'red');
      this.renderer.setStyle(asterisk, 'margin-left', '2px');
      const text = this.renderer.createText('*');
      this.renderer.appendChild(asterisk, text);
      this.renderer.appendChild(element, asterisk);
    }
  }

}
