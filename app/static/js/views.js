import { UI } from "./utils.js";

/* ========================
   HOMEPAGE
======================== */

export const HomePageView = {
  init({ onSearch, onClearSearch }) {
    this.container = document.getElementById("books");
    this.searchInput = document.getElementById("search-field");
    this.clearSearch = document.getElementById("clear-search");

    if (!this.container || !this.searchInput || !this.clearSearch) return;

    this.bindEvents(onSearch, onClearSearch);
  },

  bindEvents(onSearch, onClearSearch) {
    // Search
    this.searchInput.addEventListener("input", () => {
      const search = this.searchInput.value.trim();
      onSearch(search);
    });

    // Clear search
    this.clearSearch.addEventListener("click", () => {
      onClearSearch();
    });
  },

  setSearchValue(value) {
    this.searchInput.value = value || "";
  },

  renderBooks(books) {
    this.container.innerHTML = "";

    books.forEach((b) => {
      this.container.insertAdjacentHTML(
        "beforeend",
        `
          <a href="/books/${b.id}">
            <div class="book-container card-sm">
              <img class="book-img" src="/static/assets/images/${b.book_img}"></img>
              <h3 class="book-title">${b.title}</h3>
              <p class="book-author">${b.author}</p>
            </div>
          </a>
          `
      );
    });
  },
};

/* ========================
   BOOK DETAILS
======================== */

export const BookDetailsView = {
  init({ onBorrowClick }) {
    this.borrowBtn = document.getElementById("borrow-btn");
    if (!this.borrowBtn) return;

    this.bindEvents(onBorrowClick);
  },

  bindEvents(onBorrowClick) {
    // Borrow Book
    this.borrowBtn.addEventListener("click", () => {
      onBorrowClick();
    });
  },

  renderBook(book) {
    document.getElementById(
      "book-img"
    ).src = `/static/assets/images/${book.book_img}`;
    document.getElementById("book-status").textContent = book.status;
    document.getElementById("book-status").classList.add(book.status);
    document.getElementById("book-title").textContent = book.title;
    document.getElementById("book-isbn").textContent = book.isbn;
    document.getElementById("book-author").textContent = book.author;
    document.getElementById("book-language").textContent = book.language;
    document.getElementById("book-pages").textContent = book.page_count;
    document.getElementById("book-publisher").textContent = book.publisher;
    document.getElementById("book-published").textContent = book.published_at;
    document.getElementById("book-description").textContent = book.description;
  },
};

/* ========================
   PROFILE
======================== */

export const ProfileView = {
  init({ onReturnClicked }) {
    // Avatar
    this.avatar = document.getElementById("profile-avatar");

    // Identity
    this.username = document.getElementById("profile-username");
    this.email = document.getElementById("profile-email");
    this.joinedDate = document.getElementById("date-joined");

    // Active borrowings
    this.active = document.getElementById("active-borrowings");
    this.history = document.getElementById("borrowings-history");

    // Borrowings history

    if (
      !this.active ||
      !this.username ||
      !this.email ||
      !this.joinedDate ||
      !this.avatar ||
      !this.history
    )
      return;

    this.bindEvents(onReturnClicked);
  },

  bindEvents(onReturnClicked) {
    // Return Book
    this.active.addEventListener("click", async (e) => {
      const returnBtn = e.target.closest(".return-btn");
      if (!returnBtn) return;

      const borrowingId = returnBtn.dataset.borrowingId;
      if (!borrowingId) return;

      onReturnClicked(borrowingId);
    });
  },

  render(profile) {
    // Avatar
    this.avatar.textContent = profile.username[0].toUpperCase();

    // Identity
    this.username.textContent = profile.username;
    this.email.textContent = profile.email;
    this.joinedDate.textContent = UI.toLocaleDateFormatter(profile.joined_date);

    // Active borrowings
    const activeBorrowings = profile.all_borrowings.filter(
      (b) => (b.status === "active") | (b.status === "overdue")
    );

    // Active borrowings
    this.renderActiveBorrowings(activeBorrowings);

    // History
    const borrowingsHistory = profile.all_borrowings.filter(
      (b) => b.status === "returned"
    );

    this.renderBorrowingsHistory(borrowingsHistory);
  },

  // Active borrowings
  renderActiveBorrowings(activeBorrowingsList) {
    this.active.innerHTML = "";

    if (!activeBorrowingsList) return;
    activeBorrowingsList.forEach((borrowing) => {
      const tr = `
      <tr>
        <td>${borrowing.book_id}</td>
        <td title="${borrowing.title}">${borrowing.title}</td>
        <td>${UI.formatDate(borrowing.borrowed_at)}</td>
        <td>${UI.formatDate(borrowing.due_at)}</td>
        <td><span class="${borrowing.status}">${borrowing.status}</span></td>
        <td>
          <button
            class="return-btn btn-action"
            data-borrowing-id="${borrowing.id}" 
            type="button">Return</button>
        </td>
      </tr>
    `;
      this.active.insertAdjacentHTML("beforeend", tr);
    });
  },

  // Recent borrowings history
  renderBorrowingsHistory(borrowingsHistory) {
    this.history.innerHTML = "";

    borrowingsHistory.slice(0, 5).forEach((borrowing) => {
      const tr = `
      <tr>
        <td>${borrowing.book_id}</td>
        <td title="${borrowing.title}">${borrowing.title}</td>
        <td>${UI.formatDate(borrowing.borrowed_at)}</td>
        <td>${UI.formatDate(borrowing.returned_at)}</td>
      </tr>
    `;
      this.history.insertAdjacentHTML("beforeend", tr);
    });
  },
};

