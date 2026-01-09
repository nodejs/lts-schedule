import { JSDOM } from "d3-node";

export interface VersionData {
  /** Start date of the version */
  start: string;
  /** LTS start date */
  lts?: string;
  /** Maintenance start date */
  maintenance?: string;
  /** End of life date */
  end: string;
  /** Codename */
  codename?: string;
}

export interface ScheduleData {
  [version: string]: VersionData;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CreateOptions {
  /** The schedule data object with version keys */
  data: ScheduleData;
  /** Start date for the chart query range */
  queryStart: Date;
  /** End date for the chart query range */
  queryEnd: Date;
  /** Whether to animate the bars (default: false) */
  animate?: boolean;
  /** Whether to exclude the "Main" row (default: false) */
  excludeMain?: boolean;
  /** Project name to prefix version labels */
  projectName: string;
  /** Chart margins (default: { top: 30, right: 30, bottom: 30, left: 110 }) */
  margin?: Margin;
  /** Color for the current date marker line (e.g., 'red', '#ff0000') */
  currentDateMarker?: string;
}

export interface D3NodeResult {
  /** Get the SVG element */
  svgString(): string;
  /** Get the HTML string */
  html(): string;
}

/**
 * Creates an D3 chart representing the Node.js LTS schedule
 *
 * @param options - Configuration options for the chart
 * @returns A D3Node instance
 */
export function create(options: CreateOptions): D3NodeResult;
