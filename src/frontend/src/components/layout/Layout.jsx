import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children }) => {
  const mainContentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const container = mainContentRef.current;
    if (!container) return;

    // Reset scroll on navigation
    container.scrollTo({ top: 0, behavior: 'instant' });

    const revealVisibleElements = () => {
      const elements = container.querySelectorAll('.scroll-reveal:not(.is-revealed)');
      if (elements.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const thresholdBottom = containerRect.bottom + 60;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= thresholdBottom) {
          el.classList.add('is-revealed');
        }
      });
    };

    // Reveal visible elements on initial render
    revealVisibleElements();
    const frameId = requestAnimationFrame(revealVisibleElements);
    const timerId = setTimeout(revealVisibleElements, 100);

    // IntersectionObserver for elements scrolled into view
    let observer;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: container,
          rootMargin: '0px 0px 40px 0px',
          threshold: 0.05,
        }
      );

      const unrevealed = container.querySelectorAll('.scroll-reveal:not(.is-revealed)');
      unrevealed.forEach((el) => observer.observe(el));
    }

    // Scroll listener inside custom overflow container
    const handleScroll = () => {
      revealVisibleElements();
    };
    container.addEventListener('scroll', handleScroll, { passive: true });

    // MutationObserver to watch for asynchronously loaded content
    let mutationObserver;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        revealVisibleElements();
        if (observer) {
          const newUnrevealed = container.querySelectorAll('.scroll-reveal:not(.is-revealed)');
          newUnrevealed.forEach((el) => observer.observe(el));
        }
      });

      mutationObserver.observe(container, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      container.removeEventListener('scroll', handleScroll);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" ref={mainContentRef}>
        <Header />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};