/* ========================
   ADMIN
======================== */

export const AdminView = {
  init() {
    this.borrowingsCount = document.getElementById("borrowings-count");
    this.usersCount = document.getElementById("users-count");
    this.booksCount = document.getElementById("books-count");
    this.recentActivityContainer = document.getElementById("recent-activity");

    if (
      !this.usersCount ||
      !this.booksCount ||
      !this.borrowingsCount ||
      !this.recentActivityContainer
    )
      return;
  },

  // render admin overview page
  render({ users, books, borrowings, activities }) {
    this.borrowingsCount.textContent = `${borrowings.length}`;
    this.usersCount.textContent = `${users.length}`;
    this.booksCount.textContent = `${books.length}`;

    this.renderRecentActivity(activities);
  },

  // render recent activity list
  renderRecentActivity(activities) {
    // if there's no recent activitie
    if (!activities) {
      this.recentActivityContainer.innerHTML =
        "No recent activities found 👀..";
      return;
    }

    // if there's recent activities
    this.recentActivityContainer.innerHTML = "";
    activities.forEach((act) => {
      const activity = `
        <li class="recent-activity-list-item">
            ${this.renderActivityMessage({
              activity_type: act.activity_type,
              username: act.username,
              bookTitle: act.book_title,
            })}
          <span class="activity-date">${UI.relativeDate(act.created_at)}</span>
        </li>
      `;

      this.recentActivityContainer.insertAdjacentHTML("beforeend", activity);
    });
  },

  renderActivityMessage({ activity_type, username, bookTitle }) {
    switch (activity_type) {
      case "BORROW_BOOK":
        return `<p><span class="user">${username}</span> borrowed <span class="book">${bookTitle}</span></p>`;
      case "RETURN_BOOK":
        return `<p><span class="user">${username}</span> returned <span class="book">${bookTitle}</span></p>`;
      case "REGISTER":
        return `<p><span class="user">${username}</span> has signed up</p>`;
      default:
        return `<p>Unknown activity</p>`;
    }
  },
};

/* ========================
   ALL ACTIVITY
======================== */

export const AllActivityView = {
  init() {
    this.list = document.getElementById("all-activity");

    if (!this.list) return;
  },

  render(activities) {
    this.renderAllActivityList(activities);
  },

  renderAllActivityList(activities) {
    // if there's no activitie
    if (!activities) {
      this.list.innerHTML = "No activities found 👀..";
      return;
    }

    // if there's activities
    this.list.innerHTML = "";
    activities.forEach((act) => {
      const activity = `
        <li class="recent-activity-list-item">
            ${this.renderActivityMessage({
              activity_type: act.activity_type,
              username: act.username,
              bookTitle: act.book_title,
            })}
          <span class="activity-date">${UI.relativeDate(act.created_at)}</span>
        </li>
      `;

      this.list.insertAdjacentHTML("beforeend", activity);
    });
  },

  renderActivityMessage({ activity_type, username, bookTitle }) {
    switch (activity_type) {
      case "BORROW_BOOK":
        return `<p><span class="user">${username}</span> borrowed <span class="book">${bookTitle}</span></p>`;
      case "RETURN_BOOK":
        return `<p><span class="user">${username}</span> returned <span class="book">${bookTitle}</span></p>`;
      case "REGISTER":
        return `<p><span class="user">${username}</span> has signed up</p>`;
      default:
        return `<p>Unknown activity</p>`;
    }
  },
};

