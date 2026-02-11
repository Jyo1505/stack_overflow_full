// Use backend URL from config.js
const BASE = API_BASE;

// feed.js - robust version
(function () {
  // helper to avoid breaking if script runs on a page without expected elements
  function el(id) { return document.getElementById(id); }
let currentUserId = null;

  const token = localStorage.getItem("token");
  if (!token) {
    // no token -> go to login page
    console.warn("No auth token, redirecting to login.");
    window.location.href = "/";
    return;
  }

  const authHeader = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json",
  };

  // safe logger for network errors
  function logFetchError(context, err) {
    console.error(`[feed.js] ${context} error:`, err);
  }

  // escape helper
  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // Show a message in a target element if present
  function showMessage(id, text) {
    const target = el(id);
    if (target) target.textContent = text;
  }

  // Load user and display welcome (safe)
  async function loadUser() {
    try {
      const res = await fetch(`${BASE}/api/users/me`, { headers: authHeader });
      if (!res.ok) {
        console.warn("Token invalid or expired, redirecting to login.");
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
      }
      const data = await res.json();
      currentUserId = data?.user?.id ?? null;

      const name = data?.user?.name || "User";
      const welcome = el("welcome-user");
      if (welcome) welcome.textContent = "Hello, " + name + "!";
    } catch (err) {
      logFetchError("loadUser", err);
    }
  }

  // Minimal /api/posts/all consumer: populate #posts element
  async function loadPosts() {
    try {
      const postsEl = el("posts");      // Feed (friends + own if needed)
const myPostsEl = el("my-posts"); // My Posts (only own)

if (!postsEl || !myPostsEl) {
  console.warn("Post containers not found in DOM.");
  return;
}


      const res = await fetch(`${BASE}/api/posts/all`, { headers: authHeader });
      // if server returned HTML (404/error page) this will likely fail on res.json()
      let data;
      try {
        data = await res.json();
      } catch (e) {
        logFetchError("Parsing /api/posts/all response", e);
        postsEl.textContent = "Unable to load posts (unexpected server response).";
        return;
      }

      if (!res.ok) {
        console.warn("/api/posts/all returned status", res.status, data);
        postsEl.textContent = data?.message || "Unable to load posts.";
        return;
      }

      const posts = data.posts || [];
      if (!posts.length) {
        postsEl.innerHTML = "<p>No posts yet.</p>";
        return;
      }

      // build HTML
     postsEl.innerHTML = "";
myPostsEl.innerHTML = "";

      posts.forEach(p => {
        // ensure fields exist
        const id = p.id ?? "";
        const userName = escapeHtml(p.user_name ?? "Unknown");
        const text = escapeHtml(p.content_text ?? "");
        const media = p.media_url
  ? `<div class="post-media">
       <img src="${BASE}${escapeHtml(p.media_url)}" alt="media" />
     </div>`
  : "";
 const dateStr = p.created_at ? new Date(p.created_at).toLocaleString() : "";

        // like/comment metadata from server (if present)
        const likeCount = (typeof p.like_count !== "undefined") ? p.like_count : (p.likeCount ?? 0);
        const likedByMe = !!p.liked_by_me;
        const commentCount = (typeof p.comment_count !== "undefined") ? p.comment_count : (p.commentCount ?? 0);
        const commentsHtml = (p.comments || []).map(c => {
          const cn = escapeHtml(c.user_name || "User");
          const ct = escapeHtml(c.text || "");
          const ts = c.created_at ? ` <span class="comment-date">(${new Date(c.created_at).toLocaleString()})</span>` : "";
          return `<div class="comment"><strong>${cn}</strong>: ${ct}${ts}</div>`;
        }).join("");

        const card = document.createElement("div");
        card.className = "post-card";
        card.dataset.postId = id;

        card.innerHTML = `
          <div class="post-header">
            <strong>${userName}</strong>
            <span class="post-date">${dateStr}</span>
          </div>
          <div class="post-content">${text}</div>
          ${media}
          <div class="post-actions">
  <button class="like-btn" data-id="${id}">
    ${likedByMe ? "Unlike" : "Like"} (<span class="like-count">${likeCount}</span>)
  </button>

  <button class="comment-toggle-btn" data-id="${id}">
    Comments (${commentCount})
  </button>

  <button class="share-btn" data-id="${id}" data-author="${p.author_id}">
    Share (<span class="share-count">${p.share_count ?? 0}</span>)
  </button>

  ${p.author_id == currentUserId ? `<button class="delete-post-btn" data-id="${id}">Delete</button>` : ""}
</div>


          <div class="comments-box" id="cbox-${id}" style="display:none">
            <div class="comment-list">${commentsHtml}</div>
            <div class="add-comment">
              <input placeholder="Write a comment..." class="comment-input" id="cin-${id}">
              <button class="comment-send-btn" data-id="${id}">Post</button>
            </div>
          </div>
        `;
        // FEED → friends + own (if you want own also visible here)
postsEl.appendChild(card);

// MY POSTS → ONLY current user's posts
if (p.author_id === currentUserId) {
  myPostsEl.appendChild(card.cloneNode(true));
}

      });

      attachLikeHandlers();    // wire up like buttons
      attachCommentHandlers(); // wire up comment post & toggle
      attachShareHandlers();
      attachDeleteHandlers();

      attachLikeHandlers();
attachCommentHandlers();
attachShareHandlers();
attachDeleteHandlers();


    } catch (err) {
      logFetchError("loadPosts", err);
    }
  }
// SHARE HANDLER (top-level)
// SHARE HANDLER with friend chooser
// SHARE HANDLER with friend chooser (replace existing attachShareHandlers)
// INLINE share chooser (replace your existing attachShareHandlers)
function attachShareHandlers() {
  // helper: remove any existing chooser from the page
  function removeExistingChoosers() {
    document.querySelectorAll(".share-chooser").forEach(c => c.remove());
  }

  document.querySelectorAll(".share-btn").forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", async (e) => {
      // toggle chooser under the post
      removeExistingChoosers();

      const postId = newBtn.dataset.id;
      const postAuthor = newBtn.dataset.author ? Number(newBtn.dataset.author) : null;
      if (!postId) return console.warn("share-btn missing data-id");

      // find the post-card element to attach chooser under
      const card = newBtn.closest(".post-card");
      if (!card) return;

      // create chooser container
      const chooser = document.createElement("div");
      chooser.className = "share-chooser";
      // basic inline style (you can move to CSS)
      chooser.style.border = "1px solid #ddd";
      chooser.style.padding = "8px";
      chooser.style.marginTop = "8px";
      chooser.style.background = "#fff";
      chooser.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";

      // show loading while fetching friends
      chooser.innerHTML = "<div>Loading friends...</div>";
      card.appendChild(chooser);

      try {
        const fr = await fetch(`${BASE}/api/friends/list`, { headers: authHeader });
        const frData = await fr.json().catch(() => ({}));
        if (!fr.ok) {
          chooser.innerHTML = `<div>Unable to load friends: ${frData.message || fr.status}</div>`;
          return;
        }

        const friends = (frData.friends || []).filter(f => Number(f.id) !== Number(postAuthor));
        if (!friends.length) {
          chooser.innerHTML = "<div>No eligible friends to share to.</div>";
          return;
        }

        // build HTML list with share buttons next to names
        const list = document.createElement("div");
        list.style.maxHeight = "180px";
        list.style.overflow = "auto";

        friends.forEach(f => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.justifyContent = "space-between";
          row.style.padding = "6px 0";
          row.style.borderBottom = "1px solid #f2f2f2";

          const name = document.createElement("div");
          name.textContent = `${f.name} `;
          name.style.flex = "1";
          name.style.marginRight = "8px";

          const shareBtn = document.createElement("button");
          shareBtn.textContent = "Share";
          shareBtn.dataset.target = f.id;
          shareBtn.style.flex = "0 0 auto";
          shareBtn.style.padding = "4px 8px";

          // attach click handler for this friend
          shareBtn.addEventListener("click", async () => {
            // disable to prevent double clicks
            shareBtn.disabled = true;
            shareBtn.textContent = "Sharing...";

            try {
              const res = await fetch(`${BASE}/api/posts/share`, {
                method: "POST",
                headers: authHeader,
                body: JSON.stringify({ postId, targetId: f.id }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                alert(data.message || "Share failed");
                shareBtn.disabled = false;
                shareBtn.textContent = "Share";
                return;
              }

              // update share count UI in the post (if present)
              const span = newBtn.querySelector(".share-count");
              if (span) span.textContent = data.share_count ?? data.shareCount ?? span.textContent;

              // provide immediate feedback (replace row content)
              row.innerHTML = `<em>Shared to ${escapeHtml(f.name)}</em>`;
              // optionally auto-close chooser after short delay
              setTimeout(() => { chooser.remove(); }, 1000);
            } catch (err) {
              console.error("share error:", err);
              alert("Network error while sharing");
              shareBtn.disabled = false;
              shareBtn.textContent = "Share";
            }
          });

          row.appendChild(name);
          row.appendChild(shareBtn);
          list.appendChild(row);
        });

        chooser.innerHTML = ""; // clear loading
        chooser.appendChild(list);

        // add a small close button
        const close = document.createElement("div");
        close.style.textAlign = "right";
        close.style.marginTop = "6px";
        close.innerHTML = `<button class="close-chooser">Close</button>`;
        close.querySelector(".close-chooser").addEventListener("click", () => chooser.remove());
        chooser.appendChild(close);

      } catch (err) {
        console.error("load friends for share failed", err);
        chooser.innerHTML = "<div>Error loading friends</div>";
      }
    });
  });

  // close chooser if user clicks outside
  document.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!target.closest) return;
    // if click is not inside a share-chooser or a share-btn, remove choosers
    if (!target.closest(".share-chooser") && !target.closest(".share-btn")) {
      removeExistingChoosers();
    }
  });
}

