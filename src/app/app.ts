import { Component, signal } from '@angular/core';

interface ArtistImage {
  src: string;
  alt: string;
  code: string;
  caption: string;
}

interface ImageCollection {
  id: string;
  number: string;
  title: string;
  mode: string;
  images: ArtistImage[];
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly isDark = signal(true);
  protected readonly activeSlides = signal<Record<string, number>>({
    portraits: 0,
    editorial: 0,
    architecture: 0,
  });

  protected readonly callNumber = '47992502909';

  whatsappLink = `https://wa.me/55${this.callNumber}?text=${encodeURIComponent(
    'Olá, vim pela landing page e gostaria de um orçamento.',
  )}`;

  protected readonly collections: ImageCollection[] = [
    {
      id: 'portraits',
      number: '01',
      title: 'Portraits',
      mode: 'Swipe',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=82',
          alt: 'Close portrait of an artist in soft studio light',
          code: 'IMG_01',
          caption: 'Mika Stone / vocalist',
        },
        {
          src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=82',
          alt: 'Black and white portrait of a visual artist',
          code: 'IMG_02',
          caption: 'Theo Vale / painter',
        },
        {
          src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=82',
          alt: 'Portrait of a dancer facing the camera',
          code: 'IMG_03',
          caption: 'Noah Rios / dancer',
        },
      ],
    },
    {
      id: 'editorial',
      number: '02',
      title: 'Editorial',
      mode: 'Frame',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=82',
          alt: 'Editorial artist portrait with dramatic styling',
          code: 'FULL_BLEED_01',
          caption: 'Studio Volume / campaign',
        },
        {
          src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=82',
          alt: 'Fashion artist walking through a bright exterior set',
          code: 'FULL_BLEED_02',
          caption: 'Glass House / lookbook',
        },
        {
          src: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=82',
          alt: 'Editorial portrait of an artist in sculptural wardrobe',
          code: 'FULL_BLEED_03',
          caption: 'New Forms / press',
        },
      ],
    },
    {
      id: 'architecture',
      number: '03',
      title: 'Architecture',
      mode: 'Swipe',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=82',
          alt: 'Geometric concrete architecture photographed with clean lines',
          code: 'ARC_01',
          caption: 'Museum light study',
        },
        {
          src: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=82',
          alt: 'Graphic architectural facade with angular shadows',
          code: 'ARC_02',
          caption: 'Brutalist rhythm',
        },
        {
          src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82',
          alt: 'Artist studio interior with strong linear perspective',
          code: 'ARC_03',
          caption: 'Studio archive',
        },
      ],
    },
  ];

  protected readonly services = [
    { title: 'Commercial', detail: 'Campaigns & lookbooks', price: 'From $1.2k' },
    { title: 'Personal', detail: 'Portraits & headshots', price: 'From $400' },
    { title: 'Editorial', detail: 'Magazines & press', price: 'Inquire' },
  ];

  protected toggleTheme(): void {
    this.isDark.update((value) => !value);
  }

  protected activeSlide(collectionId: string): number {
    return this.activeSlides()[collectionId] ?? 0;
  }

  protected moveCarousel(
    viewport: HTMLElement,
    collectionId: string,
    slideCount: number,
    direction: number,
  ): void {
    const nextSlide = (this.activeSlide(collectionId) + direction + slideCount) % slideCount;
    this.goToSlide(viewport, collectionId, nextSlide);
  }

  protected goToSlide(viewport: HTMLElement, collectionId: string, slideIndex: number): void {
    this.activeSlides.update((slides) => ({ ...slides, [collectionId]: slideIndex }));

    const target = viewport.querySelector<HTMLElement>(`[data-slide-index="${slideIndex}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }
}
