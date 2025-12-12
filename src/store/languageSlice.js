import { createSlice } from '@reduxjs/toolkit';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = {
  zh: '中文',
  en: 'English',

};

// 从 localStorage 获取初始语言，默认为中文
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('app-language');
  return savedLanguage && SUPPORTED_LANGUAGES[savedLanguage] ? savedLanguage : 'zh';
};

// 语言切片
const languageSlice = createSlice({
  name: 'language',
  initialState: {
    currentLanguage: getInitialLanguage(),
  },
  reducers: {
    // 切换语言
    setLanguage: (state, action) => {
      const newLanguage = action.payload;
      if (SUPPORTED_LANGUAGES[newLanguage]) {
        state.currentLanguage = newLanguage;
        localStorage.setItem('app-language', newLanguage);
      }
      // 忽略不支持的语言
    },
    
    // 重置语言状态
    resetLanguage: (state) => {
      state.currentLanguage = 'zh';
      localStorage.setItem('app-language', 'zh');
    }
  }
});

// 导出 actions
export const { 
  setLanguage, 
  setLoading, 
  clearError, 
  resetLanguage 
} = languageSlice.actions;

// 选择器
export const selectCurrentLanguage = (state) => state.language.currentLanguage;
export const selectLanguageLoading = (state) => state.language.isLoading;
export const selectLanguageError = (state) => state.language.error;
export const selectSupportedLanguages = () => SUPPORTED_LANGUAGES;

// 导出 reducer
export default languageSlice.reducer;
