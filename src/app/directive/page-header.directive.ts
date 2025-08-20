import { AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[pageHeader]',

})
export class PageHeaderDirective implements OnInit, AfterViewInit {
  @Input() pageHeader!: string;
  constructor(private el: ElementRef, private renderer: Renderer2) {
  }
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.applyStyles();
  }

  private applyStyles(): void {
    this.renderer.addClass(this.el.nativeElement, 'sticky');
    this.renderer.addClass(this.el.nativeElement, 'top-[var(--navbar-height)]');
    this.renderer.addClass(this.el.nativeElement, 'z-40');
    this.renderer.addClass(this.el.nativeElement, 'page-header');
    this.renderer.addClass(
      this.el.nativeElement,
      this.pageHeader === 'list' ? 'mb-[0.50rem]' : 'mb-[1rem]'
    );

    const toolbar = this.el.nativeElement.querySelector('p-toolbar .p-toolbar');
    if (!toolbar) return;
    this.renderer.setStyle(toolbar, 'background-color', 'rgba(255,255,255,0.1)')
    this.renderer.setStyle(toolbar, 'backdrop-filter', 'blur(0.5rem)');
    this.renderer.setStyle(toolbar, '-webkit-backdrop-filter', 'blur(0.5rem)');
    this.renderer.setStyle(toolbar, 'border-radius', '0 0 0.5rem 0.5rem');
    this.renderer.setStyle(toolbar, 'padding', '0.50rem 0.75rem 0.50rem 0.75rem');
    this.renderer.setStyle(toolbar, 'border-top', 'none');


  }

}
