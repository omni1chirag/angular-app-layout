import { AfterViewInit, Directive, ElementRef, HostListener, inject, Input, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';

export type FooterType = 'default' | 'actions' | 'minimal';

@Directive({
  selector: '[appPageFooter]'
})
export class PageFooterDirective implements OnInit, AfterViewInit, OnDestroy {

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  @Input() pageFooter: FooterType = 'default';
  @Input() blurIntensity: 'light' | 'medium' | 'strong' = 'medium';
  @Input() shadow = true;
  @Input() autoHide = false;
  @Input() hideOnScroll = false;

  private readonly isVisible = signal(true);
  private readonly scrollTimeout?: number;
  private lastScrollY = 0;
  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    this.validateInputs();
  }

  ngAfterViewInit(): void {
    this.applyStyles();
    this.setupEventListeners();
    this.observeToolbarChanges();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

    private validateInputs(): void {
    const validFooterTypes: FooterType[] = ['default', 'actions', 'minimal'];
    if (!validFooterTypes.includes(this.pageFooter)) {
      console.warn(`Invalid pageFooter type: ${this.pageFooter}. Using 'default'.`);
      this.pageFooter = 'default';
    }
  }

  private applyStyles(): void {
    const element = this.el.nativeElement;

  // Base sticky footer styles
    this.renderer.addClass(element, 'sticky');
    this.renderer.addClass(element, 'bottom-0');
    this.renderer.addClass(element, 'z-40');
    this.renderer.addClass(element, 'page-footer');
    this.renderer.addClass(element, 'transition-all');
    this.renderer.addClass(element, 'duration-300');


    // Footer type specific padding
    const paddingClass = this.getPaddingClass();
    this.renderer.addClass(element, paddingClass);

    // Apply backdrop blur and shadow
    this.applyBackgroundEffects(element);
    
    // Apply footer type specific styles
    this.applyFooterTypeStyles(element);

    // Auto-hide functionality
    if (this.autoHide) {
      this.setupAutoHide(element);
    }

  }

  private getPaddingClass(): string {
    const paddingMap: Record<FooterType, string> = {
      'actions': 'pt-2',
      'minimal': 'pt-1',
      'default': 'pt-4'
    };
    return paddingMap[this.pageFooter];
  }

  private applyBackgroundEffects(element: HTMLElement): void {
    
    // Backdrop filter based on intensity
    const blurValue = this.getBlurValue();
    this.renderer.setStyle(element, 'backdrop-filter', `blur(${blurValue})`);
    this.renderer.setStyle(element, '-webkit-backdrop-filter', `blur(${blurValue})`);

    // Shadow
    if (this.shadow) {
      this.renderer.setStyle(
        element, 
        'box-shadow', 
        '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)'
      );
    }
  }

  private getBlurValue(): string {
    const blurMap = {
      'light': '0.25rem',
      'medium': '0.5rem',
      'strong': '1rem'
    };
    return blurMap[this.blurIntensity];
  }

  private applyFooterTypeStyles(element: HTMLElement): void {
    switch (this.pageFooter) {
      case 'actions':
        this.renderer.setStyle(element, 'border-top', '1px solid rgba(229, 231, 235, 0.8)');
        break;
      case 'minimal':
        this.renderer.setStyle(element, 'background-color', 'rgba(255, 255, 255, 0.9)');
        break;
      case 'default':
        this.renderer.setStyle(element, 'border-top', '2px solid rgba(59, 130, 246, 0.1)');
        break;
    }
  }

  private setupEventListeners(): void {
    if (this.hideOnScroll) {
      this.setupScrollListener();
    }
  }

  private setupAutoHide(element: HTMLElement): void {
    // Auto-hide after 3 seconds of inactivity
    let hideTimer: number;

    const showFooter = () => {
      this.renderer.setStyle(element, 'transform', 'translateY(0)');
      this.isVisible.set(true);
    };

    const hideFooter = () => {
      this.renderer.setStyle(element, 'transform', 'translateY(100%)');
      this.isVisible.set(false);
    };

    const resetTimer = () => {
      clearTimeout(hideTimer);
      showFooter();
      hideTimer = window.setTimeout(hideFooter, 3000);
    };

    // Show on mouse move or touch
    ['mousemove', 'touchstart', 'scroll'].forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Initial timer
    resetTimer();
  }

  private setupScrollListener(): void {
    let ticking = false;

    const updateFooter = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > this.lastScrollY;
      const element = this.el.nativeElement;

      if (isScrollingDown && currentScrollY > 100) {
        // Hide footer when scrolling down
        this.renderer.setStyle(element, 'transform', 'translateY(100%)');
        this.isVisible.set(false);
      } else {
        // Show footer when scrolling up or at top
        this.renderer.setStyle(element, 'transform', 'translateY(0)');
        this.isVisible.set(true);
      }

      this.lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateFooter);
        ticking = true;
      }
    };

    document.addEventListener('scroll', onScroll, { passive: true });
  }

  private observeToolbarChanges(): void {
    const element = this.el.nativeElement;
    const toolbar = element.querySelector('p-toolbar .p-toolbar') as HTMLElement;
    
    if (!toolbar) return;

    this.applyToolbarStyles(toolbar);

    // Observe for dynamic toolbar changes
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(() => {
        this.applyToolbarStyles(toolbar);
      });
    });

    this.resizeObserver.observe(toolbar);
  }

  private applyToolbarStyles(toolbar: HTMLElement): void {
    const styles = {
      'background-color': 'rgba(255, 255, 255, 0.95)',
      'backdrop-filter': `blur(${this.getBlurValue()})`,
      '-webkit-backdrop-filter': `blur(${this.getBlurValue()})`,
      'border-radius': '0.75rem 0.75rem 0 0',
      'padding': this.getToolbarPadding(),
      'border-bottom': 'none',
      'border-top': '1px solid rgba(229, 231, 235, 0.5)',
      'box-shadow': this.shadow ? '0 -4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
      'transition': 'all 0.3s ease-in-out'
    };

    Object.entries(styles).forEach(([property, value]) => {
      this.renderer.setStyle(toolbar, property, value);
    });
  }

  private getToolbarPadding(): string {
    const paddingMap: Record<FooterType, string> = {
      'actions': '0.5rem 0.75rem',
      'minimal': '0.25rem 0.5rem',
      'default': '0.75rem 1rem'
    };
    return paddingMap[this.pageFooter];
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Recalculate styles on resize
    const toolbar = this.el.nativeElement.querySelector('p-toolbar .p-toolbar') as HTMLElement;
    if (toolbar) {
      this.applyToolbarStyles(toolbar);
    }
  }

  private cleanup(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // Public API for controlling footer visibility
  show(): void {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'transform', 'translateY(0)');
    this.isVisible.set(true);
  }

  hide(): void {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'transform', 'translateY(100%)');
    this.isVisible.set(false);
  }

  toggle(): void {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }
}
