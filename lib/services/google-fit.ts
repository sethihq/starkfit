/**
 * Google Fit API service
 *
 * Fetches real step count data from the Google Fitness REST API.
 * Requires a valid OAuth2 access token with the fitness.activity.read scope.
 *
 * Setup:
 *   1. Create OAuth2 credentials at https://console.cloud.google.com/apis/credentials
 *   2. Enable the Fitness API at https://console.cloud.google.com/apis/library/fitness.googleapis.com
 *   3. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local
 */

const FITNESS_API_BASE = 'https://www.googleapis.com/fitness/v1/users/me'

const STEP_DATA_SOURCE =
  'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'

interface AggregateRequest {
  aggregateBy: Array<{
    dataSourceId: string
  }>
  bucketByTime: {
    durationMillis: number
  }
  startTimeMillis: number
  endTimeMillis: number
}

interface DataPoint {
  value: Array<{
    intVal?: number
    fpVal?: number
  }>
}

interface Dataset {
  point: DataPoint[]
}

interface Bucket {
  dataset: Dataset[]
}

interface AggregateResponse {
  bucket: Bucket[]
}

/**
 * Fetch step count for a date range from Google Fit.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param startTime   - Start of the range (inclusive)
 * @param endTime     - End of the range (exclusive)
 * @returns Total step count across the range
 */
export async function getStepCount(
  accessToken: string,
  startTime: Date,
  endTime: Date
): Promise<number> {
  const body: AggregateRequest = {
    aggregateBy: [{ dataSourceId: STEP_DATA_SOURCE }],
    bucketByTime: {
      durationMillis: endTime.getTime() - startTime.getTime(),
    },
    startTimeMillis: startTime.getTime(),
    endTimeMillis: endTime.getTime(),
  }

  const response = await fetch(`${FITNESS_API_BASE}/dataset:aggregate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Google Fit API error (${String(response.status)}): ${errorText}`
    )
  }

  const data = (await response.json()) as AggregateResponse

  return parseTotalSteps(data)
}

/**
 * Extract total steps from the Google Fit aggregate response.
 */
function parseTotalSteps(data: AggregateResponse): number {
  let total = 0

  for (const bucket of data.bucket) {
    for (const dataset of bucket.dataset) {
      for (const point of dataset.point) {
        const firstValue = point.value[0]
        if (firstValue) {
          total += firstValue.intVal ?? 0
        }
      }
    }
  }

  return total
}

/**
 * Get today's date range (midnight to now) in the user's local timezone.
 */
export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return { start, end: now }
}

/**
 * Build the Google OAuth2 consent URL for the implicit flow.
 *
 * @param clientId    - Google OAuth2 client ID
 * @param redirectUri - URI to redirect after consent
 * @returns Full authorization URL
 */
export function buildOAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/fitness.activity.read',
    include_granted_scopes: 'true',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