/* ========================
   SIGN UP
======================== */

export const SignUpView = {
  init({ onSignUpClick, onGoogleAuthClicked }) {
    this.signUpForm = document.getElementById("signup-form");
    this.googleAuth = document.getElementById("oauth-google");

    if (!this.signUpForm || !this.googleAuth) return;

    this.bindEvents(onSignUpClick, onGoogleAuthClicked);
  },

  bindEvents(onSignUpClick, onGoogleAuthClicked) {
    // Sign Up
    this.signUpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      onSignUpClick(this.signUpForm);
    });

    // Continue with Google
    this.googleAuth.addEventListener("click", () => {
      onGoogleAuthClicked();
    });
  },
};

/* ========================
   SIGN IN
======================== */

export const SignInView = {
  init({ onSignInClick, onGoogleAuthClicked }) {
    this.signInForm = document.getElementById("signin-form");
    this.googleAuth = document.getElementById("oauth-google");

    if (!this.signInForm || !this.googleAuth) return;

    this.bindEvents(onSignInClick, onGoogleAuthClicked);
  },

  bindEvents(onSignInClick, onGoogleAuthClicked) {
    // Sign In
    this.signInForm.addEventListener("submit", (e) => {
      e.preventDefault();
      onSignInClick(this.signInForm);
    });

    // Continue with Google
    this.googleAuth.addEventListener("click", () => {
      onGoogleAuthClicked();
    });
  },
};

/* ========================
   NAVBAR
======================== */

export const NavbarView = {
  init({ onSignUpClick, onSignInClick, onSignOutClick }) {
    // Guest
    this.signupBtn = document.getElementById("signup-btn");
    this.signinBtn = document.getElementById("signin-btn");

    // Avatar
    this.avatar = document.getElementById("avatar-dropdown");
    this.avatarMenu = document.getElementById("avatar-menu");
    this.avatarBtn = document.getElementById("avatar-nav-btn");
    this.avatarLetter = document.getElementById("avatar-letter");

    // User links
    this.profileLink = document.getElementById("profile-link");
    this.settingsLink = document.getElementById("settings-link");

    // admin links
    this.overviewLink = document.getElementById("overview-link");
    this.manageBooksLink = document.getElementById("manage-books-link");
    this.manageUsersLink = document.getElementById("manage-users-link");
    this.manageBorrowingsLink = document.getElementById(
      "manage-borrowings-link"
    );

    // signout
    this.signoutBtn = document.getElementById("signout-btn");

    if (
      !this.signupBtn ||
      !this.signinBtn ||
      !this.profileLink ||
      !this.signoutBtn ||
      !this.avatarBtn ||
      !this.avatarMenu ||
      !this.avatarLetter ||
      !this.avatar ||
      !this.overviewLink ||
      !this.manageBooksLink ||
      !this.manageUsersLink ||
      !this.manageBorrowingsLink ||
      !this.settingsLink
    )
      return;

    this.bindEvents(onSignUpClick, onSignInClick, onSignOutClick);
  },

  bindEvents(onSignUpClick, onSignInClick, onSignOutClick) {
    /* === GUEST === */

    // Sign Up
    this.signupBtn.addEventListener("click", () => {
      onSignUpClick();
    });

    // Sign In
    this.signinBtn.addEventListener("click", () => {
      onSignInClick();
    });

    /* === USER === */

    // Toggle avatar menu
    this.avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = this.avatarMenu.classList.toggle("show");
      this.avatarBtn.setAttribute("aria-expanded", isOpen);
    });

    // Close avatar menu
    document.addEventListener("click", () => {
      this.avatarMenu.classList.remove("show");
      this.avatarBtn.setAttribute("aria-expanded", "false");
    });

    // Sign Out
    this.signoutBtn.addEventListener("click", () => {
      onSignOutClick();
    });
  },

  render(user) {
    if (!user) {
      this.guestState();
      return;
    }

    this.userState();
    this.setAvatar(user.username[0]);
  },

  setAvatar(letter) {
    if (this.avatarLetter) this.avatarLetter.textContent = letter.toUpperCase();
  },

  userState() {
    this.avatar?.classList.remove("hidden");
    this.signoutBtn?.classList.remove("hidden");
    this.profileLink?.classList.remove("hidden");
    this.settingsLink?.classList.remove("hidden");
  },

  guestState() {
    this.signoutBtn?.classList.add("hidden");
    this.signupBtn?.classList.remove("hidden");
    this.signinBtn?.classList.remove("hidden");
  },

  adminState() {
    this.avatar?.classList.remove("hidden");
    this.manageBorrowingsLink?.classList.remove("hidden");
    this.manageUsersLink?.classList.remove("hidden");
    this.manageBooksLink?.classList.remove("hidden");
    this.overviewLink?.classList.remove("hidden");
  },
};

