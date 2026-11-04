"use client";

import { AssignPersonModal } from "./AssignPersonModal";

interface AddToCommitteeModalProps { isOpen: boolean; onClose: () => void; }

export function AddToCommitteeModal({ isOpen, onClose }: AddToCommitteeModalProps) {
  return <AssignPersonModal isOpen={isOpen} onClose={onClose} scope="club" />;
}