function attachDeleteHandlers() {
  document.querySelectorAll('.delete-post-btn').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', async () => {
      const postId = newBtn.dataset.id;
      if (!postId) return console.warn('delete-post-btn missing data-id');
      if (!confirm('Delete this post?')) return;

      try {
        const res = await fetch(`${BASE}/api/posts/delete`, {
          method: 'DELETE',
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId })
        });
        const data = await res.json().catch(()=>({}));

        if (!res.ok) {
          alert(data.message || 'Delete failed');
          return;
        }

        // success - reload posts (and optionally show toast)
        // if you use showToast, replace alert with showToast('Post deleted','success');
        alert(data.message || 'Post deleted');
        await loadPosts();
      } catch (err) {
        console.error('delete post error:', err);
        alert('Network error');
      }
    });
  });
}

  // Attach like/unlike handlers (safe)
  function attachLikeHandlers() {
    document.querySelectorAll(".like-btn").forEach(btn => {
      // remove existing listener by cloning (safe idempotent attach)
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", async () => {
        const postId = newBtn.dataset.id;
        if (!postId) return console.warn("like-btn missing data-id");
        const isUnlike = newBtn.textContent.trim().startsWith("Unlike");
        try {
          const res = await fetch(`${BASE}/api/posts/${isUnlike ? "unlike" : "like"}`, {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify({ postId }),
          });
          const result = await res.json().catch(() => ({}));
          if (!res.ok) {
            alert(result.message || "Like action failed");
            return;
          }
          // update UI
          const span = newBtn.querySelector(".like-count");
          if (span) span.textContent = result.like_count ?? result.likeCount ?? "0";
          newBtn.innerHTML = `${isUnlike ? "Like" : "Unlike"} (<span class="like-count">${result.like_count ?? result.likeCount ?? 0}</span>)`;
        } catch (err) {
          logFetchError("like/unlike", err);
          alert("Network error liking post");
        }
      });
    });
  }

  // Attach comment toggles and send handlers
  // Attach comment toggles and send handlers (top-level)
