import * as services from "./services.js";
import { CONFIG } from "./config.js";
import * as views from "./views.js";
import * as utils from "./utils.js";

/* ========================
   HOMEPAGE
======================== */

export const HomePageController = {
  async init() {
    this.books = await services.BookService.loadAll();

    views.HomePageView.init({
      books: this.books,
      onSubmit: this.handleSearch.bind(this),
    });
  },

  handleSearch(q) {
    const url = new URL("/browse", window.location.origin);
    url.searchParams.set("q", q);
    url.searchParams.set("page", 1);

    window.location.href = url.toString();
  },
};

/* ========================
   BOOK DETAILS
======================== */

export const BookDetailsController = {
  async init() {
    // Book
    this.book = await services.BookService.loadById(
      Number(window.location.pathname.split("/").pop())
    );

    // Token
    this.token = await services.AuthService.getAuthState();

    views.BookDetailsView.init({
      onBorrowClick: this.handleBorrow.bind(this),
      onFavoriteClick: this.handleFavorite.bind(this),
    });

    views.BookDetailsView.renderBook(this.book);
  },

  async handleBorrow() {
    /* Not registered */
    if (!this.token) {
      utils.UI.showToast("Account is required to borrow books", "error");
      return;
    }

    /* Registered */

    // Borrow request
    const { response, data } = await services.BorrowingService.borrowBook(
      this.book.id
    );
    if (response.status === 201) {
      utils.UI.showToast(data.msg, data.type);
    } else if (response.status === 409) {
      utils.UI.showToast(data.msg, data.type);
    } else if (response.status === 401) {
      utils.UI.showToast(data.msg, data.type);
    }
  },

  async handleFavorite() {
    /* Not registered */
    if (!this.token) {
      utils.UI.showToast("Account is required to borrow books", "error");
      return;
    }

    /* Registered */

    // Add to favorites request
    const { response, data } = await services.Favorites.createFavorite(
      this.book.id
    );
    if (response.status === 201) {
      utils.UI.showToast(data.msg, data.type);
    } else if (response.status === 409) {
      utils.UI.showToast(data.msg, data.type);
    } else if (response.status === 401) {
      utils.UI.showToast(data.msg, data.type);
    }
  },
};

/* ========================
   PROFILE
======================== */

export const ProfileController = {
  async init() {
    this.profile = await services.UserService.loadProfile();

    views.ProfileView.init({
      profile: this.profile,
      onReturnClicked: this.handleReturn.bind(this),
      onRemoveFavoriteClicked: this.handleRemoveFavorite.bind(this),
      onUpdateUsername: this.handleUsernameUpdate.bind(this),
      onUpdateEmail: this.handleEmailUpdate.bind(this),
      onPasswordUpdate: this.handlePasswordUpdate.bind(this),
    });
  },

  // username update
  async handleUsernameUpdate(form) {
    const formData = new FormData(form);
    const { response, data } = await services.UserService.updateUser(formData);

    if (response.ok) {
      utils.UI.showToast(data.msg, data.type);

      // Reload profile
      const refreshedProfile = await services.UserService.loadProfile();
      views.ProfileView.render(refreshedProfile);

      form.closest("[data-modal]").classList.add("hidden");
    } else {
      utils.UI.showToast(data.msg, data.type);
    }
  },

  // email update
  async handleEmailUpdate(form) {
    const formData = new FormData(form);
    const { response, data } = await services.UserService.updateUser(formData);

    if (response.ok) {
      utils.UI.showToast(data.msg, data.type);

      // Reload profile
      const refreshedProfile = await services.UserService.loadProfile();
      views.ProfileView.render(refreshedProfile);

      form.closest("[data-modal]").classList.add("hidden");
    } else {
      utils.UI.showToast(data.msg, data.type);
    }
  },

  // password update
  async handlePasswordUpdate(form) {
    const formData = new FormData(form);
    const { response, data } = await services.UserService.updatePassword(
      formData
    );

    if (response.ok) {
      utils.UI.showToast(data.msg, data.type);
      form.closest("[data-modal]").classList.add("hidden");
    }
    if (response.status === 400) {
      // error msg
      views.ProfileView.renderErrorMsg(data.msg);
    }
  },

  // return book
  async handleReturn(borrowingId) {
    const { response, data } = await services.BorrowingService.returnBook(
      borrowingId
    );

    if (response.status === 200) {
      // Show success toast notification
      utils.UI.showToast(data.msg, data.type);

      // Reload profile
      const refreshedProfile = await services.UserService.loadProfile();

      // Reload active borrowings
      views.ProfileView.renderActiveBorrowings(refreshedProfile);

      const refreshedHistory = refreshedProfile.all_borrowings.filter(
        (b) => b.status === "returned"
      );

      // Reload history
      views.ProfileView.renderBorrowingsHistory(refreshedHistory);
    } else if (response.status === 400) {
      // Show error toast notification
      utils.UI.showToast(data.msg, data.type);
    }
  },

  // remove favorite book
  async handleRemoveFavorite(favId) {
    const { response, data } = await services.Api.request("/favorites/delete", {
      method: "DELETE",
      body: JSON.stringify({ fav_id: favId }),
    });

    if (response.status === 200) {
      // Show success toast notification
      utils.UI.showToast(data.msg, data.type);

      // Reload profile
      const refreshedProfile = await services.UserService.loadProfile();

      // Reload profile
      views.ProfileView.renderFavorites(refreshedProfile);
    } else if (response.status === 400) {
      // Show error toast notification
      utils.UI.showToast(data.msg, data.type);
    }
  },
};

