import { dialogText } from '@/data/ui';
import { cx } from '@/lib/cx';
import s from './Dialog.module.css';

type ConfirmOptions = {
  title: string;
  /** Texte brut : jamais interprété comme du HTML. */
  text?: string;
  confirmText?: string;
  cancelText?: string;
  /** Action destructrice (« Supprimer ») : bouton de confirmation rouge. */
  danger?: boolean;
};

/**
 * Confirmation dans une boîte SweetAlert aux couleurs EVENTHEME.
 *
 * Remplace `window.confirm` : le site n'utilise jamais les alertes natives du
 * navigateur. SweetAlert est chargé à la demande pour ne pas alourdir les
 * pages qui n'en ont pas besoin. Le focus part sur « Annuler » : une touche
 * Entrée machinale ne déclenche pas une action destructrice.
 */
export async function confirmDialog({
  title,
  text,
  confirmText = dialogText.confirm,
  cancelText = dialogText.cancel,
  danger = false,
}: ConfirmOptions): Promise<boolean> {
  const { default: Swal } = await import('sweetalert2');
  const { isConfirmed } = await Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: true,
    buttonsStyling: false,
    heightAuto: false,
    backdrop: 'rgba(5, 5, 5, 0.82)',
    customClass: {
      popup: s.popup,
      title: s.title,
      htmlContainer: s.text,
      actions: s.actions,
      confirmButton: cx(s.button, danger ? s.danger : s.confirm),
      cancelButton: cx(s.button, s.cancel),
    },
    showClass: { popup: s.show },
    hideClass: { popup: s.hide },
  });
  return isConfirmed;
}