function attachCommentHandlers() {
  // toggles
  document.querySelectorAll(".comment-toggle-btn").forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", () => {
      const id = newBtn.dataset.id;
      const box = el("cbox-" + id);
      if (!box) return;
      box.style.display = box.style.display === "none" ? "block" : "none";
    });
  });

  // send buttons
  document.querySelectorAll(".comment-send-btn").forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", async () => {
      const postId = newBtn.dataset.id;
      const input = el("cin-" + postId);
      if (!input) return alert("Comment input not found");
      const text = input.value.trim();
      if (!text) return;
      try {
        const res = await fetch(`${BASE}/api/posts/comment`, {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({ postId, text }),
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(result.message || "Failed to add comment");
          return;
        }
        // reload posts to show comment
        await loadPosts();
      } catch (err) {
        logFetchError("comment send", err);
        alert("Network error adding comment");
      }
    });
  });
}


  // Post creation (safe)
  // Robust initPostCreation() — copy/paste into feed.js
function initPostCreation() {
  const btn = document.getElementById("post-submit-btn");
  const fileInput = document.getElementById("post-media-file");
  const preview = document.getElementById("media-preview");
  const contentEl = document.getElementById("post-content");
  const msgEl = document.getElementById("post-message");

  if (!btn) return;

  // small preview helper (keep)
  function showPreview(file) {
    if (!preview) return;
    preview.innerHTML = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      preview.appendChild(img);
    } else if (file.type.startsWith("video/")) {
      const vid = document.createElement("video");
      vid.src = url;
      vid.controls = true;
      vid.width = 320;
      vid.onloadeddata = () => URL.revokeObjectURL(url);
      preview.appendChild(vid);
    } else {
      preview.textContent = file.name;
    }
  }
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const f = fileInput.files && fileInput.files[0];
      showPreview(f);
    });
  }

  btn.addEventListener("click", async () => {
    const content = (contentEl && contentEl.value || "").trim();
    if (!content) {
      if (msgEl) msgEl.textContent = "Content cannot be empty.";
      return;
    }
    if (msgEl) { msgEl.textContent = "Posting..."; }

    try {
      const token = localStorage.getItem("token") || "";
      const headers = { "Authorization": "Bearer " + token };

      // if file selected -> FormData
      const file = fileInput && fileInput.files && fileInput.files[0];
      let res, data;

      if (file) {
        const fd = new FormData();
        fd.append("content_text", content);
        fd.append("media", file); // key must be "media"
        console.log("Sending FormData with file:", file.name, file.type, file.size);

        res = await fetch(`${BASE}/api/posts/create`, {
          method: "POST",
          headers, // DO NOT set Content-Type — browser will set multipart boundary
          body: fd
        });
      } else {
        // no file => send JSON fallback (server handles both)
        res = await fetch(`${BASE}/api/posts/create`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ content_text: content })
        });
      }

      // read response
      const text = await res.text();
      try { data = JSON.parse(text); } catch (e) { data = { message: text }; }

      if (!res.ok) {
        console.error("POST /api/posts/create failed:", res.status, data);
        if (msgEl) msgEl.textContent = data.message || ("Server error: " + res.status);
        return;
      }

      // success -> reload
      if (msgEl) msgEl.textContent = data.message || "Posted";
      contentEl.value = "";
      if (fileInput) fileInput.value = "";
      if (preview) preview.innerHTML = "";
      await loadPosts();
      await loadPostLimit();
    } catch (err) {
      console.error("createPost fetch error:", err);
      if (msgEl) msgEl.textContent = "Network error while posting.";
    }
  });
}


  // Friend request send (safe)
 function initFriendRequestSend() {
  const btn = el("send-request-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const idInput = el("friend-id"); // hidden input OR selected user id
    const msgEl = el("friend-request-message");
    const receiverId = Number(idInput?.value);

    if (!receiverId) {
      if (msgEl) msgEl.textContent = "Select a user.";
      return;
    }

    if (msgEl) msgEl.textContent = "Sending request...";

    try {
      const res = await fetch(`${BASE}/api/friends/request`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ receiverId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (msgEl) msgEl.textContent = data.message || "Request failed";
        return;
      }

      if (msgEl) msgEl.textContent = "Friend request sent";
      idInput.value = "";

      await loadIncomingRequests();
      await loadFriends();
      await loadOtherUsers();

    } catch (err) {
      console.error("send friend request", err);
      if (msgEl) msgEl.textContent = "Network error";
    }
  });
}


  // load friends list
  // load friends list (renders Remove button)
