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
      postListing: string;
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
    categories: Record<
      string,
      { name: string; description: string }
    >;
    home: {
      anniversaryBadge: string;
      heroTitle1: string;
      heroTitle2: string;
      heroTitle3: string;
      heroDesc: string;
      startShopping: string;
      browseCategories: string;
      statStudents: string;
      statVerified: string;
      statRating: string;
      categoriesTitle: string;
      categoriesDesc: string;
      shopNow: string;
      recentTitle: string;
      recentDesc: string;
      viewAll: string;
      loadingListings: string;
      noListingsTitle: string;
      noListingsDesc: string;
      trustTitle: string;
      trustDesc: string;
      trustVerified: string;
      trustApproved: string;
      trustRatings: string;
    };
    footer: {
      tagline: string;
      description: string;
      onlyAccounts: string;
      rulesTitle: string;
      rules: string[];
      supportTitle: string;
      phoneLabel: string;
      emailLabel: string;
      supportHoursTitle: string;
      supportHoursWeekday: string;
      supportHoursSat: string;
      copyright: string;
      adminPortal: string;
      terms: string;
      privacy: string;
    };
    admin: {
      title: string;
      subtitle: string;
      pendingProducts: string;
      pendingRatings: string;
      tabProducts: string;
      tabRatings: string;
      tabUsers: string;
      filterLabel: string;
      filterAll: string;
      filterPending: string;
      filterApproved: string;
      filterRejected: string;
      itemsOf: string;
      colProduct: string;
      colSeller: string;
      colCategory: string;
      colPrice: string;
      colSubmitted: string;
      colStatus: string;
      colActions: string;
      colReviewer: string;
      colRating: string;
      colComment: string;
      approve: string;
      reject: string;
      undo: string;
      deleteProduct: string;
      confirmDeleteProduct: string;
      noProducts: string;
      noRatings: string;
      badgeApproved: string;
      badgeRejected: string;
      badgePending: string;
      lowRating: string;
      legendLowRating: string;
      legendUndo: string;
      // Users tab
      colUser: string;
      colRole: string;
      colEmail: string;
      assignPermissions: string;
      revokeAccess: string;
      noUsers: string;
      totalUsers: string;
      roleAdmin: string;
      roleUser: string;
      masterAdmin: string;
      noAdminAccess: string;
      // Permissions modal
      permModalTitle: string;
      permModalSubtitle: string;
      permManageProducts: string;
      permManageProductsDesc: string;
      permManageRatings: string;
      permManageRatingsDesc: string;
      permManageUsers: string;
      permManageUsersDesc: string;
      permManageUsersLocked: string;
      permSave: string;
      permCancel: string;
      permSaving: string;
      permNoneWarning: string;
      // Content (Policies) tab
      tabContent: string;
      cmsTitle: string;
      cmsNewPolicy: string;
      cmsEditPolicy: string;
      cmsSave: string;
      cmsCancel: string;
      cmsSaving: string;
      cmsSlug: string;
      cmsSlugHint: string;
      cmsPageTitle: string;
      cmsContent: string;
      cmsDelete: string;
      cmsConfirmDelete: string;
      cmsNoPolicy: string;
      cmsLastUpdated: string;
    };
    postListing: {
      title: string;
      subtitle: string;
      fieldTitle: string;
      fieldTitlePlaceholder: string;
      fieldDesc: string;
      fieldDescPlaceholder: string;
      fieldPrice: string;
      fieldPricePlaceholder: string;
      fieldCategory: string;
      fieldCategoryPlaceholder: string;
      fieldCondition: string;
      fieldConditionNew: string;
      fieldConditionUsed: string;
      fieldPhone: string;
      fieldPhonePlaceholder: string;
      fieldImages: string;
      fieldImagesHint: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successDesc: string;
      cancel: string;
      errorRequired: string;
      errorImageSize: string;
    };
    common: {
      conditions: Record<string, string>;
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
      postListing: 'Đăng tin',
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
    categories: {
      agriculture: {
        name: 'Nông sản',
        description: 'Sản phẩm tươi & hàng nông trại',
      },
      food: {
        name: 'Thực phẩm',
        description: 'Món ăn tự nấu & sẵn dùng',
      },
      'home-appliances': {
        name: 'Đồ gia dụng',
        description: 'Điện tử & đồ dùng gia đình',
      },
      cosmetics: {
        name: 'Mỹ phẩm',
        description: 'Làm đẹp & chăm sóc cá nhân',
      },
      'university-merch': {
        name: 'Đồ UEH',
        description: 'Sản phẩm thương hiệu UEH chính hãng',
      },
    },
    home: {
      anniversaryBadge: '1976 – 2026 · Kỷ niệm 50 năm',
      heroTitle1: '50 Năm Đào Tạo',
      heroTitle2: 'Những Nhà Kinh Tế',
      heroTitle3: 'Hàng Đầu Việt Nam',
      heroDesc:
        'Thành lập năm 1976, Đại học Kinh tế TP.HCM (UEH) đã đào tạo nhiều thế hệ lãnh đạo doanh nghiệp. Nay, chợ sinh viên của chúng ta cho phép bạn giao dịch an toàn và tự tin trong cộng đồng UEH.',
      startShopping: 'Bắt đầu mua sắm',
      browseCategories: 'Xem danh mục',
      statStudents: 'Sinh viên',
      statVerified: 'Email xác thực',
      statRating: 'Đánh giá TB',
      categoriesTitle: 'Khám phá danh mục',
      categoriesDesc: 'Tìm hiểu những gì các bạn sinh viên UEH đang rao bán qua 5 danh mục chọn lọc.',
      shopNow: 'Xem ngay',
      recentTitle: 'Tin đăng mới nhất',
      recentDesc: 'Sản phẩm mới nhất từ các bạn sinh viên',
      viewAll: 'Xem tất cả',
      loadingListings: 'Đang tải bài đăng...',
      noListingsTitle: 'Chưa có sản phẩm mới',
      noListingsDesc: 'Hãy quay lại sau để xem thêm bài đăng.',
      trustTitle: 'Giao dịch an toàn trong cộng đồng UEH',
      trustDesc:
        'Mỗi người bán đều là sinh viên UEH đã xác thực. Tất cả tin đăng đều được admin xét duyệt trước khi hiển thị. Sân trường của bạn, chợ của bạn.',
      trustVerified: 'Sinh viên\nXác thực',
      trustApproved: 'Admin\nDuyệt',
      trustRatings: 'Đánh giá\nTừ cộng đồng',
    },
    footer: {
      tagline: 'Chợ sinh viên – Est. 2026',
      description:
        'Nền tảng mua bán đáng tin cậy dành riêng cho sinh viên UEH. Mua, bán và kết nối với các bạn sinh viên Kinh tế trên mọi cơ sở.',
      onlyAccounts: 'Chỉ tài khoản @st.ueh.edu.vn được phép',
      rulesTitle: 'Quy tắc & Chính sách',
      rules: [
        'Quy tắc cộng đồng',
        'Quy định đăng tin',
        'Chính sách đánh giá',
        'Mặt hàng bị cấm',
        'Giải quyết tranh chấp',
        'Chính sách bảo mật',
      ],
      supportTitle: 'Hỗ trợ & Hotline',
      phoneLabel: 'Điện thoại / Zalo',
      emailLabel: 'Email',
      supportHoursTitle: 'Giờ hỗ trợ',
      supportHoursWeekday: 'T2 – T6: 8:00 SA – 5:00 CH',
      supportHoursSat: 'T7: 8:00 SA – 12:00 TT',
      copyright: '© 2026 UEH Market. Đại học Kinh tế TP.HCM (UEH).',
      adminPortal: 'Cổng Admin',
      terms: 'Điều khoản',
      privacy: 'Bảo mật',
    },
    admin: {
      title: 'Bảng điều khiển Admin',
      subtitle: 'Xem xét và kiểm duyệt tin đăng & đánh giá của sinh viên.',
      pendingProducts: 'Sản phẩm chờ duyệt',
      pendingRatings: 'Đánh giá chờ duyệt',
      tabProducts: 'Quản lý duyệt tin',
      tabRatings: 'Quản lý đánh giá',
      tabUsers: 'Quản lý tài khoản',
      filterLabel: 'Lọc:',
      filterAll: 'Tất cả',
      filterPending: 'Chờ duyệt',
      filterApproved: 'Đã duyệt',
      filterRejected: 'Từ chối',
      itemsOf: 'trong',
      colProduct: 'Sản phẩm',
      colSeller: 'Người bán',
      colCategory: 'Danh mục',
      colPrice: 'Giá',
      colSubmitted: 'Ngày gửi',
      colStatus: 'Trạng thái',
      colActions: 'Thao tác',
      colReviewer: 'Người đánh giá',
      colRating: 'Điểm',
      colComment: 'Bình luận',
      approve: 'Duyệt',
      reject: 'Từ chối',
      undo: 'Hoàn tác',
      deleteProduct: 'Xóa',
      confirmDeleteProduct: 'Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      noProducts: 'Không có sản phẩm nào để hiển thị',
      noRatings: 'Không có đánh giá nào để hiển thị',
      badgeApproved: 'Đã duyệt',
      badgeRejected: 'Từ chối',
      badgePending: 'Chờ duyệt',
      lowRating: 'Điểm thấp',
      legendLowRating: 'Hàng có điểm thấp (≤2★) được tô màu đỏ',
      legendUndo: 'Thao tác có thể hoàn tác trước khi tải lại trang',
      colUser: 'Người dùng',
      colRole: 'Vai trò',
      colEmail: 'Email',
      assignPermissions: 'Phân quyền',
      revokeAccess: 'Thu hồi quyền',
      noUsers: 'Không có người dùng nào',
      totalUsers: 'tổng số người dùng',
      roleAdmin: 'Admin',
      roleUser: 'Người dùng',
      masterAdmin: 'Quản trị viên gốc',
      noAdminAccess: 'Không có quyền truy cập',
      permModalTitle: 'Phân quyền quản trị',
      permModalSubtitle: 'Chọn các quyền bạn muốn cấp cho người dùng này.',
      permManageProducts: 'Duyệt tin đăng',
      permManageProductsDesc: 'Xét duyệt và phê duyệt/từ chối tin đăng sản phẩm',
      permManageRatings: 'Duyệt đánh giá',
      permManageRatingsDesc: 'Xét duyệt và phê duyệt/từ chối đánh giá từ người mua',
      permManageUsers: 'Quản lý tài khoản',
      permManageUsersDesc: 'Xem danh sách và phân quyền cho người dùng khác',
      permManageUsersLocked: 'Bạn không có quyền cấp quyền này',
      permSave: 'Lưu phân quyền',
      permCancel: 'Hủy',
      permSaving: 'Đang lưu...',
      permNoneWarning: 'Bỏ chọn tất cả sẽ thu hồi quyền admin của người dùng.',
      tabContent: 'Nội dung',
      cmsTitle: 'Quản lý nội dung chính sách',
      cmsNewPolicy: 'Thêm chính sách',
      cmsEditPolicy: 'Sửa chính sách',
      cmsSave: 'Lưu',
      cmsCancel: 'Hủy',
      cmsSaving: 'Đang lưu...',
      cmsSlug: 'Đường dẫn (slug)',
      cmsSlugHint: 'Chỉ dùng chữ thường, số và dấu gạch ngang',
      cmsPageTitle: 'Tiêu đề trang',
      cmsContent: 'Nội dung',
      cmsDelete: 'Xóa',
      cmsConfirmDelete: 'Bạn có chắc muốn xóa chính sách này?',
      cmsNoPolicy: 'Chưa có chính sách nào. Nhấn "Thêm chính sách" để tạo mới.',
      cmsLastUpdated: 'Cập nhật lần cuối',
    },
    postListing: {
      title: 'Đăng tin mới',
      subtitle: 'Điền thông tin sản phẩm bạn muốn bán',
      fieldTitle: 'Tiêu đề',
      fieldTitlePlaceholder: 'Ví dụ: Quạt mini Điều Hòa Xiaomi còn mới',
      fieldDesc: 'Mô tả',
      fieldDescPlaceholder: 'Mô tả tình trạng, xuất xứ, lý do bán...',
      fieldPrice: 'Giá (VNĐ)',
      fieldPricePlaceholder: 'Ví dụ: 150000',
      fieldCategory: 'Danh mục',
      fieldCategoryPlaceholder: 'Chọn danh mục',
      fieldCondition: 'Tình trạng',
      fieldConditionNew: 'Mới',
      fieldConditionUsed: 'Đã qua sử dụng',
      fieldPhone: 'Số điện thoại / Zalo',
      fieldPhonePlaceholder: 'Ví dụ: 0901234567',
      fieldImages: 'Hình ảnh sản phẩm',
      fieldImagesHint: 'Tối đa 5 ảnh, mỗi ảnh dưới 5MB (JPG, PNG, WEBP)',
      submit: 'Đăng tin',
      submitting: 'Đang đăng...',
      successTitle: 'Đăng tin thành công!',
      successDesc: 'Tin của bạn đang chờ admin duyệt. Chúng tôi sẽ xem xét trong thời gian sớm nhất.',
      cancel: 'Hủy',
      errorRequired: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
      errorImageSize: 'Ảnh quá lớn. Mỗi ảnh phải dưới 5MB.',
    },
    common: {
      conditions: {
        New: 'Mới',
        'Like New': 'Như mới',
        Used: 'Đã qua sử dụng',
        Good: 'Tốt',
        Fair: 'Khá',
      },
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
      postListing: 'Post Listing',
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
    categories: {
      agriculture: {
        name: 'Agriculture',
        description: 'Fresh produce & farm goods',
      },
      food: {
        name: 'Food',
        description: 'Homemade & ready-to-eat meals',
      },
      'home-appliances': {
        name: 'Home Appliances',
        description: 'Electronics & household items',
      },
      cosmetics: {
        name: 'Cosmetics',
        description: 'Beauty & personal care',
      },
      'university-merch': {
        name: 'University Merch',
        description: 'Official UEH branded items',
      },
    },
    home: {
      anniversaryBadge: '1976 – 2026 · Celebrating 50 Years',
      heroTitle1: '50 Years of Shaping',
      heroTitle2: "Vietnam's Finest",
      heroTitle3: 'Economists',
      heroDesc:
        'Founded in 1976, UEH University (Đại học Kinh tế TP.HCM) has cultivated generations of business leaders. Now, our very own student marketplace lets you trade safely and confidently within the UEH community.',
      startShopping: 'Start Shopping',
      browseCategories: 'Browse Categories',
      statStudents: 'Students',
      statVerified: 'Verified Emails',
      statRating: 'Avg. Rating',
      categoriesTitle: 'Browse Categories',
      categoriesDesc: 'Explore what your fellow UEH students are offering across five curated categories.',
      shopNow: 'Shop now',
      recentTitle: 'Recent Listings',
      recentDesc: 'Fresh items posted by your fellow students',
      viewAll: 'View all',
      loadingListings: 'Loading listings...',
      noListingsTitle: 'No new listings yet',
      noListingsDesc: 'Check back later for more posts.',
      trustTitle: 'Trade Safely Within UEH Community',
      trustDesc:
        'Every seller is a verified UEH student. All listings are reviewed by admin before going live. Your campus, your marketplace.',
      trustVerified: 'Verified\nStudents',
      trustApproved: 'Admin\nApproved',
      trustRatings: 'Peer\nRatings',
    },
    footer: {
      tagline: 'UEH University Student Marketplace – Est. 2026',
      description:
        'A trusted peer-to-peer marketplace exclusively for UEH University (Đại học Kinh tế TP.HCM) students. Buy, sell, and connect with fellow students across all campuses.',
      onlyAccounts: 'Only @st.ueh.edu.vn accounts allowed',
      rulesTitle: 'Rules & Policies',
      rules: [
        'Community Guidelines',
        'Listing Rules',
        'Rating Policy',
        'Prohibited Items',
        'Dispute Resolution',
        'Privacy Policy',
      ],
      supportTitle: 'Support & Hotline',
      phoneLabel: 'Phone / Zalo',
      emailLabel: 'Email',
      supportHoursTitle: 'Support Hours',
      supportHoursWeekday: 'Mon – Fri: 8:00 AM – 5:00 PM',
      supportHoursSat: 'Sat: 8:00 AM – 12:00 PM',
      copyright: '© 2026 UEH Market. UEH University (Đại học Kinh tế TP.HCM).',
      adminPortal: 'Admin Portal',
      terms: 'Terms',
      privacy: 'Privacy',
    },
    admin: {
      title: 'Admin Dashboard',
      subtitle: 'Review and moderate student listings and ratings.',
      pendingProducts: 'Pending Products',
      pendingRatings: 'Pending Ratings',
      tabProducts: 'Manage Products',
      tabRatings: 'Manage Ratings',
      tabUsers: 'Manage Users',
      filterLabel: 'Filter:',
      filterAll: 'All',
      filterPending: 'Pending',
      filterApproved: 'Approved',
      filterRejected: 'Rejected',
      itemsOf: 'of',
      colProduct: 'Product',
      colSeller: 'Seller',
      colCategory: 'Category',
      colPrice: 'Price',
      colSubmitted: 'Submitted',
      colStatus: 'Status',
      colActions: 'Actions',
      colReviewer: 'Reviewer',
      colRating: 'Rating',
      colComment: 'Comment',
      approve: 'Approve',
      reject: 'Reject',
      undo: 'Undo',
      deleteProduct: 'Delete',
      confirmDeleteProduct: 'Are you sure you want to delete this listing? This action cannot be undone.',
      noProducts: 'No items to show',
      noRatings: 'No ratings to show',
      badgeApproved: 'Approved',
      badgeRejected: 'Rejected',
      badgePending: 'Pending',
      lowRating: 'Low rating',
      legendLowRating: 'Rows with low ratings (≤2★) are highlighted in red',
      legendUndo: 'Actions can be undone before page refresh',
      colUser: 'User',
      colRole: 'Role',
      colEmail: 'Email',
      assignPermissions: 'Assign Permissions',
      revokeAccess: 'Revoke Access',
      noUsers: 'No users found',
      totalUsers: 'total users',
      roleAdmin: 'Admin',
      roleUser: 'User',
      masterAdmin: 'Master Admin',
      noAdminAccess: 'No access granted',
      permModalTitle: 'Assign Admin Permissions',
      permModalSubtitle: 'Select the permissions to grant this user.',
      permManageProducts: 'Manage Products',
      permManageProductsDesc: 'Review and approve/reject product listings',
      permManageRatings: 'Manage Ratings',
      permManageRatingsDesc: 'Review and approve/reject buyer ratings',
      permManageUsers: 'Manage Users',
      permManageUsersDesc: 'View user list and assign permissions to others',
      permManageUsersLocked: 'You do not have permission to grant this',
      permSave: 'Save Permissions',
      permCancel: 'Cancel',
      permSaving: 'Saving...',
      permNoneWarning: 'Unchecking all will revoke this user\'s admin access.',
      tabContent: 'Content',
      cmsTitle: 'Policy Content Management',
      cmsNewPolicy: 'Add Policy',
      cmsEditPolicy: 'Edit Policy',
      cmsSave: 'Save',
      cmsCancel: 'Cancel',
      cmsSaving: 'Saving...',
      cmsSlug: 'Slug (URL path)',
      cmsSlugHint: 'Lowercase letters, numbers, and hyphens only',
      cmsPageTitle: 'Page Title',
      cmsContent: 'Content',
      cmsDelete: 'Delete',
      cmsConfirmDelete: 'Are you sure you want to delete this policy?',
      cmsNoPolicy: 'No policies yet. Click "Add Policy" to create one.',
      cmsLastUpdated: 'Last updated',
    },
    postListing: {
      title: 'Post a New Listing',
      subtitle: 'Fill in the details of the item you want to sell',
      fieldTitle: 'Title',
      fieldTitlePlaceholder: 'e.g. Xiaomi Mini Fan – Like New',
      fieldDesc: 'Description',
      fieldDescPlaceholder: 'Describe the condition, origin, reason for selling...',
      fieldPrice: 'Price (VND)',
      fieldPricePlaceholder: 'e.g. 150000',
      fieldCategory: 'Category',
      fieldCategoryPlaceholder: 'Select a category',
      fieldCondition: 'Condition',
      fieldConditionNew: 'New',
      fieldConditionUsed: 'Used',
      fieldPhone: 'Phone / Zalo',
      fieldPhonePlaceholder: 'e.g. 0901234567',
      fieldImages: 'Product Images',
      fieldImagesHint: 'Up to 5 images, each under 5MB (JPG, PNG, WEBP)',
      submit: 'Post Listing',
      submitting: 'Posting...',
      successTitle: 'Listing Posted!',
      successDesc: 'Your listing is pending admin review. We will review it as soon as possible.',
      cancel: 'Cancel',
      errorRequired: 'Please fill in all required fields.',
      errorImageSize: 'Image too large. Each image must be under 5MB.',
    },
    common: {
      conditions: {
        New: 'New',
        'Like New': 'Like New',
        Used: 'Used',
        Good: 'Good',
        Fair: 'Fair',
      },
    },
  },
};
