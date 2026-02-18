interface ErrorResponse {
  message: string;
  userMessage: string;
  suggestions: string[];
  details?: string;
}

function getContextualErrorInfo(context?: string): { 
  userMessage: string; 
  suggestions: string[];
} {
  switch (context) {
    case 'agents':
      return {
        userMessage: 'The AI agents dashboard failed to load properly. This could be due to session data issues or communication problems with the agent management system.',
        suggestions: [
          'Check your internet connection and try refreshing the page',
          'Verify that agent session files are accessible and not corrupted',
          'Clear browser cache and reload the application',
          'Check if other parts of the dashboard are working normally',
          'Review recent agent activity in the Error Dashboard'
        ]
      };
    case 'kanban':
      return {
        userMessage: 'The Kanban board could not be displayed. This might be related to data synchronization or storage issues.',
        suggestions: [
          'Refresh the page to reload board data',
          'Check if you have proper permissions to access this board',
          'Verify your network connection is stable',
          'Try accessing other dashboard features to isolate the issue',
          'Clear browser data and try again'
        ]
      };
    case 'root':
    default:
      return {
        userMessage: 'The application encountered a critical error that prevented it from loading properly.',
        suggestions: [
          'Refresh your browser to restart the application',
          'Clear your browser cache and cookies',
          'Try using a different browser or incognito mode',
          'Check if the issue persists across different devices',
          'Report this error if it continues to occur'
        ]
      };
  }
}

function categorizeError(error: unknown): { 
  category: 'network' | 'permission' | 'data' | 'system' | 'unknown';
  severity: 'low' | 'medium' | 'high';
} {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    // Network-related errors
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('connection')) {
      return { category: 'network', severity: 'medium' };
    }
    
    // Permission-related errors
    if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('forbidden')) {
      return { category: 'permission', severity: 'high' };
    }
    
    // Data-related errors
    if (msg.includes('parse') || msg.includes('invalid') || msg.includes('corrupt') || msg.includes('missing')) {
      return { category: 'data', severity: 'medium' };
    }
    
    // System-related errors
    if (msg.includes('system') || msg.includes('internal') || msg.includes('server')) {
      return { category: 'system', severity: 'high' };
    }
  }
  
  return { category: 'unknown', severity: 'medium' };
}

export function handleError(error: unknown, context?: string): ErrorResponse {
  const isDev = process.env.NODE_ENV === 'development';
  const rawMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorInfo = categorizeError(error);
  const contextualInfo = getContextualErrorInfo(context);
  
  console.error(`[${context ?? 'app'}]`, error);
  
  // Enhanced user message based on error category
  let enhancedUserMessage = contextualInfo.userMessage;
  if (errorInfo.category === 'network') {
    enhancedUserMessage += ' This appears to be a network-related issue.';
  } else if (errorInfo.category === 'permission') {
    enhancedUserMessage += ' This seems to be a permissions or access issue.';
  } else if (errorInfo.category === 'data') {
    enhancedUserMessage += ' This looks like a data processing or storage issue.';
  }
  
  // Enhanced suggestions based on error category
  let enhancedSuggestions = [...contextualInfo.suggestions];
  if (errorInfo.category === 'network') {
    enhancedSuggestions.unshift('Check your network connection and try again');
  } else if (errorInfo.category === 'permission') {
    enhancedSuggestions.unshift('Verify you have the necessary permissions for this action');
  } else if (errorInfo.category === 'data') {
    enhancedSuggestions.unshift('The data might be corrupted - try reloading or clearing cache');
  }
  
  return {
    message: isDev ? rawMessage : 'An unexpected error occurred',
    userMessage: enhancedUserMessage,
    suggestions: enhancedSuggestions.slice(0, 5), // Limit to 5 suggestions
    details: isDev ? (error instanceof Error ? error.stack : String(error)) : undefined,
  };
}
