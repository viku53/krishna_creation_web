import React from 'react';
import { Helmet } from 'react-helmet-async';
import { GA_MEASUREMENT_ID, META_PIXEL_ID } from '../gtm';

/**
 * Injects GA4 (gtag.js) and Meta Pixel scripts into <head> only when their
 * corresponding environment variables are configured.
 */
const AnalyticsHead: React.FC = () => {
  if (!GA_MEASUREMENT_ID && !META_PIXEL_ID) {
    return null;
  }

  return (
    <Helmet>
      {GA_MEASUREMENT_ID && (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
        />
      )}
      {GA_MEASUREMENT_ID && (
        <script>{`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
          window.gtag('js', new Date());
          window.gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)});
        `}</script>
      )}
      {META_PIXEL_ID && (
        <script>{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${JSON.stringify(META_PIXEL_ID)});
          fbq('track', 'PageView');
        `}</script>
      )}
    </Helmet>
  );
};

export default AnalyticsHead;
