import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// Composant qui lance une erreur pour les tests
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Supprimer les erreurs de console pendant les tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  test('affiche les enfants quand il n\'y a pas d\'erreur', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('affiche l\'interface d\'erreur quand une erreur est capturée', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oups ! Une erreur s\'est produite')).toBeInTheDocument();
    expect(screen.getByText('Réessayer')).toBeInTheDocument();
    expect(screen.getByText('Retour à l\'accueil')).toBeInTheDocument();
  });

  test('affiche les détails de l\'erreur en mode développement', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Détails de l'erreur/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  test('masque les détails de l\'erreur en mode production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Détails de l'erreur/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

