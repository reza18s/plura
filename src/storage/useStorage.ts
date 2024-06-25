import { Agency, User } from "@prisma/client";
import React from "react";
import { create } from "zustand";
type userModel = {
  user?: User;
  agency?: Agency;
};
type modelDate = {
  data?: userModel | {};
  isOpen: boolean;
  isLoading: boolean;
  showModal: React.ReactNode;
  setOpen: (modal: React.ReactNode, fetchDate?: () => Promise<any>) => void;
  setClose: () => void;
};
const useStore = create<modelDate>((set, get) => ({
  date: {},
  isOpen: false,
  isLoading: false,
  showModal: null,
  setOpen: async (modal, fetchDate) => {
    if (modal) {
      set((state) => ({ isLoading: true }));
      if (fetchDate) {
        const newData = await fetchDate();
        set((state) => ({ data: { ...state.data, ...newData } || {} }));
      }
      set((state) => ({ showModal: modal, isOpen: true, isLoading: false }));
    }
  },
  setClose: () => set((state) => ({ isOpen: false, data: {} })),
}));
export default useStore;
