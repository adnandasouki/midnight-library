import * as controllers from "./controllers.js";

export const Router = {
  init() {
    // homepage
    if (window.location.pathname === "/") {
      console.log("home");
      controllers.HomePageController.init();
      controllers.NavbarController.init();
    }

    // Book details
    if (window.location.pathname.startsWith("/books/")) {
      console.log("book details");
      controllers.BookDetailsController.init();
      controllers.NavbarController.init();
    }

    // Sign up
    if (window.location.pathname === "/signup") {
      console.log("sign up");
      controllers.SignUpController.init();
    }

    // Sign in
    if (window.location.pathname === "/signin") {
      console.log("sign in");
      controllers.SignInController.init();
    }

    // profile
    if (window.location.pathname === "/user/profile") {
      controllers.ProfileController.init();
      controllers.NavbarController.init();
    }

    // Admin
    if (window.location.pathname === "/admin/") {
      console.log("admin");
      controllers.AdminController.init();
      controllers.NavbarController.init();
    }

    // Manage books
    if (window.location.pathname === "/admin/manage-books") {
      console.log("manage books");
      controllers.ManageBooksController.init();
      controllers.NavbarController.init();
    }

    // Manage users
    if (window.location.pathname === "/admin/manage-users") {
      console.log("manage users");
      controllers.ManageUsersController.init();
      controllers.NavbarController.init();
    }

    // Manage borrowings
    if (window.location.pathname === "/admin/manage-borrowings") {
      console.log("manage borrowings");
      controllers.ManageBorrowingsController.init();
      controllers.NavbarController.init();
    }

    // All activity
    if (window.location.pathname === "/admin/activities") {
      console.log("all activity");
      controllers.NavbarController.init();
      controllers.AllActivityController.init();
    }
  },
};
