// Ambient TypeScript declarations for `@mapbox/polyline`.
// The package is CommonJS and ships without bundled typings.
declare module "@mapbox/polyline" {
  export type PolylineTuple = [number, number];

  /**
   * Decodes an encoded OSRM / Google polyline into an array of
   * [latitude, longitude] coordinate pairs.
   */
  export function decode(encoded: string, precision?: number): PolylineTuple[];

  /**
   * Encodes an array of [latitude, longitude] coordinate pairs into a string.
   */
  export function encode(
    coordinates: ReadonlyArray<PolylineTuple>,
    precision?: number
  ): string;

  /** Encodes a GeoJSON LineString geometry/feature into a polyline string. */
  export function fromGeoJSON(
    geojson: object,
    precision?: number
  ): string;

  /** Decodes a polyline string into a GeoJSON LineString geometry. */
  export function toGeoJSON(
    encoded: string,
    precision?: number
  ): { type: "LineString"; coordinates: PolylineTuple[] };

  const polyline: {
    decode: typeof decode;
    encode: typeof encode;
    fromGeoJSON: typeof fromGeoJSON;
    toGeoJSON: typeof toGeoJSON;
  };

  export default polyline;
}

declare module "leaflet-ant-path" {
  interface AntPathOptions {
    color?: string;
    weight?: number;
    opacity?: number;
    pulseColor?: string;
    dashArray?: number[];
    delay?: number;
    reverse?: boolean;
    [key: string]: unknown;
  }

  type AntPathLayer = {
    addTo: (map: unknown) => AntPathLayer;
  };

  export class AntPath {
    constructor(latlngs: [number, number][], options?: AntPathOptions);
    addTo: (map: unknown) => AntPath;
  }

  export function antPath(
    latlngs: [number, number][],
    options?: AntPathOptions
  ): AntPathLayer;
}