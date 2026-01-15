import { CONFIG } from "./config.js";
import { handleSessionExpired } from "./utils.js";

/* ========================
   API
======================== */

export const Api = {
  async request(endpoint, options = {}) {
    const headers = {
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });

    if (response.status === 401) {
      console.log("triggered");
      handleSessionExpired();
      throw new Error("Session expired");
    }

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
  async getCurrentUser() {
    const { response, data } = await Api.request("/auth/me", { method: "GET" });
    if (!response.ok) return null; // guest -> false
    return data.user; // user
  },

  async getAuthState() {
    const { response, data } = await Api.request("/auth/state", {
      method: "GET",
    });
    return data.user;
  },

  async signUp(formData) {
    const { response, data } = await Api.request("/auth/signup", {
      method: "POST",
      body: formData,
    });
    return { response, data };
  },

  async signIn(formData) {
    const { response, data } = await Api.request("/auth/signin", {
      method: "POST",
      body: formData,
    });
    return { response, data };
  },

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
  async loadForAdmin() {
    const { response, data } = await Api.request("/books/admin", {
      method: "GET",
    });

    if (response.ok) return data;
    return null;
  },

  async loadAll() {
    const params = new URLSearchParams(window.location.search);

    const { response, data } = await Api.request(
      `/books/all?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (response.ok) return data;
    return null;
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

  async loadById(bookId) {
    const { response, data } = await Api.request(`/books/${bookId}`, {
      method: "GET",
    });
    if (!response.ok) return;
    return data;
  },

  async addBook(formData) {
    const { response, data } = await Api.request("/books/create", {
      method: "POST",
      body: formData,
    });

    return { response, data };
  },

  async deleteBook(bookId) {
    const { response, data } = await Api.request(`/books/${bookId}`, {
      method: "DELETE",
    });

    return { response, data };
  },

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
  async borrowBook(bookId) {
    const { response, data } = await Api.request("/borrowings/borrow", {
      method: "POST",
      body: JSON.stringify({ book_id: bookId }),
    });

    return { response, data };
  },

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

  getAll() {
    const user = this.getUserData();
    return user?.all_borrowings || [];
  },

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

  async loadById(userId) {
    const { response, data } = await Api.request(`/user/${userId}`, {
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

  async updateUser(formData) {
    const { response, data } = await Api.request(`/user/update`, {
      method: "PATCH",
      body: formData,
    });

    return { response, data };
  },

  async updatePassword(formData) {
    const { response, data } = await Api.request("/user/update/password", {
      method: "PATCH",
      body: formData,
    });

    return { response, data };
  },
};

/* ========================
   ADMIN
======================== */

export const AdminService = {
  async updateWithAdmin(userId, formData) {
    const { response, data } = await Api.request(
      `/user/update-with-admin/${userId}`,
      {
        method: "PATCH",
        body: formData,
      }
    );

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
