import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title ? `${title} | Ophrus` : 'Ophrus'}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
};

export default SEO;
