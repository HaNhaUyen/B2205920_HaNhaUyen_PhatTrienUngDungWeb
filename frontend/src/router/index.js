// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import BorrowHome from "../views/BorrowHome.vue";
import BooksPage from "../views/BookCatalog.vue";
import LoginUser from "../views/LoginUser.vue";
import LoginAdmin from "../views/LoginAdmin.vue";
import Register from "../views/Register.vue";
import BookDetail from "../views/BookDetail.vue";
import UserProfile from "../views/UserProfile.vue";
import NotFound from "@/views/NotFound.vue";
import BorrowedBooks from "../views/BorrowedBooks.vue";

const routes = [
  {
    path: "/",
    name: "BorrowHome",
    component: BorrowHome,
  },
  {
    path: "/books",
    name: "BooksPage",
    component: BooksPage,
  },
  {
    path: "/login",
    name: "LoginUser",
    component: LoginUser,
  },
  {
    path: "/login-admin",
    name: "LoginAdmin",
    component: LoginAdmin,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/books/:id",
    name: "BookDetail",
    component: BookDetail,
  },
  {
    path: "/profile",
    name: "UserProfile",
    component: UserProfile,
  },
  {
    path: "/borrowed-books",
    name: "BorrowedBooks",
    component: BorrowedBooks,
    // Chỉ cần đăng nhập là được, không cần check role cụ thể
    meta: { requiresAuth: true },
  },

  // ===========================
  // ADMIN ROUTES + GUARDS
  // ===========================
  {
    path: "/admin",
    component: () => import("@/components/admin/AdminLayout.vue"),
    meta: { requiresAuth: true, roles: ["admin"] },
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/admin/AdminDashboard.vue"),
      },
      {
        path: "books",
        name: "BookManager",
        component: () => import("@/components/admin/BookManager.vue"),
      },
      {
        path: "books/edit/:id",
        name: "EditBook",
        component: () => import("@/components/admin/EditBook.vue"),
      },
      {
        path: "users",
        name: "UserManagement",
        component: () => import("@/components/admin/UserManagement.vue"),
      },
      {
        path: "users/edit/:id",
        name: "EditUser",
        component: () => import("@/components/admin/EditUser.vue"),
      },
      {
        path: "categories",
        name: "Categories",
        component: () => import("@/components/admin/Categories.vue"),
      },
      {
        path: "categories/edit/:id",
        name: "EditCategories",
        component: () => import("@/components/admin/EditCategories.vue"),
      },
      {
        path: "publishers",
        name: "Publishers",
        component: () => import("@/components/admin/Publishers.vue"),
      },
      {
        path: "publishers/edit/:id",
        name: "EditPublishers",
        component: () => import("@/components/admin/EditPublisher.vue"),
      },
      {
        path: "authors",
        name: "Authors",
        component: () => import("@/components/admin/Authors.vue"),
      },
      {
        path: "authors/edit/:id",
        name: "EditAuthor",
        component: () => import("@/components/admin/EditAuthor.vue"),
      },
      {
        path: "borrows",
        name: "Borrows",
        component: () => import("@/components/admin/BorrowManager.vue"),
      },
      {
        path: "borrows/edit/:id",
        name: "EditBorrow",
        component: () => import("@/components/admin/EditBorrow.vue"),
      },
      {
        path: "comments",
        name: "Comments",
        component: () => import("@/components/admin/CommentManager.vue"),
      },
    ],
  },

  // 404
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// =====================================
// KIỂM TRA ĐĂNG NHẬP + PHÂN QUYỀN ADMIN
// =====================================
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Kiểm tra nếu route yêu cầu đăng nhập
  if (to.meta.requiresAuth) {
    if (!user) {
      return next("/login"); // Chưa có user -> về login
    }

    // 2. Kiểm tra quyền (Role)
    // CHỈ KIỂM TRA NẾU ROUTE ĐÓ CÓ YÊU CẦU ROLE CỤ THỂ
    if (to.meta.roles && to.meta.roles.length > 0) {
      const role = user.role || user.vai_tro; // Đề phòng tên trường khác nhau

      if (!to.meta.roles.includes(role)) {
        return next({ name: "NotFound" }); // Không đúng quyền -> 404 hoặc 403
      }
    }
  }

  next();
});

export default router;