/* ========================
   ADMIN
======================== */

export const AdminController = {
  async init() {
    this.borrowings = await services.BorrowingService.loadAll();
    this.users = await services.UserService.loadAll();
    this.books = await services.BookService.loadForAdmin();
    this.activities = await services.ActivityService.loadRecent();

    views.AdminView.init();

    views.AdminView.render({
      users: this.users,
      books: this.books,
      borrowings: this.borrowings,
      activities: this.activities,
    });
  },
};

/* ========================
   ALL ACTIVITY
======================== */

export const AllActivityController = {
  async init() {
    this.activities = await services.ActivityService.loadAll();

    views.AllActivityView.init();
    views.AllActivityView.render(this.activities);
  },
};

/* ========================
   MANAGE BOOKS
======================== */

export const ManageBooksController = {
  searchQuery: "",
  visibleBooks: [],

  async init() {
    this.allBooks = await services.BookService.loadForAdmin();
    this.visibleBooks = [...this.allBooks];

    views.ManageBooksView.init({
      books: this.visibleBooks,
      onSearch: this.handleSearch.bind(this),
      onDeleteBookClicked: this.handleDeleteBook.bind(this),
      onAddBookSubmit: this.handleAddBook.bind(this),
      onEditBookSubmit: this.handleEditBook.bind(this),
    });
  },

  handleSearch(query) {
    this.searchQuery = query;

    let data = [...this.allBooks];

    if (this.searchQuery) {
      const q = this.searchQuery.trim().toLowerCase();

      data = data.filter(
        (book) =>
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q)
      );
    }

    this.visibleBooks = data;
    views.ManageBooksView.renderBooksTable(this.visibleBooks);
  },

  async handleAddBook(form) {
    const formData = new FormData(form);
    const { response, data } = await services.BookService.addBook(formData);

    utils.UI.showToast(data.msg, data.type);

    if (response.status === 201) {
      const refreshed = await services.BookService.loadForAdmin();
      views.ManageBooksView.render(refreshed);
    }
  },

  async handleEditBook(bookId, form) {
    const formData = new FormData(form);
    const { response, data } = await services.BookService.updateBook(
      bookId,
      formData
    );

    utils.UI.showToast(data.msg, data.type);

    if (response.status === 200) {
      this.init();
    }
  },

  async handleDeleteBook(bookId) {
    const { response, data } = await services.BookService.deleteBook(bookId);

    utils.UI.showToast(data.msg, data.type);

    if (response.status === 200) {
      const refreshed = await services.BookService.loadForAdmin();
      views.ManageBooksView.render(refreshed);
    }
  },
};

/* ========================
   MANAGE USERS
======================== */

