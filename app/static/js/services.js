import { LMS_Storage } from "./utils.js";
import { CONFIG } from "./config.js";

/* ========================
   API
======================== */

export const Api = {
  async request(endpoint, options = {}) {
    // Headers
    const headers = {
      ...(options.headers || {}),
    };

    // don't include applicaiton/json if data is formData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Request
    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });

    let data = null;
    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    }

    return { response, data };
  },
};

/* ========================
   AUTH
======================== */

export const AuthService = {
  // Get current user data
  async getCurrentUser() {
    const { response, data } = await Api.request("/auth/me", { method: "GET" });
    if (!response.ok) return null; // guest -> false
    return data.user; // user
  },

  // Get auth state
  async getAuthState() {
    const { response, data } = await Api.request("/auth/state", {
      method: "GET",
    });
    return data.user;
  },

  // Create a new account
  async signUp(formData) {
    const { response, data } = await Api.request("/auth/signup", {
      method: "POST",
      body: formData,
    });

    if (response.status === 201) {
      return { response, data };
    }
    return { response, data };
  },

  // Sign in
  async signIn(formData) {
    const { response, data } = await Api.request("/auth/signin", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return response.error || "Signin failed";
    }
    return { response, data };
  },

  // Sign out
  async signOut() {
    const res = await Api.request("/auth/signout", { method: "POST" });
    console.log(res.data);
    if (!res.response.ok) return;
    return res.response.ok;
  },
};

/* ========================
   BOOKS
======================== */

export const BookService = {
  async loadAll() {
    const { response, data } = await Api.request("/books/all", {
      method: "GET",
    });

    if (response.status === 200) {
      return data;
    }

    return [];
  },

  // Load all books by search
  async search(params = {}) {
    const q = new URLSearchParams(params).toString();

    const { response, data } = await Api.request(`/books/all?${q}`, {
      method: "GET",
    });

    if (response.status === 200) {
      return data;
    }

    return [];
  },

  // Read all books from local storage
  getAll() {
    return LMS_Storage.get(CONFIG.BOOKS_KEY) || [];
  },

  // Read book by id
  getById(bookId) {
    const books = this.getAll();
    return books.find((book) => book.id === bookId);
  },

  // Add book
  async addBook(formData) {
    const { response, data } = await Api.request("/books/create", {
      method: "POST",
      body: formData,
    });

    return { response, data };
  },

  // Delete by id
  async deleteBook(bookId) {
    const { response, data } = await Api.request(`/books/${bookId}`, {
      method: "DELETE",
    });

    return { response, data };
  },

  // Update by id
  async updateBook(bookId, formData) {
    const { response, data } = await Api.request(`/books/${bookId}`, {
      method: "PATCH",
      body: formData,
    });

    return { response, data };
  },
};

/* ========================
   BORROWINGS
======================== */

export const BorrowingService = {
  // Borrow book
  async borrowBook(bookId) {
    const { response, data } = await Api.request("/borrowings/borrow", {
      method: "POST",
      body: JSON.stringify({ book_id: bookId }),
    });

    return { response, data };
  },

  // Return borrowed book
  async returnBook(borrowingId) {
    const { response, data } = await Api.request(
      `/borrowings/return/${borrowingId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          borrowing_id: borrowingId,
        }),
      }
    );

    return { response, data };
  },

  // Load all borrowings
  async loadAll() {
    const { response, data } = await Api.request("/borrowings/all", {
      method: "GET",
    });

    if (response.status === 200) {
      return data;
    } else {
      console.log("Failed to load all borrowings");
    }
  },

  // Read borrowings by user
  getByUser() {
    return LMS_Storage.get(CONFIG.USER_DATA_KEY);
  },

  // Read all borrowings
  getAll() {
    const user = this.getUserData();
    return user?.all_borrowings || [];
  },

  // Read active borrowings
  getActive() {
    const user = this.getUserData();
    return user?.active_borrowings() || [];
  },
};

/* ========================
   USER
======================== */

export const UserService = {
  async loadProfile() {
    const { response, data } = await Api.request("/user/profile", {
      method: "GET",
    });
    if (!response.ok) return null;
    return data;
  },

  async loadAll() {
    const { response, data } = await Api.request("/user/all", {
      method: "GET",
    });

    if (response.status === 200) {
      return data;
    }

    return [];
  },

  async loadById() {
    const { response, data } = await Api.request("/user/current", {
      method: "GET",
    });
    if (!response.ok) return null;
    return data;
  },

  async createUser(formData) {
    const { response, data } = await Api.request("/user/create-with-admin", {
      method: "POST",
      body: formData,
    });

    return { response, data };
  },

  async deleteUser(userId) {
    const { response, data } = await Api.request(`/user/delete/${userId}`, {
      method: "DELETE",
    });

    return { response, data };
  },

  async updateUser(userId, formData) {
    const { response, data } = await Api.request(`/user/update/${userId}`, {
      method: "PATCH",
      body: formData,
    });

    return { response, data };
  },
};

/* ========================
   ACTIVITIES
======================== */

export const ActivityService = {
  async loadAll() {
    const { response, data } = await Api.request("/activities/all", {
      method: "GET",
    });
    if (!response.ok) return [];
    return data;
  },

  async loadById(id) {
    const { response, data } = await Api.request(`/activities/${id}`, {
      method: "GET",
    });
    if (!response.ok) return null;
    return data;
  },

  async loadByLimit() {
    const { response, data } = await Api.request("/activities/limit", {
      method: "GET",
    });
    if (!response.ok) return [];
    return data;
  },

  async loadRecent() {
    const { response, data } = await Api.request("/activities/recent", {
      method: "GET",
    });
    if (!response.ok) return [];
    return data;
  },
};

/* ========================
   FAVORITES
======================== */

export const Favorites = {
  async createFavorite(bookId) {
    const { response, data } = await Api.request("/favorites/create", {
      method: "POST",
      body: JSON.stringify({ book_id: bookId }),
    });
    if (!response.ok) return;
    return { response, data };
  },

  async loadAllFavorites() {
    const { response, data } = await Api.request("/favorites/all", {
      method: "GET",
    });
    if (!response.ok) return [];
    return data;
  },

  async loadFavoritesByUser() {
    const { response, data } = await Api.request("/favorites/user", {
      method: "GET",
    });
    if (!response.ok) return [];
    return data;
  },

  async deleteFavorite(favId) {
    const { response, data } = await Api.request("/favorites/delete", {
      method: "DELETE",
      body: {
        fav_id: favId,
      },
    });
    if (!response.ok) return;
    return { response, data };
  },
};
