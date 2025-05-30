// scroll-spy.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ScrollSpyService } from '@service/scroll-spy.service';
import { PlatformService } from '@service/platform.service';

@Directive({
  selector: '[scrollSpy]'
})
export class ScrollSpyDirective {
  @Input() scrollSpy!: string;
  private readonly offset = 155; // Adjust based on your header height

  constructor(
    private el: ElementRef,
    private spyService: ScrollSpyService,
    private platform: PlatformService
  ) {
    this.onScroll()
   }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (!this.platform.isBrowser()) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const elementBottom = rect.bottom + window.scrollY;
    const scrollPosition = window.scrollY + this.offset;

    if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
      this.spyService.setActiveModule(this.scrollSpy);
    }
  }
}