async function loadFriends() {
  try {
    const res = await fetch(`${BASE}/api/friends/list`, { headers: authHeader });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn("/api/friends/list failed", data);
      return;
    }
    const listEl = el("friends-list");
    const countEl = el("friend-count-text");
    if (countEl) countEl.textContent = `You have ${data.count} friend(s).`;
    if (!listEl) return;

    // load friends list (renders Remove button) — replace rendering part
listEl.innerHTML = "";
(data.friends || []).forEach(f => {
  const li = document.createElement("li");
  li.innerHTML = `${escapeHtml(f.name)} <button class="remove-friend-btn" data-id="${f.id}">Remove</button>`;
  listEl.appendChild(li);
});

    // attach remove handlers
    listEl.querySelectorAll(".remove-friend-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const friendId = btn.dataset.id;
        if (!friendId) return;
        if (!confirm("Remove this friend?")) return;

        try {
          const res = await fetch(`${BASE}/api/friends/remove`, {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify({ friendId }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) return alert(data.message || "Failed to remove friend");

          alert(data.message || "Friend removed");
          // refresh lists & counts
          await loadFriends();
          await loadOtherUsers();
          await loadPostLimit();
          await loadPosts();
        } catch (err) {
          console.error("remove friend error", err);
          alert("Network error");
        }
      });
    });

  } catch (err) {
    logFetchError("loadFriends", err);
  }
}

