import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ExternalScript } from '../utils/external-js.loader';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ScriptLoaderService {
    private readonly renderer: Renderer2;
    private readonly document = inject(DOCUMENT);
    private readonly rendererFactory = inject(RendererFactory2);

    constructor() {
        this.renderer = this.rendererFactory.createRenderer(null, null);
    }

    loadScript(script: ExternalScript): void {
        if (!this.document.getElementById(script.id)) {
            const scriptElt = this.renderer.createElement('script');
            this.renderer.setAttribute(scriptElt, 'type', 'text/javascript');
            this.renderer.setAttribute(scriptElt, 'id', script.id);
            this.renderer.setAttribute(scriptElt, 'src', script.src);
            this.renderer.appendChild(this.document.head, scriptElt);
        }
    }

    loadScripts(scripts: ExternalScript[]): void {
        scripts.forEach(script => this.loadScript(script));
    }
}
