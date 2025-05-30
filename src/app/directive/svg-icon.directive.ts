import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { catchError, of } from 'rxjs';
import { PlatformService } from '../service/platform.service';

@Directive({
  selector: 'img[svgIcon]'
})
export class SvgIconDirective {
  private readonly defaultDimensions = { width: '34', height: '34' };

  constructor(
    private el: ElementRef,
    private http: HttpClient,
    private renderer: Renderer2,
    private platformService: PlatformService
  ) { }

  ngOnInit() {
    if (!this.platformService.isBrowser()) {
      return;
    }

    const imgElement = this.el.nativeElement as HTMLImageElement;
    const imgSrc = imgElement.getAttribute('src');

    if (imgSrc?.endsWith('.svg')) {
      this.handleSvgReplacement(imgElement, imgSrc);
    }
  }

  private handleSvgReplacement(img: HTMLImageElement, src: string) {
    this.http.get(src, { responseType: 'text' }).pipe(
      catchError(() => of(null))
    ).subscribe(svgContent => {
      if (svgContent) {
        this.replaceImgWithSvg(img, svgContent);
      }
    });
  }

  private replaceImgWithSvg(img: HTMLImageElement, svgContent: string) {
    const svgElement = this.parseSvg(svgContent);
    if (!svgElement) return;

    this.transferAttributes(img, svgElement);
    this.handleDimensions(img, svgElement);
    this.optimizeSvgForStyling(svgElement);
    this.replaceElement(img, svgElement);
  }

  private parseSvg(content: string): SVGElement | null {
    const doc = new DOMParser().parseFromString(content, 'image/svg+xml');
    return doc.querySelector('svg');
  }

  private transferAttributes(source: HTMLElement, target: SVGElement) {
    Array.from(source.attributes).forEach(attr => {
      if (attr.name !== 'src') {
        this.renderer.setAttribute(target, attr.name, attr.value);
      }
    });
  }

  private handleDimensions(img: HTMLImageElement, svg: SVGElement) {
    const width = img.getAttribute('width') || this.defaultDimensions.width;
    const height = img.getAttribute('height') || this.defaultDimensions.height;

    this.renderer.setAttribute(svg, 'width', width);
    this.renderer.setAttribute(svg, 'height', height);

    if (width && !height) {
      this.renderer.removeAttribute(svg, 'height');
    }
    if (height && !width) {
      this.renderer.removeAttribute(svg, 'width');
    }
  }

  private optimizeSvgForStyling(svg: SVGElement) {
    this.renderer.setAttribute(svg, 'fill', 'currentColor');
    
    const elements = svg.querySelectorAll('*');
    elements.forEach(element => {
      if (element.hasAttribute('fill')) {
        this.renderer.removeAttribute(element, 'fill');
      }
    });
  }

  private replaceElement(oldElement: HTMLElement, newElement: SVGElement) {
    const parent = this.renderer.parentNode(oldElement);
    this.renderer.insertBefore(parent, newElement, oldElement);
    this.renderer.removeChild(parent, oldElement);
  }
}
