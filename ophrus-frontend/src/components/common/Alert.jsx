import React from 'react';
import { Alert as UiAlert, AlertTitle, AlertDescription } from '../ui/alert';

const Alert = ({ type = 'default', title, children }) => {
  const variant = type === 'error' ? 'destructive' : 'default';
  return (
    <UiAlert variant={variant} className="mb-4">
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{children}</AlertDescription>
    </UiAlert>
  );
};

export default Alert;
