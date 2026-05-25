import { reactive } from 'vue'
import { getLoggedUser, getProfile, fetchImageAsBase64 } from '@/services/api'

const API_KEY = import.meta.env.VITE_API_KEY
const API_SECRET = import.meta.env.VITE_API_SECRET
const AUTH_CACHE_KEY = 'samaaja_auth_cache'

export const authState = reactive({
  isLoggedIn: false,
  email: null,
  isInitialLoad: true,
  profile: {
    fullName: null,
    image: null,
    imageBase64: null,
    category: null,
    organization: null,
    interests: [],
    gender: null,
    dob: null,
    mobileNumber: null,
    bio: null, // Separating bio from interests for clarity if needed, or keeping it as interests
    stats: {
      actions: 0,
      posts: 0,
      hours: 0
    }
  }
})

export const isProfileComplete = () => {
  const p = authState.profile;
  // All these are mandatory: Gender, Bio (interests/bio), Category, Date of birth, Mobile Number
  // Using interests or bio based on what gets saved. Let's rely on 'bio'.
  return !!(p.gender && p.bio && p.category && p.dob && p.mobileNumber);
}

const loadCachedAuth = () => {
  const cached = localStorage.getItem(AUTH_CACHE_KEY)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      Object.assign(authState, parsed, { isInitialLoad: true }) // Keep isInitialLoad true so checkAuth still runs
    } catch (e) {
      console.error("Failed to parse cached auth", e)
    }
  }
}

const saveCachedAuth = () => {
  const stateToCache = { ...authState }
  delete stateToCache.isInitialLoad // Don't cache the loading state itself
  localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(stateToCache))
}

const clearCachedAuth = () => {
  localStorage.removeItem(AUTH_CACHE_KEY)
}

// Load from cache immediately on app start
loadCachedAuth()

export async function checkAuth() {
  try {
    // 1. Fetch real logged in user (works in Dev now because of api.js proxy/tokens!)
    const data = await getLoggedUser();
    authState.email = data;
    authState.isLoggedIn = true;
    
    // 2. Fetch their actual profile data from Frappe
    const user_profile = await getProfile(data)
    
    if (user_profile) {
      // 3. Sanitize the Python "None" string right away before it hits the cache
      const rawImage = user_profile.user_image;
      const sanitizedImage = (rawImage === 'None' || rawImage === 'null' || !rawImage) ? null : rawImage;

      authState.profile.fullName = user_profile.full_name
      authState.profile.image = sanitizedImage // Store the clean image
      authState.profile.category = user_profile.user_category
      authState.profile.organization = user_profile.user_organization
      authState.profile.gender = user_profile.gender
      authState.profile.dob = user_profile.birth_date 
      authState.profile.mobileNumber = user_profile.mobile_no 
      authState.profile.bio = user_profile.bio
      authState.profile.interests = user_profile.interests
      authState.profile.badges = user_profile.badges
      authState.profile.stats.actions = user_profile.action_count || 0
      authState.profile.stats.posts = user_profile.posts || 0
      authState.profile.stats.hours = user_profile.hours_invested || 0

      // Cache the fresh data!
      saveCachedAuth()

      // 4. Only attempt to fetch and convert to base64 if it's a REAL image url
      if (sanitizedImage) {
        fetchImageAsBase64(sanitizedImage).then(base64 => {
          if (base64) {
            authState.profile.imageBase64 = base64;
            saveCachedAuth();
          }
        });
      }
    }
  } catch (error) {
    console.error("Auth Check Failed: ", error)
    authState.isLoggedIn = false;
    clearCachedAuth() // Clear cache if the session is dead
  } finally {
    // 🛑 THIS IS THE MASTER LOCK-PICK 🛑
    // No matter if the API fails, succeeds, or throws an error, 
    // this line ALWAYS runs, turning off the loading screen and unlocking your app!
    authState.isInitialLoad = false;
  }
}

export const getRequestOptions = () => {
  return {
    credentials: 'include'
  }
}

export const getAPITokenFromEnv = () => {
  return `token ${API_KEY}:${API_SECRET}`
}

export const getAPITokenFromStorage = () => {
  const api_key = localStorage.getItem('api_key')
  const api_secret = localStorage.getItem('api_secret')
  return {
    'Authorization': `token ${api_key}:${api_secret}`
  }
}