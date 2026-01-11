import * as controllers from "./controllers.js";

export const Router = {
  init() {
    // homepage
    if (window.location.pathname === "/") {
      controllers.HomePageController.init();
      controllers.NavbarController.init();
    }

    // Book details
    if (window.location.pathname.startsWith("/books/")) {
      controllers.BookDetailsController.init();
      controllers.NavbarController.init();
    }

    // Sign up
    if (window.location.pathname === "/signup") {
      controllers.SignUpController.init();
    }

    // Sign in
    if (window.location.pathname === "/signin") {
      controllers.SignInController.init();
    }

    // profile
    if (window.location.pathname === "/user/profile") {
      controllers.ProfileController.init();
      controllers.NavbarController.init();
    }

    // Admin
    if (window.location.pathname === "/admin/") {
      controllers.AdminController.init();
      controllers.NavbarController.init();
    }

    // Manage books
    if (window.location.pathname === "/admin/manage-books") {
      controllers.ManageBooksController.init();
      controllers.NavbarController.init();
    }

    // Manage users
    if (window.location.pathname === "/admin/manage-users") {
      controllers.ManageUsersController.init();
      controllers.NavbarController.init();
    }

    // Manage borrowings
    if (window.location.pathname === "/admin/manage-borrowings") {
      controllers.ManageBorrowingsController.init();
      controllers.NavbarController.init();
    }

    // All activity
    if (window.location.pathname === "/admin/activities") {
      controllers.NavbarController.init();
      controllers.AllActivityController.init();
    }

    if (window.location.pathname == "/browse") {
      controllers.NavbarController.init();
      controllers.BrowseBookController.init();
    }
  },
};
