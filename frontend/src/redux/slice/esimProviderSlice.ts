import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface EsimProviderState {
    esim_provider: string | null;
}

const initialState: EsimProviderState = {
    esim_provider: null
};

const esimProviderSlice = createSlice({
    name: 'esimProvider',
    initialState,
    reducers: {
        setEsimProvider: (state, action: PayloadAction<string | null>) => {
            state.esim_provider = action.payload;
        },
        clearEsimProvider: (state) => {
            state.esim_provider = null;
        }
    }
});

export const { setEsimProvider, clearEsimProvider } = esimProviderSlice.actions;
export default esimProviderSlice.reducer;
