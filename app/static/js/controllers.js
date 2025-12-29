import * as services from "./services.js";
import { CONFIG } from "./config.js";
import * as views from "./views.js";
import * as utils from "./utils.js";

/* ========================
   HOMEPAGE
======================== */

export const HomePageController = {
  async init() {
    const q = utils.Url.get("q");

    views.HomePageView.init({
      onSearch: this.handleSearch.bind(this),
      onClearSearch: this.handleClearSearch.bind(this),
    });

    views.HomePageView.setSearchValue(q);

    await this.loadBooks(q);
  },

  async handleSearch(search) {
    if (search) {
      utils.Url.set({ q: search });
    } else {
      utils.Url.set({ q: null });
    }

    await this.loadBooks(search);
  },

  async handleClearSearch() {
    utils.Url.set({ q: null });
    views.HomePageView.setSearchValue();
    await this.loadBooks(this.visibleBooks);
  },

  async loadBooks(query) {
    let books;

    if (!query) {
      books = await services.BookService.loadAll();
    } else {
      books = await services.BookService.search({ q: query });
    }

    views.HomePageView.renderBooks(books);
  },
};

/* ========================
   BOOK DETAILS
======================== */

export const BookDetailsController = {
  async init() {
    // Book
    this.book = await services.BookService.getById(
      Number(window.location.pathname.split("/").pop())
    );

    // Token
    this.token = await services.AuthService.getAuthState();

    views.BookDetailsView.init({
      onBorrowClick: this.handleBorrow.bind(this),
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
};

/* ========================
   PROFILE
======================== */

export const ProfileController = {
  async init() {
    this.profile = await services.UserService.loadProfile();

    views.ProfileView.init({
      onReturnClicked: this.handleReturn.bind(this),
    });

    views.ProfileView.render(this.profile);
  },

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
      views.ProfileView.renderActiveBorrowings(
        refreshedProfile.active_borrowings
      );
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
    this.books = await services.BookService.loadAll();
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
    this.allBooks = await services.BookService.loadAll();
    this.visibleBooks = [...this.allBooks];

    views.ManageBooksView.init({
      onSearch: this.handleSearch.bind(this),
      onAddBookSubmit: this.handleAddBook.bind(this),
      onEditBookClicked: this.handleEditBookModel.bind(this),
      onEditBookSubmit: this.handleEditBook.bind(this),
    });

    views.ManageBooksView.renderBooksTable(this.visibleBooks);
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
      await BookService.loadAll();
      views.ManageBooksView.renderBooksTable(this.visibleBooks);
      views.ManageBooksView.closeAddBookModel();
      views.ManageBooksView.resetAddBookForm();
    }
  },

  async handleEditBookModel(bookId) {
    const book = await services.BookService.getById(bookId);
    if (!book) return;

    views.ManageBooksView.openEditBookModel(book);
  },

  async handleEditBook(bookId, formData) {
    const { response, data } = await services.BookService.updateBook(
      bookId,
      formData
    );

    utils.UI.showToast(data.msg, data.type);

    if (response.status === 200) {
      await BookService.loadAll();
      views.ManageBooksView.renderBooksTable(this.visibleBooks);
      views.ManageBooksView.closeEditBookModel();
    }
  },

  async handleDeleteBook(bookId) {
    const { response, data } = await services.BookService.deleteBook(bookId);

    utils.UI.showToast(data.msg, data.type);

    if (response.status === 200) {
      await BookService.loadAll();
      views.ManageBooksView.renderBooksTable(this.visibleBooks);
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
      onEditUserClicked: this.handleEditModel.bind(this),
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

  async handleEditModel(userId) {
    const user = await services.UserService.loadById(userId);
    if (!user) return;

    views.ManageUsersView.openEditModel(user);
  },

  async handleEditUser(userId, formData) {
    const { response, data } = await services.UserService.updateUser(
      userId,
      formData
    );

    if (response.status === 200) {
      utils.UI.showToast(data.msg, data.type);
      await services.UserService.loadAll();
      views.ManageUsersView.renderUsersTable(this.visibleUsers);
      views.ManageUsersView.closeEditModel();
    } else {
      utils.UI.showToast(data.msg, data.type);
    }
  },

  async handleAddUser(form) {
    const formData = new FormData(form);
    const { response, data } = await services.UserService.addUser(formData);

    utils.UI.showToast(data.msg, data.type);

    if (response.status === 201) {
      await services.UserService.loadAll();
      views.ManageUsersView.renderUsersTable(this.visibleUsers);
      views.ManageUsersView.closeAddModel();
      views.ManageUsersView.resetAddBookForm();
    }
  },

  async handleDeleteUser(userId) {
    const { response, data } = await services.UserService.deleteUser(userId);

    if (response.status === 200) {
      utils.UI.showToast(data.msg, data.type);
      await services.UserService.loadAll();
      views.ManageUsersView.renderUsersTable(this.visibleUsers);
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
      applyFilters: this.handleFiltering.bind(this),
      onReturnClicked: this.handleForceReturn.bind(this),
    });

    views.ManageBorrowingsView.renderBorrowingsTable(this.visibleBorrowings);
  },

  async handleForceReturn(borrowingId) {
    const { response, data } = await services.BorrowingService.returnBook(
      borrowingId
    );

    if (response.status === 200) {
      utils.UI.showToast(data.msg, data.type);
      this.allBorrowings = await BorrowingService.loadAll();
      this.visibleBorrowings = [...this.allBorrowings];
      views.ManageBorrowingsView.renderBorrowingsTable(this.visibleBorrowings);
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
  },
  // LOCAL SIGN UP
  async signUp(form) {
    const formData = new FormData(form);
    const { response, data } = await services.AuthService.signUp(formData);

    if (response.status === 201) {
      window.location.href = "/";
    } else {
      console.log(data.error);
    }
  },

  // GOOGLE AUTH
  handleGoogleAuth() {
    window.location.href = "/api/user/create/google";
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
  },
  async signIn(form) {
    const formData = new FormData(form);
    const { response, data } = await services.AuthService.signIn(formData);

    if (response.ok) {
      if (data.user.is_admin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } else {
      alert(response.error);
    }
  },

  // GOOGLE AUTH
  handleGoogleAuth() {
    window.location.href = "/api/user/create/google";
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
