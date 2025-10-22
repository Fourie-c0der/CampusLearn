// ForumPost.js
import { supabase } from './supabaseClient.js';

// Section containers
const latestContainer = document.getElementById('forum-posts');        // Latest
const trendingContainer = document.getElementById('trending-posts');   // Trending
const unansweredContainer = document.getElementById('unanswered-posts');// Unanswered

// Forms / Modals
const newPostForm = document.getElementById('new-post-form');
const replyForm = document.getElementById('reply-form');
const replyModalEl = document.getElementById('replyModal');
const replyModal = replyModalEl ? new bootstrap.Modal(replyModalEl) : null;
const replyParentIdInput = document.getElementById('reply-parent-id');

// Utilities
const fmtDate = ts => new Date(ts).toLocaleString();
const authorName = row => (row.isanonymous ? 'Anonymous' :  'Unknown');

// DOM builders 
function buildPostCard(post) {
  const card = document.createElement('div');
  card.className = 'card mb-3 shadow-sm';
  card.dataset.postId = String(post.post_id);

  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${post.title || '(No title)'}</h5>
      <p class="card-text">${post.content}</p>

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">Posted by ${authorName(post)}</small>
        <small>${fmtDate(post.postedat)}</small>
      </div>

      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm upvote-btn" data-id="${post.post_id}">
          <i class="fa-regular fa-thumbs-up me-1"></i>${post.upvotes}
        </button>
        <button class="btn btn-outline-secondary btn-sm reply-btn" data-id="${post.post_id}">
          <i class="fa-regular fa-comment-dots me-1"></i>Reply
        </button>
        <button class="btn btn-link btn-sm text-decoration-none text-muted toggle-replies-btn" data-id="${post.post_id}">
          <i class="fa-solid fa-caret-down me-1"></i>View Replies
        </button>
      </div>

      <div class="replies-container mt-3 ps-3 border-start d-none" data-replies-for="${post.post_id}">
        <div class="text-muted small">Loading replies...</div>
      </div>
    </div>
  `;
  return card;
}

function buildReplyItem(reply) {
  const wrap = document.createElement('div');
  wrap.className = 'border rounded p-2 mb-2';
  wrap.dataset.postId = String(reply.post_id);

  wrap.innerHTML = `
    <p class="mb-1">${reply.content}</p>
    <div class="d-flex justify-content-between align-items-center small">
      <span class="text-muted">By ${authorName(reply)} • ${fmtDate(reply.postedat)}</span>
      <div>
        <button class="btn btn-outline-primary btn-sm upvote-btn" data-id="${reply.post_id}">
          <i class="fa-regular fa-thumbs-up me-1"></i>${reply.upvotes}
        </button>
        <button class="btn btn-outline-secondary btn-sm reply-btn" data-id="${reply.post_id}">
          <i class="fa-solid fa-reply me-1"></i>Reply
        </button>
        <button class="btn btn-link btn-sm text-decoration-none text-muted toggle-replies-btn" data-id="${reply.post_id}">
          <i class="fa-solid fa-caret-down me-1"></i>View Replies
        </button>
      </div>
    </div>

    <div class="replies-container mt-2 ps-3 border-start d-none" data-replies-for="${reply.post_id}">
      <div class="text-muted small">Loading replies...</div>
    </div>
  `;
  return wrap;
}

// Data fetchers 
async function fetchTopLevelPosts({ orderBy = 'postedat', asc = false } = {}) {
  const { data, error } = await supabase
    .from('forum_post')
    .select(`
      post_id,
      author_id,
      title,
      content,
      upvotes,
      postedat,
      isanonymous,
      parentpost_id,
      User:author_id(firstname)
    `)
    .is('parentpost_id', null)
    .order(orderBy, { ascending: asc });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data || [];
}

async function fetchReplies(parentId) {
  const { data, error } = await supabase
    .from('forum_post')
    .select(`
      post_id,
      author_id,
      content,
      upvotes,
      postedat,
      isanonymous,
      parentpost_id,
      User:author_id(firstname)
    `)
    .eq('parentpost_id', parentId)
    .order('postedat', { ascending: true });

  if (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
  return data || [];
}

// Renderers 
async function renderRepliesInto(containerEl, parentId) {
  if (!containerEl) return;
  containerEl.innerHTML = '<div class="text-muted small">Loading replies...</div>';
  const replies = await fetchReplies(parentId);

  if (!replies.length) {
    containerEl.innerHTML = '<div class="text-muted small">No replies yet.</div>';
    return;
  }

  containerEl.innerHTML = '';
  for (const r of replies) {
    containerEl.appendChild(buildReplyItem(r));
  }
}

async function toggleRepliesForButton(btn) {
  const targetId = btn.dataset.id;
  if (!targetId) return;

  // Prefer the closest replies container for this button’s thread
  let container = btn.closest('.card, .border')?.querySelector(`.replies-container[data-replies-for="${targetId}"]`);

  // Fallback: global search 
  if (!container) container = document.querySelector(`.replies-container[data-replies-for="${targetId}"]`);
  if (!container) return;

  const isHidden = container.classList.contains('d-none');
  if (isHidden) {
    await renderRepliesInto(container, Number(targetId));
    container.classList.remove('d-none');
    btn.innerHTML = `<i class="fa-solid fa-caret-up me-1"></i>Hide Replies`;
  } else {
    container.classList.add('d-none');
    btn.innerHTML = `<i class="fa-solid fa-caret-down me-1"></i>View Replies`;
  }
}

// Refresh all visible threads for a parent across tabs
async function refreshAllThreadsFor(parentId) {
  const containers = document.querySelectorAll(`.replies-container[data-replies-for="${parentId}"]`);
  for (const c of containers) {
    // refresh it so the new reply appears immediately
    if (!c.classList.contains('d-none')) {
      await renderRepliesInto(c, Number(parentId));
    }
  }
}

// Sections 
async function loadLatest() {
  const posts = await fetchTopLevelPosts({ orderBy: 'postedat', asc: false });
  latestContainer.innerHTML = '';
  const empty = document.getElementById('forum-empty');

  if (!posts.length) {
    empty?.classList.remove('d-none');
    return;
  }
  empty?.classList.add('d-none');
  for (const p of posts) latestContainer.appendChild(buildPostCard(p));
}

async function loadTrending() {
  const posts = await fetchTopLevelPosts({ orderBy: 'upvotes', asc: false });
  trendingContainer.innerHTML = '';
  const empty = document.getElementById('trending-empty');

  if (!posts.length) {
    empty?.classList.remove('d-none');
    return;
  }
  empty?.classList.add('d-none');
  for (const p of posts) trendingContainer.appendChild(buildPostCard(p));
}

async function loadUnanswered() {
  // top-level posts
  const posts = await fetchTopLevelPosts({ orderBy: 'postedat', asc: false });
  // replies 
  const { data: replies, error } = await supabase
    .from('forum_post')
    .select('parentpost_id')
    .not('parentpost_id', 'is', null);

  if (error) {
    console.error('Error fetching replies list for unanswered:', error);
    return;
  }

  const answeredIds = new Set((replies || []).map(r => r.parentpost_id));
  const unanswered = posts.filter(p => !answeredIds.has(p.post_id));

  unansweredContainer.innerHTML = '';
  const empty = document.getElementById('unanswered-empty');
  if (!unanswered.length) {
    empty?.classList.remove('d-none');
    return;
  }
  empty?.classList.add('d-none');
  for (const p of unanswered) unansweredContainer.appendChild(buildPostCard(p));
}

async function loadAll() {
  await Promise.all([loadLatest(), loadTrending(), loadUnanswered()]);
}

// New Post 
if (newPostForm) {
  newPostForm.addEventListener('submit', async e => {
    e.preventDefault();
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const isAnonymous = document.getElementById('is-anonymous').checked;
    const authorId = 1; // TODO: use logged-in user id

    if (!content) return;

    const { error } = await supabase
      .from('forum_post')
      .insert([{ title, content, isanonymous: isAnonymous, author_id: authorId }]);

    if (error) {
      console.error('Error adding post:', error);
      return;
    }

    newPostForm.reset();
    document.querySelector('#askModal .btn-close')?.click();
    await loadAll();
  });
}

// Reply Submit 
if (replyForm && replyModal) {
  replyForm.addEventListener('submit', async e => {
    e.preventDefault();
    const content = document.getElementById('reply-content').value.trim();
    const parentId = Number(replyParentIdInput.value);
    const authorId = 1; // TODO: use logged-in user id

    if (!content || !parentId) return;

    const { error } = await supabase
      .from('forum_post')
      .insert([{ content, author_id: authorId, parentpost_id: parentId, isanonymous: false }]);

    if (error) {
      console.error('Error submitting reply:', error);
      return;
    }

    replyForm.reset();
    replyModal.hide();

    // Make sure the new reply is visible immediately in any open tab
    // Open the thread in the currently interacted card if it is closed
    const localToggles = document.querySelectorAll(`.toggle-replies-btn[data-id="${parentId}"]`);
    for (const t of localToggles) {
      const localContainer = t.closest('.card, .border')?.querySelector(`.replies-container[data-replies-for="${parentId}"]`);
      if (localContainer && localContainer.classList.contains('d-none')) {
        localContainer.classList.remove('d-none');
        t.innerHTML = `<i class="fa-solid fa-caret-up me-1"></i>Hide Replies`;
      }
    }

    // Refresh replies where the thread is visible
    await refreshAllThreadsFor(parentId);

    // Keep section orders/counts fresh
    await loadAll();
  });
}

// Global Clicks 
document.addEventListener('click', async e => {
  // Upvote
  const upBtn = e.target.closest('.upvote-btn');
  if (upBtn) {
    const postId = Number(upBtn.dataset.id);
    const { error } = await supabase.rpc('increment_upvote', { post_id_input: postId });
    if (error) console.error('Error upvoting:', error);
    else await loadAll();
    return;
  }

  // Reply 
  const replyBtn = e.target.closest('.reply-btn');
  if (replyBtn && replyModal) {
    replyParentIdInput.value = replyBtn.dataset.id;
    replyModal.show();
    return;
  }

  // Toggle replies 
  const toggleBtn = e.target.closest('.toggle-replies-btn');
  if (toggleBtn) {
    await toggleRepliesForButton(toggleBtn);
  }
});

// Init 
loadAll();