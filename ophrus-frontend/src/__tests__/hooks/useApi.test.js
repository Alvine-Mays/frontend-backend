import { renderHook, act } from '@testing-library/react';
import { useApi, useMutation } from '../../hooks/useApi';

// Mock du toast
const mockToast = {
  success: jest.fn(),
  error: jest.fn()
};

jest.mock('../../components/common/Toast', () => ({
  useToast: () => mockToast
}));

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exécute la fonction API avec succès', async () => {
    const mockApiFunction = jest.fn().mockResolvedValue({ data: 'test' });
    
    const { result } = renderHook(() => 
      useApi(mockApiFunction, [], { immediate: false })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await result.current.execute();
    });

    expect(mockApiFunction).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('gère les erreurs correctement', async () => {
    const mockError = new Error('API Error');
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => 
      useApi(mockApiFunction, [], { immediate: false })
    );

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // L'erreur est attendue
      }
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.loading).toBe(false);
    expect(mockToast.error).toHaveBeenCalledWith('API Error');
  });

  test('affiche un toast de succès quand configuré', async () => {
    const mockApiFunction = jest.fn().mockResolvedValue({ data: 'test' });
    
    const { result } = renderHook(() => 
      useApi(mockApiFunction, [], { 
        immediate: false,
        showSuccessToast: true,
        successMessage: 'Succès !'
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(mockToast.success).toHaveBeenCalledWith('Succès !');
  });
});

describe('useMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exécute la mutation avec succès', async () => {
    const mockMutationFunction = jest.fn().mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => 
      useMutation(mockMutationFunction)
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await result.current.mutate('test-arg');
    });

    expect(mockMutationFunction).toHaveBeenCalledWith('test-arg');
    expect(result.current.loading).toBe(false);
    expect(mockToast.success).toHaveBeenCalledWith('Opération réussie');
  });

  test('gère les erreurs de mutation', async () => {
    const mockError = new Error('Mutation Error');
    const mockMutationFunction = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => 
      useMutation(mockMutationFunction)
    );

    await act(async () => {
      try {
        await result.current.mutate();
      } catch (error) {
        // L'erreur est attendue
      }
    });

    expect(result.current.error).toBe('Mutation Error');
    expect(mockToast.error).toHaveBeenCalledWith('Mutation Error');
  });
});

