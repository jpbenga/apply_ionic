import { Injectable } from '@angular/core';

export interface PdfGenerationOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  width?: number;
  height?: number;
  padding?: number;
  backgroundColor?: string;
  fontOptimization?: boolean;
  singlePage?: boolean;
  isPreStyled?: boolean;
}

export interface PdfLayoutMetrics {
  contentHeight: number;
  availableHeight: number;
  fitsOnePage: boolean;
  compressionNeeded: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  private readonly A4_WIDTH_PX = 794;
  private readonly A4_HEIGHT_PX = 1123;
  private readonly DEFAULT_PADDING = 40;

  constructor() { }

  async generateOptimizedPdf(
    element: HTMLElement,
    options: PdfGenerationOptions = {}
  ): Promise<void> {
    try {
      const config = this.getDefaultConfig(options);
     
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const optimizedElement = options.isPreStyled
        ? element.cloneNode(true) as HTMLElement
        : this.createOptimizedElement(element, config);
     
      if (options.isPreStyled) {
        optimizedElement.style.position = 'absolute';
        optimizedElement.style.left = '-9999px';
        optimizedElement.style.top = '-9999px';
      }
     
      document.body.appendChild(optimizedElement);

      try {
        const metrics = this.analyzeLayout(optimizedElement, config);

        if (!metrics.fitsOnePage && config.singlePage) {
          this.applyContentCompression(optimizedElement, metrics);
        }

        const canvas = await html2canvas(optimizedElement, {
          scale: config.scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: config.backgroundColor,
          width: config.width,
          height: config.height,
          scrollX: 0,
          scrollY: 0,
          imageTimeout: 15000,
          logging: false
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const dimensions = this.calculateOptimalDimensions(canvas, 210, 297);
       
        const imgData = canvas.toDataURL('image/jpeg', config.quality);
        pdf.addImage(
          imgData,
          'JPEG',
          dimensions.x,
          dimensions.y,
          dimensions.width,
          dimensions.height
        );

        pdf.save(config.filename || 'document.pdf');
       
      } finally {
        document.body.removeChild(optimizedElement);
      }

    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw error;
    }
  }

  analyzeLayout(element: HTMLElement, config: PdfGenerationOptions): PdfLayoutMetrics {
    const contentHeight = element.scrollHeight;
    const availableHeight = config.height! - (config.padding! * 2);
    const fitsOnePage = contentHeight <= availableHeight;
    const compressionNeeded = fitsOnePage ? 0 : Math.min(1, (contentHeight - availableHeight) / contentHeight);

    return {
      contentHeight,
      availableHeight,
      fitsOnePage,
      compressionNeeded
    };
  }

  private applyContentCompression(element: HTMLElement, metrics: PdfLayoutMetrics): void {
    if (metrics.compressionNeeded === 0) return;

    const compressionFactor = 1 - (metrics.compressionNeeded * 0.8);

    this.compressSpacing(element, compressionFactor);
    this.compressFontSizes(element, compressionFactor);
   
  }

  private compressSpacing(element: HTMLElement, factor: number): void {
    const spacingElements = element.querySelectorAll('*');
    spacingElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const styles = window.getComputedStyle(htmlEl);
     
      const marginBottom = parseInt(styles.marginBottom) || 0;
      if (marginBottom > 0) {
        htmlEl.style.marginBottom = Math.max(2, marginBottom * factor) + 'px';
      }
     
      const marginTop = parseInt(styles.marginTop) || 0;
      if (marginTop > 0) {
        htmlEl.style.marginTop = Math.max(2, marginTop * factor) + 'px';
      }
     
      const paddingTop = parseInt(styles.paddingTop) || 0;
      const paddingBottom = parseInt(styles.paddingBottom) || 0;
      if (paddingTop > 0) {
        htmlEl.style.paddingTop = Math.max(1, paddingTop * factor) + 'px';
      }
      if (paddingBottom > 0) {
        htmlEl.style.paddingBottom = Math.max(1, paddingBottom * factor) + 'px';
      }
    });
  }

