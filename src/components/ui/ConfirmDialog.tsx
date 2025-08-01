// import Swal from 'sweetalert2';

// interface ConfirmDialogOptions {
//   title: string;
//   text?: string;
//   icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
//   confirmButtonText?: string;
//   cancelButtonText?: string;
//   confirmButtonColor?: string;
//   cancelButtonColor?: string;
// }

// export const showConfirmDialog = async (options: ConfirmDialogOptions): Promise<boolean> => {
//   const {
//     title,
//     text = '',
//     icon = 'question',
//     confirmButtonText = 'Confirmar',
//     cancelButtonText = 'Cancelar',
//     confirmButtonColor = '#3085d6',
//     cancelButtonColor = '#d33'
//   } = options;

//   const result = await Swal.fire({
//     title,
//     text,
//     icon,
//     showCancelButton: true,
//     confirmButtonColor,
//     cancelButtonColor,
//     confirmButtonText,
//     cancelButtonText,
//     reverseButtons: true,
//     customClass: {
//       popup: 'rounded-lg',
//       confirmButton: 'rounded-md px-4 py-2 mx-2',
//       cancelButton: 'rounded-md px-4 py-2 mx-2'
//     }
//   });

//   return result.isConfirmed;
// };

// export const showSuccessAlert = async (title: string, text?: string): Promise<void> => {
//   await Swal.fire({
//     title,
//     text,
//     icon: 'success',
//     confirmButtonText: 'OK',
//     confirmButtonColor: '#10b981',
//     customClass: {
//       popup: 'rounded-lg',
//       confirmButton: 'rounded-md px-4 py-2'
//     }
//   });
// };

// export const showErrorAlert = async (title: string, text?: string): Promise<void> => {
//   await Swal.fire({
//     title,
//     text,
//     icon: 'error',
//     confirmButtonText: 'OK',
//     confirmButtonColor: '#ef4444',
//     customClass: {
//       popup: 'rounded-lg',
//       confirmButton: 'rounded-md px-4 py-2'
//     }
//   });
// };

// export const showInfoAlert = async (title: string, text?: string): Promise<void> => {
//   await Swal.fire({
//     title,
//     text,
//     icon: 'info',
//     confirmButtonText: 'OK',
//     confirmButtonColor: '#3b82f6',
//     customClass: {
//       popup: 'rounded-lg',
//       confirmButton: 'rounded-md px-4 py-2'
//     }
//   });
// };

// // Hook personalizado para usar os dialogs
// export const useConfirmDialog = () => {
//   return {
//     showConfirmDialog,
//     showSuccessAlert,
//     showErrorAlert,
//     showInfoAlert
//   };
// };

import Swal from 'sweetalert2';

// --- Interfaces ---
interface ConfirmDialogOptions {
  title: string;
  text?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

interface LoadingOptions {
  title?: string;
  text?: string;
}

// --- Funções Auxiliares (mantidas as suas originais) ---
export const showConfirmDialog = async (
  options: ConfirmDialogOptions
): Promise<boolean> => {
  const {
    title,
    text = '',
    icon = 'question',
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    confirmButtonColor = '#3085d6',
    cancelButtonColor = '#d33',
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
      cancelButton: 'rounded-md px-4 py-2 mx-2',
    },
  });

  return result.isConfirmed;
};

export const showSuccessAlert = async (
  title: string,
  text?: string
): Promise<void> => {
  await Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#10b981',
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md px-4 py-2',
    },
  });
};

export const showErrorAlert = async (
  title: string,
  text?: string
): Promise<void> => {
  await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md px-4 py-2',
    },
  });
};

export const showInfoAlert = async (
  title: string,
  text?: string
): Promise<void> => {
  await Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'rounded-md px-4 py-2',
    },
  });
};

// --- Nova Função Centralizada ---
/**
 * Exibe um diálogo de confirmação, e se confirmado, mostra um loading
 * enquanto executa uma função assíncrona, e então exibe o resultado
 * (sucesso ou erro) usando os seus alertas existentes.
 *
 * @param confirmOptions Opções para o diálogo de confirmação do SweetAlert2.
 * @param action Função assíncrona a ser executada se o usuário confirmar.
 * @param loadingOptions Opções para o diálogo de loading (título e texto).
 * @returns Promise<boolean> Retorna true se a ação foi confirmada e executada com sucesso, false caso contrário.
 */
export const executeWithConfirmationAndLoading = async (
  confirmOptions: ConfirmDialogOptions,
  action: () => Promise<any>, // A função que contém sua lógica assíncrona
  loadingOptions: LoadingOptions = {} // Opções padrão para o loading
): Promise<boolean> => {
  const {
    title: loadingTitle = 'Processando...',
    text: loadingText = 'Por favor, aguarde...',
  } = loadingOptions;

  // 1. Exibir o diálogo de confirmação (usando a sua função showConfirmDialog)
  const confirmed = await showConfirmDialog(confirmOptions);

  if (!confirmed) {
    // Usuário cancelou
    return false;
  }

  // 2. Se confirmado, exibir o loading
  Swal.fire({
    title: loadingTitle,
    text: loadingText,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // 3. Executar a ação assíncrona
  try {
    await action(); // Executa a função passada
    Swal.close(); // Fecha o loading

    // 4. Mostrar alerta de sucesso (usando a sua função showSuccessAlert)
    await showSuccessAlert(
      confirmOptions.title || 'Sucesso!',
      'Operação concluída com êxito.'
    );

    return true; // Ação confirmada e executada com sucesso
  } catch (error: any) {
    Swal.close(); // Fecha o loading

    // 5. Mostrar alerta de erro (usando a sua função showErrorAlert)
    await showErrorAlert(
      confirmOptions.title || 'Erro!',
      error.message || 'Ocorreu um erro inesperado.'
    );
    console.error('Erro na operação:', error);
    return false; // Ação falhou
  }
};

// --- Hook Personalizado Atualizado ---
export const useConfirmDialog = () => {
  return {
    showConfirmDialog,
    showSuccessAlert,
    showErrorAlert,
    showInfoAlert,
    // Adicionamos a nova função ao hook
    executeWithConfirmationAndLoading,
  };
};
