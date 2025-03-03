/**
 * Strapi authentication module
 * Handles JWT token management and authentication
 */

const strapiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_STRAPI_URL,
  jwt: null
};

/**
 * Authenticate with Strapi and get JWT token
 */
export const authenticate = async () => {
  const response = await fetch(`${strapiConfig.baseUrl}/api/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      identifier: process.env.STRAPI_USER,
      password: process.env.STRAPI_PASSWORD
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.message || 'Authentication failed');
  }

  const data = await response.json();
  return data.jwt;
};

/**
 * Get current JWT token or authenticate to get a new one
 */
export const getJWT = async () => {
  if (!strapiConfig.jwt) {
    strapiConfig.jwt = await authenticate();
  }
  return strapiConfig.jwt;
};

/**
 * Clear stored JWT token
 */
export const clearJWT = () => {
  strapiConfig.jwt = null;
};

/**
 * Get headers with JWT token for Strapi requests
 */
export const getAuthHeaders = async () => ({
  'Authorization': `Bearer ${await getJWT()}`,
  'Content-Type': 'application/json'
});