/* ========================
   MANAGE BOOKS
======================== */

export const ManageBooksView = {
  init({
    onSearch,
    onAddBookSubmit,
    onEditBookClicked,
    onEditBookSubmit,
    onDeleteBookClicked,
  }) {
    this.container = document.getElementById("manage-books-data");
    this.searchField = document.getElementById("search-books-table");

    // add book model
    this.addBookModel = document.getElementById("add-book-model");
    this.openAddModel = document.getElementById("open-add-model");
    this.closeAddModel = document.getElementById("close-add-model");
    this.addBookForm = document.getElementById("add-book-form");

    this.addFormImgFile = document.getElementById("add-form-img-file");
    this.editFormImgFile = document.getElementById("edit-form-img-file");

    this.addBookFileName = document.getElementById("add-book-file-name");
    this.editBookFileName = document.getElementById("edit-book-file-name");

    // edit book model
    this.editBookModel = document.getElementById("edit-book-model");
    this.closeEditModel = document.getElementById("close-edit-model");
    this.editBookForm = document.getElementById("edit-book-form");

    if (
      !this.container ||
      !this.addBookModel ||
      !this.addBookForm ||
      !this.editBookModel ||
      !this.editBookForm ||
      !this.searchField ||
      !this.closeAddModel ||
      !this.closeEditModel ||
      !this.openAddModel ||
      !this.addFormImgFile ||
      !this.editFormImgFile ||
      !this.addBookFileName ||
      !this.editBookFileName
    )
      return;

    this.bindEvents(
      onSearch,
      onAddBookSubmit,
      onEditBookClicked,
      onEditBookSubmit,
      onDeleteBookClicked
    );
  },

  bindEvents(
    onSearch,
    onAddBookSubmit,
    onEditBookClicked,
    onEditBookSubmit,
    onDeleteBookClicked
  ) {
    // upload img for add book form
    this.addFormImgFile.addEventListener("change", () => {
      this.addBookFileName.textContent =
        this.addFormImgFile.files[0]?.name || "No file selected";
    });

    // upload img for edit book form
    this.editFormImgFile.addEventListener("change", () => {
      this.editBookFileName.textContent =
        this.editFormImgFile.files[0]?.name || "No file selected";
    });

    // Search
    this.searchField.addEventListener("input", (e) => {
      onSearch(e.target.value);
    });

    // Open add book model
    this.openAddModel.addEventListener("click", () => {
      this.openAddBookModel();
    });

    // Close add book model
    this.closeAddModel.addEventListener("click", () => {
      this.closeAddBookModel();
    });

    // Add book form
    this.addBookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      onAddBookSubmit(this.addBookForm);
    });

    // Open edit book model
    this.container.addEventListener("click", async (e) => {
      const btn = e.target.closest(".edit-book-btn");
      if (!btn) return;

      const bookId = Number(btn.dataset.bookId) || null;
      this.editBookForm.dataset.bookId = bookId;

      onEditBookClicked(bookId);
    });

    // Close edit book model
    this.closeEditModel.addEventListener("click", () => {
      this.closeEditBookModel();
    });

    // Edit book
    this.editBookForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const bookId = this.editBookForm.dataset.bookId;
      const formData = new FormData(this.editBookForm);

      if (!bookId || !formData) return;

      onEditBookSubmit(bookId, formData);
    });

    // Delete book
    this.container.addEventListener("click", async (e) => {
      const btn = e.target.closest(".delete-book-btn");
      if (!btn) return;

      const bookId = btn.dataset.bookId;

      onDeleteBookClicked(bookId);
    });
  },

  openAddBookModel() {
    this.addBookModel.classList.remove("hidden");
  },

  closeAddBookModel() {
    this.addBookModel.classList.add("hidden");
  },

  resetAddBookForm() {
    this.addBookForm.reset();
  },

  openEditBookModel(book) {
    this.editBookForm.isbn.value = book.isbn ?? "";
    this.editBookForm.title.value = book.title ?? "";
    this.editBookForm.author.value = book.author ?? "";
    this.editBookForm.language.value = book.language ?? "";
    this.editBookForm.subtitle.value = book.subtitle ?? "";
    this.editBookForm.page_count.value = book.page_count ?? "";
    this.editBookForm.publisher.value = book.publisher ?? "";
    this.editBookForm.published_at.value = book.published_at ?? "";
    this.editBookForm.total_copies.value = book.total_copies ?? "";
    this.editBookForm.description.value = book.description ?? "";

    this.editBookModel.classList.remove("hidden");
  },

  closeEditBookModel() {
    this.editBookModel.classList.add("hidden");
  },

  // Render manage books table
  renderBooksTable(books) {
    this.container.innerHTML = "";

    books.forEach((b) => {
      const book = `
      <tr>
        <td>${b.id}</td>
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.total_copies}</td>
        <td>
          <div class="manage-books-btns">
            <button
              class="edit-book-btn manage-books-btn btn-action"
              data-book-id="${b.id}">
              Edit
            </button>
            <button
              class="delete-book-btn manage-books-btn btn-action btn-danger"
              data-book-id="${b.id}">
              Delete
            </button>
          </div>
        </td>
      </tr>
      `;
      this.container.insertAdjacentHTML("beforeend", book);
    });
  },
};

