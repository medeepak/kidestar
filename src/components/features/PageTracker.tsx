import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../../utils/analytics';

export const PageTracker: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        // Log a page view event whenever the route changes
        trackEvent('page_view', {
            pathname: location.pathname,
            search: location.search
        });
    }, [location.pathname, location.search]);

    return null;
};
