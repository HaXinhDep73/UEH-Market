export type Lang = 'vi' | 'en';

export const translations: Record<
  Lang,
  {
    navbar: {
      home: string;
      categories: string;
      admin: string;
      logout: string;
      categoriesLabelMobile: string;
      adminDashboardMobile: string;
    };
    login: {
      welcomeBack: string;
      createAccount: string;
      signInHelper: string;
      signUpHelper: string;
      studentEmail: string;
      password: string;
      mustEndWith: string;
      forgot: string;
      toggleSignUp: string;
      toggleSignIn: string;
      signInSubmitting: string;
      signUpSubmitting: string;
      signIn: string;
      signUp: string;
      onlyUehStudents: string;
    };
  }
> = {
  vi: {
    navbar: {
      home: 'Trang chủ',
      categories: 'Danh mục',
      admin: 'Admin',
      logout: 'Đăng xuất',
      categoriesLabelMobile: 'Danh mục',
      adminDashboardMobile: 'Bảng điều khiển Admin',
    },
    login: {
      welcomeBack: 'Chào mừng trở lại',
      createAccount: 'Tạo tài khoản',
      signInHelper: 'Đăng nhập với email sinh viên UEH để tiếp tục.',
      signUpHelper: 'Đăng ký với email sinh viên UEH để bắt đầu.',
      studentEmail: 'Email sinh viên',
      password: 'Mật khẩu',
      mustEndWith: 'Phải kết thúc bằng @st.ueh.edu.vn',
      forgot: 'Quên mật khẩu?',
      toggleSignUp: 'Đăng ký',
      toggleSignIn: 'Đăng nhập',
      signInSubmitting: 'Đang đăng nhập...',
      signUpSubmitting: 'Đang tạo tài khoản...',
      signIn: 'Đăng nhập',
      signUp: 'Đăng ký',
      onlyUehStudents: 'Chỉ tài khoản sinh viên UEH có email hợp lệ ',
    },
  },
  en: {
    navbar: {
      home: 'Home',
      categories: 'Categories',
      admin: 'Admin',
      logout: 'Logout',
      categoriesLabelMobile: 'Categories',
      adminDashboardMobile: 'Admin Dashboard',
    },
    login: {
      welcomeBack: 'Welcome back',
      createAccount: 'Create your account',
      signInHelper: 'Sign in with your UEH student email to continue.',
      signUpHelper: 'Sign up with your UEH student email to get started.',
      studentEmail: 'Student Email',
      password: 'Password',
      mustEndWith: 'Must end with @st.ueh.edu.vn',
      forgot: 'Forgot password?',
      toggleSignUp: 'Sign Up',
      toggleSignIn: 'Sign In',
      signInSubmitting: 'Signing in...',
      signUpSubmitting: 'Creating account...',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      onlyUehStudents: 'Only UEH student accounts with a valid ',
    },
  },
};