/* ========================
   MANAGE USERS
======================== */

export const ManageUsersView = {
  searchQuery: "",

  init({
    onSearch,
    onEditUserClicked,
    onEditUserSubmit,
    onAddUserSubmit,
    onDeleteUserClicked,
  }) {
    this.container = document.getElementById("manage-users-data");
    this.searchField = document.getElementById("search-users-table");

    // add user model
    this.addUserModel = document.getElementById("add-user-model");
    this.openAddUserModel = document.getElementById("open-add-user-model");
    this.closeAddUserModel = document.getElementById("close-add-user-model");
    this.addUserForm = document.getElementById("add-user-form");

    // edit user model
    this.openEditUserModel = document.getElementById("edit-user-model");
    this.closeEditUserModel = document.getElementById("close-edit-user-model");
    this.editUserForm = document.getElementById("edit-user-form");

    if (
      !this.container ||
      !this.searchField ||
      !this.openAddUserModel ||
      !this.closeAddUserModel ||
      !this.addUserModel ||
      !this.addUserForm ||
      !this.openEditUserModel ||
      !this.editUserForm ||
      !this.closeEditUserModel
    )
      return;

    this.bindEvents(
      onSearch,
      onEditUserClicked,
      onEditUserSubmit,
      onAddUserSubmit,
      onDeleteUserClicked
    );
  },

  bindEvents(
    onSearch,
    onEditUserClicked,
    onEditUserSubmit,
    onAddUserSubmit,
    onDeleteUserClicked
  ) {
    // Search
    this.searchField.addEventListener("input", (e) => {
      e.preventDefault();
      this.searchQuery = e.target.value;
      onSearch(this.searchQuery);
    });

    // Open add user model
    this.openAddUserModel.addEventListener("click", () => {
      this.openAddModel();
    });

    // Close add user model
    this.closeAddUserModel.addEventListener("click", () => {
      this.closeAddModel();
    });

    // Open edit user model
    this.container.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-user-btn");
      if (!editBtn) return;

      const userId = Number(editBtn.dataset.userId);
      if (!userId) return;

      this.editUserForm.dataset.userId = userId;

      onEditUserClicked(userId);
    });

    // close edit user model
    this.closeEditUserModel.addEventListener("click", () => {
      this.closeEditModel();
    });

    // Edit user
    this.editUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userId = this.editUserForm.dataset.userId;
      if (!userId) return;

      const formData = new FormData(this.editUserForm);
      if (!formData) return;

      onEditUserSubmit(userId, formData);
    });

    // Add user
    this.addUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      onAddUserSubmit(this.addUserForm);
    });

    // delete user
    this.container.addEventListener("click", async (e) => {
      const deleteBtn = e.target.closest(".delete-user-btn");
      if (!deleteBtn) return;

      const userId = Number(deleteBtn.dataset.userId);
      if (!userId) return;

      onDeleteUserClicked(userId);
    });
  },

  openAddModel() {
    this.addUserModel.classList.remove("hidden");
  },

  closeAddModel() {
    this.addUserModel.classList.add("hidden");
  },

  resetAddModel() {
    this.addUserForm.reset();
  },

  openEditModel(user) {
    this.editUserForm.username.value = user.username ?? "";
    this.editUserForm.email.value = user.email ?? "";

    this.openEditUserModel.classList.remove("hidden");
  },

  closeEditModel() {
    this.openEditUserModel.classList.add("hidden");
  },

  renderUsersTable(books) {
    this.container.innerHTML = "";

    books.forEach((user) => {
      const tr = `
        <tr>
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${UI.toLocaleDateFormatter(user.date_joined)}</td>
          <td>
            <button 
              type="button" 
              class="edit-user-btn btn-action"
              data-user-id="${user.id}">
              Edit
            </button>
            <button 
              type="button" 
              class="delete-user-btn btn-action btn-danger"
              data-user-id="${user.id}">
              Delete
            </button>
          </td>
        </tr>
      `;
      this.container.insertAdjacentHTML("beforeend", tr);
    });
  },
};

