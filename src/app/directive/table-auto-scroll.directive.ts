import { AfterViewInit, Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { PlatformService } from '@service/platform.service';

@Directive({
  selector: '[tableAutoScroll]',
  standalone: true
})
export class TableAutoScrollDirective implements AfterViewInit, OnDestroy {

  private readonly el = inject(ElementRef);
  private readonly platformService = inject(PlatformService);

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
  private readonly isBrowser: boolean;

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
    this.debouncedScrollHeight = this.debounce(this.setScrollHeight, this.debounceDelay);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.initializeElements();
    this.setupResizeObserver();
    this.setScrollHeight(); // Initial calculation
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
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

  private readonly setScrollHeight = () => {
    requestAnimationFrame(() => {
      if (!this.tableBody) return;

      const windowHeight = window.innerHeight;
      const totalHeight = windowHeight - this.calculateHeightReduction();
      this.tableBody.style.height = `${totalHeight + 10}px`;
    });
  }

  private calculateHeightReduction(): number {
    return Object.values(this.SELECTORS).reduce((sum, selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return sum;

      const styles = getComputedStyle(element);
      let reduction = 0;

      switch (selector) {
        case this.SELECTORS.MAIN_CONTAINER:
          reduction = parseFloat(styles.paddingTop);
          break;

        case this.SELECTORS.PAGE_HEADER:
          reduction = element.offsetHeight + parseFloat(styles.marginBottom);
          break;

        case this.SELECTORS.TABLE_HEADER:
          // Handle potential hidden header with transition
          reduction = Math.max(element.offsetHeight, parseFloat(styles.height));
          break;

        case this.SELECTORS.PAGINATOR:
          // Use scrollHeight instead of offsetHeight for hidden elements
          reduction = element?.offsetHeight > 0 ? element?.offsetHeight : element?.scrollHeight;
          break;

        default:
          reduction = element.offsetHeight;
      }

      // Add safety checks for NaN values
      return sum + (Number.isFinite(reduction) ? reduction : 0);
    }, 0);
  }

  private readonly debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  private readonly debouncedScrollHeight: () => void;
}