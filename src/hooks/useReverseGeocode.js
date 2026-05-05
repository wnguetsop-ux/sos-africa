import { useEffect, useRef, useState } from 'react';

const cache = new Map();

const buildAddress = (a) => {
  const houseNumber = a.house_number || '';
  const road = a.road || a.pedestrian || a.path || '';
  const neighbourhood = a.neighbourhood || a.suburb || a.quarter || '';
  let line = '';
  if (houseNumber) line += `${houseNumber} `;
  if (road) line += road;
  if (neighbourhood && !line.includes(neighbourhood)) {
    line += line ? `, ${neighbourhood}` : neighbourhood;
  }
  return line || a.city || a.town || a.village || '';
};

export const useReverseGeocode = (location) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastKey = useRef(null);

  useEffect(() => {
    if (!location?.lat || !location?.lng) return;
    // round to ~3 decimals (~110 m) so we don't refetch on tiny GPS jitter
    const key = `${location.lat.toFixed(3)},${location.lng.toFixed(3)}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    if (cache.has(key)) {
      setInfo(cache.get(key));
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=16&addressdetails=1`,
      { headers: { 'Accept-Language': 'fr' } }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const a = data.address || {};
        const result = {
          city: a.city || a.town || a.village || a.municipality || a.county || '',
          state: a.state || a.region || '',
          country: a.country || '',
          countryCode: (a.country_code || '').toUpperCase(),
          neighbourhood:
            a.neighbourhood || a.suburb || a.quarter || a.district || a.borough || '',
          road: a.road || a.pedestrian || '',
          line: buildAddress(a),
          full: data.display_name || '',
          raw: a,
        };
        cache.set(key, result);
        setInfo(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location?.lat, location?.lng]);

  return { info, loading };
};

export default useReverseGeocode;
