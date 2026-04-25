import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  formData: {
    hcp_name: '',
    interaction_date: new Date().toISOString().split('T')[0],
    interaction_type: 'meeting',
    products_discussed: '',
    sentiment: 'neutral',
    outcomes: '',
    follow_up_actions: '',
  },
  chatMessages: [],
  extractedData: null,
  loading: false,
  savedInteractions: [],
}

const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload
      state.formData[field] = value
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload)
    },
    setExtractedData: (state, action) => {
      state.extractedData = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    resetForm: (state) => {
      state.formData = initialState.formData
      state.chatMessages = []
      state.extractedData = null
    },
    setSavedInteractions: (state, action) => {
      state.savedInteractions = action.payload
    },
  },
})

export const {
  updateFormField,
  setFormData,
  addChatMessage,
  setExtractedData,
  setLoading,
  resetForm,
  setSavedInteractions,
} = interactionSlice.actions

export default interactionSlice.reducer