// fetch other users and render clickable list
// loadOtherUsers - quick fix (client only)
async function loadOtherUsers() {
  try {
    const res = await fetch(`${BASE}/api/users/list`, { headers: authHeader });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn("/api/users/list failed", data);
      return;
    }

    const ul = el("other-users-list");
    if (!ul) return;
    ul.innerHTML = "";

    (data.users || []).forEach(u => {
      // Only show name (not email). Keep user id in data-id for potential use
      const li = document.createElement("li");
      li.innerHTML = `
  ${escapeHtml(u.name)}
  <button class="quick-send" data-id="${u.id}">
    Send Request
  </button>
`;

ul.appendChild(li);
    });

    // attach quick-send handlers
    ul.querySelectorAll(".quick-send").forEach(btn => {
  btn.addEventListener("click", async () => {
    const receiverId = Number(btn.dataset.id);
if (!receiverId) return alert("User id missing");

btn.disabled = true;
btn.textContent = "Sending...";

try {
  const res = await fetch(`${BASE}/api/friends/request`, {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ receiverId })
  });


      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Request failed");
        btn.disabled = false;
        btn.textContent = "Send Request";
        return;
      }

      // ✅ success UI feedback
      btn.textContent = "Request Sent";
      btn.disabled = true;

      // refresh lists
      await loadIncomingRequests();
      await loadFriends();

    } catch (err) {
      console.error("send request error", err);
      alert("Network error");
      btn.disabled = false;
      btn.textContent = "Send Request";
    }
  });
});

  } catch (err) {
    console.error("loadOtherUsers error:", err);
  }
}

  // incoming friend requests
  // Replace your existing functions with these in feed.js

// load incoming friend requests (renders name only, no email)
async function loadIncomingRequests() {
  try {
    const res = await fetch(`${BASE}/api/friends/request`, { headers: authHeader });
    const data = await res.json().catch(() => ({}));

    const listEl = document.getElementById("incoming-requests");
    if (!listEl) return;

    listEl.innerHTML = "";

    if (!res.ok) {
      // optionally show a message instead of nothing
      listEl.innerHTML = `<li class="muted">Unable to load incoming requests.</li>`;
      return;
    }

    const requests = data.requests || [];
    if (!requests.length) {
      listEl.innerHTML = `<li class="muted">No incoming requests.</li>`;
      return;
    }

    requests.forEach((r) => {
      // create a list item showing only the name and an Accept button
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.padding = "6px 0";

      const nameDiv = document.createElement("div");
      nameDiv.textContent = r.name ? r.name : "Unknown user";

      const btn = document.createElement("button");
      btn.textContent = "Accept";
      btn.className = "quick-accept";
      btn.dataset.id = r.id;

      btn.addEventListener("click", async () => {
        await acceptRequest(r.id);
      });

      li.appendChild(nameDiv);
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  } catch (err) {
    console.error("loadIncomingRequests error:", err);
  }
}

// accept a friend request (uses requestId)
async function acceptRequest(requestId) {
  try {
    const res = await fetch(`${BASE}/api/friends/accept`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ requestId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Failed to accept request");
      return;
    }

    // refresh lists & limits after accepting
    await loadFriends();
    await loadIncomingRequests();
    await loadPostLimit();
    alert(data.message || "Friend request accepted");
  } catch (err) {
    console.error("acceptRequest error:", err);
    alert("Network error");
  }
}


  

  // load post limit info
  async function loadPostLimit() {
    try {
      const res = await fetch(`${BASE}/api/posts/limit`, { headers: authHeader });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn("/api/posts/limit failed", data);
        return;
      }
      const infoEl = el("post-limit-info");
      if (!infoEl) return;
      const { friend_count, allowed_per_day, posted_today } = data;
      if (friend_count === 0) {
        infoEl.textContent = "You have 0 friends. Add at least 1 friend to post.";
      } else if (allowed_per_day === -1) {
        infoEl.textContent = `You have ${friend_count} friends. You can post unlimited times today.`;
      } else {
        const remaining = allowed_per_day - posted_today;
        infoEl.textContent = `Friends: ${friend_count}. Allowed: ${allowed_per_day} per day. Used today: ${posted_today}. Remaining: ${remaining < 0 ? 0 : remaining}.`;
        const submitBtn = el("post-submit-btn");
        if (submitBtn) submitBtn.disabled = remaining <= 0;
      }
    } catch (err) {
      logFetchError("loadPostLimit", err);
    }
  }

  // logout
  const logoutBtn = el("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  });

  // initialize interactive bits
  initPostCreation();
  initFriendRequestSend();

  // initial load
  loadUser();
  loadFriends();
  loadIncomingRequests();
  loadPostLimit();
  loadOtherUsers();
  loadPosts();

})();



function initSectionTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".feed-section").forEach(s => s.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
    });
  });
}
initSectionTabs();



