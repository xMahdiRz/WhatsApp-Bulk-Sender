declare module 'papaparse' {
  interface ParseConfig {
    header?: boolean;
    complete?: (results: ParseResult) => void;
    error?: (error: Error) => void;
  }

  interface ParseResult {
    data: any[];
    errors: any[];
    meta: any;
  }

  function parse(file: File, config: ParseConfig): void;
  function unparse(data: any[]): string;

  export { parse, unparse };
} 