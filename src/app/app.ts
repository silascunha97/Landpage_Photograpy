import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  signal,
} from '@angular/core';

interface ArtistImage {
  src: string;
  avifSrc: string;
  webpSrc: string;
  alt: string;
  code: string;
  caption: string;
  width: number;
  height: number;
}

type PublicImageKey =
  | 'hero'
  | 'drone-self'
  | 'event-wide'
  | 'event-close'
  | 'event-highlight'
  | 'session-portrait'
  | 'session-detail'
  | 'session-highlight'
  | 'session-wide'
  | 'session-close';

interface PublicImage extends ArtistImage {
  key: PublicImageKey;
  order: number;
  optimizedName: string;
}

interface CarouselImage extends ArtistImage {
  loopIndex: number;
  originalIndex: number;
  isClone: boolean;
}

interface ImageCollection {
  id: string;
  number: string;
  title: string;
  mode: string;
  images: readonly ArtistImage[];
  loopedImages: readonly CarouselImage[];
}

const createPublicImage = (
  image: Omit<PublicImage, 'src' | 'avifSrc' | 'webpSrc'>,
): PublicImage => ({
  ...image,
  avifSrc: `/images/${image.optimizedName}.avif`,
  webpSrc: `/images/${image.optimizedName}.webp`,
  src: `/images/${image.optimizedName}.webp`,
});

const createLoopedImages = (images: readonly ArtistImage[]): readonly CarouselImage[] => {
  if (images.length <= 1) {
    return images.map((image, index) => ({
      ...image,
      loopIndex: index,
      originalIndex: index,
      isClone: false,
    }));
  }

  const lastImage = images[images.length - 1];
  const firstImage = images[0];

  if (!lastImage || !firstImage) {
    return [];
  }

  return [
    {
      ...lastImage,
      loopIndex: 0,
      originalIndex: images.length - 1,
      isClone: true,
    },
    ...images.map((image, index) => ({
      ...image,
      loopIndex: index + 1,
      originalIndex: index,
      isClone: false,
    })),
    {
      ...firstImage,
      loopIndex: images.length + 1,
      originalIndex: 0,
      isClone: true,
    },
  ];
};

const createCollection = (collection: Omit<ImageCollection, 'loopedImages'>): ImageCollection => ({
  ...collection,
  loopedImages: createLoopedImages(collection.images),
});

const PUBLIC_IMAGES: readonly PublicImage[] = [
  createPublicImage({
    key: 'hero',
    order: 1,
    optimizedName: 'carlos-daniel-hero',
    alt: 'Fotografia principal do portfolio de Daniel',
    code: 'IMG_01',
    caption: 'Portfolio / destaque',
    width: 739,
    height: 1314,
  }),
  createPublicImage({
    key: 'drone-self',
    order: 2,
    optimizedName: 'carlos-daniel-drone-self',
    alt: 'Registro de Daniel com equipamento de drone',
    code: 'IMG_02',
    caption: 'Drone / making of',
    width: 1066,
    height: 1600,
  }),
  createPublicImage({
    key: 'event-wide',
    order: 3,
    optimizedName: 'carlos-daniel-event-wide',
    alt: 'Registro aberto de evento fotografado por Daniel',
    code: 'IMG_03',
    caption: 'Evento / cobertura',
    width: 960,
    height: 1280,
  }),
  createPublicImage({
    key: 'event-close',
    order: 4,
    optimizedName: 'carlos-daniel-event-close',
    alt: 'Registro aproximado de evento fotografado por Daniel',
    code: 'IMG_04',
    caption: 'Evento / detalhe',
    width: 960,
    height: 1280,
  }),
  createPublicImage({
    key: 'event-highlight',
    order: 5,
    optimizedName: 'carlos-daniel-event-highlight',
    alt: 'Registro complementar de evento fotografado por Daniel',
    code: 'IMG_05',
    caption: 'Evento / destaque',
    width: 720,
    height: 1280,
  }),
  createPublicImage({
    key: 'session-portrait',
    order: 6,
    optimizedName: 'carlos-daniel-session-portrait',
    alt: 'Fotografia de ensaio feita por Daniel',
    code: 'IMG_06',
    caption: 'Ensaio / retrato',
    width: 1066,
    height: 1600,
  }),
  createPublicImage({
    key: 'session-detail',
    order: 7,
    optimizedName: 'carlos-daniel-session-detail',
    alt: 'Detalhe de ensaio fotografado por Daniel',
    code: 'IMG_07',
    caption: 'Ensaio / detalhe',
    width: 1066,
    height: 1600,
  }),
  createPublicImage({
    key: 'session-highlight',
    order: 8,
    optimizedName: 'carlos-daniel-session-highlight',
    alt: 'Fotografia complementar de ensaio feita por Daniel',
    code: 'IMG_08',
    caption: 'Ensaio / destaque',
    width: 1066,
    height: 1600,
  }),
  createPublicImage({
    key: 'session-wide',
    order: 9,
    optimizedName: 'carlos-daniel-session-wide',
    alt: 'Fotografia aberta de ensaio feita por Daniel',
    code: 'IMG_09',
    caption: 'Ensaio / cena',
    width: 1066,
    height: 1600,
  }),
  createPublicImage({
    key: 'session-close',
    order: 10,
    optimizedName: 'carlos-daniel-session-close',
    alt: 'Fotografia aproximada de ensaio feita por Daniel',
    code: 'IMG_10',
    caption: 'Ensaio / proximidade',
    width: 1066,
    height: 1600,
  }),
];

