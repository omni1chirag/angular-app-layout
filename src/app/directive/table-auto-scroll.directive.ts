import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';

@Directive({
  selector: '[tableAutoScroll]',
  standalone: true
})
export class TableAutoScrollDirective implements AfterViewInit, OnDestroy {
  private readonly SELECTORS = {
    MAIN_CONTAINER: 'div.layout-main-container',
    PAGE_HEADER: '[pageHeader]',
    TABLE_OPTIONS: 'div.table-options',
    PAGINATOR: 'p-paginator',
    TABLE_HEADER: '.p-datatable-thead'
  };

  private subtractElements: HTMLElement[] = [];
  private resizeObserver!: ResizeObserver;
  private tableBody!: HTMLElement;
  private readonly debounceDelay = 100;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.debouncedScrollHeight = this.debounce(this.setScrollHeight, this.debounceDelay);
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initializeElements();
    this.setupResizeObserver();
    this.setScrollHeight(); // Initial calculation
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.resizeObserver?.disconnect();
      window.removeEventListener('resize', this.debouncedScrollHeight);
    }
  }

  private initializeElements() {
    this.tableBody = this.el.nativeElement.querySelector('.p-datatable-table-container');
    this.subtractElements = Object.values(this.SELECTORS)
      .map(selector => document.querySelector(selector))
      .filter((el): el is HTMLElement => !!el);
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(this.debouncedScrollHeight);
    this.subtractElements.forEach(el => this.resizeObserver.observe(el));
    window.addEventListener('resize', this.debouncedScrollHeight);
  }

  private setScrollHeight = () => {
    requestAnimationFrame(() => {
      if (!this.tableBody) return;

      const windowHeight = window.innerHeight;
      //console.log("windowHeight : ", windowHeight);
      const totalHeight = windowHeight - this.calculateHeightReduction();
      this.tableBody.style.height = `${totalHeight + 10}px`;
    });
  }

  private calculateHeightReduction(): number {
    return Object.values(this.SELECTORS).reduce((sum, selector) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) return sum;

      const styles = getComputedStyle(element);
      let reduction = 0;

      switch (selector) {
        case this.SELECTORS.MAIN_CONTAINER:
          reduction = parseFloat(styles.paddingTop);
          //console.log(selector + " reduction: ", reduction);
          break;

        case this.SELECTORS.PAGE_HEADER:
          reduction = element.offsetHeight + parseFloat(styles.marginBottom);
          //console.log(selector + " reduction: ", reduction);
          break;

        case this.SELECTORS.TABLE_HEADER:
          // Handle potential hidden header with transition
          reduction = Math.max(element.offsetHeight, parseFloat(styles.height));
          //console.log(selector + " reduction: ", reduction);
          break;

        case this.SELECTORS.PAGINATOR:
          // Use scrollHeight instead of offsetHeight for hidden elements
          reduction = element.offsetHeight > 0 ? element.offsetHeight : (element as HTMLElement).scrollHeight;
          //console.log(selector + " reduction: ", reduction);
          break;

        default:
          reduction = element.offsetHeight;
          //console.log(selector + " reduction: ", reduction);
      }

      // Add safety checks for NaN values
      return sum + (Number.isFinite(reduction) ? reduction : 0);
    }, 0);
  }

  private debounce = (fn: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  private debouncedScrollHeight: () => void;
}