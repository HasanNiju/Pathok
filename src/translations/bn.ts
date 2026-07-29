/**
 * Bangla dictionary. Key shape must always mirror en.ts exactly —
 * the translation type is derived from English (see translation-context.tsx).
 */
import type en from "./en";

const bn: typeof en = {
  app: {
    name: "পাঠক",
  },
  shell: {
    sidebarPlaceholder: "নেভিগেশন",
    topbarPlaceholder: "পাঠক",
    comingSoon: "এই অংশটি এখনো তৈরি হয়নি",
  },
  theme: {
    light: "হালকা",
    dark: "গাঢ়",
    system: "সিস্টেম",
  },
  language: {
    label: "ভাষা",
  },
  common: {
    close: "বন্ধ করুন",
    dismiss: "খারিজ করুন",
    previous: "পূর্ববর্তী",
    next: "পরবর্তী",
    searchPlaceholder: "খুঁজুন",
    clear: "মুছুন",
    loading: "লোড হচ্ছে",
  },
  auth: {
    nav: {
      login: "লগ ইন",
      logout: "লগ আউট",
      account: "অ্যাকাউন্ট",
    },
    login: {
      title: "আবার স্বাগতম",
      description: "পড়া চালিয়ে যেতে লগ ইন করুন।",
      emailLabel: "ইমেইল",
      emailPlaceholder: "you@example.com",
      passwordLabel: "পাসওয়ার্ড",
      passwordPlaceholder: "আপনার পাসওয়ার্ড লিখুন",
      rememberMe: "মনে রাখুন",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      submit: "লগ ইন",
      noAccount: "অ্যাকাউন্ট নেই?",
      signupLink: "সাইন আপ করুন",
      demoAccounts: "ডেমো অ্যাকাউন্ট: admin@pathok.app / Admin@123 · user@pathok.app / User@123",
    },
    signup: {
      title: "অ্যাকাউন্ট তৈরি করুন",
      description: "কয়েক সেকেন্ডে পড়া শুরু করুন।",
      nameLabel: "পুরো নাম",
      namePlaceholder: "আপনার নাম",
      emailLabel: "ইমেইল",
      emailPlaceholder: "you@example.com",
      passwordLabel: "পাসওয়ার্ড",
      passwordPlaceholder: "একটি পাসওয়ার্ড তৈরি করুন",
      confirmPasswordLabel: "পাসওয়ার্ড নিশ্চিত করুন",
      confirmPasswordPlaceholder: "পাসওয়ার্ড আবার লিখুন",
      submit: "সাইন আপ",
      haveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
      loginLink: "লগ ইন করুন",
    },
    forgotPassword: {
      title: "পাসওয়ার্ড রিসেট করুন",
      description: "আপনার ইমেইল দিন, আমরা একটি ভেরিফিকেশন কোড পাঠাব।",
      emailLabel: "ইমেইল",
      emailPlaceholder: "you@example.com",
      submit: "কোড পাঠান",
      backToLogin: "লগ ইনে ফিরে যান",
    },
    resetPassword: {
      title: "নতুন পাসওয়ার্ড সেট করুন",
      description: "আপনার অ্যাকাউন্টের জন্য একটি নতুন পাসওয়ার্ড বেছে নিন।",
      newPasswordLabel: "নতুন পাসওয়ার্ড",
      confirmPasswordLabel: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
      submit: "পাসওয়ার্ড রিসেট করুন",
    },
    otp: {
      title: "ভেরিফিকেশন কোড লিখুন",
      description: "আমরা {email}-এ একটি ৬-সংখ্যার কোড পাঠিয়েছি।",
      verify: "ভেরিফাই করুন",
      resend: "কোড আবার পাঠান",
      resendIn: "{seconds} সেকেন্ডে আবার পাঠান",
      changeEmail: "ভুল ইমেইল?",
      demoHint: "ডেমো মোড — কোনো প্রকৃত ইমেইল পাঠানো হয় না। আপনার কোড নোটিফিকেশনে দেখানো হয়েছে।",
    },
    verifyEmail: {
      title: "ইমেইল ভেরিফাই হয়েছে",
      description: "আপনার ইমেইল সফলভাবে ভেরিফাই হয়েছে। এখন আপনি লগ ইন করতে পারেন।",
      continueButton: "লগ ইনে যান",
    },
    account: {
      title: "অ্যাকাউন্ট",
      roleLabel: "ভূমিকা",
      statusLabel: "ইমেইল অবস্থা",
      verified: "ভেরিফাইড",
      notVerified: "ভেরিফাই হয়নি",
      logout: "লগ আউট",
      adminPanelTitle: "অ্যাডমিন টুলস",
      adminPanelDescription: "এই অংশটি শুধুমাত্র অ্যাডমিন ভূমিকার জন্য দৃশ্যমান।",
    },
    roles: {
      guest: "গেস্ট",
      user: "পাঠক",
      admin: "অ্যাডমিন",
    },
    password: {
      show: "পাসওয়ার্ড দেখান",
      hide: "পাসওয়ার্ড লুকান",
      strength: "শক্তি",
      strengthLabels: {
        weak: "দুর্বল",
        fair: "মোটামুটি",
        good: "ভালো",
        strong: "শক্তিশালী",
      },
    },
    validation: {
      required: "এই ঘরটি আবশ্যক",
      nameRequired: "আপনার নাম লিখুন",
      emailInvalid: "একটি সঠিক ইমেইল ঠিকানা দিন",
      passwordWeak: "৮+ অক্ষর, বড়-ছোট হাতের অক্ষর ও একটি সংখ্যা ব্যবহার করুন",
      passwordMismatch: "পাসওয়ার্ড মিলছে না",
      otpInvalid: "৬-সংখ্যার কোড লিখুন",
    },
    errors: {
      invalidCredentials: "ভুল ইমেইল অথবা পাসওয়ার্ড",
      emailExists: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে",
      emailNotVerified: "লগ ইন করার আগে আপনার ইমেইল ভেরিফাই করুন",
      userNotFound: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি",
      invalidOtp: "আপনি যে কোডটি দিয়েছেন তা সঠিক নয়",
      otpExpired: "এই কোডের মেয়াদ শেষ হয়ে গেছে। আবার একটি নিন",
      otpNotVerified: "প্রথমে কোডটি ভেরিফাই করুন",
      generic: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন",
    },
    toasts: {
      signupSuccess: "অ্যাকাউন্ট তৈরি হয়েছে — চালিয়ে যেতে ইমেইল ভেরিফাই করুন",
      otpSent: "ভেরিফিকেশন কোড পাঠানো হয়েছে",
      otpResent: "একটি নতুন কোড পাঠানো হয়েছে",
      emailVerified: "ইমেইল সফলভাবে ভেরিফাই হয়েছে",
      passwordResetSuccess: "পাসওয়ার্ড রিসেট হয়েছে — এখন লগ ইন করতে পারেন",
      loggedOut: "লগ আউট হয়েছে",
      welcomeBack: "আবার স্বাগতম",
    },
  },
};

export default bn;