const ORDERED_PUBLIC_IMAGES = [...PUBLIC_IMAGES].sort(
  (current, next) => current.order - next.order,
);

const PUBLIC_IMAGE_BY_KEY = new Map(
  ORDERED_PUBLIC_IMAGES.map((image) => [image.key, image] as const),
);

const getPublicImage = (key: PublicImageKey): PublicImage => {
  const image = PUBLIC_IMAGE_BY_KEY.get(key);

  if (!image) {
    throw new Error(`Imagem publica nao encontrada: ${key}`);
  }

  return image;
};

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChildren('carouselViewport')
  private carouselViewports!: QueryList<ElementRef<HTMLElement>>;

  private readonly scrollEndTimers = new Map<string, ReturnType<typeof setTimeout>>();

  protected readonly heroImage = getPublicImage('hero');

  protected readonly isDark = signal(true);
  protected readonly activeSlides = signal<Record<string, number>>({
    portraits: 0,
    editorial: 0,
    architecture: 0,
  });

  protected readonly callNumber = '47992502909';

  protected readonly whatsappLink = `https://wa.me/55${this.callNumber}?text=${encodeURIComponent(
    'Olá, Carlos. Analisamos seu portfólio estrutura e movimento e precisamos dessa precisão técnica para documentar o nosso próximo evento esportivo. Queremos alinhar a logística e entender a viabilidade de cobertura da sua lente — incluindo a perspectiva aérea e fotos de ação. Como está sua agenda para os próximos meses?',
  )}`;

  protected readonly collections: readonly ImageCollection[] = [
    createCollection({
      id: 'portraits',
      number: '01',
      title: 'Portraits',
      mode: 'Swipe',
      images: [
        getPublicImage('drone-self'),
        getPublicImage('event-wide'),
        getPublicImage('event-close'),
      ],
    }),
    createCollection({
      id: 'editorial',
      number: '02',
      title: 'Editorial',
      mode: 'Frame',
      images: [
        getPublicImage('session-portrait'),
        getPublicImage('session-detail'),
        getPublicImage('session-highlight'),
      ],
    }),
    createCollection({
      id: 'architecture',
      number: '03',
      title: 'Architecture',
      mode: 'Swipe',
      images: [
        getPublicImage('session-wide'),
        getPublicImage('session-close'),
        getPublicImage('event-highlight'),
      ],
    }),
  ];

  ngAfterViewInit(): void {
    setTimeout(() => this.resetCarouselPositions());
  }

  ngOnDestroy(): void {
    for (const timer of this.scrollEndTimers.values()) {
      clearTimeout(timer);
    }

    this.scrollEndTimers.clear();
  }

  protected toggleTheme(): void {
    this.isDark.update((value) => !value);
  }

  protected activeSlide(collectionId: string): number {
    return this.activeSlides()[collectionId] ?? 0;
  }

  protected handleCarouselScroll(
    viewport: HTMLElement,
    collectionId: string,
    slideCount: number,
  ): void {
    this.syncActiveSlideFromViewport(viewport, collectionId);

    const currentTimer = this.scrollEndTimers.get(collectionId);

    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    const timer = setTimeout(() => {
      this.scrollEndTimers.delete(collectionId);
      this.normalizeInfiniteScroll(viewport, collectionId, slideCount);
    }, 120);

    this.scrollEndTimers.set(collectionId, timer);
  }

  protected moveCarousel(
    viewport: HTMLElement,
    collectionId: string,
    slideCount: number,
    direction: number,
  ): void {
    const nextSlide = (this.activeSlide(collectionId) + direction + slideCount) % slideCount;
    const currentSlide = this.activeSlide(collectionId);
    const targetLoopIndex =
      direction > 0 && currentSlide === slideCount - 1
        ? slideCount + 1
        : direction < 0 && currentSlide === 0
          ? 0
          : nextSlide + 1;

    this.setActiveSlide(collectionId, nextSlide);
    this.scrollToLoopIndex(viewport, targetLoopIndex, 'smooth');
  }

  protected goToSlide(viewport: HTMLElement, collectionId: string, slideIndex: number): void {
    this.setActiveSlide(collectionId, slideIndex);
    this.scrollToLoopIndex(viewport, slideIndex + 1, 'smooth');
  }

  private resetCarouselPositions(): void {
    for (const viewportRef of this.carouselViewports) {
      const viewport = viewportRef.nativeElement;
      const collectionId = viewport.dataset['collectionId'];

      if (!collectionId) {
        continue;
      }

      this.scrollToLoopIndex(viewport, this.activeSlide(collectionId) + 1, 'auto');
    }
  }

  private setActiveSlide(collectionId: string, slideIndex: number): void {
    if (this.activeSlide(collectionId) === slideIndex) {
      return;
    }

    this.activeSlides.update((slides) => ({ ...slides, [collectionId]: slideIndex }));
  }

  private syncActiveSlideFromViewport(viewport: HTMLElement, collectionId: string): void {
    const closestSlide = this.findClosestLoopSlide(viewport);

    if (!closestSlide) {
      return;
    }

    const slideIndex = Number(closestSlide.dataset['slideIndex']);

    if (Number.isNaN(slideIndex)) {
      return;
    }

    this.setActiveSlide(collectionId, slideIndex);
  }

  private normalizeInfiniteScroll(
    viewport: HTMLElement,
    collectionId: string,
    slideCount: number,
  ): void {
    const closestSlide = this.findClosestLoopSlide(viewport);

    if (!closestSlide) {
      return;
    }

    const loopIndex = Number(closestSlide.dataset['loopIndex']);
    const slideIndex = Number(closestSlide.dataset['slideIndex']);

    if (Number.isNaN(loopIndex) || Number.isNaN(slideIndex)) {
      return;
    }

    this.setActiveSlide(collectionId, slideIndex);

    if (loopIndex === 0) {
      this.scrollToLoopIndex(viewport, slideCount, 'auto');
      return;
    }

    if (loopIndex === slideCount + 1) {
      this.scrollToLoopIndex(viewport, 1, 'auto');
    }
  }

  private findClosestLoopSlide(viewport: HTMLElement): HTMLElement | null {
    const slides = Array.from(viewport.querySelectorAll<HTMLElement>('[data-loop-index]'));
    let closestSlide = slides[0];

    if (!closestSlide) {
      return null;
    }

    const viewportStart = viewport.getBoundingClientRect().left;

    for (const slide of slides) {
      if (
        Math.abs(slide.getBoundingClientRect().left - viewportStart) <
        Math.abs(closestSlide.getBoundingClientRect().left - viewportStart)
      ) {
        closestSlide = slide;
      }
    }

    return closestSlide;
  }

  private scrollToLoopIndex(
    viewport: HTMLElement,
    loopIndex: number,
    behavior: ScrollBehavior,
  ): void {
    const target = viewport.querySelector<HTMLElement>(`[data-loop-index="${loopIndex}"]`);

    if (!target) {
      return;
    }

    if (typeof target.scrollIntoView !== 'function') {
      viewport.scrollLeft = target.offsetLeft;
      return;
    }

    if (behavior === 'auto') {
      const previousScrollBehavior = viewport.style.scrollBehavior;
      viewport.style.scrollBehavior = 'auto';
      target.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
      viewport.style.scrollBehavior = previousScrollBehavior;
      return;
    }

    target.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
  }
}
