import { useState } from 'react';

export function useMediaModal<T extends { url: string; caption?: string }>(items: T[]) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const openModal = (idx: number) => {
    setModalOpen(true);
    setModalIndex(idx);
  };
  const closeModal = () => setModalOpen(false);
  const prevModal = () => setModalIndex(i => (i > 0 ? i - 1 : i));
  const nextModal = () => setModalIndex(i => (i < items.length - 1 ? i + 1 : i));

  return {
    modalOpen,
    modalIndex,
    openModal,
    closeModal,
    prevModal,
    nextModal,
    modalItem: items[modalIndex],
    hasPrev: modalIndex > 0,
    hasNext: modalIndex < items.length - 1,
  };
}
