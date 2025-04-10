declare module 'confetti-js' {
  interface ConfettiSettings {
    target?: string;
    max?: number;
    size?: number;
    animate?: boolean;
    props?: string[];
    colors?: string[][];
    clock?: number;
    rotate?: boolean;
    width?: number;
    height?: number;
    start_from_edge?: boolean;
    respawn?: boolean;
  }

  interface ConfettiInstance {
    render: () => void;
    clear: () => void;
  }

  export function create(
    canvasId: string,
    settings?: ConfettiSettings
  ): ConfettiInstance;
} 