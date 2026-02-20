// global.js - Bridge between HTML onclick and module functions
import { switchAuthTab, togglePassword, showForgotPassword, showTerms, continueAsGuest, socialLogin, sendResetLink } from './main.js';

// Make functions globally available
window.switchAuthTab = switchAuthTab;
window.togglePassword = togglePassword;
window.showForgotPassword = showForgotPassword;
window.showTerms = showTerms;
window.continueAsGuest = continueAsGuest;
window.socialLogin = socialLogin;
window.sendResetLink = sendResetLink;