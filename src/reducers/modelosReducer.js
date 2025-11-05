
export const modelosReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODELOS':
      return action.payload;
    case 'ADD_MODELO':
      return [...state, action.payload];
    case 'UPDATE_MODELO':
      return state.map((modelo) =>
        modelo.id === action.payload.id ? action.payload : modelo
      );
    case 'DELETE_MODELO':
      return state.filter((modelo) => modelo.id !== action.payload);
    default:
      return state;
  }
};
