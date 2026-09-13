import { doc, collection, addDoc, setDoc, getDoc, increment, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';

const TEAM_STORAGE_KEY = 'thermalwatch_team_member';
const CACHED_TEAM_IPS_KEY = 'thermalwatch_cached_team_ips';

// Base known team IPs
const HARDCODED_TEAM_IPS: string[] = [
  '103.97.106.28', // Primary team workstation IP
];

/**
 * Checks if current user is flagged as a team member in URL or localStorage.
 */
function checkUrlAndStorageTeamStatus(): { isFlaggedInStorage: boolean; wasFlaggedInUrl: boolean } {
  try {
    if (typeof window === 'undefined') return { isFlaggedInStorage: false, wasFlaggedInUrl: false };

    let wasFlaggedInUrl = false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('team')) {
      const val = urlParams.get('team');
      if (val === 'true' || val === '1') {
        localStorage.setItem(TEAM_STORAGE_KEY, 'true');
        wasFlaggedInUrl = true;
      } else if (val === 'false' || val === '0') {
        localStorage.removeItem(TEAM_STORAGE_KEY);
      }

      // Clean up the URL parameter cleanly without page refresh
      urlParams.delete('team');
      const newQuery = urlParams.toString();
      const cleanUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '') + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    const isFlaggedInStorage = localStorage.getItem(TEAM_STORAGE_KEY) === 'true';
    return { isFlaggedInStorage, wasFlaggedInUrl };
  } catch {
    return { isFlaggedInStorage: false, wasFlaggedInUrl: false };
  }
}

/**
 * Retrieves known team IPs from Firestore config, falling back to cached local storage.
 */
async function getKnownTeamIps(): Promise<string[]> {
  try {
    const configDoc = await getDoc(doc(db, 'site_stats', 'config'));
    if (configDoc.exists()) {
      const data = configDoc.data();
      const ips = Array.isArray(data?.team_ips) ? data.team_ips : [];
      const combined = Array.from(new Set([...HARDCODED_TEAM_IPS, ...ips]));
      try {
        localStorage.setItem(CACHED_TEAM_IPS_KEY, JSON.stringify(combined));
      } catch {
        // Ignore storage quotas
      }
      return combined;
    }
  } catch (err) {
    console.debug('Failed to fetch dynamic team IPs, using cache/defaults:', err);
  }

  // Fallback to local storage cache or hardcoded defaults
  try {
    const cached = localStorage.getItem(CACHED_TEAM_IPS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return Array.from(new Set([...HARDCODED_TEAM_IPS, ...parsed]));
    }
  } catch {
    // Ignore
  }

  return HARDCODED_TEAM_IPS;
}

/**
 * Generates or retrieves a session identifier for deduplicating quick reloads.
 */
function getSessionInfo(): { sessionId: string; isNewSession: boolean } {
  try {
    let sessionId = sessionStorage.getItem('tw_session_id');
    let isNewSession = false;
    if (!sessionId) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      sessionStorage.setItem('tw_session_id', sessionId);
      isNewSession = true;
    }
    return { sessionId, isNewSession };
  } catch {
    return { sessionId: 'unknown', isNewSession: true };
  }
}

/**
 * Attempts a fast, graceful non-blocking fetch to get rough location and public IP.
 * Fails silently after 2.5 seconds if adblocked or offline.
 */
async function fetchGeoData(): Promise<{ ip?: string; city?: string; region?: string; country?: string; org?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return {};
    const data = await res.json();
    return {
      ip: data.ip ? String(data.ip).trim() : undefined,
      city: data.city || undefined,
      region: data.region || undefined,
      country: data.country_name || data.country || undefined,
      org: data.org || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Silently records the visit in Firestore with strict IP and device filtering.
 */
export async function trackVisit(): Promise<void> {
  try {
    const { isFlaggedInStorage, wasFlaggedInUrl } = checkUrlAndStorageTeamStatus();
    const { sessionId, isNewSession } = getSessionInfo();

    // 1. Resolve visitor IP and location
    const [geo, teamIps] = await Promise.all([
      fetchGeoData(),
      getKnownTeamIps()
    ]);

    const visitorIp = geo.ip;

    // 2. IP filtering check
    const isMatchedByIp = Boolean(visitorIp && teamIps.includes(visitorIp));
    const isTeam = isFlaggedInStorage || wasFlaggedInUrl || isMatchedByIp;

    // If this visitor visited via ?team=true or is newly identified, auto-register their IP
    if ((wasFlaggedInUrl || isFlaggedInStorage) && visitorIp && !teamIps.includes(visitorIp)) {
      setDoc(
        doc(db, 'site_stats', 'config'),
        {
          team_ips: arrayUnion(visitorIp),
          last_updated: serverTimestamp(),
        },
        { merge: true }
      ).catch((e) => console.debug('Could not auto-register team IP:', e));
    }

    const basicInfo = {
      timestamp: serverTimestamp(),
      isTeam,
      matchedByIp: isMatchedByIp,
      matchedByStorage: isFlaggedInStorage,
      sessionId,
      isNewSession,
      referrer: document.referrer || 'direct',
      path: window.location.pathname || '/',
      userAgent: navigator.userAgent,
      language: navigator.language || 'unknown',
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      recordedAtIso: new Date().toISOString(),
    };

    // 3. Atomically increment counters in site_stats/summary
    const summaryRef = doc(db, 'site_stats', 'summary');
    setDoc(
      summaryRef,
      {
        total_views: increment(1),
        external_views: increment(isTeam ? 0 : 1),
        team_views: increment(isTeam ? 1 : 0),
        last_visit_at: serverTimestamp(),
        last_visit_iso: new Date().toISOString(),
      },
      { merge: true }
    ).catch((err) => console.debug('Stats counter update suppressed:', err));

    // 4. Save detailed visit record in site_visits collection
    const visitsCollection = collection(db, 'site_visits');
    await addDoc(visitsCollection, {
      ...basicInfo,
      ...geo,
    });
  } catch (err) {
    // Suppress silently so user and judges experience zero interruptions
    console.debug('Visit tracking suppressed:', err);
  }
}