export const ManageUsersController = {
  visibleUsers: [],

  async init() {
    this.users = await services.UserService.loadAll();
    this.visibleUsers = [...this.users];

    views.ManageUsersView.init({
      onSearch: this.handleSearch.bind(this),
      onEditUserModalOpen: this.handleEditUserModal.bind(this),
      onEditUserSubmit: this.handleEditUser.bind(this),
      onAddUserSubmit: this.handleAddUser.bind(this),
      onDeleteUserClicked: this.handleDeleteUser.bind(this),
    });

    views.ManageUsersView.renderUsersTable(this.visibleUsers);
  },

  handleSearch(query) {
    let data = [...this.users];

    if (query) {
      const q = query.trim().toLowerCase();

      data = data.filter(
        (user) =>
          user.username.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q)
      );
    }

    this.visibleUsers = data;
    views.ManageUsersView.renderUsersTable(this.visibleUsers);
  },

  async handleEditUserModal(userId) {
    const user = await services.UserService.loadById(userId);
    if (!user) return;

    views.ManageUsersView.initEditUserModal(user);
  },

  async handleEditUser(userId, form) {
    const formData = new FormData(form);
    const { response, data } = await services.AdminService.updateWithAdmin(
      userId,
      formData
    );

    if (response.status === 200) {
      utils.UI.showToast(data.msg, data.type);
      views.ManageUsersView.closeVisibleModal();
      const refreshed = await services.UserService.loadAll();
      views.ManageUsersView.renderUsersTable(refreshed);
    } else {
      utils.UI.showToast(data.msg, data.type);
    }
  },

  async handleAddUser(form) {
    const formData = new FormData(form);
    const { response, data } = await services.UserService.createUser(formData);

    utils.UI.showToast(data.msg, data.type);

    if (response.status === 201) {
      views.ManageUsersView.closeVisibleModal();
      const refreshed = await services.UserService.loadAll();
      views.ManageUsersView.renderUsersTable(refreshed);
    }
  },

  async handleDeleteUser(userId) {
    const { response, data } = await services.UserService.deleteUser(userId);

    if (response.status === 200) {
      utils.UI.showToast(data.msg, data.type);
      const refreshed = await services.UserService.loadAll();
      views.ManageUsersView.renderUsersTable(refreshed);
    } else {
      utils.UI.showToast(data.msg, data.type);
    }
  },
};

/* ========================
   MANAGE BORROWINGS
======================== */

export const ManageBorrowingsController = {
  visibleBorrowings: [],

  async init() {
    this.allBorrowings = await services.BorrowingService.loadAll();
    this.visibleBorrowings = [...this.allBorrowings];

    views.ManageBorrowingsView.init({
      books: this.allBorrowings,
      applyFilters: this.handleFiltering.bind(this),
      onReturnClicked: this.handleForceReturn.bind(this),
    });
  },

  async handleForceReturn(borrowingId) {
    const { response, data } = await services.BorrowingService.returnBook(
      borrowingId
    );

    if (response.status === 200) {
      utils.UI.showToast(data.msg, data.type);
      const refreshed = await services.BorrowingService.loadAll();
      views.ManageBorrowingsView.render(refreshed);
    } else {
      utils.UI.showToast(data.msg, data.type);
    }
  },

  handleFiltering(options) {
    let data = [...this.allBorrowings];

    // Status
    if (options.statusFilter !== "all") {
      data = data.filter(
        (b) => b.status.toLowerCase() === options.statusFilter
      );
    }

    // Search
    if (options.searchQuery) {
      const q = options.searchQuery.trim().toLowerCase();
      data = data.filter(
        (b) =>
          b.user.toLowerCase().includes(q) || b.book.toLowerCase().includes(q)
      );
    }

    this.visibleBorrowings = data;
    views.ManageBorrowingsView.renderBorrowingsTable(this.visibleBorrowings);
  },
};

/* ========================
   SIGN UP
======================== */

export const SignUpController = {
  init() {
    views.SignUpView.init({
      onSignUpClick: this.signUp.bind(this),
      onGoogleAuthClicked: this.handleGoogleAuth.bind(this),
    });

    window.addEventListener("pageshow", (e) => {
      if (e.persisted) {
        views.SignUpView.resetGoogleLoading();
        views.SignUpView.hideError();
      }
    });
  },
  // local
  async signUp(form) {
    const formData = new FormData(form);

    // start lodaing
    views.SignUpView.showLoading();

    try {
      // request
      const { response, data } = await services.AuthService.signUp(formData);

      if (response.status === 201) {
        window.location.href = "/";
      } else {
        views.SignUpView.showError(data.msg);
      }
    } catch (e) {
      // error
    } finally {
      // hide loading
      views.SignUpView.hideLodaing();
    }
  },

  // google
  handleGoogleAuth() {
    views.SignUpView.showGoogleLoading();

    requestAnimationFrame(() => {
      window.location.href = "/api/auth/google";
    });
  },
};

