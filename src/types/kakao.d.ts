declare namespace kakao.maps {
  function load(callback: () => void): void;

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setBounds(bounds: LatLngBounds): void;
    panTo(position: LatLng): void;
    setCenter(position: LatLng): void;
    setLevel(level: number): void;
    getCenter(): LatLng;
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    extend(position: LatLng): void;
    isEmpty(): boolean;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  interface MarkerOptions {
    map?: Map;
    position: LatLng;
    title?: string;
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  interface InfoWindowOptions {
    content: string;
    removable?: boolean;
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
  }

  interface CustomOverlayOptions {
    position: LatLng;
    content: string | HTMLElement;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }

  namespace event {
    function addListener(
      target: Marker | Map,
      type: string,
      handler: () => void,
    ): void;
    function removeListener(
      target: Marker | Map,
      type: string,
      handler: () => void,
    ): void;
  }

  namespace services {
    class Places {
      keywordSearch(
        keyword: string,
        callback: (
          data: PlaceResult[],
          status: string,
          pagination: Pagination,
        ) => void,
        options?: PlacesSearchOptions,
      ): void;
      categorySearch(
        code: string,
        callback: (
          data: PlaceResult[],
          status: string,
          pagination: Pagination,
        ) => void,
        options?: PlacesSearchOptions,
      ): void;
    }

    interface PlaceResult {
      id: string;
      place_name: string;
      category_name: string;
      category_group_code: string;
      address_name: string;
      road_address_name: string;
      phone: string;
      x: string;
      y: string;
      place_url: string;
      distance: string;
    }

    interface PlacesSearchOptions {
      category_group_code?: string;
      location?: LatLng;
      radius?: number;
      bounds?: LatLngBounds;
      size?: number;
      page?: number;
    }

    interface Pagination {
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      current: number;
      gotoPage(page: number): void;
      nextPage(): void;
      prevPage(): void;
    }

    const Status: {
      OK: string;
      ZERO_RESULT: string;
      ERROR: string;
    };
  }
}

interface Window {
  kakao: typeof kakao;
}
