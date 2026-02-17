export function handleError(error: unknown, context?: string): { message: string; details?: string } {
  const isDev = process.env.NODE_ENV === 'development';
  const msg = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${context ?? 'app'}]`, error);
  return {
    message: isDev ? msg : 'An unexpected error occurred',
    details: isDev ? (error instanceof Error ? error.stack : String(error)) : undefined,
  };
}