/* ========================
   SIGN IN
======================== */

export const SignInController = {
  init() {
    views.SignInView.init({
      onSignInClick: this.signIn.bind(this),
      onGoogleAuthClicked: this.handleGoogleAuth.bind(this),
    });

    window.addEventListener("pageshow", (e) => {
      if (e.persisted) {
        views.SignInView.resetGoogleLoading();
        views.SignInView.hideError();
      }
    });
  },
  async signIn(form) {
    const formData = new FormData(form);

    // start loading
    views.SignInView.showLoading();

    try {
      // request
      const { response, data } = await services.AuthService.signIn(formData);

      if (response.status === 200) {
        if (data.user.is_admin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        views.SignInView.showError(data.msg);
      }
    } catch (e) {
      // error
    } finally {
      // stop loading
      views.SignInView.hideLoading();
    }
  },

  handleGoogleAuth() {
    views.SignInView.showGoogleLoading();

    requestAnimationFrame(() => {
      window.location.href = "/api/auth/google";
    });
  },
};

/* ========================
   NAVBAR
======================== */

export const NavbarController = {
  async init() {
    views.NavbarView.init({
      onSignUpClick: this.handleSignUp.bind(this),
      onSignInClick: this.handleSignIn.bind(this),
      onSignOutClick: this.handleSignOut.bind(this),
    });

    await this.handleState();
  },

  async handleState() {
    // get current user
    const token = await services.AuthService.getAuthState();

    // not registered
    if (!token) {
      // guest state
      utils.authState.user = null;
      utils.authState.isAuthenticated = false;

      views.NavbarView.guestState();
      return;
    }

    const currentUser = await services.UserService.loadById(token.user_id);

    // admin
    if (currentUser.is_admin) {
      utils.authState.user = token;
      utils.authState.isAuthenticated = true;
      views.NavbarView.adminState();
      views.NavbarView.setAvatar(currentUser.username[0]);
      return;
    } else {
      // registered
      utils.authState.user = token;
      utils.authState.isAuthenticated = true;

      views.NavbarView.userState();
      views.NavbarView.setAvatar(currentUser.username[0]);
      return;
    }
  },

  handleSignUp() {
    window.location.href = "/signup";
  },

  handleSignIn() {
    window.location.href = "/signin";
  },

  handleSignOut() {
    services.AuthService.signOut();
    window.location.href = "/signin";
  },
};

/* ========================
   BROWSE BOOKS
======================== */

export const BrowseBookController = {
  async init() {
    this.data = await services.BookService.loadAll();

    this.getSearchParams();

    views.BrowseBookView.init({
      data: this.data,
      onSearch: this.handleSearch.bind(this),
      onClearSearch: this.handleClearSearch.bind(this),
      onPageChange: this.handlePageChange.bind(this),
    });
  },

  async getSearchParams() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const page = params.get("page") || 1;

    await services.BookService.loadAll();

    views.BrowseBookView.setSearchValue(q);
    views.BrowseBookView.focusSearch();
  },

  async handlePageChange(page) {
    console.log(page);
    if (page < 1) return;

    const url = new URL(window.location);
    url.searchParams.set("page", page);
    window.history.pushState({}, "", url);

    const data = await services.BookService.loadAll();
    views.BrowseBookView.render(data, this.handlePageChange.bind(this));
  },

  async handleSearch(q) {
    // set param value
    const url = new URL(window.location);
    url.searchParams.set("q", q);
    url.searchParams.set("page", 1);

    // push to url
    window.history.pushState({}, "", url);

    // render
    const searched = await services.BookService.loadAll();
    views.BrowseBookView.render(searched);
  },

  async handleClearSearch() {
    // 1. reset url q value
    const url = new URL(window.location);
    url.searchParams.set("q", "");
    window.history.pushState({}, "", url);

    // 2. reset search input
    views.BrowseBookView.setSearchValue();

    // 3. relaod books
    const books = await services.BookService.loadAll();
    views.BrowseBookView.render(books);
  },
};
