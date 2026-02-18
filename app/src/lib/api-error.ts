interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: string;
  stack?: string;
  timestamp: string;
  context?: string;
}

export function apiError(
  error: unknown, 
  status = 500, 
  context?: string,
  userFriendlyMessage?: string
): Response {
  const isDev = process.env.NODE_ENV === 'development';
  const rawMessage = error instanceof Error ? error.message : String(error);
  
  // Categorize common API errors for better user messages
  let enhancedMessage = userFriendlyMessage;
  if (!enhancedMessage) {
    if (status === 400) {
      enhancedMessage = 'The request was invalid or malformed';
    } else if (status === 401) {
      enhancedMessage = 'Authentication required to access this resource';
    } else if (status === 403) {
      enhancedMessage = 'Access denied - insufficient permissions';
    } else if (status === 404) {
      enhancedMessage = 'The requested resource was not found';
    } else if (status === 429) {
      enhancedMessage = 'Too many requests - please try again later';
    } else if (status >= 500) {
      enhancedMessage = 'An internal server error occurred';
    } else {
      enhancedMessage = 'An unexpected error occurred';
    }
  }

  const response: ApiErrorResponse = {
    error: isDev ? rawMessage : enhancedMessage,
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    response.message = enhancedMessage;
    response.details = rawMessage;
    if (error instanceof Error && error.stack) {
      response.stack = error.stack;
    }
  }

  if (context) {
    response.context = context;
  }

  // Log the error for debugging
  console.error(`[API Error ${status}]${context ? ` [${context}]` : ''}`, error);

  return Response.json(response, { status });
}
