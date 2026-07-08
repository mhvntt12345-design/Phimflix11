// ============================================
// PHIMFLIX - Firebase Configuration
// ============================================

// 1. Dán mã cấu hình Firebase của bạn vào đây:
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCkoTtO-YMKeOhdW0g6wf0X4ftJ7BesKJE",
  authDomain: "phimflix-1df8a.firebaseapp.com",
  databaseURL: "https://phimflix-1df8a-default-rtdb.firebaseio.com",
  projectId: "phimflix-1df8a",
  storageBucket: "phimflix-1df8a.firebasestorage.app",
  messagingSenderId: "954824375170",
  appId: "1:954824375170:web:7fe05d88f685e9b34ded9b",
  measurementId: "G-LB19RPC1BE"
};

// Hàm kiểm tra xem Firebase đã được cấu hình chưa
window.isFirebaseConfigured = function() {
    return window.FIREBASE_CONFIG && 
           window.FIREBASE_CONFIG.apiKey && 
           window.FIREBASE_CONFIG.apiKey.length > 5;
};