/* ========================
   MANAGE BORROWINGS
======================== */

export const ManageBorrowingsView = {
  options: {
    searchQuery: "",
    statusFilter: "all",
  },

  init({ applyFilters, onReturnClicked }) {
    this.container = document.getElementById("manage-borrowings-data");
    this.filters = document.getElementById("borrowings-filters");
    this.searchField = document.getElementById("search-borrowings-field");
    if (!this.container || !this.filters || !this.searchField) return;

    this.bindEvents(applyFilters, onReturnClicked);
  },

  bindEvents(applyFilters, onReturnClicked) {
    // Search listener
    this.searchField.addEventListener("input", (e) => {
      e.preventDefault();

      this.options.searchQuery = e.target.value;
      applyFilters(this.options);
    });

    // Filter listener
    this.filters.addEventListener("change", (e) => {
      e.preventDefault();

      this.options.statusFilter = e.target.value;
      applyFilters(this.options);
    });

    // Force return with admin
    this.container.addEventListener("click", async (e) => {
      e.preventDefault();

      const returnBtn = e.target.closest(".return-borrowing-btn");
      if (!returnBtn) return;

      const borrowingId = Number(returnBtn.dataset.borrowingId);
      if (!borrowingId) return;

      onReturnClicked(borrowingId);
    });
  },

  renderBorrowingsTable(books) {
    this.container.innerHTML = "";

    books.forEach((borrowing) => {
      const showReturnBtn = borrowing.status === "Active";
      const showReturnDate = borrowing.status === "Returned";
      const tr = `
        <tr>
          <td>${borrowing.user}</td>
          <td>${borrowing.book}</td>
          <td>${UI.formatDate(borrowing.borrowed_at)}</td>
          <td>${UI.formatDate(borrowing.due_at)}</td>
          <td>${borrowing.status}</td>
          <td>
            ${
              showReturnDate
                ? UI.formatDate(borrowing.returned_at)
                : `<span>-</span>`
            }
          </td>
          <td>
            ${
              showReturnBtn
                ? `<button
                      type="button"
                      class="return-borrowing-btn manage-borrowings-btn btn-action"
                      data-borrowing-id="${borrowing.id}">
                      Return
                  </button>`
                : `<span>-</span>`
            }
          </td>
        </tr>
      `;
      this.container.insertAdjacentHTML("beforeend", tr);
    });
  },
};
