import Swal from 'sweetalert2';

interface ConfirmDialogOptions {
  title: string;
  text?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

export const showConfirmDialog = async (options: ConfirmDialogOptions): Promise<boolean> => {
  const {
    title,
    text = '',
    icon = 'question',
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    confirmButtonColor = '#3085d6',
    cancelButtonColor = '#d33'
  } = options;

  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md px-4 py-2 mx-2',
      cancelButton: 'rounded-md px-4 py-2 mx-2'
    }
  });

  return result.isConfirmed;
};

export const showSuccessAlert = async (title: string, text?: string): Promise<void> => {
  await Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#10b981',
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md px-4 py-2'
    }
  });
};

export const showErrorAlert = async (title: string, text?: string): Promise<void> => {
  await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md px-4 py-2'
    }
  });
};

export const showInfoAlert = async (title: string, text?: string): Promise<void> => {
  await Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md px-4 py-2'
    }
  });
};

// Hook personalizado para usar os dialogs
export const useConfirmDialog = () => {
  return {
    showConfirmDialog,
    showSuccessAlert,
    showErrorAlert,
    showInfoAlert
  };
};

