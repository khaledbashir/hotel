import { create } from "zustand";
import type { HotelContract } from "@/lib/schemas/contract-schema";

interface ContractState {
  contract: HotelContract | null;
  pdfFile: File | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setContract: (contract: HotelContract) => void;
  setPdfFile: (file: File) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateContract: (updates: Partial<HotelContract>) => void;
  reset: () => void;
}

export const useContractStore = create<ContractState>((set) => ({
  contract: null,
  pdfFile: null,
  isLoading: false,
  error: null,
  
  setContract: (contract) => set({ contract, error: null }),
  setPdfFile: (file) => set({ pdfFile: file }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  updateContract: (updates) => 
    set((state) => ({
      contract: state.contract ? { ...state.contract, ...updates } : null,
    })),
  reset: () => set({ contract: null, pdfFile: null, isLoading: false, error: null }),
}));
