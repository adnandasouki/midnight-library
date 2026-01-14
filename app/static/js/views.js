import { UI } from "./utils.js";

/* ========================
   HOMEPAGE
======================== */

export const HomePageView = {
  init({ books, onSubmit }) {
    this.featuredBooks = document.getElementById("featured-books");
    this.searchForm = document.getElementById("home-search-form");
    this.searchInput = document.getElementById("home-search-input");

    if (!this.searchInput || !this.searchForm || !this.featuredBooks) return;

    this.bindEvents(onSubmit);
    this.render(books);
  },

  render(books) {
    this.renderFeaturedBooks(books);
  },

  bindEvents(onSubmit) {
    this.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const q = this.searchInput.value.trim();
      if (!q) return;

      onSubmit(q);
    });
  },

  renderFeaturedBooks(books) {
    this.featuredBooks.innerHTML = "";

    books.slice(0, 5).forEach((b) => {
      this.featuredBooks.insertAdjacentHTML(
        "beforeend",
        `
          <a href="/books/${b.id}">
            <div class="book-container">
              <img class="book-img" src="/static/assets/books/${b.book_img}"></img>
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
  init({ onBorrowClick, onFavoriteClick }) {
    this.borrowBtn = document.getElementById("borrow-btn");
    this.favoriteBtn = document.getElementById("favorite-btn");
    if (!this.borrowBtn || !this.favoriteBtn) return;

    this.bindEvents(onBorrowClick, onFavoriteClick);
  },

  bindEvents(onBorrowClick, onFavoriteClick) {
    // Borrow Book
    this.borrowBtn.addEventListener("click", () => {
      onBorrowClick();
    });

    // Add to Favorites
    this.favoriteBtn.addEventListener("click", () => {
      onFavoriteClick();
    });
  },

  renderBook(book) {
    console.log(book);
    let status = book.total_copies > 0 ? "available" : "unavailable";

    document.getElementById("by-author").textContent = book.author;

    document.getElementById("published").textContent = book.published_at;

    document.getElementById("book-subtitle").textContent = book.subtitle;
    console.log(book.subtitle);

    document.getElementById(
      "book-img"
    ).src = `/static/assets/books/${book.book_img}`;
    document.getElementById("book-status").textContent = status;
    document.getElementById("book-status").classList.add(status);

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
  init({
    profile,
    onReturnClicked,
    onRemoveFavoriteClicked,
    onUpdateUsername,
    onUpdateEmail,
    onPasswordUpdate,
  }) {
    // hero
    this.avatar = document.getElementById("profile-avatar");
    this.username = document.getElementById("profile-username");
    this.email = document.getElementById("profile-email");

    // content
    this.content = document.getElementById("profile-content");

    // tables
    this.borrowings = document.querySelector(".active-borrowings");
    this.historyTable = document.querySelector(".history");
    this.favoritesTable = document.querySelector(".favorites");

    this.active = document.getElementById("active-borrowings");
    this.history = document.getElementById("borrowings-history");
    this.favorites = document.getElementById("favorite-books");

    if (
      !this.active ||
      !this.username ||
      !this.email ||
      !this.avatar ||
      !this.history ||
      !this.favorites ||
      !this.content
    )
      return;

    console.log("passed");

    this.render(profile, this.hashInput());
    this.bindEvents(
      profile,
      onReturnClicked,
      onRemoveFavoriteClicked,
      onUpdateUsername,
      onUpdateEmail,
      onPasswordUpdate
    );
  },

  render(profile, subpage) {
    this.renderHero(profile);

    switch (subpage) {
      case "borrowings":
        this.selectSubpage(subpage);
        this.renderActiveBorrowings(profile);
        break;

      case "history":
        this.selectSubpage(subpage);
        this.renderBorrowingsHistory(profile);
        break;

      case "favorites":
        this.selectSubpage(subpage);
        this.renderFavorites(profile);
        break;

      case "settings":
        this.selectSubpage(subpage);
        this.renderAccountInfo(profile);
        break;

      default:
        this.renderActiveBorrowings(profile);
        break;
    }
  },

  bindEvents(
    profile,
    onReturnClicked,
    onRemoveFavoriteClicked,
    onUpdateUsername,
    onUpdateEmail,
    onPasswordUpdate
  ) {
    // borrowings subpage
    document
      .getElementById("borrowings-subpage")
      .addEventListener("click", () => {
        location.hash = "borrowings";
        this.render(profile, this.hashInput());
      });

    // history subpage
    document.getElementById("history-subpage").addEventListener("click", () => {
      location.hash = "history";
      this.render(profile, this.hashInput());
    });

    // favorites subpage
    document
      .getElementById("favorites-subpage")
      .addEventListener("click", () => {
        location.hash = "favorites";
        this.render(profile, this.hashInput());
      });

    // settings subpage
    document
      .getElementById("settings-subpage")
      .addEventListener("click", () => {
        location.hash = "settings";
        this.render(profile, this.hashInput());
      });

    // Return Book
    this.active.addEventListener("click", async (e) => {
      const returnBtn = e.target.closest(".return-btn");
      if (!returnBtn) return;

      const borrowingId = returnBtn.dataset.borrowingId;
      if (!borrowingId) return;

      onReturnClicked(borrowingId);
    });

    // Remove favorite
    this.favorites.addEventListener("click", (e) => {
      const removeFavoriteBtn = e.target.closest(".remove-favorite-btn");
      if (!removeFavoriteBtn) return;

      const favoriteId = removeFavoriteBtn.dataset.removeFavoriteBtn;
      if (!favoriteId) return;

      onRemoveFavoriteClicked(favoriteId);
    });

    // ===== SETTINGS =====

    // === modal ===
    // open modal (generic)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-modal]");
      if (!btn) return;

      const selected = btn.dataset.openModal;
      const modal = document.querySelector(selected);
      if (!modal) return;

      modal.classList.remove("hidden");
    });
    // close modal (generic)
    document.addEventListener("click", (e) => {
      if (
        e.target.closest("[data-close-modal]") ||
        e.target === e.target.closest("[data-modal]")
      ) {
        e.target.closest("[data-modal]").classList.add("hidden");
      }
    });
    // close modal with esc button
    document.addEventListener("keydown", (e) => {
      if (e.key != "Escape") return;

      const modal = document.querySelector("[data-modal]:not(.hidden)");
      if (!modal) return;

      modal.classList.add("hidden");
    });
    // submit form (generic)
    document.addEventListener("submit", (e) => {
      const modal = document.querySelector("[data-modal]");
      const form = e.target.closest("[data-form-type]");
      if (!form) return;

      e.preventDefault();

      const type = form.dataset.formType;

      if (type === "username") {
        onUpdateUsername(form);
      }

      if (type === "email") {
        onUpdateEmail(form);
      }
      if (type === "password") {
        onPasswordUpdate(form);
      }

      modal.classList.add("hidden");
    });
  },

  closeUpdatePasswordMode() {
    document.getElementById("update-password-model").classList.add("hidden");
  },

  renderErrorMsg(msg) {
    document.getElementById("form-error").classList.remove("hidden");
    document.getElementById("error").textContent = msg;
  },

  renderAccountInfo(profile) {
    document.getElementById("info-username").textContent = profile.username;
    document.getElementById("info-email").textContent = profile.email;
  },

  hashInput() {
    return location.hash.replace("#", "") || "borrowings";
  },

  selectSubpage(subpage) {
    switch (subpage) {
      case "borrowings":
        document
          .getElementById("profile-borrowings-table")
          .classList.remove("hidden");
        document
          .getElementById("profile-history-table")
          .classList.add("hidden");
        document.getElementById("favorites-table").classList.add("hidden");
        document.getElementById("profile-settings").classList.add("hidden");

        document.getElementById("borrowings-subpage").classList.add("active");
        document.getElementById("history-subpage").classList.remove("active");
        document.getElementById("favorites-subpage").classList.remove("active");
        document.getElementById("settings-subpage").classList.remove("active");
        break;
      case "history":
        document
          .getElementById("profile-history-table")
          .classList.remove("hidden");
        document
          .getElementById("profile-borrowings-table")
          .classList.add("hidden");
        document.getElementById("favorites-table").classList.add("hidden");
        document.getElementById("profile-settings").classList.add("hidden");

        document.getElementById("favorites-subpage").classList.remove("active");
        document.getElementById("history-subpage").classList.add("active");
        document
          .getElementById("borrowings-subpage")
          .classList.remove("active");
        document.getElementById("settings-subpage").classList.remove("active");
        break;

      case "favorites":
        document.getElementById("favorites-table").classList.remove("hidden");
        document
          .getElementById("profile-borrowings-table")
          .classList.add("hidden");
        document
          .getElementById("profile-history-table")
          .classList.add("hidden");
        document.getElementById("profile-settings").classList.add("hidden");

        document.getElementById("favorites-subpage").classList.add("active");
        document
          .getElementById("borrowings-subpage")
          .classList.remove("active");
        document.getElementById("history-subpage").classList.remove("active");
        document.getElementById("settings-subpage").classList.remove("active");
        break;

      case "settings":
        document.getElementById("profile-settings").classList.remove("hidden");
        document.getElementById("favorites-table").classList.add("hidden");
        document
          .getElementById("profile-borrowings-table")
          .classList.add("hidden");
        document
          .getElementById("profile-history-table")
          .classList.add("hidden");

        document.getElementById("settings-subpage").classList.add("active");
        document.getElementById("favorites-subpage").classList.remove("active");
        document
          .getElementById("borrowings-subpage")
          .classList.remove("active");
        document.getElementById("history-subpage").classList.remove("active");
    }
  },

  renderHero(profile) {
    // Avatar
    this.avatar.textContent = profile.username[0].toUpperCase();

    // Identity
    this.username.textContent = profile.username;
    this.email.textContent = profile.email;
  },

  // Active borrowings
  renderActiveBorrowings(profile) {
    const tbody = this.active;
    const table = this.borrowings;
    tbody.innerHTML = "";

    // Active borrowings
    const activeBorrowings = profile.all_borrowings.filter(
      (b) => b.status === "active" || b.status === "overdue"
    );

    // empty state
    if (activeBorrowings.length === 0) {
      table.classList.add("is-empty");
      table.classList.remove("has-data");

      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="empty-row">
          <td colspan="6">
            <div class="empty-state">
              <img src="/static/assets/icons/empty.png">
              <p>No active borrowings yet</p>
            </div>
          </td>
        </tr>
      `
      );
      return;
    }

    table.classList.remove("is-empty");
    table.classList.add("has-data");

    // data rows
    activeBorrowings.forEach((borrowing) => {
      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td class="id">${borrowing.book_id}</td>
          <td class="title">${borrowing.title}</td>
          <td>${UI.formatDate(borrowing.borrowed_at)}</td>
          <td>${UI.formatDate(borrowing.due_at)}</td>
          <td class="status-cell"><span class="status-badge status-${
            borrowing.status
          }">${borrowing.status}</span></td>
          <td>
            <button
              class="return-btn btn btn-sm btn-return"
              data-borrowing-id="${borrowing.id}"
              type="button">
              Return
            </button>
          </td>
        </tr>
        `
      );
    });
  },

  // Recent borrowings history
  renderBorrowingsHistory(profile) {
    const tbody = this.history;
    const table = this.historyTable;
    tbody.innerHTML = "";

    const borrowingsHistory = profile.all_borrowings.filter(
      (b) => b.status === "returned"
    );

    if (borrowingsHistory.length === 0) {
      table.classList.add("is-empty");
      table.classList.remove("has-data");

      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="empty-row">
          <td colspan="4">
            <div class="empty-state">
              <img src="/static/assets/icons/empty.png">
              <p>No borrowed books yet</p>
            </div>
          </td>
        </tr>
        `
      );
      return;
    }

    table.classList.remove("is-empty");
    table.classList.add("has-data");

    borrowingsHistory.forEach((borrowing) => {
      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td>${borrowing.book_id}</td>
          <td title="${borrowing.title}">${borrowing.title}</td>
          <td>${UI.formatDate(borrowing.borrowed_at)}</td>
          <td>${UI.formatDate(borrowing.returned_at)}</td>
          <td></td>
        </tr>
        `
      );
    });
  },

  // Favorites
  renderFavorites(profile) {
    const tbody = this.favorites;
    const table = this.favoritesTable;
    tbody.innerHTML = "";

    if (profile.favorites.length === 0) {
      table.classList.add("is-empty");
      table.classList.remove("has-data");
      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="empty-row">
          <td colspan="2">
            <div class="empty-state">
              <img src="/static/assets/icons/empty.png">
              <p>No favorite books yet</p>
            </div>
          </td>
        </tr>
        `
      );
      return;
    }

    table.classList.remove("is-empty");
    table.classList.add("has-data");

    profile.favorites.forEach((f) => {
      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td class="title">${f.title}</td>
          <td class="action">
            <button
              class="remove-favorite-btn btn btn-sm btn-delete"
              type="button"
              data-remove-favorite-btn="${f.id}"
              >Remove
            </button>
          </td>
        </tr>
        `
      );
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

    // attention required items
    this.overdueAttentionCount = document.getElementById(
      "overdue-attention-count"
    );
    this.stockAttentionCount = document.getElementById("stock-attention-count");

    if (
      !this.usersCount ||
      !this.booksCount ||
      !this.borrowingsCount ||
      !this.recentActivityContainer ||
      !this.overdueAttentionCount ||
      !this.stockAttentionCount
    )
      return;
  },

  // render admin overview page
  render({ users, books, borrowings, activities }) {
    // attention required
    const overdues = borrowings.filter((b) => b.status === "overdue");
    if (overdues.length > 0) {
      document.getElementById("overdue-link").classList.remove("hidden");
      this.overdueAttentionCount.textContent = overdues.length;
    }

    const outOfStockBooks = books.filter((b) => b.total_copies === 0);
    if (outOfStockBooks.length > 0) {
      document.getElementById("stock-link").classList.remove("hidden");
      this.stockAttentionCount.textContent = outOfStockBooks.length;
    }

    // KPIs
    this.borrowingsCount.textContent = `${borrowings.length}`;
    this.usersCount.textContent = `${users.length}`;
    this.booksCount.textContent = `${books.length}`;

    // recent activity
    this.renderRecentActivity(activities);
  },

  showAttention(attention) {
    attention.classList.remove("hidden");
  },

  hideAttention(attention) {
    attention.classList.add("hidden");
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

    // loading
    this.submitBtn = this.signUpForm.querySelector("button[type='submit']");
    this.spinner = this.submitBtn.querySelector(".spinner");
    this.btnText = this.submitBtn.querySelector(".submit-text");

    // error
    this.error = this.signUpForm.querySelector(".error");

    if (!this.signUpForm || !this.googleAuth) return;

    this.bindEvents(onSignUpClick, onGoogleAuthClicked);
  },

  // events
  bindEvents(onSignUpClick, onGoogleAuthClicked) {
    // local
    this.signUpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      onSignUpClick(this.signUpForm);
    });

    // google
    this.googleAuth.addEventListener("click", () => {
      onGoogleAuthClicked();
    });
  },

  // loading state
  showLoading() {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = true;
    this.spinner.classList.remove("hidden");
    this.btnText.classList.add("hidden");
  },

  hideLodaing() {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = true;
    this.spinner.classList.add("hidden");
    this.btnText.classList.remove("hidden");
  },

  showError(e) {
    this.error.classList.remove("hidden");
    this.error.textContent = e;
  },

  hideError() {
    this.error.classList.add("hidden");
  },

  showGoogleLoading() {
    this.googleAuth.disabled = true;

    const spinner = this.googleAuth.querySelector(".spinner");
    const btnContent = this.googleAuth.querySelector(".oauth-btn-content");

    spinner.classList.remove("hidden");
    btnContent.classList.add("hidden");
  },

  resetGoogleLoading() {
    this.googleAuth.disabled = false;

    const spinner = this.googleAuth.querySelector(".spinner");
    const btnContent = this.googleAuth.querySelector(".oauth-btn-content");

    spinner.classList.add("hidden");
    btnContent.classList.remove("hidden");
  },
};

/* ========================
   SIGN IN
======================== */

export const SignInView = {
  init({ onSignInClick, onGoogleAuthClicked }) {
    // signin form
    this.signInForm = document.getElementById("signin-form");
    this.googleAuth = document.getElementById("oauth-google");

    // loading
    this.submitBtn = this.signInForm.querySelector("button[type='submit']");
    this.spinner = this.submitBtn.querySelector(".spinner");
    this.btnText = this.submitBtn.querySelector(".submit-text");

    // error
    this.error = this.signInForm.querySelector(".error");

    // password
    this.passInput = document.querySelector('input[type="password"]');
    this.showPass = document.querySelector(".password.show");
    this.hidePass = document.querySelector(".password.hide");

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

    // show password
    this.showPass.addEventListener("click", () => {
      this.passInput.type = "text";
      this.showPass.classList.add("hidden");
      this.hidePass.classList.remove("hidden");

      this.passInput.focus();
    });

    // hide password
    this.hidePass.addEventListener("click", () => {
      this.passInput.type = "password";
      this.showPass.classList.remove("hidden");
      this.hidePass.classList.add("hidden");

      this.passInput.focus();
    });
  },

  showLoading() {
    this.submitBtn.disabled = true;
    this.spinner.classList.remove("hidden");
    this.btnText.classList.add("hidden");
  },

  hideLoading() {
    this.submitBtn.disabled = false;
    this.spinner.classList.add("hidden");
    this.btnText.classList.remove("hidden");
  },

  showError(e) {
    this.error.classList.remove("hidden");
    this.error.textContent = e;
  },

  hideError() {
    this.error.classList.add("hidden");
  },

  showGoogleLoading() {
    this.googleAuth.disabled = true;

    const spinner = this.googleAuth.querySelector(".spinner");
    const btnContent = this.googleAuth.querySelector(".oauth-btn-content");

    spinner.classList.remove("hidden");
    btnContent.classList.add("hidden");
  },

  resetGoogleLoading() {
    this.googleAuth.disabled = false;

    const spinner = this.googleAuth.querySelector(".spinner");
    const btnContent = this.googleAuth.querySelector(".oauth-btn-content");

    spinner.classList.add("hidden");
    btnContent.classList.remove("hidden");
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
      !this.manageBorrowingsLink
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
    books,
    onSearch,
    onDeleteBookClicked,
    onAddBookSubmit,
    onEditBookSubmit,
  }) {
    this.container = document.getElementById("manage-books-data");

    this.searchField = document.getElementById("search-field");
    this.clearSearch = document.getElementById("clear-search");

    this.addFormImgFile = document.getElementById("add-form-img-file");
    this.addBookFileName = document.getElementById("add-book-file-name");

    this.editFormImgFile = document.getElementById("edit-form-img-file");
    this.editBookFileName = document.getElementById("edit-book-file-name");

    if (!this.container || !this.addFormImgFile || !this.editFormImgFile)
      return;

    this.books = books;

    this.render(books);
    this.bindEvents(
      onSearch,
      onDeleteBookClicked,
      onAddBookSubmit,
      onEditBookSubmit
    );
  },

  render(books) {
    this.renderBooksTable(books);
  },

  bindEvents(onSearch, onDeleteBookClicked, onAddBookSubmit, onEditBookSubmit) {
    this.searchField.addEventListener("input", (e) => {
      onSearch(e.target.value);

      if (e.target.value === "") {
        this.clearSearch.classList.add("hidden");
      } else {
        this.clearSearch.classList.remove("hidden");
      }
    });

    this.clearSearch.addEventListener("click", () => {
      this.searchField.value = "";
      this.clearSearch.classList.add("hidden");
    });

    this.container.addEventListener("click", async (e) => {
      const btn = e.target.closest(".delete-book-btn");
      if (!btn) return;

      const bookId = btn.dataset.bookId;

      onDeleteBookClicked(bookId);
    });

    // === MODALS ===

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-modal]");
<<<<<<< HEAD
=======

>>>>>>> 0028886 (fix(manage-books): correct form submission and delete logic)
      if (!btn) return;

      const modal = document.querySelector(btn.dataset.openModal);

      if (modal.id === "edit-book") {
        const book = this.books.find(
          (b) => b.id === Number(btn.dataset.bookId)
        );

        this.initEditBookForm(book);
      }

      modal.classList.remove("hidden");
    });

    document.addEventListener("click", (e) => {
      const closeBtn = e.target.closest("[data-close-modal]");

      const modal = document.querySelector("[data-modal]:not(.hidden)");

      if (closeBtn || e.target === modal) {
        this.resetForm();
        modal.classList.add("hidden");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      const modal = document.querySelector("[data-modal]:not(.hidden)");

      this.resetForm();
      modal.classList.add("hidden");
    });

    document.addEventListener("submit", (e) => {
      const form = e.target.closest("[data-form-type]");

      e.preventDefault();

      const type = form.dataset.formType;

      if (type === "add-book") {
        onAddBookSubmit(form);
      }

      if (type === "edit-book") {
        onEditBookSubmit(form.dataset.bookId, form);
      }

      this.resetForm();
      this.closeModal();
    });

    this.addFormImgFile.addEventListener("change", () => {
      this.addBookFileName.textContent =
        this.addFormImgFile.files[0]?.name || "No file selected";
    });

    this.editFormImgFile.addEventListener("change", () => {
      this.editBookFileName.textContent =
        this.editFormImgFile.files[0]?.name || "No file selected";
    });
  },

  initEditBookForm(book) {
    const form = document.querySelector('[data-form-type="edit-book"]');

    form.dataset.bookId = book.id;

    form.isbn.value = book.isbn ?? "";
    form.title.value = book.title ?? "";
    form.author.value = book.author ?? "";
    form.language.value = book.language ?? "";
    form.subtitle.value = book.subtitle ?? "";
    form.page_count.value = book.page_count ?? "";
    form.publisher.value = book.publisher ?? "";
    form.published_at.value = book.published_at ?? "";
    form.total_copies.value = book.total_copies ?? "";
    form.description.value = book.description ?? "";
  },

  resetForm() {
    document.querySelector("[data-form-type]:not(.hidden)").reset();
  },

  closeModal() {
    document.querySelector("[data-modal]:not(.hidden)").classList.add("hidden");
  },

  renderBooksTable(books) {
    const tbody = this.container;
    const table = document.querySelector(".books");
    tbody.innerHTML = "";

    // empty state
    if (books.length === 0) {
      table.classList.add("is-empty");
      table.classList.remove("has-data");

      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="empty-row">
          <td colspan="5">
            <div class="empty-state">
              <img src="/static/assets/icons/empty.png">
              <p>No books found</p>
            </div>
          </td>
        </tr>
      `
      );
      return;
    }

    table.classList.remove("is-empty");
    table.classList.add("has-data");

    books.forEach((b) => {
      const book = `
      <tr>
        <td class="id">${b.id}</td>
        <td class="title">${b.title}</td>
        <td class="author">${b.author}</td>
        <td class="copies">${b.total_copies}</td>
        <td>
          <div class="table-btns">
            <button
              type="button"
              class="edit-book-btn btn btn-sm btn-edit"
              data-book-id="${b.id}"
              data-open-modal="#edit-book"
              > Edit
            </button>
            <button
              class="delete-book-btn btn btn-sm btn-delete"
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
    onEditUserModalOpen,
    onEditUserSubmit,
    onAddUserSubmit,
    onDeleteUserClicked,
  }) {
    this.container = document.getElementById("manage-users-data");

    this.searchField = document.getElementById("search-field");
    this.clearSearch = document.getElementById("clear-search");

    if (!this.container || !this.searchField) return;

    this.bindEvents(
      onSearch,
      onEditUserModalOpen,
      onEditUserSubmit,
      onAddUserSubmit,
      onDeleteUserClicked
    );
  },

  bindEvents(
    onSearch,
    onEditUserModalOpen,
    onEditUserSubmit,
    onAddUserSubmit,
    onDeleteUserClicked
  ) {
    this.searchField.addEventListener("input", (e) => {
      onSearch(e.target.value);

      if (e.target.value === "") {
        this.clearSearch.classList.add("hidden");
      } else {
        this.clearSearch.classList.remove("hidden");
      }
    });

    this.clearSearch.addEventListener("click", () => {
      this.searchField.value = "";
      this.clearSearch.classList.add("hidden");
    });

    // === USER MODALS ===

    // open modal (generic)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-modal]");
      if (!btn) return;

      const selected = btn.dataset.openModal;

      const modal = document.querySelector(selected);
      if (!modal) return;

      if (modal.id === "edit-user") {
        const userId = btn.dataset.userId;
        onEditUserModalOpen(userId);
      }

      modal.classList.remove("hidden");
    });

    // close with btn or when clicking outside
    document.addEventListener("click", (e) => {
      const modal = e.target.closest("[data-modal]:not(.hidden)");
      const closeBtn = e.target.closest("[data-close-modal]");

      if (!modal) return;

      if (closeBtn || e.target === modal) {
        modal.classList.add("hidden");
        this.resetForm();
      }
    });

    // close with esc btn
    document.addEventListener("keydown", (e) => {
      if (!e.key === "Escape") return;

      // selects the currently visible modal
      const modal = document.querySelector("[data-modal]:not(.hidden)");
      if (!modal) return;

      if (e.key === "Escape") {
        this.resetForm();
        modal.classList.add("hidden");
      }
    });

    // submit modal (generic)
    document.addEventListener("submit", (e) => {
      const modal = e.target.closest("[data-modal]");
      const form = e.target.closest("[data-form-type]");

      if (!form || !modal) return;
      e.preventDefault();

      const type = form.dataset.formType;

      if (type === "add-user") {
        onAddUserSubmit(form);
      }

      if (type === "edit-user") {
        onEditUserSubmit(form.dataset.userId, form);
      }
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

  initEditUserModal(user) {
    const form = document.querySelector('[data-form-type="edit-user"]');
    form.username.value = user.username || "";
    form.email.value = user.email || "";

    // populate user id
    form.dataset.userId = user.id;
  },

  closeVisibleModal() {
    const modal = document.querySelector("[data-modal]:not(.hidden)");
    modal.classList.add("hidden");
  },

  resetForm() {
    const form = document.querySelector("[data-form-type]:not(.hidden)");
    form.reset();
  },

  renderUsersTable(books) {
    const tbody = this.container;
    const table = document.querySelector(".users");
    tbody.innerHTML = "";

    // empty state
    if (books.length === 0) {
      table.classList.add("is-empty");
      table.classList.remove("has-data");

      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="empty-row">
          <td colspan="5">
            <div class="empty-state">
              <img src="/static/assets/icons/empty.png">
              <p>No users found</p>
            </div>
          </td>
        </tr>
      `
      );
      return;
    }

    table.classList.remove("is-empty");
    table.classList.add("has-data");

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
              class="edit-user-btn btn btn-sm btn-edit"
              data-user-id="${user.id}"
              data-open-modal="#edit-user"
              > Edit
            </button>
            <button 
              type="button" 
              class="delete-user-btn btn btn-sm btn-delete"
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

  init({ books, applyFilters, onReturnClicked }) {
    this.container = document.getElementById("manage-borrowings-data");

    this.searchField = document.getElementById("search-field");
    this.clearSearch = document.getElementById("clear-search");

    this.filters = document.getElementById("borrowings-filters");

    if (!this.container || !this.filters || !this.searchField) return;

    this.render(books);
    this.bindEvents(applyFilters, onReturnClicked);
  },

  render(books) {
    this.renderBorrowingsTable(books);
  },

  bindEvents(applyFilters, onReturnClicked) {
    // Search listener
    this.searchField.addEventListener("input", (e) => {
      this.options.searchQuery = e.target.value;
      applyFilters(this.options);

      if (e.target.value) {
        this.clearSearch.classList.remove("hidden");
      } else {
        this.clearSearch.classList.add("hidden");
      }
    });

    this.clearSearch.addEventListener("click", () => {
      this.options.searchQuery = "";
      this.searchField.value = "";
      this.clearSearch.classList.add("hidden");
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
    const tbody = this.container;
    const table = document.querySelector(".borrowings");
    tbody.innerHTML = "";

    // empty state
    if (books.length === 0) {
      table.classList.add("is-empty");
      table.classList.remove("has-data");

      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="empty-row">
          <td colspan="7">
            <div class="empty-state">
              <img src="/static/assets/icons/empty.png">
              <p>No borrowings found</p>
            </div>
          </td>
        </tr>
      `
      );
      return;
    }

    table.classList.remove("is-empty");
    table.classList.add("has-data");

    books.forEach((borrowing) => {
      const showReturnBtn =
        borrowing.status === "active" || borrowing.status === "overdue";
      const showReturnDate = borrowing.status === "returned";
      const tr = `
        <tr>
          <td class="user">${borrowing.user}</td>
          <td class="book">${borrowing.book}</td>
          <td>${UI.formatDate(borrowing.borrowed_at)}</td>
          <td>${UI.formatDate(borrowing.due_at)}</td>
          <td class="status-cell"><span class="status-badge status-${
            borrowing.status
          }">${borrowing.status}</span></td>
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
                      class="return-borrowing-btn btn btn-sm btn-return"
                      data-borrowing-id="${borrowing.id}">
                      Return
                  </button>`
                : `<span>-</span>`
            }
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", tr);
    });
  },
};

/* ========================
   BROWSE BOOKS
======================== */

export const BrowseBookView = {
  init({ data, onSearch, onClearSearch, onPageChange }) {
    // books list
    this.container = document.getElementById("all-books");

    // search
    this.searchInput = document.getElementById("search-field");
    this.clearSearch = document.getElementById("clear-search");

    // counters
    this.booksCount = document.getElementById("books-count");

    // pagination
    this.pageTrack = document.getElementById("page-track");
    this.pagination = document.getElementById("pagination");
    this.nextBtn = document.getElementById("next-btn");
    this.prevBtn = document.getElementById("prev-btn");

    // empty state
    this.emptyState = document.querySelector(".empty-state-wrapper");

    if (!this.container || !this.searchInput) return;

    this.bindEvents(onSearch, onClearSearch);
    this.render(data, onPageChange);
  },

  bindEvents(onSearch, onClearSearch) {
    // search input
    this.searchInput.addEventListener("input", (e) => {
      this.toggleClearSearch();
      onSearch(e.target.value);
    });

    // clear search
    this.clearSearch.addEventListener("click", (e) => {
      this.hideClearSearch();
      onClearSearch();
    });

    this.nextBtn.addEventListener("click", () => {
      this.onPageChange(this.currentPage + 1);
    });

    this.prevBtn.addEventListener("click", () => {
      this.onPageChange(this.currentPage - 1);
    });
  },

  toggleClearSearch() {
    this.clearSearch.classList.toggle("hidden", !this.searchInput.value);
  },

  hideClearSearch() {
    this.clearSearch.classList.add("hidden");
  },

  render(data, onPageChange) {
    this.currentPage = data.current_page;
    this.onPageChange = onPageChange;

    const isEmpty = data.total_items === 0;
    const isSingePage = data.total_pages <= 1;

    this.renderTotalItems(data);
    this.renderBooks(data.books);

    const hidePagination = isEmpty || isSingePage;

    this.pagination.classList.toggle("hidden", hidePagination);
    this.pageTrack.classList.toggle("hidden", hidePagination);

    document.getElementById("links-container").innerHTML = "";

    if (!hidePagination) {
      this.renderPageTrack(data);
      this.renderPagination(
        data.total_pages,
        data.current_page,
        this.onPageChange
      );
    }
  },

  // pagination
  renderPagination(totalPages, currentPage) {
    if (totalPages < 1) {
      return;
    }

    document.getElementById("pagination").classList.remove("hidden");

    const container = document.getElementById("links-container");

    // clears for fresh rerendering (CRITICAL)
    container.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.classList.add("link");
      btn.textContent = i;

      if (i === currentPage) btn.classList.add("active");

      btn.addEventListener("click", () => {
        this.onPageChange(i);
      });

      container.appendChild(btn);
    }

    this.prevBtn.disabled = currentPage === 1;
    this.nextBtn.disabled = currentPage === totalPages;
  },

  setSearchValue(q) {
    this.searchInput.value = q || "";
  },

  focusSearch() {
    if (!this.searchInput) return;
    this.searchInput.focus();
    this.toggleClearSearch();
  },

  renderPageTrack(data) {
    this.pageTrack.textContent = `${data.current_page} of ${data.total_pages}`;
  },

  renderTotalItems(data) {
    this.booksCount.textContent = `${data.total_items} Books`;
  },

  // browse books
  renderBooks(books) {
    this.container.innerHTML = "";

    if (books.length === 0) {
      this.emptyState.classList.remove("hidden");
      this.container.classList.add("hidden");
      return;
    }

    this.emptyState.classList.add("hidden");
    this.container.classList.remove("hidden");

    books.forEach((b) => {
      this.container.insertAdjacentHTML(
        "beforeend",
        `
          <a href="/books/${b.id}">
            <div class="book-container">
              <img class="book-img" src="/static/assets/books/${b.book_img}"></img>
              <h3 class="book-title">${b.title}</h3>
              <p class="book-author">${b.author}</p>
            </div>
          </a>
          `
      );
    });
  },
};
