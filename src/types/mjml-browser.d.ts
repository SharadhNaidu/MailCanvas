/**
 * Type declarations for mjml-browser
 * The library doesn't provide its own TypeScript types
 */

declare module "mjml-browser" {
  interface MjmlError {
    line: number;
    message: string;
    tagName: string;
    formattedMessage: string;
  }

  interface MjmlOptions {
    /** Validation level: "strict" | "soft" | "skip" */
    validationLevel?: "strict" | "soft" | "skip";
    /** File path used in error messages */
    filePath?: string;
    /** Add "mj-" prefix to components */
    mjmlConfigPath?: string;
    /** Minimum width for mobile responsiveness */
    minifyOptions?: object;
    /** Output beautified HTML */
    beautify?: boolean;
    /** Keep comments in output */
    keepComments?: boolean;
    /** Custom fonts to include */
    fonts?: Record<string, string>;
  }

  interface MjmlResult {
    /** The compiled HTML string */
    html: string;
    /** Array of validation errors */
    errors: MjmlError[];
    /** JSON structure of the MJML document */
    json?: object;
  }

  /**
   * Compile MJML to HTML
   * @param mjml - The MJML source code
   * @param options - Compilation options
   * @returns Compilation result with HTML and errors
   */
  function mjml2html(mjml: string, options?: MjmlOptions): MjmlResult;

  export default mjml2html;
}