  private compressFontSizes(element: HTMLElement, factor: number): void {
    const textElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li');
    textElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const currentSize = parseInt(window.getComputedStyle(htmlEl).fontSize) || 12;
      const newSize = Math.max(7, currentSize * factor);
      htmlEl.style.fontSize = newSize + 'px';
    });
  }

  private optimizeLongContent(element: HTMLElement): void {
    const descriptions = element.querySelectorAll('.description, .item-description, p');
    descriptions.forEach(desc => {
      const htmlDesc = desc as HTMLElement;
      const text = htmlDesc.textContent || '';
     
      if (text.length > 120) {
        htmlDesc.textContent = text.substring(0, 117) + '...';
      }
    });

    const itemLists = element.querySelectorAll('.skills-list, .experience-list');
    itemLists.forEach(list => {
      const items = list.querySelectorAll('li, .skill-tag');
      if (items.length > 15) {
        Array.from(items).slice(15).forEach(item => {
          (item as HTMLElement).style.display = 'none';
        });
      }
    });
  }

  private createOptimizedElement(original: HTMLElement, config: PdfGenerationOptions): HTMLElement {
    const cloned = original.cloneNode(true) as HTMLElement;
   
    cloned.setAttribute('data-pdf-element', 'true');
   
    cloned.style.cssText = `
      width: ${config.width}px !important;
      height: ${config.height}px !important;
      background: ${config.backgroundColor} !important;
      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 10px !important;
      line-height: 1.3 !important;
      color: #333 !important;
      padding: ${config.padding}px !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      position: absolute !important;
      top: -9999px !important;
      left: -9999px !important;
      overflow: hidden !important;
      page-break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      visibility: visible !important;
      display: block !important;
      opacity: 1 !important;
      z-index: 1 !important;
    `;

    this.applyPdfOptimizations(cloned);
    this.ensureChildrenVisibility(cloned);
   
    return cloned;
  }

  private ensureChildrenVisibility(element: HTMLElement): void {
    const allElements = element.querySelectorAll('*');
    allElements.forEach(child => {
      const htmlChild = child as HTMLElement;
     
      if (htmlChild.style.display === 'none') {
        htmlChild.style.display = 'block';
      }
     
      if (htmlChild.style.visibility === 'hidden') {
        htmlChild.style.visibility = 'visible';
      }
     
      if (htmlChild.style.opacity === '0') {
        htmlChild.style.opacity = '1';
      }

      if (htmlChild.tagName === 'ION-ICON') {
        htmlChild.style.display = 'none';
      }
    });

    element.style.visibility = 'visible';
    element.style.display = 'block';
    element.style.opacity = '1';
  }

  private applyPdfOptimizations(element: HTMLElement): void {
    const interactiveElements = element.querySelectorAll(
      'button, ion-button, ion-fab, .btn, .interactive, .hover-effect'
    );
    interactiveElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    const coloredElements = element.querySelectorAll('[style*="background"]');
    coloredElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.setProperty('-webkit-print-color-adjust', 'exact');
      htmlEl.style.setProperty('color-adjust', 'exact');
      htmlEl.style.setProperty('print-color-adjust', 'exact');
    });

    const sections = element.querySelectorAll('.section, .cv-section, .item, .experience-item, .formation-item');
    sections.forEach(section => {
      const htmlSection = section as HTMLElement;
      htmlSection.style.pageBreakInside = 'avoid';
      htmlSection.style.setProperty('break-inside', 'avoid');
    });
  }

  private calculateOptimalDimensions(
    canvas: HTMLCanvasElement,
    pageWidth: number,
    pageHeight: number
  ): { x: number; y: number; width: number; height: number } {
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    const finalWidth = imgHeight > pageHeight ? (pageWidth * pageHeight) / imgHeight : imgWidth;
    const finalHeight = imgHeight > pageHeight ? pageHeight : imgHeight;

    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    return { x, y, width: finalWidth, height: finalHeight };
  }

  private getDefaultConfig(options: PdfGenerationOptions): Required<PdfGenerationOptions> {
    return {
      filename: options.filename || `document_${new Date().toISOString().split('T')[0]}.pdf`,
      quality: options.quality ?? 0.95,
      scale: options.scale ?? 2,
      width: options.width ?? this.A4_WIDTH_PX,
      height: options.height ?? this.A4_HEIGHT_PX,
      padding: options.padding ?? 25,
      backgroundColor: options.backgroundColor ?? '#ffffff',
      fontOptimization: options.fontOptimization ?? true,
      singlePage: options.singlePage ?? true,
      isPreStyled: options.isPreStyled ?? false
    };
  }

  generateFileName(baseName: string, suffix?: string): string {
    const date = new Date().toISOString().split('T')[0];
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fullName = suffix ? `${cleanBaseName}_${suffix}` : cleanBaseName;
    return `${fullName}_${date}.pdf`;
  }

  validateElement(element: HTMLElement): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
   
    if (!element) {
      errors.push('Élément HTML manquant');
    }
   
    if (element && element.offsetHeight === 0) {
      errors.push('Élément non visible (hauteur 0)');
    }
   
    if (element && element.offsetWidth === 0) {
      errors.push('Élément non visible (largeur 0)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  estimatePdfSize(element: HTMLElement): {
    estimatedSizeMB: number;
    recommendedQuality: number;
    warnings: string[]
  } {
    const warnings: string[] = [];
    const area = element.offsetWidth * element.offsetHeight;
   
    const estimatedSizeMB = (area / 1000000) * 0.5;
    let recommendedQuality = 0.95;
   
    if (estimatedSizeMB > 5) {
      warnings.push('PDF volumineux estimé (>5MB)');
      recommendedQuality = 0.85;
    }
   
    if (estimatedSizeMB > 10) {
      warnings.push('PDF très volumineux estimé (>10MB)');
      recommendedQuality = 0.7;
    }

    return {
      estimatedSizeMB: Math.round(estimatedSizeMB * 100) / 100,
      recommendedQuality,
      warnings
    };
  }
}