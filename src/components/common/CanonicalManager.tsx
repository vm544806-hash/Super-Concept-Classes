import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const CanonicalManager = () => {
  const location = useLocation();

  useEffect(() => {
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const cleanPath = location.pathname === '/' ? '' : location.pathname;
    canonical.href = `https://superconceptclasses.vercel.app${cleanPath}`;
  }, [location.pathname]);

  return null;
};
