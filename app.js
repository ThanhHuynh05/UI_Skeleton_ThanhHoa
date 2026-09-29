/**
 * Aria - Enterprise NL Query Assistant
 * app.js - Main Application Orchestrator & State Controller
 *
 * Implements:
 * 1. Conversation History (Multi-turn conversations, pinned, grouped, search, export)
 * 2. Role-Based Identity & "Who is Using" blocking modal
 * 3. Answer Tools (Table/Chart toggle, SVG bar/line/pie, CSV download, print, SQL explanation)
 * 4. Input Helpers (Typeahead, Domain scope chips, Voice STT, Time range)
 * 5. Schema Intelligence (Data Explorer drawer, Business Glossary, Relationships)
 * 6. Security & Governance (Masking, AST write blocking, Injection blocking, Audit log)
 * 7. Settings, Preferences, Help, and Toast Notifications
 */

(function () {
  'use strict';

  // =========================================================================
  // APPLICATION STATE
  // =========================================================================
  const state = {
    currentUser: null, // { id, name, role, roleTitle }
    conversations: [], // [ { id, title, createdAt, updatedAt, pinned, messages: [] } ]
    activeConversationId: null,
    isThinking: false,
    activeAbortController: null,
    settings: {
      theme: 'light',
      fontSize: 'font-md',
      detailLevel: 'detailed',
      showSqlDefault: false,
      showPipelineDefault: false,
      compactMode: false
    },
    activeDomainScope: 'Auto',
    activeTimeRange: 'Auto',
    searchQuery: '',
    currentFeedbackMessageId: null,
    voiceRecognition: null,
    isRecordingVoice: false
  };

  // DOM Elements
  const chatMessagesEl = document.getElementById('chatMessages');
  const chatContainerEl = document.getElementById('chatContainer');
  const chatInputEl = document.getElementById('chatInput');
  const sendBtnEl = document.getElementById('sendBtn');
  const voiceInputBtnEl = document.getElementById('voiceInputBtn');
  const typeaheadPopupEl = document.getElementById('typeaheadPopup');
  const sidebarConversationsListEl = document.getElementById('sidebarConversationsList');
  const historySearchInputEl = document.getElementById('historySearchInput');
  const newChatBtnEl = document.getElementById('newChatBtn');
  const clearAllHistoryBtnEl = document.getElementById('clearAllHistoryBtn');
  const themeToggleBtnEl = document.getElementById('themeToggleBtn');
  const mobileMenuBtnEl = document.getElementById('mobileMenuBtn');
  const sidebarEl = document.getElementById('sidebar');
  const userMenuBtnEl = document.getElementById('userMenuBtn');
  const userMenuDropdownEl = document.getElementById('userMenuDropdown');
  const headerUserLabelEl = document.getElementById('headerUserLabel');
  const switchUserMenuItemEl = document.getElementById('switchUserMenuItem');
  const resetDemoDataMenuItemEl = document.getElementById('resetDemoDataMenuItem');
  const toastContainerEl = document.getElementById('toastContainer');

  // Modals & Drawers
  const userProfileModalBackdrop = document.getElementById('userProfileModalBackdrop');
  const profileNameInput = document.getElementById('profileNameInput');
  const roleCardsGrid = document.getElementById('roleCardsGrid');
  const saveProfileBtn = document.getElementById('saveProfileBtn');

  const dataExplorerDrawer = document.getElementById('dataExplorerDrawer');
  const navDataExplorerBtn = document.getElementById('navDataExplorerBtn');
  const closeExplorerBtn = document.getElementById('closeExplorerBtn');
  const tabTablesBtn = document.getElementById('tabTablesBtn');
  const tabGlossaryBtn = document.getElementById('tabGlossaryBtn');
  const explorerTabContent = document.getElementById('explorerTabContent');
  const explorerSearchInput = document.getElementById('explorerSearchInput');

  const savedAnswersDrawer = document.getElementById('savedAnswersDrawer');
  const savedAnswersBtn = document.getElementById('savedAnswersBtn');
  const closeSavedAnswersBtn = document.getElementById('closeSavedAnswersBtn');
  const savedAnswersList = document.getElementById('savedAnswersList');

  const settingsDrawer = document.getElementById('settingsDrawer');
  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');

  const helpModalBackdrop = document.getElementById('helpModalBackdrop');
  const helpModalBtn = document.getElementById('helpModalBtn');
  const closeHelpModalBtn = document.getElementById('closeHelpModalBtn');
  const helpTabContent = document.getElementById('helpTabContent');
  const helpTabDomainsBtn = document.getElementById('helpTabDomainsBtn');
  const helpTabScopeBtn = document.getElementById('helpTabScopeBtn');
  const helpTabShortcutsBtn = document.getElementById('helpTabShortcutsBtn');

  const feedbackModalBackdrop = document.getElementById('feedbackModalBackdrop');
  const closeFeedbackModalBtn = document.getElementById('closeFeedbackModalBtn');
  const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
  const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
  const feedbackReasonChips = document.getElementById('feedbackReasonChips');
  const feedbackCommentInput = document.getElementById('feedbackCommentInput');

  const sourceTableModalBackdrop = document.getElementById('sourceTableModalBackdrop');
  const closeSourceTableModalBtn = document.getElementById('closeSourceTableModalBtn');
  const sourceTableModalTitle = document.getElementById('sourceTableModalTitle');
  const sourceTableModalBody = document.getElementById('sourceTableModalBody');

  const domainScopeChipsEl = document.getElementById('domainScopeChips');
  const timeRangeSelectEl = document.getElementById('timeRangeSelect');

  // =========================================================================
  // 1. INITIALIZATION & IDENTITY (FIX 2: WHO IS USING)
  // =========================================================================
  function initUserIdentity() {
    try {
      const stored = localStorage.getItem('aria_user_profile');
      if (stored) {
        state.currentUser = JSON.parse(stored);
        updateUserBadge();
        loadUserConversations();
        renderSidebarConversations();
        renderActiveConversation();
      } else {
        showFirstAccessModal();
      }
    } catch (e) {
      console.warn('Identity load error', e);
      showFirstAccessModal();
    }
  }

  function showFirstAccessModal() {
    userProfileModalBackdrop.classList.add('open');
    renderRoleCards();
    if (state.currentUser) {
      profileNameInput.value = state.currentUser.name;
    } else {
      profileNameInput.value = 'Sarah Lin';
    }
  }

  let selectedRoleKey = 'sales_manager';
  function renderRoleCards() {
    const roles = window.AriaMock.USER_ROLES;
    roleCardsGrid.innerHTML = Object.keys(roles).map((key) => {
      const r = roles[key];
      const isSelected = key === selectedRoleKey;
      return `
        <div class="role-select-card ${isSelected ? 'selected' : ''}" data-role-key="${key}" tabindex="0" role="button">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="role-card-title">${escapeHtml(r.title)}</div>
            <span class="brand-badge" style="font-size: 10px;">${escapeHtml(r.category)}</span>
          </div>
          <div class="role-card-desc">${escapeHtml(r.description)}</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 4px;">
            Allowed: ${r.allowedDomains.join(', ')}
          </div>
        </div>
      `;
    }).join('');

    roleCardsGrid.querySelectorAll('.role-select-card').forEach((card) => {
      card.addEventListener('click', () => {
        selectedRoleKey = card.getAttribute('data-role-key');
        const roleDef = window.AriaMock.USER_ROLES[selectedRoleKey];
        if (roleDef && (!profileNameInput.value || profileNameInput.value.includes('Sarah') || profileNameInput.value.includes('Michael') || profileNameInput.value.includes('David') || profileNameInput.value.includes('Elena') || profileNameInput.value.includes('Victoria') || profileNameInput.value.includes('Alex'))) {
          profileNameInput.value = roleDef.defaultName;
        }
        renderRoleCards();
      });
    });
  }

  function saveUserProfile() {
    const name = profileNameInput.value.trim() || 'Enterprise User';
    const roleDef = window.AriaMock.USER_ROLES[selectedRoleKey] || window.AriaMock.USER_ROLES.sales_manager;

    const userObj = {
      id: selectedRoleKey,
      name: name,
      role: selectedRoleKey,
      roleTitle: roleDef.title
    };

    state.currentUser = userObj;
    localStorage.setItem('aria_user_profile', JSON.stringify(userObj));
    userProfileModalBackdrop.classList.remove('open');
    updateUserBadge();
    loadUserConversations();
    renderSidebarConversations();
    renderActiveConversation();
    showToast(`Signed in as ${userObj.name} (${userObj.roleTitle})`);
  }

  function updateUserBadge() {
    if (!state.currentUser) return;
    headerUserLabelEl.innerHTML = `Signed in as: <strong>${escapeHtml(state.currentUser.name)} (${escapeHtml(state.currentUser.roleTitle)})</strong>`;
    const adminNav = document.getElementById('adminWorkspaceNav');
    if (adminNav) {
      adminNav.style.display = state.currentUser.role === 'data_admin' ? 'flex' : 'none';
    }
  }

  // =========================================================================
  // 2. CONVERSATION MODEL & STORAGE (FIX 1: CONVERSATION BUG)
  // =========================================================================
  function getStorageKeyConvs() {
    const roleId = state.currentUser ? state.currentUser.role : 'default';
    return `aria_convs_${roleId}`;
  }

  function getStorageKeyActiveConv() {
    const roleId = state.currentUser ? state.currentUser.role : 'default';
    return `aria_active_conv_${roleId}`;
  }

  function loadUserConversations() {
    try {
      const storedConvs = localStorage.getItem(getStorageKeyConvs());
      state.conversations = storedConvs ? JSON.parse(storedConvs) : [];
      const storedActive = localStorage.getItem(getStorageKeyActiveConv());
      state.activeConversationId = storedActive || (state.conversations.length > 0 ? state.conversations[0].id : null);
    } catch (e) {
      console.warn('Failed to load conversations', e);
      state.conversations = [];
      state.activeConversationId = null;
    }
  }

  function saveConversationsToStorage() {
    try {
      localStorage.setItem(getStorageKeyConvs(), JSON.stringify(state.conversations));
      localStorage.setItem(getStorageKeyActiveConv(), state.activeConversationId || '');
    } catch (e) {
      console.warn('Failed to save conversations', e);
    }
  }

  function getActiveConversation() {
    if (!state.activeConversationId) return null;
    return state.conversations.find((c) => c.id === state.activeConversationId) || null;
  }

  function createNewConversation(initialTitle = 'New Conversation') {
    const newConv = {
      id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: initialTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      messages: []
    };
    state.conversations.unshift(newConv);
    state.activeConversationId = newConv.id;
    saveConversationsToStorage();
    renderSidebarConversations();
    renderActiveConversation();
    return newConv;
  }

  // =========================================================================
  // 3. SIDEBAR GROUPING & RENDERING (Pinned, Today, Yesterday, Earlier)
  // =========================================================================
  function renderSidebarConversations() {
    if (!sidebarConversationsListEl) return;

    let convs = [...state.conversations];
    const query = state.searchQuery.toLowerCase().trim();

    if (query) {
      convs = convs.filter((c) => {
        const titleMatch = c.title.toLowerCase().includes(query);
        const msgMatch = (c.messages || []).some((m) => (m.text || '').toLowerCase().includes(query));
        return titleMatch || msgMatch;
      });
    }

    if (convs.length === 0) {
      sidebarConversationsListEl.innerHTML = `
        <div style="padding: 16px 8px; text-align: center; color: var(--text-muted); font-size: 11.5px;">
          ${query ? 'No matching conversations.' : 'No conversations yet.<br>Click "New Chat" to begin.'}
        </div>
      `;
      return;
    }

    // Grouping
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    const pinnedGroup = [];
    const todayGroup = [];
    const yesterdayGroup = [];
    const earlierGroup = [];

    convs.forEach((c) => {
      if (c.pinned) {
        pinnedGroup.push(c);
      } else if (c.updatedAt >= todayStart) {
        todayGroup.push(c);
      } else if (c.updatedAt >= yesterdayStart) {
        yesterdayGroup.push(c);
      } else {
        earlierGroup.push(c);
      }
    });

    let html = '';
    if (pinnedGroup.length > 0) html += renderGroupHtml('Pinned', pinnedGroup);
    if (todayGroup.length > 0) html += renderGroupHtml('Today', todayGroup);
    if (yesterdayGroup.length > 0) html += renderGroupHtml('Yesterday', yesterdayGroup);
    if (earlierGroup.length > 0) html += renderGroupHtml('Earlier', earlierGroup);

    sidebarConversationsListEl.innerHTML = html;

    // Attach Click Handlers
    sidebarConversationsListEl.querySelectorAll('.conversation-item').forEach((item) => {
      const convId = item.getAttribute('data-conv-id');

      item.addEventListener('click', (e) => {
        if (e.target.closest('.conv-action-btn')) return;
        state.activeConversationId = convId;
        saveConversationsToStorage();
        renderSidebarConversations();
        renderActiveConversation();
        if (window.innerWidth <= 820) sidebarEl.classList.remove('open');
      });

      // Pin button
      const pinBtn = item.querySelector('.btn-pin-conv');
      if (pinBtn) {
        pinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = state.conversations.find((c) => c.id === convId);
          if (target) {
            target.pinned = !target.pinned;
            saveConversationsToStorage();
            renderSidebarConversations();
            showToast(target.pinned ? 'Conversation pinned' : 'Conversation unpinned');
          }
        });
      }

      // Rename button
      const renameBtn = item.querySelector('.btn-rename-conv');
      if (renameBtn) {
        renameBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = state.conversations.find((c) => c.id === convId);
          if (target) {
            const renameBackdrop = document.getElementById('renameConvModalBackdrop');
            const renameInput = document.getElementById('renameConvInput');
            renameInput.value = target.title;
            renameBackdrop.classList.add('open');
            renameInput.focus();

            const closeRename = () => renameBackdrop.classList.remove('open');
            document.getElementById('closeRenameConvModalBtn').onclick = closeRename;
            document.getElementById('cancelRenameConvBtn').onclick = closeRename;
            document.getElementById('submitRenameConvBtn').onclick = () => {
              const newTitle = renameInput.value;
              if (newTitle && newTitle.trim()) {
                target.title = newTitle.trim().substring(0, 50);
                saveConversationsToStorage();
                renderSidebarConversations();
                showToast('Conversation renamed');
              }
              closeRename();
            };
          }
        });
      }

      // Delete button
      const deleteBtn = item.querySelector('.btn-delete-conv');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = state.conversations.find((c) => c.id === convId);
          if (target) {
            const deleteBackdrop = document.getElementById('deleteConvModalBackdrop');
            deleteBackdrop.classList.add('open');

            const closeDelete = () => deleteBackdrop.classList.remove('open');
            document.getElementById('closeDeleteConvModalBtn').onclick = closeDelete;
            document.getElementById('cancelDeleteConvBtn').onclick = closeDelete;
            document.getElementById('submitDeleteConvBtn').onclick = () => {
              state.conversations = state.conversations.filter((c) => c.id !== convId);
              if (state.activeConversationId === convId) {
                state.activeConversationId = state.conversations.length > 0 ? state.conversations[0].id : null;
              }
              saveConversationsToStorage();
              renderSidebarConversations();
              renderActiveConversation();
              showToast('Conversation deleted');
              closeDelete();
            };
          }
        });
      }
    });
  }

  function renderGroupHtml(groupTitle, groupItems) {
    return `
      <div>
        <div class="history-group-title">${groupTitle}</div>
        <ul class="history-group-list">
          ${groupItems.map((c) => `
            <li class="conversation-item ${c.id === state.activeConversationId ? 'active' : ''}" data-conv-id="${c.id}" tabindex="0">
              <span class="conv-title" title="${escapeHtml(c.title)}">
                ${c.pinned ? '<svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>' : ''}
                ${escapeHtml(c.title)}
              </span>
              <div class="conv-actions">
                <button type="button" class="conv-action-btn btn-pin-conv" title="${c.pinned ? 'Unpin' : 'Pin'}">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </button>
                <button type="button" class="conv-action-btn btn-rename-conv" title="Rename">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button type="button" class="conv-action-btn btn-delete-conv" title="Delete">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // =========================================================================
  // 4. RENDERING ACTIVE CONVERSATION & IDLE STATE
  // =========================================================================
  function renderActiveConversation() {
    const conv = getActiveConversation();

    if (!conv || !conv.messages || conv.messages.length === 0) {
      renderIdleState();
      return;
    }

    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); margin-bottom: 8px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">${escapeHtml(conv.title)}</div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="action-tool-btn" id="exportConvBtn" title="Export conversation as Markdown">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export .md
          </button>
          <button type="button" class="action-tool-btn" id="printConvBtn" title="Print conversation / Save PDF">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print PDF
          </button>
        </div>
      </div>
    `;

    conv.messages.forEach((msg, idx) => {
      if (msg.role === 'user') {
        html += renderUserMessageHtml(msg, idx === conv.messages.length - 2 || idx === conv.messages.length - 1);
      } else if (msg.role === 'agent') {
        html += renderAgentMessageHtml(msg, idx);
      }
    });

    chatContainerEl.innerHTML = html;

    // Attach dynamic handlers
    attachConversationEventHandlers(conv);
    scrollToBottom();
  }

  function renderUserMessageHtml(msg, isLastUserTurn) {
    return `
      <div class="chat-row user-row" id="msg_row_${msg.id}">
        <div class="user-bubble-container">
          <div class="user-bubble">${escapeHtml(msg.text)}</div>
          <div class="user-bubble-meta">
            <span>${msg.time || ''}</span>
            ${isLastUserTurn ? `<span class="user-edit-btn" data-msg-id="${msg.id}" data-text="${escapeHtml(msg.text)}">Edit</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderAgentMessageHtml(msg, msgIdx) {
    if (msg.type === 'blocked') {
      return renderBlockedSecurityHtml(msg);
    }
    if (msg.type === 'clarification') {
      return renderClarificationHtml(msg);
    }
    if (msg.type === 'error') {
      return renderErrorHtml(msg);
    }

    const res = msg.resultsData || {};
    const tableHtml = generateTableHtml(res.table, msg.id, msg.activeView || 'table', msg.tablePage || 1, msg.tableSearch || '');
    const chartHtml = generateChartHtml(res.chart, msg.id, msg.chartType || 'bar');
    const formatBusinessSource = (name) => name.replace('enterprise_dw.', '').replace('dim_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const sourcesHtml = (res.sources || []).map((s) => `
      <button type="button" class="source-badge-btn" data-table-name="${escapeHtml(s.name)}" title="${escapeHtml(s.name)} - ${escapeHtml(s.description || 'Table schema & description')}">
        <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/></svg>
        ${escapeHtml(formatBusinessSource(s.name))}
      </button>
    `).join('');

    const answerBody = state.settings.detailLevel === 'concise' && res.answerConcise
      ? res.answerConcise
      : res.answer;

    const isPinned = window.AriaMock.getSavedAnswers(state.currentUser ? state.currentUser.id : 'default').some(a => a.id === msg.id);

    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card">
          <!-- 1. Applied Interpretation & Business Answer -->
          ${res.interpretation ? `
            <div class="interpretation-box" style="background: var(--bg-hover); padding: 12px; border-radius: 6px; margin-bottom: 12px; font-size: 12.5px; border-left: 3px solid var(--accent-primary);">
              <div style="font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">I interpreted your question as:</div>
              <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary); line-height: 1.6;">
                ${Object.entries(res.interpretation).map(([k, v]) => `<li><strong>${escapeHtml(k)}</strong> = ${escapeHtml(v)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div class="grounded-answer-text">
            ${formatMarkdownBold(answerBody)}
          </div>

          <!-- 2. Key Evidence/Visualization -->
          ${(res.table || res.chart) ? `
          <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
            <div class="table-view-toggle">
              ${res.table ? `<button type="button" class="view-btn ${(msg.activeView || 'table') === 'table' ? 'active' : ''}" data-view="table" data-msg-id="${msg.id}">Table View</button>` : ''}
              ${res.chart ? `<button type="button" class="view-btn ${(msg.activeView || 'table') === 'chart' ? 'active' : ''}" data-view="chart" data-msg-id="${msg.id}">Chart View</button>` : ''}
            </div>
          </div>
          ` : ''}
          ${(msg.activeView || 'table') === 'table' ? tableHtml : chartHtml}

          <!-- 3. Actions -->
          <div class="response-actions-row">
            <div class="action-tools-group">
              <button type="button" class="action-tool-btn btn-copy-answer" data-answer="${escapeHtml(answerBody)}" title="Copy answer text">
                📋 Copy Text
              </button>
              <button type="button" class="action-tool-btn btn-copy-table" data-msg-id="${msg.id}" title="Copy table to clipboard">
                📊 Copy Table
              </button>
              <button type="button" class="action-tool-btn btn-export-csv" data-msg-id="${msg.id}" title="Download table data as CSV">
                📥 Download CSV
              </button>
              <button type="button" class="action-tool-btn btn-pin-answer ${isPinned ? 'pinned' : ''}" data-msg-id="${msg.id}" title="${isPinned ? 'Remove from Saved' : 'Pin to Saved Insights'}">
                ${isPinned ? '★ Saved' : '☆ Save Insight'}
              </button>
              <button type="button" class="action-tool-btn btn-regenerate" data-msg-id="${msg.id}" title="Regenerate this answer">
                🔄 Regenerate
              </button>
            </div>

            <div class="feedback-buttons">
              <button type="button" class="feedback-btn btn-feedback-up" data-msg-id="${msg.id}" title="Helpful answer" aria-label="Thumbs up">👍</button>
              <button type="button" class="feedback-btn btn-feedback-down" data-msg-id="${msg.id}" title="Report issue with answer" aria-label="Thumbs down">👎</button>
            </div>
          </div>

          <!-- 4. Technical Details / Why this answer? -->
          <details class="technical-details-accordion" style="margin-top: 12px; font-size: 11.5px; border-top: 1px solid var(--border-color); padding-top: 8px;">
            <summary style="cursor: pointer; font-weight: 600; color: var(--text-secondary);">⚙️ Technical details / Why this answer?</summary>
            
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div class="answer-meta-bar" style="border: none; padding: 0; background: transparent;">
                <span class="answer-meta-item">🕒 Data as of: ${escapeHtml(res.dataAsOf || 'Yesterday 23:59 UTC')}</span>
                <span class="answer-meta-item">🛡️ RBAC: ${escapeHtml(state.currentUser ? state.currentUser.roleTitle : 'Default')}</span>
              </div>

              ${res.confidenceNote ? `
                <div class="limitations-note-box" style="margin: 0;">
                  <strong>Grounding &amp; Scope Note:</strong> ${escapeHtml(res.confidenceNote)}
                </div>
              ` : ''}

              <div class="sources-row" style="margin: 0;">
                <span style="color: var(--text-muted); font-weight: 500;">Business Sources &amp; Definitions:</span>
                ${sourcesHtml}
              </div>

              ${res.plainEnglishExplanation ? `
                <div class="explanation-details" style="margin: 0; padding: 8px; background: var(--bg-hover); border-radius: 4px;">
                  <strong style="display:block; margin-bottom: 4px;">Pipeline / Query Strategy:</strong>
                  ${escapeHtml(res.plainEnglishExplanation)}
                </div>
              ` : ''}

              <details class="sql-accordion" ${state.settings.showSqlDefault ? 'open' : ''} style="margin: 0;">
                <summary class="sql-summary" style="list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface); border: 1.5px solid var(--border-color); border-radius: 6px; font-weight: 600; color: var(--text-primary); transition: all 0.2s ease; margin-bottom: 8px;">
                  <div class="sql-summary-left" style="display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    <span>View Generated SQL Query</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <button type="button" class="btn-copy-sql action-tool-btn" data-sql="${escapeHtml(res.sql || '')}" onclick="event.preventDefault();" style="padding: 4px 8px; font-size: 11px;">Copy SQL</button>
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="sql-chevron"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </summary>
                <pre class="sql-code-block" style="margin-top: 8px;"><code>${escapeHtml(res.sql || '-- No SQL executed')}</code></pre>
              </details>
            </div>
          </details>

          <!-- Suggested Follow-ups -->
          ${res.followUps && res.followUps.length > 0 ? `
            <div class="followups-container">
              <div class="followups-label">Suggested Follow-ups</div>
              <div class="followups-chips-list">
                ${res.followUps.map((f) => `
                  <button type="button" class="followup-chip" data-query="${escapeHtml(f)}">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    ${escapeHtml(f)}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderBlockedSecurityHtml(msg) {
    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card">
          <div class="error-card" style="border-color: var(--danger-border); background-color: var(--danger-bg); color: var(--danger-color);">
            <div class="error-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
              <span>${escapeHtml(msg.title || 'Action Blocked by Security Gateway')}</span>
            </div>
            <div class="error-message">${escapeHtml(msg.message || '')}</div>
            <div class="error-reason">
              <strong>Security Policy:</strong> ${escapeHtml(msg.reason || '')}
            </div>
            ${msg.details ? `
              <details class="explanation-details" style="margin-top: 6px;">
                <summary class="explanation-summary">Why was this query blocked?</summary>
                <div class="explanation-content">${escapeHtml(msg.details)}</div>
              </details>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderClarificationHtml(msg) {
    const opts = msg.options || [];
    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card" style="border: 2px solid var(--accent-primary); box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 24px; position: relative; z-index: 10;">
          <div class="clarification-box" style="border: none; background: transparent; padding: 0;">
            <div class="clarification-title" style="font-size: 16px; margin-bottom: 12px; color: var(--text-primary);">
              <svg width="24" height="24" fill="none" stroke="var(--accent-primary)" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span style="font-weight: 700;">Agent Clarification Required</span>
            </div>
            <p class="clarification-question" style="font-size: 15px; margin-bottom: 20px; line-height: 1.5;">${escapeHtml(msg.question || '')}</p>
            <div class="clarification-chips" style="display: flex; flex-direction: column; gap: 10px;">
              ${opts.map((opt) => `
                <button type="button" class="clarification-chip" data-payload="${escapeHtml(opt.payload)}" data-label="${escapeHtml(opt.label)}" style="width: 100%; justify-content: space-between; padding: 12px 16px; font-size: 14px; border: 1px solid var(--border-color); background: var(--bg-surface); text-align: left;" ${msg.resolvedPayload ? 'disabled' : ''}>
                  <span style="font-weight: 500;">${escapeHtml(opt.label)}</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderErrorHtml(msg) {
    const err = msg.errorData || {};
    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card">
          <div class="error-card">
            <div class="error-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>${escapeHtml(err.title || 'Information Not Found')}</span>
            </div>
            <div class="error-message">${escapeHtml(err.message || '')}</div>
            <div class="error-reason">
              <strong>Context &amp; Boundary:</strong> ${escapeHtml(err.reason || '')}
            </div>
            ${err.suggestedActions && err.suggestedActions.length > 0 ? `
              <div class="error-suggestions">
                <strong>Recommended Next Steps:</strong>
                <ul>
                  ${err.suggestedActions.map((act) => `<li>${escapeHtml(act)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 5. IDLE STATE & ROLE-BASED EXAMPLES
  // =========================================================================
  function renderIdleState() {
    const roleKey = state.currentUser ? state.currentUser.role : 'sales_manager';
    let examples = window.AriaMock.ROLE_EXAMPLE_QUESTIONS[roleKey] || window.AriaMock.ROLE_EXAMPLE_QUESTIONS.sales_manager;

    // Filter by active domain scope
    if (state.activeDomainScope && state.activeDomainScope !== 'All') {
      const filtered = examples.filter((ex) => ex.domain === state.activeDomainScope);
      if (filtered.length > 0) examples = filtered;
    }

    chatContainerEl.innerHTML = `
      <section class="welcome-hero" id="welcomeHero">
        <div class="hero-chip">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-9H9v5h2V7zm0 6H9v2h2v-2z"/></svg>
          Read-only enterprise data assistant
        </div>
        <h1 class="hero-title">Ask questions about the enterprise data you have access to</h1>
        <p class="hero-subtitle">
          Get business answers grounded in approved enterprise data, with applied filters, definitions, and source details you can verify.
        </p>

        <div class="example-section">
          <div class="example-section-label">
            <span>Suggested for your role (${escapeHtml(state.currentUser ? state.currentUser.roleTitle : 'Sales Manager')})</span>
            <span style="font-weight: normal; font-size: 11px;">Scope: <strong>${escapeHtml(state.activeDomainScope)}</strong></span>
          </div>
          <div class="example-grid">
            ${examples.map((ex) => `
              <button type="button" class="example-card" data-query="${escapeHtml(ex.text)}">
                <div class="example-card-header">
                  <span class="example-card-category">${escapeHtml(ex.category)}</span>
                  <span class="brand-badge" style="font-size: 9px;">Verified</span>
                </div>
                <div class="example-card-text">${escapeHtml(ex.text)}</div>
              </button>
            `).join('')}
          </div>
        </div>
      </section>
    `;

    chatContainerEl.querySelectorAll('.example-card').forEach((card) => {
      card.addEventListener('click', () => {
        const q = card.getAttribute('data-query');
        chatInputEl.value = q;
        chatInputEl.focus();
        updateSendButtonState();
      });
    });
  }

  // =========================================================================
  // 6. QUERY EXECUTION PIPELINE (Fix 1: MULTI-TURN IN ACTIVE CONV)
  // =========================================================================
  function handleSendMessage() {
    const text = chatInputEl.value.trim();
    if (!text || state.isThinking) return;

    chatInputEl.value = '';
    updateSendButtonState();
    closeTypeahead();

    processUserPrompt(text);
  }

  function processUserPrompt(promptText, options = {}) {
    // 1. Ensure Active Conversation exists
    let conv = getActiveConversation();
    if (!conv) {
      conv = createNewConversation(promptText.substring(0, 40));
    } else if (conv.messages.length === 0) {
      conv.title = promptText.substring(0, 40);
      saveConversationsToStorage();
      renderSidebarConversations();
    }

    // 2. Append User Message
    const userMsgId = 'msg_' + Date.now() + '_u';
    const userMsg = {
      id: userMsgId,
      role: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    conv.messages.push(userMsg);
    conv.updatedAt = Date.now();
    saveConversationsToStorage();
    renderActiveConversation();

    // 3. Initiate Thinking State
    state.isThinking = true;
    updateSendButtonState();
    state.activeAbortController = new AbortController();

    const agentMsgId = 'msg_' + Date.now() + '_a';
    renderThinkingBubble(agentMsgId);

    // 4. Invoke Isolated askAgent()
    window.askAgent(promptText, (stageIdx, stageObj, isRetry) => {
      updateThinkingStage(agentMsgId, stageIdx, stageObj, isRetry);
    }, {
      user: state.currentUser,
      domainScope: state.activeDomainScope,
      timeRange: state.activeTimeRange,
      clarificationPayload: options.clarificationPayload,
      signal: state.activeAbortController.signal
    })
    .then((result) => {
      state.isThinking = false;
      state.activeAbortController = null;
      updateSendButtonState();

      // Mask sensitive columns for current role if required
      if (result.table && state.currentUser) {
        applyRoleColumnMasking(result.table, state.currentUser.role);
      }

      // Append Agent Message
      const agentMsg = {
        id: agentMsgId,
        role: 'agent',
        type: result.type,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        resultsData: result.type === 'results' ? result : null,
        errorData: result.type === 'error' ? result.friendlyError : null,
        clarificationData: result.type === 'clarification' ? result : null,
        question: result.question || null,
        options: result.options || null,
        title: result.title || null,
        message: result.message || null,
        reason: result.reason || null,
        details: result.details || null,
        activeView: 'table',
        tablePage: 1,
        tableSearch: ''
      };

      conv.messages.push(agentMsg);
      conv.updatedAt = Date.now();
      saveConversationsToStorage();
      renderSidebarConversations();
      renderActiveConversation();
      scrollToBottom();
    })
    .catch((err) => {
      state.isThinking = false;
      state.activeAbortController = null;
      updateSendButtonState();

      if (err.message && err.message.includes('cancelled')) {
        conv.messages.push({
          id: agentMsgId,
          role: 'agent',
          type: 'error',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          errorData: {
            title: 'Generation Stopped',
            message: 'Query synthesis was cancelled by user.',
            reason: 'User triggered stop generating.',
            suggestedActions: ['Submit another question or rephrase your inquiry.']
          }
        });
      } else {
        conv.messages.push({
          id: agentMsgId,
          role: 'agent',
          type: 'error',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          errorData: {
            title: 'Execution Error',
            message: String(err),
            reason: 'Client-side processing exception.',
            suggestedActions: ['Check input and try again.']
          }
        });
      }
      saveConversationsToStorage();
      renderActiveConversation();
      scrollToBottom();
    });
  }

  // =========================================================================
  // 7. THINKING PIPELINE ANIMATION & STOP BUTTON (Group A)
  // =========================================================================
  function renderThinkingBubble(msgId) {
    const thinkingRow = document.createElement('div');
    thinkingRow.className = 'chat-row agent-row';
    thinkingRow.id = `thinking_row_${msgId}`;

    const stages = window.AriaMock.PIPELINE_STAGES;
    thinkingRow.innerHTML = `
      <div class="thinking-container">
        <div class="thinking-header">
          <div class="thinking-title-area">
            <div class="pulse-spinner" aria-hidden="true"></div>
            <span>Aria Query Pipeline Execution</span>
          </div>
          <button type="button" class="btn-stop-generating" id="stopGeneratingBtn">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="12" rx="2"></rect></svg>
            Stop generating
          </button>
        </div>
        <ul class="stage-trail-list" id="trail_${msgId}">
          ${stages.map((st, idx) => `
            <li class="stage-item ${idx === 0 ? 'active' : 'pending'}" id="st_${msgId}_${idx}">
              <div class="stage-dot">${idx === 0 ? '●' : '○'}</div>
              <span class="stage-label">${escapeHtml(st.label)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    chatContainerEl.appendChild(thinkingRow);

    const stopBtn = thinkingRow.querySelector('#stopGeneratingBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (state.activeAbortController) {
          state.activeAbortController.abort();
          showToast('Query generation stopped');
        }
      });
    }
    scrollToBottom();
  }

  function updateThinkingStage(msgId, stageIdx, stageObj, isRetry) {
    const trailEl = document.getElementById(`trail_${msgId}`);
    if (!trailEl) return;

    if (isRetry) {
      const retryLi = document.createElement('li');
      retryLi.className = 'stage-item retry-active';
      retryLi.innerHTML = `
        <div class="stage-dot">⚠</div>
        <span class="stage-label">${escapeHtml(stageObj.label)}</span>
      `;
      trailEl.appendChild(retryLi);
    } else {
      for (let i = 0; i < stageIdx; i++) {
        const item = document.getElementById(`st_${msgId}_${i}`);
        if (item) {
          item.className = 'stage-item completed';
          const dot = item.querySelector('.stage-dot');
          if (dot) dot.innerHTML = '✓';
        }
      }
      const curItem = document.getElementById(`st_${msgId}_${stageIdx}`);
      if (curItem) {
        curItem.className = 'stage-item active';
        const dot = curItem.querySelector('.stage-dot');
        if (dot) dot.innerHTML = '●';
      }
    }
    scrollToBottom();
  }

  // =========================================================================
  // 8. DATA TABLE (FILTERING, SORTING, PAGINATION, MASKING)
  // =========================================================================
  function applyRoleColumnMasking(tableData, roleKey) {
    if (!tableData || !tableData.columns) return;
    const roleDef = window.AriaMock.USER_ROLES[roleKey];
    if (!roleDef || !roleDef.maskedColumns || roleDef.maskedColumns.length === 0) return;

    tableData.columns.forEach((colKey, colIdx) => {
      if (roleDef.maskedColumns.includes(colKey)) {
        tableData.types[colIdx] = 'masked';
      }
    });
  }

  function generateTableHtml(tableData, msgId, activeView, page = 1, searchQuery = '') {
    if (!tableData || !tableData.headers || !tableData.rows) return '';

    let rows = [...tableData.rows];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }

    const pageSize = 5;
    const totalPages = Math.ceil(rows.length / pageSize) || 1;
    const curPage = Math.min(Math.max(1, page), totalPages);
    const pagedRows = rows.slice((curPage - 1) * pageSize, curPage * pageSize);

    return `
      <div class="result-table-container" id="table_container_${msgId}">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <span style="font-weight: 600; font-size: 12.5px;">${escapeHtml(tableData.title || 'Query Records')}</span>
            <span style="font-size: 11px; color: var(--text-muted);">(${rows.length} records)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="text" class="table-search-input in-table-filter" data-msg-id="${msgId}" placeholder="Filter rows..." value="${escapeHtml(searchQuery)}">
          </div>
        </div>

        <div class="table-scroll-wrapper">
          <table class="result-data-table" id="data_table_${msgId}">
            <thead>
              <tr>
                ${tableData.headers.map((h, i) => `
                  <th data-col-idx="${i}" data-msg-id="${msgId}">
                    ${tableData.types[i] === 'masked' ? `
                      <div style="display:inline-flex; flex-direction:column; gap:2px;">
                        <span style="color:var(--danger-color);">🔒 Restricted</span>
                        <span style="font-size:9px; color:var(--text-muted); font-weight:normal;">Masked by RBAC policy</span>
                      </div>
                    ` : escapeHtml(h)}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${renderTableRowsHtml(pagedRows, tableData.columns, tableData.types)}
            </tbody>
          </table>
        </div>

        <div class="table-pagination-bar">
          <span>Page ${curPage} of ${totalPages}</span>
          <div style="display: flex; gap: 4px;">
            <button type="button" class="pagination-btn table-prev-btn" data-msg-id="${msgId}" data-page="${curPage - 1}" ${curPage <= 1 ? 'disabled' : ''}>Prev</button>
            <button type="button" class="pagination-btn table-next-btn" data-msg-id="${msgId}" data-page="${curPage + 1}" ${curPage >= totalPages ? 'disabled' : ''}>Next</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderTableRowsHtml(rows, columns, types) {
    if (rows.length === 0) {
      return `<tr><td colspan="${columns.length}" style="text-align: center; color: var(--text-muted); padding: 16px;">No matching records.</td></tr>`;
    }

    return rows.map((row) => `
      <tr>
        ${columns.map((colKey, colIdx) => {
          const val = row[colKey];
          const type = types[colIdx];

          if (type === 'masked') {
            return `<td><span class="td-masked" title="Restricted for your role (${escapeHtml(state.currentUser ? state.currentUser.roleTitle : 'Role')})">•••• 🔒</span></td>`;
          } else if (type === 'badge') {
            const badgeClass = 'status-' + String(val).toLowerCase().replace(/[^a-z0-9]/g, '-');
            return `<td><span class="td-badge ${badgeClass}">${escapeHtml(String(val))}</span></td>`;
          } else if (type === 'number') {
            const formatted = typeof val === 'number' ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val;
            return `<td class="td-number">${escapeHtml(String(formatted))}</td>`;
          } else if (type === 'percent' || type === 'variance') {
            const isPos = typeof val === 'number' && val > 0;
            return `<td class="td-number">${typeof val === 'number' ? (isPos && type === 'variance' ? '+' : '') + val.toFixed(1) + '%' : escapeHtml(String(val))}</td>`;
          } else {
            return `<td>${escapeHtml(String(val !== undefined ? val : ''))}</td>`;
          }
        }).join('')}
      </tr>
    `).join('');
  }

  // =========================================================================
  // 9. INLINE SVG CHARTS (BAR / LINE / PIE) (Group B)
  // =========================================================================
  function generateChartHtml(chartData, msgId, chartType = 'bar') {
    if (!chartData || !chartData.items || chartData.items.length === 0) return '';

    let svgChartHtml = '';
    if (chartType === 'line') {
      svgChartHtml = renderSvgLineChart(chartData);
    } else if (chartType === 'pie') {
      svgChartHtml = renderSvgPieChart(chartData);
    } else {
      svgChartHtml = renderSvgBarChart(chartData);
    }

    return `
      <div class="chart-panel-container">
        <div class="chart-header-row">
          <div style="font-weight: 600; font-size: 12.5px;">${escapeHtml(chartData.title || 'Data Visualisation')}</div>
          <div class="chart-type-selector">
            <button type="button" class="chart-type-btn ${chartType === 'bar' ? 'active' : ''}" data-type="bar" data-msg-id="${msgId}">Bar</button>
            <button type="button" class="chart-type-btn ${chartType === 'line' ? 'active' : ''}" data-type="line" data-msg-id="${msgId}">Line</button>
            <button type="button" class="chart-type-btn ${chartType === 'pie' ? 'active' : ''}" data-type="pie" data-msg-id="${msgId}">Pie</button>
          </div>
        </div>
        <div class="chart-svg-wrapper">
          ${svgChartHtml}
        </div>
      </div>
    `;
  }

  function renderSvgBarChart(chartData) {
    const items = chartData.items;
    const maxVal = Math.max(...items.map((i) => Math.max(i.value || 0, i.targetValue || 0))) || 1;
    const width = 580;
    const barHeight = 24;
    const gap = 14;
    const height = items.length * (barHeight + gap) + 20;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width: 100%; height: auto;">
        ${items.map((item, idx) => {
          const y = idx * (barHeight + gap) + 10;
          const barWidth = Math.max(10, Math.round(((item.value || 0) / maxVal) * 360));
          const color = item.color || '#2563eb';
          return `
            <g>
              <text x="110" y="${y + 16}" font-size="11.5" text-anchor="end" fill="var(--text-secondary)" font-family="var(--font-sans)">
                ${escapeHtml(item.label)}
              </text>
              <rect x="120" y="${y}" width="380" height="${barHeight}" rx="4" fill="var(--bg-hover)"/>
              <rect x="120" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}">
                <title>${escapeHtml(item.label)}: ${item.value}${chartData.unit || ''}</title>
              </rect>
              <text x="${130 + barWidth}" y="${y + 16}" font-size="11" font-weight="600" fill="var(--text-primary)" font-family="var(--font-mono)">
                ${item.value}${chartData.unit || ''}
              </text>
            </g>
          `;
        }).join('')}
      </svg>
    `;
  }

  function renderSvgLineChart(chartData) {
    const items = chartData.items;
    const maxVal = Math.max(...items.map((i) => i.value || 0)) || 1;
    const width = 560;
    const height = 180;
    const padX = 60;
    const padY = 30;
    const plotWidth = width - padX * 2;
    const plotHeight = height - padY * 2;

    const points = items.map((item, idx) => {
      const x = padX + (idx / Math.max(1, items.length - 1)) * plotWidth;
      const y = height - padY - ((item.value || 0) / maxVal) * plotHeight;
      return { x, y, val: item.value, label: item.label };
    });

    const polylinePts = points.map((p) => `${p.x},${p.y}`).join(' ');

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width: 100%; height: auto;">
        <!-- Grid lines -->
        <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="var(--border-strong)" stroke-width="1"/>
        <line x1="${padX}" y1="${padY}" x2="${width - padX}" y2="${padY}" stroke="var(--border-color)" stroke-dasharray="3"/>
        <line x1="${padX}" y1="${padY + plotHeight / 2}" x2="${width - padX}" y2="${padY + plotHeight / 2}" stroke="var(--border-color)" stroke-dasharray="3"/>

        <!-- Connecting Line -->
        <polyline fill="none" stroke="var(--accent-primary)" stroke-width="2.5" points="${polylinePts}"/>

        <!-- Data Points & Labels -->
        ${points.map((p) => `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="var(--accent-primary)" stroke="#fff" stroke-width="2">
              <title>${escapeHtml(p.label)}: ${p.val}${chartData.unit || ''}</title>
            </circle>
            <text x="${p.x}" y="${p.y - 8}" font-size="10" text-anchor="middle" font-weight="600" fill="var(--text-primary)" font-family="var(--font-mono)">${p.val}</text>
            <text x="${p.x}" y="${height - 10}" font-size="10.5" text-anchor="middle" fill="var(--text-muted)">${escapeHtml(p.label)}</text>
          </g>
        `).join('')}
      </svg>
    `;
  }

  function renderSvgPieChart(chartData) {
    const items = chartData.items;
    const total = items.reduce((acc, i) => acc + (i.value || 0), 0) || 1;
    const width = 480;
    const height = 180;
    const cx = 110;
    const cy = 90;
    const r = 65;

    let cumulativeAngle = 0;
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    const slices = items.map((item, idx) => {
      const sliceAngle = ((item.value || 0) / total) * 2 * Math.PI;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle = endAngle;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const color = item.color || colors[idx % colors.length];
      const pct = Math.round(((item.value || 0) / total) * 100);

      return { pathData, color, label: item.label, value: item.value, pct };
    });

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width: 100%; height: auto;">
        <!-- Pie Slices -->
        <g>
          ${slices.map((s) => `
            <path d="${s.pathData}" fill="${s.color}">
              <title>${escapeHtml(s.label)}: ${s.value}${chartData.unit || ''} (${s.pct}%)</title>
            </path>
          `).join('')}
        </g>

        <!-- Legend -->
        <g transform="translate(230, 25)">
          ${slices.map((s, idx) => `
            <g transform="translate(0, ${idx * 26})">
              <rect x="0" y="0" width="12" height="12" rx="2" fill="${s.color}"/>
              <text x="20" y="10" font-size="11.5" fill="var(--text-secondary)">
                ${escapeHtml(s.label)}: <tspan font-weight="600" font-family="var(--font-mono)">${s.pct}%</tspan> (${s.value}${chartData.unit || ''})
              </text>
            </g>
          `).join('')}
        </g>
      </svg>
    `;
  }

  // =========================================================================
  // 10. EVENT HANDLERS ON CHAT INTERACTIONS (Group A, B, C)
  // =========================================================================
  function attachConversationEventHandlers(conv) {
    // 1. Export Conversation
    const exportBtn = document.getElementById('exportConvBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        let md = `# ${conv.title}\n*Exported from Aria AI Assistant on ${new Date().toLocaleString()}*\n\n---\n\n`;
        conv.messages.forEach((m) => {
          if (m.role === 'user') {
            md += `### User Query (${m.time})\n> ${m.text}\n\n`;
          } else {
            md += `### Aria Answer (${m.time})\n${m.resultsData ? m.resultsData.answer : (m.message || '')}\n\n`;
            if (m.resultsData && m.resultsData.sql) {
              md += `\`\`\`sql\n${m.resultsData.sql}\n\`\`\`\n\n`;
            }
          }
        });
        downloadFile(`${conv.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`, md, 'text/markdown');
        showToast('Exported conversation as Markdown');
      });
    }

    // 2. Print Conversation
    const printBtn = document.getElementById('printConvBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // 3. User Edit Button
    chatContainerEl.querySelectorAll('.user-edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        chatInputEl.value = text;
        chatInputEl.focus();
        updateSendButtonState();
        showToast('Editing last question. Press Enter to resend.');
      });
    });

    // 4. Clarification Chips
    chatContainerEl.querySelectorAll('.clarification-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const payload = chip.getAttribute('data-payload');
        const label = chip.getAttribute('data-label');
        processUserPrompt(label, { clarificationPayload: payload });
      });
    });

    // 5. Follow-up Chips
    chatContainerEl.querySelectorAll('.followup-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        processUserPrompt(query);
      });
    });

    // 6. View Switch (Table vs Chart)
    chatContainerEl.querySelectorAll('.view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const view = btn.getAttribute('data-view');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg) {
          msg.activeView = view;
          renderActiveConversation();
        }
      });
    });

    // 7. Chart Type Switch (Bar / Line / Pie)
    chatContainerEl.querySelectorAll('.chart-type-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const type = btn.getAttribute('data-type');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg) {
          msg.chartType = type;
          renderActiveConversation();
        }
      });
    });

    // 8. In-Table Filter Search
    chatContainerEl.querySelectorAll('.in-table-filter').forEach((input) => {
      input.addEventListener('input', () => {
        const msgId = input.getAttribute('data-msg-id');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg) {
          msg.tableSearch = input.value;
          msg.tablePage = 1;
          renderActiveConversation();
          const refreshedInput = document.querySelector(`.in-table-filter[data-msg-id="${msgId}"]`);
          if (refreshedInput) {
            refreshedInput.focus();
            refreshedInput.setSelectionRange(refreshedInput.value.length, refreshedInput.value.length);
          }
        }
      });
    });

    // 9. Table Pagination
    chatContainerEl.querySelectorAll('.table-prev-btn, .table-next-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const page = parseInt(btn.getAttribute('data-page'), 10);
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg && page >= 1) {
          msg.tablePage = page;
          renderActiveConversation();
        }
      });
    });

    // 10. Table Sorting
    chatContainerEl.querySelectorAll('.result-data-table th').forEach((th) => {
      th.addEventListener('click', () => {
        const msgId = th.getAttribute('data-msg-id');
        const colIdx = parseInt(th.getAttribute('data-col-idx'), 10);
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg && msg.resultsData && msg.resultsData.table) {
          const table = msg.resultsData.table;
          const colKey = table.columns[colIdx];
          const isAsc = !th.classList.contains('sort-asc');

          table.rows.sort((a, b) => {
            let valA = a[colKey];
            let valB = b[colKey];
            if (typeof valA === 'number' && typeof valB === 'number') {
              return isAsc ? valA - valB : valB - valA;
            }
            return isAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
          });

          renderActiveConversation();
        }
      });
    });

    // 11. Copy Answer Text
    chatContainerEl.querySelectorAll('.btn-copy-answer').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-answer');
        navigator.clipboard.writeText(text);
        showToast('Answer text copied to clipboard');
      });
    });

    // 12. Copy Table
    chatContainerEl.querySelectorAll('.btn-copy-table').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg && msg.resultsData && msg.resultsData.table) {
          const t = msg.resultsData.table;
          const tsv = [t.headers.join('\t'), ...t.rows.map((r) => t.columns.map((c) => r[c]).join('\t'))].join('\n');
          navigator.clipboard.writeText(tsv);
          showToast('Table copied as TSV to clipboard');
        }
      });
    });

    // 13. Download Table CSV
    chatContainerEl.querySelectorAll('.btn-export-csv').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg && msg.resultsData && msg.resultsData.table) {
          const t = msg.resultsData.table;
          const csv = [t.headers.join(','), ...t.rows.map((r) => t.columns.map((c) => `"${r[c]}"`).join(','))].join('\n');
          downloadFile('query_results.csv', csv, 'text/csv');
          showToast('Table downloaded as CSV');
        }
      });
    });

    // 14. Pin/Save Answer
    chatContainerEl.querySelectorAll('.btn-pin-answer').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg && msg.resultsData) {
          const isSaved = window.AriaMock.toggleSaveAnswer(state.currentUser ? state.currentUser.id : 'default', {
            id: msg.id,
            title: conv.title,
            answer: msg.resultsData.answer,
            sql: msg.resultsData.sql,
            timestamp: msg.timestamp
          });
          showToast(isSaved ? 'Answer saved to bookmarks' : 'Answer removed from bookmarks');
          renderActiveConversation();
        }
      });
    });

    // 15. Regenerate
    chatContainerEl.querySelectorAll('.btn-regenerate').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msgIdx = conv.messages.findIndex((m) => m.id === msgId);
        if (msgIdx >= 1) {
          const userPrompt = conv.messages[msgIdx - 1].text;
          conv.messages.splice(msgIdx, 1);
          saveConversationsToStorage();
          processUserPrompt(userPrompt);
        }
      });
    });

    // 16. Feedback Buttons
    chatContainerEl.querySelectorAll('.btn-feedback-up').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((m) => m.id === msgId);
        window.AriaMock.recordFeedback('up', null, null, conv.title, state.currentUser);
        btn.style.opacity = '1';
        btn.style.background = 'var(--success-bg)';
        showToast('Thank you for positive feedback!');
      });
    });

    chatContainerEl.querySelectorAll('.btn-feedback-down').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.currentFeedbackMessageId = btn.getAttribute('data-msg-id');
        feedbackModalBackdrop.classList.add('open');
      });
    });

    // 17. Source Table Pill Inspection
    chatContainerEl.querySelectorAll('.source-badge-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tableName = btn.getAttribute('data-table-name');
        openSourceTableModal(tableName);
      });
    });

    // 18. Copy SQL Button
    chatContainerEl.querySelectorAll('.btn-copy-sql').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sql = btn.getAttribute('data-sql');
        navigator.clipboard.writeText(sql);
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy SQL'; }, 2000);
        showToast('SQL query copied');
      });
    });
  }

  // =========================================================================
  // 11. SOURCE TABLE INSPECTION MODAL (Group B)
  // =========================================================================
  function openSourceTableModal(tableName) {
    const tableDef = window.AriaMock.SCHEMA_CATALOG.find((t) => t.name === tableName) || {
      name: tableName,
      domain: 'Enterprise Data Mart',
      records: '10,000+',
      description: 'Enterprise operational database table.',
      columns: []
    };

    sourceTableModalTitle.textContent = `Table: ${tableDef.name}`;
    sourceTableModalBody.innerHTML = `
      <div class="schema-table-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="brand-badge">${escapeHtml(tableDef.domain)}</span>
          <span style="font-size: 11px; color: var(--text-muted);">${tableDef.records} rows</span>
        </div>
        <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">
          ${escapeHtml(tableDef.description)}
        </p>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
          Primary Key: <code>${tableDef.pk || 'id'}</code>
        </div>
      </div>

      <div>
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 6px;">Key Schema Columns</div>
        <div style="max-height: 180px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <table class="result-data-table" style="font-size: 11.5px;">
            <thead><tr><th>Column</th><th>Data Type</th><th>Attributes</th></tr></thead>
            <tbody>
              ${(tableDef.columns || []).map((col) => `
                <tr>
                  <td><code>${escapeHtml(col.name)}</code></td>
                  <td>${escapeHtml(col.type)}</td>
                  <td>${col.isPk ? '<span class="brand-badge" style="font-size: 9px;">PK</span>' : (col.isFk ? '<span class="brand-badge" style="font-size: 9px;">FK</span>' : (col.isSensitive ? '🔒 Sensitive' : ''))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
        <button type="button" class="btn-new-chat ask-about-table-btn" data-query="${escapeHtml(tableDef.sampleQuery || `Describe records in ${tableDef.name}`)}" style="width: auto; padding: 6px 14px;">
          Ask about this table
        </button>
      </div>
    `;

    sourceTableModalBody.querySelector('.ask-about-table-btn').addEventListener('click', () => {
      sourceTableModalBackdrop.classList.remove('open');
      const q = tableDef.sampleQuery || `Describe records in ${tableDef.name}`;
      chatInputEl.value = q;
      chatInputEl.focus();
      updateSendButtonState();
    });

    sourceTableModalBackdrop.classList.add('open');
  }

  // =========================================================================
  // 12. DATA EXPLORER & BUSINESS GLOSSARY (Group D)
  // =========================================================================
  let explorerActiveTab = 'tables';
  function renderDataExplorer() {
    const q = (explorerSearchInput.value || '').toLowerCase().trim();

    if (explorerActiveTab === 'tables') {
      let tables = window.AriaMock.SCHEMA_CATALOG;
      if (q) {
        tables = tables.filter((t) => t.name.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
      }

      explorerTabContent.innerHTML = tables.map((t) => `
        <div class="schema-table-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="schema-table-name">${escapeHtml(t.name)}</span>
            <span class="brand-badge" style="font-size: 9.5px;">${escapeHtml(t.domain)}</span>
          </div>
          <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(t.description)}</p>
          <div style="font-size: 10.5px; color: var(--text-muted);">
            PK: <code>${t.pk}</code> • ${t.columns.length} columns • ${t.records} records
          </div>
          <button type="button" class="action-tool-btn ask-table-btn" data-query="${escapeHtml(t.sampleQuery)}" style="align-self: flex-start; margin-top: 4px;">
            💬 Ask about this table
          </button>
        </div>
      `).join('');

      explorerTabContent.querySelectorAll('.ask-table-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          dataExplorerDrawer.classList.remove('open');
          const query = btn.getAttribute('data-query');
          chatInputEl.value = query;
          chatInputEl.focus();
          updateSendButtonState();
        });
      });
    } else {
      let glossary = window.AriaMock.BUSINESS_GLOSSARY;
      if (q) {
        glossary = glossary.filter((g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q) || g.synonyms.some((s) => s.toLowerCase().includes(q)));
      }

      explorerTabContent.innerHTML = glossary.map((g) => `
        <div class="schema-table-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 13px; color: var(--text-primary);">${escapeHtml(g.term)}</span>
            <span class="brand-badge" style="font-size: 9.5px;">${escapeHtml(g.domain)}</span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(g.definition)}</p>
          <div style="font-size: 11px; color: var(--text-muted);">
            <strong>Synonyms:</strong> ${escapeHtml(g.synonyms.join(', '))}
          </div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">
            Mapped Tables: ${g.tables.map((tbl) => `<code>${tbl}</code>`).join(' ')}
          </div>
        </div>
      `).join('');
    }
  }

  // =========================================================================
  // 13. SAVED ANSWERS DRAWER (Group B)
  // =========================================================================
  function renderSavedAnswers() {
    const list = window.AriaMock.getSavedAnswers(state.currentUser ? state.currentUser.id : 'default');
    if (list.length === 0) {
      savedAnswersList.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 24px 0;">No saved answers yet.<br>Click "Save" on any query result to pin it here.</div>`;
      return;
    }

    savedAnswersList.innerHTML = list.map((item) => `
      <div class="schema-table-card">
        <div style="font-weight: 600; font-size: 13px;">${escapeHtml(item.title)}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin: 4px 0;">Last refreshed: ${new Date(item.timestamp).toLocaleString()}</div>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(item.answer.substring(0, 160))}...</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
          <div style="display: flex; gap: 8px;">
            <button type="button" class="view-btn" style="padding: 2px 6px; font-size: 11px;" onclick="alert('Query refreshed.')">🔄 Refresh</button>
            <button type="button" class="view-btn" style="padding: 2px 6px; font-size: 11px;" onclick="alert('Snapshot saved.')">💾 Save Snapshot</button>
          </div>
          <button type="button" class="conv-action-btn remove-saved-btn" data-id="${item.id}" style="color: var(--danger-color);">Remove</button>
        </div>
      </div>
    `).join('');

    savedAnswersList.querySelectorAll('.remove-saved-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.AriaMock.toggleSaveAnswer(state.currentUser ? state.currentUser.id : 'default', { id });
        renderSavedAnswers();
        showToast('Removed from saved answers');
      });
    });
  }

  // =========================================================================
  // 14. INPUT HELPERS: TYPEAHEAD, DOMAIN CHIPS, VOICE INPUT (Group C)
  // =========================================================================
  function initInputHelpers() {
    // 1. Typeahead
    chatInputEl.addEventListener('input', () => {
      updateSendButtonState();
      const val = chatInputEl.value.trim().toLowerCase();
      if (val.length < 2) {
        closeTypeahead();
        return;
      }

      // Match against glossary and role questions
      const suggestions = [];
      window.AriaMock.BUSINESS_GLOSSARY.forEach((g) => {
        if (g.term.toLowerCase().includes(val) || g.synonyms.some((s) => s.toLowerCase().includes(val))) {
          suggestions.push({ type: 'Glossary', text: `Explain ${g.term.toLowerCase()}` });
        }
      });
      const roleQuestions = window.AriaMock.ROLE_EXAMPLE_QUESTIONS[state.currentUser ? state.currentUser.role : 'sales_manager'] || [];
      roleQuestions.forEach((q) => {
        if (q.text.toLowerCase().includes(val)) {
          suggestions.push({ type: 'Verified Question', text: q.text });
        }
      });

      if (suggestions.length > 0) {
        typeaheadPopupEl.innerHTML = suggestions.slice(0, 4).map((s) => `
          <div class="typeahead-item" data-text="${escapeHtml(s.text)}">
            <span class="brand-badge" style="font-size: 9px; margin-right: 6px;">${escapeHtml(s.type)}</span>
            ${escapeHtml(s.text)}
          </div>
        `).join('');
        typeaheadPopupEl.classList.add('open');

        typeaheadPopupEl.querySelectorAll('.typeahead-item').forEach((item) => {
          item.addEventListener('click', () => {
            chatInputEl.value = item.getAttribute('data-text');
            closeTypeahead();
            chatInputEl.focus();
            updateSendButtonState();
          });
        });
      } else {
        closeTypeahead();
      }
    });

    // 2. Domain Scope Chips
    if (domainScopeChipsEl) {
      domainScopeChipsEl.querySelectorAll('.scope-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          domainScopeChipsEl.querySelectorAll('.scope-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
          state.activeDomainScope = chip.getAttribute('data-scope');
          showToast(`Query scope limited to: ${state.activeDomainScope}`);
          if (!getActiveConversation() || (getActiveConversation().messages || []).length === 0) {
            renderIdleState();
          }
        });
      });
    }

    // 3. Time Range Select
    if (timeRangeSelectEl) {
      timeRangeSelectEl.addEventListener('change', () => {
        state.activeTimeRange = timeRangeSelectEl.value;
        showToast(`Time window set to: ${state.activeTimeRange}`);
      });
    }

    // 4. Voice Input (Web Speech API)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      state.voiceRecognition = new SpeechRecognition();
      state.voiceRecognition.continuous = false;
      state.voiceRecognition.interimResults = false;
      state.voiceRecognition.lang = 'en-US';

      state.voiceRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInputEl.value = (chatInputEl.value ? chatInputEl.value + ' ' : '') + transcript;
        updateSendButtonState();
        showToast(`Heard: "${transcript}"`);
      };

      state.voiceRecognition.onend = () => {
        state.isRecordingVoice = false;
        voiceInputBtnEl.classList.remove('recording');
      };

      state.voiceRecognition.onerror = (e) => {
        state.isRecordingVoice = false;
        voiceInputBtnEl.classList.remove('recording');
        showToast(`Voice input error: ${e.error}`);
      };

      voiceInputBtnEl.addEventListener('click', () => {
        if (!state.isRecordingVoice) {
          state.voiceRecognition.start();
          state.isRecordingVoice = true;
          voiceInputBtnEl.classList.add('recording');
          showToast('Listening... Speak your business question.');
        } else {
          state.voiceRecognition.stop();
          state.isRecordingVoice = false;
          voiceInputBtnEl.classList.remove('recording');
        }
      });
    } else {
      voiceInputBtnEl.style.display = 'none';
    }
  }

  function closeTypeahead() {
    if (typeaheadPopupEl) typeaheadPopupEl.classList.remove('open');
  }

  // =========================================================================
  // 15. SETTINGS, HELP MODAL & GLOBAL SHORTCUTS (Group H)
  // =========================================================================
  function initSettingsAndHelp() {
    // Theme Choice Buttons in Settings Drawer
    settingsDrawer.querySelectorAll('.theme-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-theme-choice');
        setTheme(choice);
      });
    });

    // Font Scale Buttons
    settingsDrawer.querySelectorAll('.font-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fontClass = btn.getAttribute('data-font');
        document.body.classList.remove('font-sm', 'font-md', 'font-lg');
        document.body.classList.add(fontClass);
        settingsDrawer.querySelectorAll('.font-choice-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.settings.fontSize = fontClass;
      });
    });

    // Detail Level Buttons
    settingsDrawer.querySelectorAll('.detail-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.settings.detailLevel = btn.getAttribute('data-detail');
        settingsDrawer.querySelectorAll('.detail-choice-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        showToast(`Answer format set to: ${state.settings.detailLevel}`);
        renderActiveConversation();
      });
    });

    // Checkboxes
    const showSqlChk = document.getElementById('settingShowSqlDefault');
    if (showSqlChk) {
      showSqlChk.addEventListener('change', () => {
        state.settings.showSqlDefault = showSqlChk.checked;
        renderActiveConversation();
      });
    }

    const compactChk = document.getElementById('settingCompactMode');
    if (compactChk) {
      compactChk.addEventListener('change', () => {
        state.settings.compactMode = compactChk.checked;
        document.body.classList.toggle('compact-mode', compactChk.checked);
      });
    }

    // Help Modal Content Rendering
    renderHelpTabContent('domains');

    helpTabDomainsBtn.addEventListener('click', () => {
      setActiveHelpTab(helpTabDomainsBtn);
      renderHelpTabContent('domains');
    });
    helpTabScopeBtn.addEventListener('click', () => {
      setActiveHelpTab(helpTabScopeBtn);
      renderHelpTabContent('scope');
    });
    helpTabShortcutsBtn.addEventListener('click', () => {
      setActiveHelpTab(helpTabShortcutsBtn);
      renderHelpTabContent('shortcuts');
    });

    // Keyboard Shortcuts Global Listener
    document.addEventListener('keydown', (e) => {
      // Esc = close modals and drawers
      if (e.key === 'Escape') {
        closeAllModalsAndDrawers();
      }
      // '/' = focus chat input (when not already in input)
      if (e.key === '/' && document.activeElement !== chatInputEl && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        chatInputEl.focus();
      }
      // Ctrl+K / Cmd+K = focus history search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        historySearchInputEl.focus();
      }
    });
  }

  function setActiveHelpTab(activeBtn) {
    [helpTabDomainsBtn, helpTabScopeBtn, helpTabShortcutsBtn].forEach((b) => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  function renderHelpTabContent(tab) {
    if (tab === 'domains') {
      helpTabContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
          <p><strong>Aria supports natural-language queries across 6 core operational domains:</strong></p>
          <div class="schema-table-card"><strong>Finance:</strong> Accounts receivable, overdue aging, vendor payments, AP invoices, GL summaries.</div>
          <div class="schema-table-card"><strong>Construction:</strong> Milestone variances, schedule lags, critical path risks, safety audits, liquidated damages.</div>
          <div class="schema-table-card"><strong>Procurement:</strong> Material spend (steel vs concrete), purchase orders, vendor master, contract expirations.</div>
          <div class="schema-table-card"><strong>Sales:</strong> Executed purchase agreements, unit allocations, milestone payment schedules, buyer accounts.</div>
          <div class="schema-table-card"><strong>Property Management:</strong> Commercial occupancy, Grade-A office vs retail renewal LOIs, WALE.</div>
          <div class="schema-table-card"><strong>Projects:</strong> Capex budgets, master development schedules, zoning parcel boundaries.</div>
        </div>
      `;
    } else if (tab === 'scope') {
      helpTabContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
          <p><strong>Architecture Boundaries &amp; Known Limitations:</strong></p>
          <div class="schema-table-card">
            <strong>Read-Only Guarantee:</strong> Aria cannot modify, insert, or delete enterprise data. All SQL runs on read-only replicas.
          </div>
          <div class="schema-table-card">
            <strong>Catalog Boundaries:</strong> Indexed operational data spans FY2023–FY2026. Pre-2023 payroll and internal corporate HR records (stored in Workday) are out-of-scope.
          </div>
          <div class="schema-table-card">
            <strong>Ungrounded Forecasting:</strong> External macroeconomic forecasts (e.g. 2030 mortgage interest rates) are unsupported to prevent hallucination.
          </div>
          <div class="schema-table-card">
            <strong>Role Masking:</strong> Sensitive columns (personal phone, tax ID, contractor profit margins) are masked per RBAC rules.
          </div>
        </div>
      `;
    } else if (tab === 'shortcuts') {
      helpTabContent.innerHTML = `
        <table class="result-data-table" style="font-size: 12.5px;">
          <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td><kbd>Enter</kbd></td><td>Send prompt / question</td></tr>
            <tr><td><kbd>Shift + Enter</kbd></td><td>Insert newline in input</td></tr>
            <tr><td><kbd>/</kbd></td><td>Focus natural-language question input</td></tr>
            <tr><td><kbd>Ctrl + K</kbd> / <kbd>Cmd + K</kbd></td><td>Focus conversation history search box</td></tr>
            <tr><td><kbd>Esc</kbd></td><td>Close any active modal or drawer</td></tr>
          </tbody>
        </table>
      `;
    }
  }

  function closeAllModalsAndDrawers() {
    dataExplorerDrawer.classList.remove('open');
    savedAnswersDrawer.classList.remove('open');
    settingsDrawer.classList.remove('open');
    helpModalBackdrop.classList.remove('open');
    feedbackModalBackdrop.classList.remove('open');
    sourceTableModalBackdrop.classList.remove('open');
    userMenuDropdownEl.classList.remove('open');
    closeTypeahead();
  }

  // =========================================================================
  // 16. THEME, TOASTS & UTILITIES
  // =========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('aria_theme') || 'light';
    setTheme(savedTheme);

    if (themeToggleBtnEl) {
      themeToggleBtnEl.addEventListener('click', () => {
        const next = state.settings.theme === 'light' ? 'dark' : 'light';
        setTheme(next);
      });
    }
  }

  function setTheme(t) {
    state.settings.theme = t;
    if (t === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
    localStorage.setItem('aria_theme', t);
    updateThemeIcon();
  }

  function updateThemeIcon() {
    if (!themeToggleBtnEl) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggleBtnEl.innerHTML = isDark
      ? `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }

  function showToast(message, type = 'info') {
    if (!toastContainerEl) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toastContainerEl.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function updateSendButtonState() {
    const hasText = chatInputEl.value.trim().length > 0;
    sendBtnEl.disabled = !hasText || state.isThinking;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (chatMessagesEl) chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMarkdownBold(text) {
    if (!text) return '';
    const escaped = escapeHtml(text);
    return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // =========================================================================
  // 17. ATTACH ALL UI BUTTON LISTENERS (DOM READY)
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initUserIdentity();
    initInputHelpers();
    initSettingsAndHelp();

    // Chat Input Keys & Send
    chatInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
    sendBtnEl.addEventListener('click', handleSendMessage);

    // New Chat Button
    newChatBtnEl.addEventListener('click', () => {
      createNewConversation('New Conversation');
      showToast('Started new conversation');
    });

    // History Search
    historySearchInputEl.addEventListener('input', () => {
      state.searchQuery = historySearchInputEl.value;
      renderSidebarConversations();
    });

    // Clear All History
    clearAllHistoryBtnEl.addEventListener('click', () => {
      if (confirm('Clear all conversation history for your current profile?')) {
        state.conversations = [];
        state.activeConversationId = null;
        saveConversationsToStorage();
        renderSidebarConversations();
        renderActiveConversation();
        showToast('All conversation history cleared');
      }
    });

    // Mobile Hamburger / Desktop Collapse
    mobileMenuBtnEl.addEventListener('click', () => {
      if (window.innerWidth <= 820) {
        sidebarEl.classList.toggle('open');
      } else {
        sidebarEl.classList.toggle('collapsed');
      }
    });

    // User Profile Dropdown Toggle
    userMenuBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuDropdownEl.classList.toggle('open');
    });
    document.addEventListener('click', () => {
      userMenuDropdownEl.classList.remove('open');
    });

    switchUserMenuItemEl.addEventListener('click', () => {
      userMenuDropdownEl.classList.remove('open');
      showFirstAccessModal();
    });

    resetDemoDataMenuItemEl.addEventListener('click', () => {
      if (confirm('Reset all demo data and start fresh?')) {
        localStorage.clear();
        location.reload();
      }
    });

    saveProfileBtn.addEventListener('click', saveUserProfile);

    // Drawers Open / Close
    navDataExplorerBtn.addEventListener('click', () => {
      dataExplorerDrawer.classList.add('open');
      renderDataExplorer();
    });
    closeExplorerBtn.addEventListener('click', () => dataExplorerDrawer.classList.remove('open'));

    tabTablesBtn.addEventListener('click', () => {
      explorerActiveTab = 'tables';
      tabTablesBtn.classList.add('active');
      tabGlossaryBtn.classList.remove('active');
      renderDataExplorer();
    });
    tabGlossaryBtn.addEventListener('click', () => {
      explorerActiveTab = 'glossary';
      tabGlossaryBtn.classList.add('active');
      tabTablesBtn.classList.remove('active');
      renderDataExplorer();
    });
    explorerSearchInput.addEventListener('input', renderDataExplorer);

    savedAnswersBtn.addEventListener('click', () => {
      savedAnswersDrawer.classList.add('open');
      renderSavedAnswers();
    });
    closeSavedAnswersBtn.addEventListener('click', () => savedAnswersDrawer.classList.remove('open'));

    settingsBtn.addEventListener('click', () => settingsDrawer.classList.add('open'));
    closeSettingsBtn.addEventListener('click', () => settingsDrawer.classList.remove('open'));

    helpModalBtn.addEventListener('click', () => helpModalBackdrop.classList.add('open'));
    closeHelpModalBtn.addEventListener('click', () => helpModalBackdrop.classList.remove('open'));

    // Feedback Modal Submission
    closeFeedbackModalBtn.addEventListener('click', () => feedbackModalBackdrop.classList.remove('open'));
    cancelFeedbackBtn.addEventListener('click', () => feedbackModalBackdrop.classList.remove('open'));

    let selectedReason = 'Wrong table';
    feedbackReasonChips.querySelectorAll('.reason-chip-btn').forEach((chip) => {
      chip.addEventListener('click', () => {
        feedbackReasonChips.querySelectorAll('.reason-chip-btn').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedReason = chip.textContent.trim();
      });
    });

    submitFeedbackBtn.addEventListener('click', () => {
      const comment = feedbackCommentInput.value.trim();
      const conv = getActiveConversation();
      window.AriaMock.recordFeedback('down', selectedReason, comment, conv ? conv.title : '', state.currentUser);
      feedbackModalBackdrop.classList.remove('open');
      feedbackCommentInput.value = '';
      showToast('Thank you! Feedback recorded for model review.');
    });

    closeSourceTableModalBtn.addEventListener('click', () => sourceTableModalBackdrop.classList.remove('open'));
  });
})();
