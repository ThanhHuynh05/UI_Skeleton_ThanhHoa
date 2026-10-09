/**
 * Aria - Enterprise NL Query Assistant
 * app.js - Main Application Orchestrator & State Controller
 *
 * Implements:
 * 1. Conversation History (Multi-turn conversations, pinned, grouped, search, export)
 * 2. Role-Based Identity & "Who is Using" blocking modal
 * 3. Answer Tools (Table/Chart toggle, SVG bar/line/pie, CSV download, print, SQL explanation)
 * 4. Input Helpers (Typeahead, multi-domain search scope, Voice STT, Time range)
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
    selectedScope: {
      domain: { mode: 'auto', value: 'Auto', values: [] },
      time: { mode: 'auto', preset: 'auto', start: null, end: null }
    },
    currentFeedbackMessageId: null,
    currentFeedbackReason: 'Wrong number',
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
  const openHistorySearchBtnEl = document.getElementById('openHistorySearchBtn');
  const historySearchModalBackdrop = document.getElementById('historySearchModalBackdrop');
  const closeHistorySearchBtnEl = document.getElementById('closeHistorySearchBtn');
  const historySearchDialogInputEl = document.getElementById('historySearchDialogInput');
  const historySearchResultsEl = document.getElementById('historySearchResults');
  const historySearchStatusEl = document.getElementById('historySearchStatus');
  const newChatBtnEl = document.getElementById('newChatBtn');
  const clearAllHistoryBtnEl = document.getElementById('clearAllHistoryBtn');
  const themeToggleBtnEl = document.getElementById('themeToggleBtn');
  const mobileMenuBtnEl = document.getElementById('mobileMenuBtn');
  const sidebarEl = document.getElementById('sidebar');
  const sidebarMobileBackdropEl = document.getElementById('sidebarMobileBackdrop');
  const closeMobileSidebarBtnEl = document.getElementById('closeMobileSidebarBtn');
  const userMenuBtnEl = document.getElementById('userMenuBtn');
  const userMenuDropdownEl = document.getElementById('userMenuDropdown');
  const headerUserLabelEl = document.getElementById('headerUserLabel');
  const switchUserMenuItemEl = document.getElementById('switchUserMenuItem');
  const resetDemoDataMenuItemEl = document.getElementById('resetDemoDataMenuItem');
  const toastContainerEl = document.getElementById('toastContainer');
  const appStatusLiveEl = document.getElementById('appStatusLive');
  const appAlertLiveEl = document.getElementById('appAlertLive');

  // Workspace Rail Navigation (Requirement A)
  const railAskBtn = document.getElementById('railAskBtn');
  const railDataGuideBtn = document.getElementById('railDataGuideBtn');
  const toggleRecentConvsBtn = document.getElementById('toggleRecentConvsBtn');
  const sidebarConvCollapsible = document.getElementById('sidebarConvCollapsible');

  // Scope & Sources Contextual Inspector (Requirement B)
  const scopeInspectorPanel = document.getElementById('scopeInspectorPanel');
  const closeScopeInspectorBtn = document.getElementById('closeScopeInspectorBtn');
  const scopeInspectorBody = document.getElementById('scopeInspectorBody');
  const scopeInspectorBackdrop = document.getElementById('scopeInspectorBackdrop');

  // Modals & Drawers
  const userProfileModalBackdrop = document.getElementById('userProfileModalBackdrop');
  const profileNameInput = document.getElementById('profileNameInput');
  const roleCardsGrid = document.getElementById('roleCardsGrid');
  const saveProfileBtn = document.getElementById('saveProfileBtn');

  const dataExplorerDrawer = document.getElementById('dataExplorerDrawer');
  const navDataExplorerBtn = document.getElementById('navDataExplorerBtn');
  const closeExplorerBtn = document.getElementById('closeExplorerBtn');
  const tabTablesBtn = document.getElementById('tabTablesBtn');
  const tabCapabilitiesBtn = document.getElementById('tabCapabilitiesBtn');
  const tabGlossaryBtn = document.getElementById('tabGlossaryBtn');
  const explorerTabContent = document.getElementById('explorerTabContent');
  const explorerSearchInput = document.getElementById('explorerSearchInput');

    const savedAnswersBtn = document.getElementById('savedAnswersBtn');

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
  const clarificationModalBackdrop = document.getElementById('clarificationModalBackdrop');
  const closeClarificationModalBtn = document.getElementById('closeClarificationModalBtn');
  const clarificationModalTitleEl = document.getElementById('clarificationModalTitle');
  const cancelClarificationBtn = document.getElementById('cancelClarificationBtn');
  const confirmClarificationBtn = document.getElementById('confirmClarificationBtn');
  const clarificationQuestionEl = document.getElementById('clarificationQuestion');
  const clarificationReasonEl = document.getElementById('clarificationModalReason');
  const clarificationOriginalQuestionEl = document.getElementById('clarificationOriginalQuestion');
  const clarificationOriginalQuestionTextEl = document.getElementById('clarificationOriginalQuestionText');
  const clarificationOptionsEl = document.getElementById('clarificationOptions');
  const clarificationUnderstoodEl = document.getElementById('clarificationUnderstood');
  const clearHistoryModalBackdrop = document.getElementById('clearHistoryModalBackdrop');
  const closeClearHistoryModalBtn = document.getElementById('closeClearHistoryModalBtn');
  const cancelClearHistoryBtn = document.getElementById('cancelClearHistoryBtn');
  const confirmClearHistoryBtn = document.getElementById('confirmClearHistoryBtn');
  const clearHistoryConversationCount = document.getElementById('clearHistoryConversationCount');
  let clearHistoryTrigger = null;
  const csvExportModalBackdrop = document.getElementById('csvExportModalBackdrop');
  const closeCsvExportModalBtn = document.getElementById('closeCsvExportModalBtn');
  const cancelCsvExportBtn = document.getElementById('cancelCsvExportBtn');
  const confirmCsvExportBtn = document.getElementById('confirmCsvExportBtn');
  const csvExportAllLabel = document.getElementById('csvExportAllLabel');
  const csvExportFilteredOption = document.getElementById('csvExportFilteredOption');
  const csvExportFilteredLabel = document.getElementById('csvExportFilteredLabel');
  const csvExportFilterDescription = document.getElementById('csvExportFilterDescription');
  const csvExportContextPreview = document.getElementById('csvExportContextPreview');
  let pendingCsvExport = null;

  let activeClarificationMessageId = null;
  let activeClarificationTrigger = null;

  const domainScopeSelectEl = document.getElementById('domainScopeSelect');
  const domainScopeSelectLabelEl = document.getElementById('domainScopeSelectLabel');
  const domainScopeMenuEl = document.getElementById('domainScopeMenu');
  const domainScopeImpactEl = document.getElementById('domainScopeImpact');
  const resetDomainScopeBtnEl = document.getElementById('resetDomainScopeBtn');
  const timeRangeSelectEl = document.getElementById('timeRangeSelect');
  const scopeEditorBarEl = document.getElementById('scopeEditorBar');
  const customDateRangeBarEl = document.getElementById('customDateRangeBar');
  const customStartDateEl = document.getElementById('customStartDate');
  const customEndDateEl = document.getElementById('customEndDate');
  const customDateValidationMsgEl = document.getElementById('customDateValidationMsg');
  const applyCustomDateBtnEl = document.getElementById('applyCustomDateBtn');

  // R2-09 Edit Interpretation Modal Elements
  const editInterpretationModalBackdrop = document.getElementById('editInterpretationModalBackdrop');
  const closeEditInterpretationModalBtn = document.getElementById('closeEditInterpretationModalBtn');
  const btnCancelEditInterpretation = document.getElementById('btnCancelEditInterpretation');
  const btnApplyEditInterpretation = document.getElementById('btnApplyEditInterpretation');
  const editInterpSourceMsgId = document.getElementById('editInterpSourceMsgId');
  const editInterpMetric = document.getElementById('editInterpMetric');
  const editInterpBreakdown = document.getElementById('editInterpBreakdown');
  const editInterpDomain = document.getElementById('editInterpDomain');
  const editInterpProjects = document.getElementById('editInterpProjects');
  const editInterpPeriod = document.getElementById('editInterpPeriod');
  const editInterpCustomDateRow = document.getElementById('editInterpCustomDateRow');
  const editInterpStartDate = document.getElementById('editInterpStartDate');
  const editInterpEndDate = document.getElementById('editInterpEndDate');
  const editInterpCurrency = document.getElementById('editInterpCurrency');
  const editInterpAssumptionsList = document.getElementById('editInterpAssumptionsList');
  const editInterpDynamicHint = document.getElementById('editInterpDynamicHint');

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
        <button type="button" class="role-select-card ${isSelected ? 'selected' : ''}" data-role-key="${key}" aria-pressed="${isSelected ? 'true' : 'false'}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="role-card-title">${escapeHtml(r.title)}</div>
            <span class="brand-badge" style="font-size: 12px;">${escapeHtml(r.category)}</span>
          </div>
          <div class="role-card-desc">${escapeHtml(r.description)}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
            Allowed: ${r.allowedDomains.join(', ')}
          </div>
        </button>
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
        const selectedCard = roleCardsGrid.querySelector(`[data-role-key="${selectedRoleKey}"]`);
        if (selectedCard) selectedCard.focus();
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
    showToast(`Demo persona changed to ${userObj.name}`);
    announceAppStatus(`Onboarding complete. ${userObj.name} is using the ${roleDef.title} demo persona. Ask a business question.`);
    requestAnimationFrame(() => chatInputEl.focus());
  }

  function updateUserBadge() {
    if (!state.currentUser) return;
    headerUserLabelEl.innerHTML = `Demo persona: <strong>${escapeHtml(state.currentUser.name)}</strong>`;
    const menuPersonaName = document.getElementById('userMenuPersonaName');
    const menuPersonaRole = document.getElementById('userMenuPersonaRole');
    if (menuPersonaName) menuPersonaName.textContent = state.currentUser.name;
    if (menuPersonaRole) menuPersonaRole.textContent = state.currentUser.roleTitle || state.currentUser.role || 'Demo user';
    if (userMenuBtnEl) {
      userMenuBtnEl.setAttribute('aria-label', `Current demo persona: ${state.currentUser.name}, ${state.currentUser.roleTitle || state.currentUser.role || 'Demo user'}. Open user menu`);
    }
    const adminNav = document.getElementById('adminWorkspaceNav');
    if (adminNav) {
      adminNav.style.display = state.currentUser.role === 'data_admin' ? 'block' : 'none';
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

  function conversationSearchText(conversation) {
    const messageText = (conversation.messages || []).map((message) => [
      message.text,
      message.originalQuery,
      message.question,
      message.message,
      message.resultsData && message.resultsData.answer
    ].filter(Boolean).join(' ')).join(' ');
    return `${conversation.title || ''} ${messageText}`.toLowerCase();
  }

  function conversationSearchSnippet(conversation, query) {
    const candidates = (conversation.messages || []).flatMap((message) => [
      message.text,
      message.originalQuery,
      message.resultsData && message.resultsData.answer,
      message.message
    ]).filter(Boolean).map(String);
    const match = candidates.find((text) => text.toLowerCase().includes(query)) || candidates[0] || 'No messages in this conversation yet.';
    const normalized = match.replace(/\s+/g, ' ').trim();
    return normalized.length > 140 ? `${normalized.slice(0, 137)}…` : normalized;
  }

  function openConversationFromSearch(conversationId) {
    const conversation = state.conversations.find((item) => item.id === conversationId);
    if (!conversation) return;
    state.activeConversationId = conversationId;
    saveConversationsToStorage();
    historySearchModalBackdrop.classList.remove('open');
    renderSidebarConversations();
    renderActiveConversation();
    showBusinessWorkspaceView('ask', { focusComposer: false });
    if (window.innerWidth <= 820) {
      sidebarEl.classList.remove('open');
      mobileMenuBtnEl.focus();
    }
    announceAppStatus(`Opened conversation: ${conversation.title}.`);
  }

  function renderConversationSearchResults() {
    if (!historySearchResultsEl || !historySearchStatusEl) return;
    const query = historySearchDialogInputEl.value.trim().toLowerCase();
    const results = [...state.conversations]
      .filter((conversation) => !query || conversationSearchText(conversation).includes(query))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    historySearchStatusEl.textContent = query
      ? `${results.length} matching ${results.length === 1 ? 'conversation' : 'conversations'}`
      : `${results.length} recent ${results.length === 1 ? 'conversation' : 'conversations'}`;

    if (!results.length) {
      historySearchResultsEl.innerHTML = `<div class="history-search-empty">${query
        ? `No conversations match “${escapeHtml(historySearchDialogInputEl.value.trim())}”. Try another title or message phrase.`
        : 'No conversations yet. Start a new chat to build your history.'}</div>`;
      return;
    }

    historySearchResultsEl.innerHTML = results.map((conversation) => `
      <button type="button" class="history-search-result" data-conversation-id="${escapeHtml(conversation.id)}">
        <span class="history-search-result-title">${escapeHtml(conversation.title || 'Untitled conversation')}</span>
        <span class="history-search-result-snippet">${escapeHtml(conversationSearchSnippet(conversation, query))}</span>
        <span class="history-search-result-meta">${new Date(conversation.updatedAt || conversation.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
      </button>
    `).join('');

    historySearchResultsEl.querySelectorAll('.history-search-result').forEach((result) => {
      result.addEventListener('click', () => openConversationFromSearch(result.getAttribute('data-conversation-id')));
    });
  }

  function openConversationSearch() {
    if (!historySearchModalBackdrop) return;
    const otherOpenModal = document.querySelector('.modal-backdrop.open:not(#historySearchModalBackdrop)');
    if (otherOpenModal) return;
    historySearchDialogInputEl.value = '';
    renderConversationSearchResults();
    if (window.innerWidth <= 820) sidebarEl.classList.remove('open');
    historySearchModalBackdrop.classList.add('open');
    requestAnimationFrame(() => historySearchDialogInputEl.focus());
  }

  function closeConversationSearch() {
    historySearchModalBackdrop.classList.remove('open');
  }

  // =========================================================================
  // 3. SIDEBAR GROUPING & RENDERING (Pinned, Today, Yesterday, Earlier)
  // =========================================================================
  function renderSidebarConversations() {
    if (!sidebarConversationsListEl) return;

    const convs = [...state.conversations];

    if (convs.length === 0) {
      sidebarConversationsListEl.innerHTML = `
        <div style="padding: 16px 8px; text-align: center; color: var(--text-muted); font-size: 12px;">
          No conversations yet.<br>Click "New Chat" to begin.
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
        if (typeof updateRailActiveState === 'function') showBusinessWorkspaceView('ask', { focusComposer: false });
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

  function openEvidenceDesk(msg) {
    const res = msg.resultsData || {};
    const scope = msg.appliedScope || res.appliedScope || {};
    
    const evidenceDesk = document.getElementById('scopeInspectorPanel');
    const body = document.getElementById('scopeInspectorBody');
    if (!evidenceDesk || !body) return;
    
    // We will render three separate divs for the tab contents
    
    // Understanding tab uses the same complete Applied Scope component as the result card.
    let understandingHtml = '<div id="evidence-tab-understanding" class="evidence-tab-content">';
    understandingHtml += '<h3 style="font-family: var(--font-serif); font-size: 20px; margin-bottom: 16px;">Applied Scope</h3>';
    understandingHtml += '<div style="margin-bottom: 24px; color: var(--text-secondary); font-size: 14px; line-height: 1.6;">';
    understandingHtml += generateAppliedScopeHtml(scope);
    understandingHtml += '</div></div>';

    // Evidence tab
    let evidenceHtml = '<div id="evidence-tab-evidence" class="evidence-tab-content" style="display: none;">';
    evidenceHtml += '<h3 style="font-family: var(--font-serif); font-size: 20px; margin-bottom: 16px;">Sources &amp; Definitions</h3>';
    evidenceHtml += '<div style="margin-bottom: 24px; color: var(--text-secondary); font-size: 14px; line-height: 1.6;">';
    const sources = res.sources || [];
    const sourceHtml = sources.length > 0
      ? sources.map((source) => {
          const definition = getBusinessSourceDefinition(source.name);
          return `<article class="business-source-card">
            <button type="button" class="business-source-title evidence-source-btn" data-table-name="${escapeHtml(source.name)}">${escapeHtml(definition.label)}</button>
            <p>${escapeHtml(definition.definition)}</p>
            <dl class="source-definition-grid">
              <div><dt>Owner</dt><dd>${escapeHtml(definition.owner)}</dd></div>
              <div><dt>Domain</dt><dd>${escapeHtml(definition.domain)}</dd></div>
              <div><dt>Grain</dt><dd>${escapeHtml(definition.grain)}</dd></div>
              <div><dt>Refresh</dt><dd>${escapeHtml(definition.cadence)}</dd></div>
              <div class="source-definition-wide"><dt>Metric calculation</dt><dd>${escapeHtml(definition.calculation)}</dd></div>
              <div class="source-definition-wide"><dt>Exclusions</dt><dd>${escapeHtml(definition.exclusions)}</dd></div>
            </dl>
          </article>`;
        }).join('')
      : '<p>Enterprise business records. A more specific source definition is not available for this result.</p>';
    evidenceHtml += '<div class="evidence-business-summary"><span>Data freshness</span><strong>' + escapeHtml(res.dataAsOf || 'Not provided') + '</strong></div>';
    evidenceHtml += '<div class="evidence-source-list">' + sourceHtml + '</div>';
    evidenceHtml += '</div></div>';

    // Technical tab
    let technicalHtml = '<div id="evidence-tab-technical" class="evidence-tab-content" style="display: none;">';
    technicalHtml += '<h3 style="font-family: var(--font-serif); font-size: 20px; margin-bottom: 16px;">Technical Trace</h3>';
    technicalHtml += '<div style="margin-bottom: 24px; color: var(--text-secondary); font-size: 14px; line-height: 1.6;">';
    const generatedSql = res.sql || res.queryGenerated || '';
    technicalHtml += '<p><strong>Execution details:</strong> ' + escapeHtml(res.summary || 'Completed successfully') + '</p>';
    technicalHtml += '<p><strong>Validation:</strong> Role authorization passed. AST check completed with no destructive operations detected.</p>';
    if (sources.length > 0) {
      technicalHtml += '<h4 style="margin-top: 16px; margin-bottom: 8px;">Physical schema</h4>';
      technicalHtml += sources.map((source) => {
        const physicalName = String(source.name || '').replace('enterprise_dw.', '');
        const tableDef = (window.AriaMock.SCHEMA_CATALOG || []).find(table => table.name === physicalName);
        return `<details class="technical-source-details">
          <summary><code>${escapeHtml(physicalName)}</code></summary>
          <p>${escapeHtml(tableDef ? tableDef.description : 'Physical source used by the generated query.')}</p>
          ${tableDef && Array.isArray(tableDef.columns) ? `<div class="technical-column-list">${tableDef.columns.map(column => `<code>${escapeHtml(column.name)}</code>`).join(' ')}</div>` : ''}
        </details>`;
      }).join('');
    }
    if (generatedSql) {
       technicalHtml += '<h4 style="margin-top: 16px; margin-bottom: 8px;">Generated SQL</h4>';
       technicalHtml += '<pre class="sql-code-block" style="margin-top: 8px;"><code>' + escapeHtml(generatedSql) + '</code></pre>';
       technicalHtml += '<button type="button" class="action-tool-btn evidence-copy-sql-btn" style="margin-top: 10px;">Copy SQL</button>';
    }
    technicalHtml += '</div></div>';
    
    body.innerHTML = understandingHtml + evidenceHtml + technicalHtml;

    body.querySelectorAll('.evidence-source-btn').forEach((button) => {
      button.addEventListener('click', () => openSourceTableModal(button.getAttribute('data-table-name')));
    });

    const copySqlButton = body.querySelector('.evidence-copy-sql-btn');
    if (copySqlButton) {
      copySqlButton.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedSql);
        showToast('SQL query copied');
      });
    }

    body.querySelectorAll('.btn-edit-interpretation').forEach((editInterpretationButton) => {
      editInterpretationButton.addEventListener('click', () => {
        const conv = getActiveConversation();
        if (!conv) return;
        const sourceMsgId = editInterpretationButton.getAttribute('data-msg-id') || msg.id;
        closeScopeInspector(false);
        openEditInterpretationModal(conv, sourceMsgId);
      });
    });
    
    // Reset tabs
    const tabs = evidenceDesk.querySelectorAll('.drawer-tab');
    tabs.forEach((t, i) => {
      t.classList.toggle('active', i === 0);
      t.style.borderBottom = i === 0 ? '2px solid var(--accent-primary)' : 'none';
      t.style.color = i === 0 ? 'var(--accent-primary)' : 'inherit';
      
      // Remove old event listeners by replacing the node
      const newTab = t.cloneNode(true);
      t.parentNode.replaceChild(newTab, t);
      
      newTab.addEventListener('click', () => {
        // Deactivate all
        evidenceDesk.querySelectorAll('.drawer-tab').forEach(nt => {
          nt.classList.remove('active');
          nt.style.borderBottom = 'none';
          nt.style.color = 'inherit';
        });
        evidenceDesk.querySelectorAll('.evidence-tab-content').forEach(c => c.style.display = 'none');
        
        // Activate this
        newTab.classList.add('active');
        newTab.style.borderBottom = '2px solid var(--accent-primary)';
        newTab.style.color = 'var(--accent-primary)';
        
        const contentId = ['evidence-tab-understanding', 'evidence-tab-evidence', 'evidence-tab-technical'][i];
        document.getElementById(contentId).style.display = 'block';
      });
    });
    
    activeScopeInspectorTriggerBtn = document.activeElement;
    evidenceDesk.inert = false;
    evidenceDesk.classList.add('open');
    evidenceDesk.setAttribute('aria-hidden', 'false');
    if (scopeInspectorBackdrop) scopeInspectorBackdrop.classList.add('open');
    requestAnimationFrame(() => closeScopeInspectorBtn && closeScopeInspectorBtn.focus());
  }

    chatContainerEl.querySelectorAll('.btn-open-evidence').forEach((button) => {
      button.addEventListener('click', () => {
        const msg = conv.messages.find((item) => item.id === button.getAttribute('data-msg-id'));
        if (msg) openEvidenceDesk(msg);
      });
    });

    // Attach dynamic handlers
    attachConversationEventHandlers(conv);
    const pendingClarification = conv.messages.find((message) => message.type === 'clarification' && !message.resolvedAt && !message.resolvedPayload && !message.clarificationDismissedAt);
    if (pendingClarification && clarificationModalBackdrop && !clarificationModalBackdrop.classList.contains('open')) {
      requestAnimationFrame(() => openClarificationModal(pendingClarification.id, chatContainerEl.querySelector(`[data-msg-id="${pendingClarification.id}"]`)));
    }
    scrollToBottom();
  }

  function renderUserMessageHtml(msg, isLastUserTurn) {
    const rerunScope = msg.scopeEditSummary;
    return `
      <div class="chat-row user-row" id="msg_row_${msg.id}">
        <div class="user-bubble-container">
          <div class="conversation-turn-label question-turn-label">${msg.isScopeRerun ? 'Re-run with edited scope' : 'Your question'}</div>
          <div class="user-bubble">${escapeHtml(msg.text)}</div>
          ${rerunScope ? `
            <div class="user-scope-rerun-summary" aria-label="Edited scope applied to this re-run">
              <strong>Updated applied scope</strong>
              <span>${escapeHtml(rerunScope)}</span>
            </div>
          ` : ''}
          <div class="user-bubble-meta">
            <span>${msg.time || ''}</span>
            ${isLastUserTurn ? `<span class="user-edit-btn" data-msg-id="${msg.id}" data-text="${escapeHtml(msg.text)}">Edit</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function getInterpSourceClass(src) {
    if (!src) return 'source-inferred';
    const s = src.toLowerCase();
    if (s.includes('edited') || s.includes('confirmed')) return 'source-confirmed';
    if (s.includes('selected') || s.includes('preset')) return 'source-selected';
    if (s.includes('default') || s.includes('standard')) return 'source-standard';
    return 'source-inferred';
  }

  function generateInterpretationHtml(scope, msg) {
    if (!scope) return '';

    const metricLabel = (scope.metric && scope.metric.label) ? scope.metric.label : 'Enterprise Records';
    const metricSource = (scope.metric && scope.metric.source) ? scope.metric.source : 'Inferred from question';

    const grain = scope.grain || scope.breakdown;
    const grainLabel = (grain && grain.label) ? grain.label : 'Standard business grain';
    const grainSource = (grain && grain.source) ? grain.source : 'Inferred from question';

    const domainLabel = (scope.domain && (scope.domain.label || scope.domain.value)) ? (scope.domain.label || scope.domain.value) : (scope.domain || 'All Domains');
    const domainSource = (scope.domain && scope.domain.source) ? scope.domain.source : ((scope.source && scope.source.domain) ? scope.source.domain : 'Inferred from question');
    const domainValues = scope.domain && Array.isArray(scope.domain.values) && scope.domain.values.length > 0
      ? scope.domain.values
      : [domainLabel];
    const hasDomainLimits = scope.domain && Array.isArray(scope.domain.values) && scope.domain.values.length > 0 && domainSource.toLowerCase().includes('limited');

    const projectLabel = (scope.projectScope && scope.projectScope.label) ? scope.projectScope.label : 'All enterprise projects';
    const projectSource = (scope.projectScope && scope.projectScope.source) ? scope.projectScope.source : 'All active portfolios';

    const timeLabel = (scope.time && scope.time.label) ? scope.time.label : (scope.periodLabel || 'No time restriction');
    const timeRange = (scope.time && scope.time.dateRange) ? scope.time.dateRange : scope.dateRange;
    const timeSource = (scope.time && scope.time.source) ? scope.time.source : ((scope.source && scope.source.time) ? scope.source.time : 'No time restriction');

    const currencyLabel = scope.currency || ((scope.metric && scope.metric.unit) ? scope.metric.unit : 'USD millions');
    const assumptions = scope.assumptions || [];
    const calendarBasis = scope.calendarBasis || 'Calendar';
    const msgId = msg ? msg.id : '';
    const isSuperseded = msg && msg.isSuperseded;

    return `
      <div class="interpretation-card ${isSuperseded ? 'card-superseded' : ''}">
        <div class="interpretation-header">
          <div class="interpretation-title-group">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span class="interpretation-card-title">Applied scope</span>
          </div>
          <div class="interpretation-header-actions">
            <span class="interpretation-basis">Basis: <strong>${escapeHtml(calendarBasis)}</strong></span>
            ${isSuperseded
              ? `<span class="superseded-badge-pill" title="This interpretation was updated in a later response">Superseded</span>`
              : `<button type="button" class="btn-edit-interpretation" data-msg-id="${msgId}" title="Edit interpretation parameters">
                  <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  <span>Edit interpretation</span>
                </button>`
            }
          </div>
        </div>

        <div class="interpretation-grid">
          <div class="interpretation-item">
            <span class="interpretation-item-label">Metric</span>
            <span class="interpretation-item-val">${escapeHtml(metricLabel)}</span>
            <span class="scope-source-tag ${getInterpSourceClass(metricSource)}">${escapeHtml(metricSource)}</span>
          </div>

          <div class="interpretation-item">
            <span class="interpretation-item-label">Grain</span>
            <span class="interpretation-item-val">${escapeHtml(grainLabel)}</span>
            <span class="scope-source-tag ${getInterpSourceClass(grainSource)}">${escapeHtml(grainSource)}</span>
          </div>

          <div class="interpretation-item">
            <span class="interpretation-item-label">${hasDomainLimits ? 'Search domains' : 'Business area'}</span>
            <span class="applied-domain-chips">${domainValues.map(domain => `<span class="applied-domain-chip">${escapeHtml(domain)}</span>`).join('')}</span>
            <span class="scope-source-tag ${getInterpSourceClass(domainSource)}">${escapeHtml(domainSource)}</span>
            ${hasDomainLimits ? '<span class="domain-access-note">Search boundary only · access policies are evaluated separately</span>' : ''}
          </div>

          <div class="interpretation-item">
            <span class="interpretation-item-label">Project scope</span>
            <span class="interpretation-item-val">${escapeHtml(projectLabel)}</span>
            <span class="scope-source-tag ${getInterpSourceClass(projectSource)}">${escapeHtml(projectSource)}</span>
          </div>

          <div class="interpretation-item">
            <span class="interpretation-item-label">Period &amp; dates</span>
            <span class="interpretation-item-val">${escapeHtml(timeLabel)}${timeRange && !timeLabel.includes(timeRange) ? ` · <small class="interpretation-dates">(${escapeHtml(timeRange)})</small>` : ''}</span>
            <span class="scope-source-tag ${getInterpSourceClass(timeSource)}">${escapeHtml(timeSource)}</span>
          </div>

          <div class="interpretation-item">
            <span class="interpretation-item-label">Currency / Unit</span>
            <span class="interpretation-item-val">${escapeHtml(currencyLabel)}</span>
            <span class="scope-source-tag ${getInterpSourceClass(scope.currencyObj && scope.currencyObj.source)}">${escapeHtml((scope.currencyObj && scope.currencyObj.source) || 'System standard')}</span>
          </div>
        </div>

        <div class="interpretation-assumptions-block">
            <div class="interpretation-assumptions-title">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Assumptions:</span>
            </div>
            ${assumptions.length > 0
              ? `<ul class="interpretation-assumptions-list">${assumptions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
              : '<div class="interpretation-assumptions-empty">No additional assumptions applied.</div>'}
        </div>
      </div>
    `;
  }

  function generateAppliedScopeHtml(scope) {
    return generateInterpretationHtml(scope, null);
  }

  const RESULT_PATTERN_META = {
    kpi: { label: 'KPI summary', description: 'Key measure and reporting period' },
    ranking: { label: 'Ranking', description: 'Highest-impact items first' },
    trend: { label: 'Trend', description: 'Progress and movement at a glance' },
    record_list: { label: 'Record list', description: 'Actionable records matching the request' },
    entity_detail: { label: 'Entity detail', description: 'Focused facts for one business entity' },
    comparison: { label: 'Comparison', description: 'Side-by-side business performance' }
  };

  function inferResultPattern(res = {}) {
    if (res.resultPattern && RESULT_PATTERN_META[res.resultPattern]) return res.resultPattern;
    const title = ((res.table && res.table.title) || '').toLowerCase();
    const metricKey = res.appliedScope && res.appliedScope.metric ? res.appliedScope.metric.key : '';
    const breakdownKey = res.appliedScope && res.appliedScope.breakdown ? res.appliedScope.breakdown.key : '';

    if (title.includes('delay penalty') || (res.table && res.table.rows && res.table.rows.length === 1)) return 'entity_detail';
    if (title.includes('construction progress') || title.includes('milestone variance')) return 'trend';
    if (title.includes('concrete vs steel') || title.includes('asset class') || title.includes('aging risk bucket')) return 'comparison';
    if (title.includes('ranked') || title.includes('top 5') || title.includes('by region')) return 'ranking';
    if (title.includes('expiring') || title.includes('pending executive') || title.includes('buyer contract') || title.includes('receivables by buyer')) return 'record_list';
    if (title.includes('portfolio overview') || metricKey === 'contract_value' || metricKey === 'contract_count' || breakdownKey === 'portfolio_total') return 'kpi';
    return res.chart ? 'comparison' : 'record_list';
  }

  function getResultState(res = {}) {
    const answer = (res.answer || '').toLowerCase();
    if (res.resultState === 'partial' || res.isPartial) return 'partial';
    if (answer.startsWith('combination not supported') || res.resultState === 'unsupported') return 'unsupported';
    if (res.resultState === 'no_data' || (res.table && Array.isArray(res.table.rows) && res.table.rows.length === 0)) return 'no_data';
    return null;
  }

  function getDefaultResultView(pattern, res = {}) {
    return getResultVisualDecision(pattern, res).kind === 'table' ? 'table' : 'chart';
  }

  function hasTemporalChartLabels(items = []) {
    const temporalLabel = /(^|\b)(q[1-4]|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|fy\s*\d{2,4}|\d{4}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})(\b|$)/i;
    return items.length > 1 && items.every(item => temporalLabel.test(String(item.label || '')));
  }

  function getResultVisualDecision(pattern, res = {}) {
    const chart = res.chart;
    const items = chart && Array.isArray(chart.items) ? chart.items : [];
    const values = items.map(item => Number(item.value));
    const allPlottedValues = items.flatMap(item => [item.value, item.targetValue, item.secondaryValue]
      .filter(value => value !== undefined && value !== null)
      .map(value => Number(value)));
    const hasInvalidValue = allPlottedValues.some(value => !Number.isFinite(value));
    const hasNegativeValue = allPlottedValues.some(value => value < 0);
    const semantic = chart && String(chart.semantic || chart.relationship || '').toLowerCase();

    if (!chart || !items.length || hasInvalidValue) return { kind: 'table', reason: 'No valid chart series is available.' };
    if (hasNegativeValue) return { kind: 'table', reason: 'Negative values are shown in a table to preserve their sign and meaning.' };
    if (semantic === 'composition' || semantic === 'part-to-whole') {
      const total = values.reduce((sum, value) => sum + value, 0);
      return total > 0
        ? { kind: 'pie', reason: 'The values form a valid part-to-whole composition.' }
        : { kind: 'table', reason: 'A composition chart requires a positive total.' };
    }
    if (pattern === 'trend' && hasTemporalChartLabels(items)) return { kind: 'line', reason: 'Values are ordered over time.' };
    if (pattern === 'ranking') return { kind: 'bar', reason: 'Categories are ranked by one comparable measure.' };
    if (pattern === 'comparison' && semantic === 'ranking') return { kind: 'bar', reason: 'Categories are ranked by one comparable measure.' };
    return { kind: 'table', reason: 'This result does not have a chart relationship that can be represented safely.' };
  }

  function getActiveResultView(msg, pattern, res) {
    if (msg.viewUserSelected && msg.activeView) return msg.activeView;
    if (msg.resultPattern && msg.activeView) return msg.activeView;
    return getDefaultResultView(pattern, res);
  }

  function getAnswerHighlights(answer, scope) {
    const matches = [...String(answer || '').matchAll(/\*\*([^*]+)\*\*/g)]
      .map(m => m[1].trim())
      .filter(v => /\d/.test(v));
    const unique = [...new Set(matches)];
    const metricKey = scope && scope.metric ? scope.metric.key : '';
    let primary = unique[0] || '';

    if (metricKey === 'contract_value' || metricKey === 'total_receivables' || metricKey === 'overdue_60d' || metricKey === 'total_invoiced_spend' || metricKey === 'allocated_value') {
      primary = unique.find(v => v.includes('$')) || primary;
    } else if (metricKey === 'occupancy_rate' || metricKey === 'construction_progress') {
      primary = unique.find(v => v.includes('%')) || primary;
    } else if (metricKey === 'contract_count') {
      primary = unique.find(v => /contract|agreement/i.test(v)) || primary;
    }

    return {
      primary,
      secondary: unique.filter(v => v !== primary).slice(0, 2)
    };
  }

  function renderResultHero(pattern, answerBody, scope) {
    const meta = RESULT_PATTERN_META[pattern] || RESULT_PATTERN_META.record_list;
    const highlights = getAnswerHighlights(answerBody, scope);
    const period = scope && scope.time ? scope.time.label : (scope && scope.periodLabel ? scope.periodLabel : 'Current scope');
    const metric = scope && scope.metric ? scope.metric.label : 'Business result';

    return `
      <section class="result-hero result-pattern-${pattern}">
        <div class="result-hero-topline">
          <span class="result-pattern-badge">${escapeHtml(meta.label)}</span>
          <span class="result-period-badge">${escapeHtml(period)}</span>
        </div>
        ${pattern === 'kpi' && highlights.primary ? `
          <div class="result-kpi-block">
            <div class="result-kpi-value">${escapeHtml(highlights.primary)}</div>
            <div class="result-kpi-definition">${escapeHtml(metric)}</div>
          </div>
        ` : ''}
        <div class="result-headline">${formatMarkdownBold(answerBody || '')}</div>
        ${pattern !== 'kpi' && highlights.primary ? `
          <div class="result-highlight-row">
            <span class="result-highlight-primary">${escapeHtml(highlights.primary)}</span>
            ${highlights.secondary.map(v => `<span class="result-highlight-secondary">${escapeHtml(v)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="result-pattern-description">${escapeHtml(meta.description)}</div>
      </section>
    `;
  }

  function renderCompactScope(scope, msg) {
    if (!scope) return '';
    const metric = scope.metric ? scope.metric.label : 'Business metric';
    const grain = scope.grain || scope.breakdown;
    const grainLabel = grain ? grain.label : 'Standard business grain';
    const period = scope.time ? scope.time.label : (scope.periodLabel || 'Current scope');
    const project = scope.projectScope ? scope.projectScope.label : 'All projects';
    const domain = scope.domain ? (scope.domain.label || scope.domain.value || scope.domain) : 'All domains';
    const currency = scope.currencyObj ? scope.currencyObj.label : (scope.currency || 'Not specified');
    const msgId = msg ? msg.id : '';
    return `
      <details class="result-scope-disclosure">
        <summary>
          <span class="result-scope-summary-label">Applied scope</span>
          <span class="result-scope-summary-value">${escapeHtml(metric)} · ${escapeHtml(grainLabel)} · ${escapeHtml(period)} · ${escapeHtml(project)} / ${escapeHtml(domain)} · ${escapeHtml(currency)}</span>
          <span class="result-scope-summary-action">Review or edit</span>
        </summary>
        <div class="result-scope-expanded">
          ${msgId ? `
            <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
              <button type="button" class="action-tool-btn btn-inspect-scope" data-msg-id="${msgId}" style="font-size: 12px; padding: 4px 10px;">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Open in Scope &amp; Sources panel</span>
              </button>
            </div>
          ` : ''}
          ${generateInterpretationHtml(scope, msg)}
        </div>
      </details>
    `;
  }

  function renderEntityDetailHtml(tableData) {
    if (!tableData || !tableData.rows || tableData.rows.length === 0) return '';
    const row = tableData.rows[0];
    return `
      <section class="entity-detail-panel">
        <div class="evidence-section-heading">${escapeHtml(tableData.title || 'Entity details')}</div>
        <div class="entity-detail-grid">
          ${tableData.columns.map((column, idx) => `
            <div class="entity-detail-field">
              <span>${escapeHtml(tableData.headers[idx] || column)}</span>
              <strong>${escapeHtml(String(row[column] !== undefined ? row[column] : '—'))}</strong>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderEvidenceHtml(res, msg, pattern, activeView) {
    if (!res.table && !res.chart) return '';
    if (pattern === 'entity_detail') return renderEntityDetailHtml(res.table);

    const visualDecision = getResultVisualDecision(pattern, res);
    const fallbackTable = res.table || (res.chart && res.chart.items ? {
      title: `${res.chart.title || 'Result'} — table view`,
      headers: ['Business category', `Value${res.chart.unit ? ` (${res.chart.unit})` : ''}`],
      columns: ['label', 'value'],
      types: ['string', 'number'],
      rows: res.chart.items.map(item => ({ label: item.label, value: item.value }))
    } : null);
    const tableHtml = generateTableHtml(fallbackTable, msg.id, activeView, msg.tablePage || 1, msg.tableSearch || '');
    const chartHtml = visualDecision.kind !== 'table' ? generateChartHtml(res.chart, msg.id, visualDecision.kind) : '';
    const content = visualDecision.kind === 'table' ? tableHtml : chartHtml;
    const heading = `<div class="result-view-header"><span class="evidence-section-heading">Supporting evidence</span><span class="visual-choice-note" title="${escapeHtml(visualDecision.reason)}">${visualDecision.kind === 'table' ? 'Table' : `${visualDecision.kind.charAt(0).toUpperCase() + visualDecision.kind.slice(1)} chart`}</span></div>`;

    if (pattern === 'kpi') {
      return `
        <details class="supporting-evidence-disclosure">
          <summary>View supporting evidence</summary>
          <div class="supporting-evidence-content">${heading}${content}</div>
        </details>
      `;
    }

    return `<section class="result-evidence">${heading}${content}</section>`;
  }

  function renderRunMetadata(msg, scope) {
    const domain = scope && scope.domain ? (scope.domain.label || scope.domain.value || scope.domain) : 'Auto';
    const period = scope && scope.time ? scope.time.label : (scope && scope.periodLabel ? scope.periodLabel : 'No added time filter');
    const project = scope && scope.projectScope ? (scope.projectScope.label || scope.projectScope.value || scope.projectScope) : 'All applicable projects';
    const runAt = new Date(msg.timestamp || Date.now()).toLocaleString();
    const runNumber = Number(msg.runNumber) || 1;
    return `
      <div class="answer-run-metadata" aria-label="Answer run metadata">
        <span><strong>Run:</strong> ${runNumber}</span>
        <span><strong>Last run:</strong> ${escapeHtml(runAt)}</span>
        <span><strong>Scope:</strong> ${escapeHtml(`${domain} · ${period} · ${project}`)}</span>
      </div>
    `;
  }

  function renderResultStateHtml(msg, stateType) {
    const res = msg.resultsData || {};
    const scope = msg.appliedScope || res.appliedScope;
    const config = stateType === 'no_data'
      ? { label: 'No matching records', title: 'Nothing matched the applied scope', body: 'The query completed successfully, but the synthetic dataset contains no records for this combination of filters.', tone: 'neutral' }
      : stateType === 'partial'
        ? { label: 'Partial result', title: 'Some evidence is unavailable', body: res.partialReason || 'The available records are shown below. Some sources did not return data, so totals may be incomplete.', tone: 'warning' }
        : { label: 'Unsupported question', title: 'This combination is not available in the demo', body: res.plainEnglishExplanation || 'The requested combination is outside the verified synthetic scenarios.', tone: 'warning' };

    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card result-state-card state-${config.tone}">
          <div class="result-state-label">${escapeHtml(config.label)}</div>
          <h3>${escapeHtml(config.title)}</h3>
          <p>${escapeHtml(config.body)}</p>
          ${renderRunMetadata(msg, scope)}
          ${res.answer ? `<div class="result-state-detail">${formatMarkdownBold(res.answer.replace(/^Combination Not Supported in Mock Ledger:\s*/i, ''))}</div>` : ''}
          ${renderCompactScope(scope, msg)}
          ${renderBusinessProvenance(res)}
          <div class="result-state-actions">
            ${scope ? `<button type="button" class="action-tool-btn btn-edit-interpretation" data-msg-id="${msg.id}">Edit scope</button>` : ''}
            ${stateType === 'unsupported'
              ? '<span class="result-action-note">The previous scope remains on this historical result. Applying a new scope creates a new version.</span>'
              : `<button type="button" class="action-tool-btn btn-run-again" data-msg-id="${msg.id}">Run again with this scope</button>`}
          </div>
          ${stateType === 'partial' ? renderEvidenceHtml(res, msg, inferResultPattern(res), getActiveResultView(msg, inferResultPattern(res), res)) : ''}
        </div>
      </div>
    `;
  }

  const BUSINESS_SOURCE_DEFINITIONS = {
    finance_receivables_ledger: { label: 'Receivables Ledger', owner: 'Finance Operations', grain: 'One receivable balance per buyer contract and reporting date', cadence: 'Daily', definition: 'Open amounts due, aging and payment status as of the displayed data date.', calculation: 'Outstanding receivables are summed from open amount due; aging metrics use days past due.', exclusions: 'Paid balances and inter-company transfers are excluded.' },
    sales_contracts: { label: 'Sales Contracts', owner: 'Sales Operations', grain: 'One executed buyer contract', cadence: 'Daily', definition: 'Executed purchase agreements, buyer allocation and signed contract value.', calculation: 'Contract value is summed from active signed agreements; contract count uses distinct agreements.', exclusions: 'Draft, cancelled and terminated agreements are excluded.' },
    dim_projects: { label: 'Project Portfolio', owner: 'Project Controls', grain: 'One development project', cadence: 'Daily', definition: 'Canonical project identity, code, asset class and lifecycle status used to group results.', calculation: 'Provides project attributes and grouping; it does not contribute monetary values directly.', exclusions: 'Archived proposals are excluded from active-project views.' },
    dim_vendors: { label: 'Supplier Directory', owner: 'Procurement', grain: 'One supplier account', cadence: 'Weekly', definition: 'Supplier identity, commodity group, rating and commercial terms.', calculation: 'Provides supplier and commodity classifications used to group procurement measures.', exclusions: 'Inactive suppliers and sensitive contact details are excluded.' },
    finance_ap_invoices: { label: 'Supplier Invoices', owner: 'Finance Operations', grain: 'One supplier invoice', cadence: 'Daily', definition: 'Invoice amounts and approval status linked to suppliers and purchase orders.', calculation: 'Invoiced spend is the sum of approved invoice amounts within the applied period.', exclusions: 'Draft, rejected and unsubmitted invoices are excluded.' },
    procurement_purchase_orders: { label: 'Purchase Orders', owner: 'Procurement', grain: 'One purchase order', cadence: 'Daily', definition: 'Approved and pending procurement commitments by supplier and project.', calculation: 'PO value is summed from order totals; lead time is averaged from issue to delivery.', exclusions: 'Cancelled purchase orders are excluded.' },
    procurement_contracts: { label: 'Supplier Contracts', owner: 'Procurement', grain: 'One supplier agreement', cadence: 'Daily', definition: 'Commercial agreements with suppliers, including status, value and expiry.', calculation: 'Counts active agreements and sums their signed value within the applied scope.', exclusions: 'Draft, terminated and superseded agreements are excluded.' },
    construction_progress_log: { label: 'Construction Progress', owner: 'Project Controls', grain: 'One project progress observation per reporting date', cadence: 'Weekly', definition: 'Planned and actual construction progress used to identify schedule variance.', calculation: 'Progress is the latest approved completion percentage; variance compares actual with plan.', exclusions: 'Unapproved field estimates are excluded.' },
    construction_milestones: { label: 'Construction Milestones', owner: 'Project Controls', grain: 'One approved milestone per project', cadence: 'Weekly', definition: 'Baseline and actual milestone dates for active construction projects.', calculation: 'Schedule variance is calculated from approved baseline and actual or forecast dates.', exclusions: 'Cancelled and unapproved milestones are excluded.' },
    construction_contracts: { label: 'Construction Contracts', owner: 'Commercial & Contracts', grain: 'One active construction agreement', cadence: 'Daily', definition: 'Signed construction contracts, contractual values and damages terms.', calculation: 'Contract value uses signed face value; damages use the active contractual rate and approved delay.', exclusions: 'Draft, terminated and superseded contracts are excluded.' },
    contractor_delay_notices: { label: 'Contractor Delay Notices', owner: 'Project Controls', grain: 'One submitted delay notice', cadence: 'Daily', definition: 'Submitted and assessed contractor delay events and approved delay days.', calculation: 'Delay exposure uses approved delay days; unapproved claims remain informational only.', exclusions: 'Withdrawn notices are excluded.' },
    contractor_disbursements: { label: 'Contractor Disbursements', owner: 'Finance Operations', grain: 'One certified contractor payment', cadence: 'Daily', definition: 'Certified amounts, retention and settlement status for contractor payments.', calculation: 'Disbursed value sums certified payments net of withheld retention where applicable.', exclusions: 'Uncertified claims and voided payments are excluded.' },
    contractor_milestones: { label: 'Contractor Milestones', owner: 'Project Controls', grain: 'One contractor milestone assessment', cadence: 'Weekly', definition: 'Contractor delivery milestones and completion status against approved plans.', calculation: 'Completion uses the latest approved milestone assessment for each contract.', exclusions: 'Superseded and unapproved assessments are excluded.' },
    dim_property_assets: { label: 'Property Portfolio', owner: 'Property Management', grain: 'One managed property asset', cadence: 'Weekly', definition: 'Managed property attributes, asset class and portfolio grouping.', calculation: 'Provides lettable-area and asset classifications used in occupancy calculations.', exclusions: 'Disposed assets are excluded from current portfolio metrics.' },
    property_leases: { label: 'Lease Register', owner: 'Property Management', grain: 'One tenant lease', cadence: 'Daily', definition: 'Lease area, occupancy status, expiry and renewal information.', calculation: 'Occupancy is occupied area divided by net lettable area for active leases.', exclusions: 'Draft, expired and cancelled leases are excluded from current occupancy.' }
    ,projects: { label: 'Project Portfolio', owner: 'Project Controls', grain: 'One real-estate project', cadence: 'Synthetic fixture', definition: 'CK1 project identity, lifecycle, type, cost and delivery attributes.', calculation: 'Provides project grouping for contract, construction and property measures.', exclusions: 'No fixture rows are excluded unless the applied scope specifies a status.' }
    ,units: { label: 'Property Units', owner: 'Property Operations', grain: 'One physical property unit', cadence: 'Synthetic fixture', definition: 'CK1 unit inventory linked to project, building and phase.', calculation: 'Occupied-unit rate uses Occupied divided by Occupied plus Vacant units.', exclusions: 'Sold inventory is excluded from the occupancy denominator.' }
    ,payment_schedules: { label: 'Buyer Payment Schedules', owner: 'Finance Operations', grain: 'One payment schedule per sales contract', cadence: 'Synthetic fixture', definition: 'Contract-level installment plan and payment frequency.', calculation: 'Links buyer contracts to their scheduled installments.', exclusions: 'No additional fixture exclusions.' }
    ,payment_installments: { label: 'Buyer Installments', owner: 'Finance Operations', grain: 'One scheduled installment', cadence: 'Synthetic fixture', definition: 'Amount due, amount paid, due date and settlement status for each installment.', calculation: 'Outstanding amount equals amount due minus amount paid.', exclusions: 'Fully settled amounts contribute zero outstanding balance.' }
    ,construction_progress: { label: 'Construction Progress', owner: 'Project Controls', grain: 'One progress observation per project phase and report date', cadence: 'Synthetic fixture', definition: 'CK1 milestone progress observations for project phases.', calculation: 'Latest progress uses the most recent report date for each phase.', exclusions: 'Older observations are excluded from latest-progress results.' }
    ,project_phases: { label: 'Project Phases', owner: 'Project Controls', grain: 'One delivery phase per project', cadence: 'Synthetic fixture', definition: 'CK1 project phase identity, status and expected handover date.', calculation: 'Provides the phase grouping for progress reporting.', exclusions: 'No additional fixture exclusions.' }
    ,lease_contracts: { label: 'Lease Register', owner: 'Property Operations', grain: 'One lease per unit and tenant', cadence: 'Synthetic fixture', definition: 'CK1 active lease dates, rent and currency.', calculation: 'Active leases support verification of occupied units.', exclusions: 'Inactive leases are excluded from current occupancy.' }
    ,service_contracts: { label: 'Property Service Contracts', owner: 'Property Operations', grain: 'One vendor service agreement per project', cadence: 'Synthetic fixture', definition: 'CK1 recurring property-service agreements, fees and end dates.', calculation: 'Expiry results filter active contracts by contract end date.', exclusions: 'Inactive service contracts are excluded.' }
    ,vendors: { label: 'Service Vendor Directory', owner: 'Property Operations', grain: 'One service vendor', cadence: 'Synthetic fixture', definition: 'CK1 vendor identity, category, rating and active status.', calculation: 'Provides vendor attributes for service-contract results.', exclusions: 'Inactive vendors are excluded where specified.' }
    ,audit_logs: { label: 'Data Access and Query Audit Logs', owner: 'Data Governance', grain: 'One access or natural-language query event', cadence: 'Synthetic fixture', definition: 'CK1 audit events and policy decisions for governed data access.', calculation: 'Decision counts group events by ALLOW, MASK or DENY.', exclusions: 'Counts describe only the displayed fixture window.' }
    ,data_access_policies: { label: 'Data Access Policies', owner: 'Data Governance', grain: 'One policy per role and data scope', cadence: 'Synthetic fixture', definition: 'CK1 allow, mask and deny rules for tables or columns.', calculation: 'Policy metadata explains access decisions; it does not contribute business measures.', exclusions: 'Inactive policies are excluded.' }
  };

  function getBusinessSourceDefinition(name) {
    const physicalName = String(name || '').replace('enterprise_dw.', '').split('.').pop();
    const tableDef = (window.AriaMock.SCHEMA_CATALOG || []).find((table) => table.name === physicalName || table.name === name);
    const curated = BUSINESS_SOURCE_DEFINITIONS[physicalName];
    if (curated) return { ...curated, physicalName, domain: tableDef ? tableDef.domain : 'Enterprise data' };
    return {
      physicalName,
      label: 'Enterprise Business Records',
      domain: tableDef ? tableDef.domain : 'Enterprise data',
      owner: 'Owner not specified in prototype',
      grain: 'Record grain not yet documented',
      cadence: 'Refresh cadence not yet documented',
      definition: tableDef ? tableDef.description : 'Definition not yet documented for this prototype source.',
      calculation: 'Calculated according to the metric and applied scope shown with the result.',
      exclusions: 'No additional exclusions documented.'
    };
  }

  function renderBusinessProvenance(res) {
    const sources = Array.isArray(res.sources) ? res.sources : [];
    const sourceLabels = sources.map(source => getBusinessSourceDefinition(source.name).label);
    return `
      <section class="result-provenance" aria-label="Data freshness and business sources">
        <div><span>Data freshness</span><strong>${escapeHtml(res.dataAsOf || 'Not provided')}</strong></div>
        <div><span>Business sources</span><strong>${escapeHtml(sourceLabels.length ? sourceLabels.join(', ') : 'Enterprise business records')}</strong></div>
      </section>
    `;
  }

  function renderAgentMessageHtml(msg, msgIdx) {
    if (msg.type === 'blocked') {
      return renderBlockedSecurityHtml(msg);
    }
    if (msg.type === 'clarification') {
      return renderClarificationHtml(msg);
    }
    if (msg.type === 'error' || msg.type === 'cancelled') {
      return renderErrorHtml(msg);
    }

    const res = msg.resultsData || {};
    const resultState = getResultState(res);
    if (resultState === 'no_data' || resultState === 'unsupported' || resultState === 'partial') {
      return renderResultStateHtml(msg, resultState);
    }
    const pattern = inferResultPattern(res);
    const activeView = getActiveResultView(msg, pattern, res);
    const scope = msg.appliedScope || res.appliedScope;
    
    // 1. Business area and reporting period
    const area = scope && scope.domain ? (scope.domain.label || scope.domain.value || scope.domain) : 'Enterprise';
    const period = scope && scope.time ? scope.time.label : (scope && scope.periodLabel ? scope.periodLabel : 'Current scope');
    
    // 2. Direct answer headline
    const headline = res.answer || 'Business Analysis';
    
    // 3. Primary number or conclusion
    const highlights = getAnswerHighlights(headline, scope);
    const primaryNumber = highlights.primary || '';
    
    // 4. Concise interpretation
    const interpretationText = `Based on ${escapeHtml(area)} data for ${escapeHtml(period)}, analysis indicates key patterns.`;
    
    // 5. Supporting visual or data
    const evidenceHtml = renderEvidenceHtml(res, msg, pattern, activeView);
    
    // 6. Why it matters
    const whyItMatters = "Understanding these metrics enables proactive operational adjustments and better financial forecasting.";
    
    // 7. Recommended next action
    const nextAction = "Review underlying records in Evidence Desk or drill down by region.";
    const userId = state.currentUser ? state.currentUser.id : 'default';
    const savedInsights = window.AriaMock && window.AriaMock.getSavedInsights
      ? window.AriaMock.getSavedInsights(userId)
      : [];
    const isSaved = savedInsights.some((item) => item.sourceMessageId === msg.id);
    const hasTable = Boolean(res.table);
    const canDownload = hasTable;
    const followUps = Array.isArray(res.followUps) ? res.followUps : [];

    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card" data-msg-id="${msg.id}">
          <div class="conversation-turn-label answer-turn-label">
            <span class="answer-turn-mark" aria-hidden="true">A</span>
            <span>${msg.runAgainOfMessageId ? 'Aria answer · Run again' : (msg.sourceMessageId ? 'Aria answer · Reinterpreted scope' : 'Aria answer')}</span>
          </div>
          ${renderRunMetadata(msg, scope)}
          <div class="message-content">
            <div class="brief-container">
              <div class="brief-meta">
                ${escapeHtml(area)} · ${escapeHtml(period)}
              </div>
              <div class="brief-headline">
                ${formatMarkdownBold(headline)}
              </div>
              ${primaryNumber ? `
                <div class="brief-number">
                  ${escapeHtml(primaryNumber)}
                </div>
              ` : ''}
              <div class="brief-interpretation">
                ${interpretationText}
              </div>
              ${renderCompactScope(scope, msg)}
              ${renderBusinessProvenance(res)}
              
              <div class="brief-evidence">
                ${evidenceHtml}
              </div>
              
              <div class="brief-why">
                <strong style="text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin-bottom: 8px; display: block; color: var(--text-muted);">Why it matters</strong>
                ${whyItMatters}
              </div>
              
              <div class="brief-action">
                Action: ${nextAction}
              </div>
            </div>
          </div>
          
          <div class="agent-footer answer-footer">
            <div class="answer-primary-actions">
              <button type="button" class="action-tool-btn btn-open-evidence" data-msg-id="${msg.id}">Open Evidence Desk</button>
            </div>
            <details class="answer-actions-menu">
              <summary class="action-tool-btn">More actions</summary>
              <div class="answer-actions-popover">
                <button type="button" class="action-tool-btn btn-copy-answer" data-answer="${escapeHtml(headline)}">Copy answer</button>
                ${hasTable ? `<button type="button" class="action-tool-btn btn-copy-table" data-msg-id="${msg.id}">Copy records</button>` : ''}
                ${canDownload ? `<button type="button" class="action-tool-btn btn-export-csv" data-msg-id="${msg.id}">Export CSV…</button>` : ''}
                <button type="button" class="action-tool-btn btn-pin-answer ${isSaved ? 'pinned' : ''}" data-msg-id="${msg.id}">${isSaved ? 'Remove from saved' : 'Save insight'}</button>
                <button type="button" class="action-tool-btn btn-run-again" data-msg-id="${msg.id}">Run again with this scope</button>
                <button type="button" class="action-tool-btn btn-feedback-up ${msg.feedback && msg.feedback.type === 'up' ? 'feedback-submitted' : ''}" data-msg-id="${msg.id}">${msg.feedback && msg.feedback.type === 'up' ? 'Helpful · Submitted' : 'Helpful'}</button>
                <button type="button" class="action-tool-btn btn-feedback-down ${msg.feedback && msg.feedback.type === 'down' ? 'feedback-submitted' : ''}" data-msg-id="${msg.id}">${msg.feedback && msg.feedback.type === 'down' ? 'Edit issue feedback' : 'Report an issue'}</button>
                ${followUps.length > 0 ? `
                  <div class="answer-followups">
                    <span>Continue with the same scope</span>
                    ${followUps.map((query) => `<button type="button" class="followup-chip" data-query="${escapeHtml(query)}" data-source-msg-id="${msg.id}">${escapeHtml(query)}</button>`).join('')}
                  </div>
                ` : ''}
              </div>
            </details>
          </div>
        </div>
      </div>
    `;
  }

  function renderBlockedSecurityHtml(msg) {
    const combined = `${msg.title || ''} ${msg.message || ''} ${msg.reason || ''}`.toLowerCase();
    const isWriteAction = /delete|update|insert|write|modify|change record/.test(combined);
    const isAccessDenied = msg.blockedType === 'ACCESS_DENIED' || /access|payroll|compensation|salary/.test(combined);
    const roleDef = state.currentUser && window.AriaMock.USER_ROLES
      ? window.AriaMock.USER_ROLES[state.currentUser.role]
      : null;
    const restrictedData = msg.restrictedData || (/payroll|salary/.test(combined) ? 'Payroll data' : 'Requested data');
    const allowedScope = Array.isArray(msg.allowedScope) && msg.allowedScope.length
      ? msg.allowedScope
      : ((roleDef && roleDef.allowedDomains) || []);
    const title = isWriteAction
      ? 'This workspace is read-only'
      : (isAccessDenied ? `You don't have access to ${restrictedData.toLowerCase()}` : 'This request was blocked');
    const explanation = isWriteAction
      ? 'You can review and analyse records here, but this prototype cannot change business data.'
      : (isAccessDenied
          ? `${restrictedData} is outside your current workspace access scope, so no restricted records were retrieved.`
          : (msg.message || 'This request could not be processed under the current security policy.'));
    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card result-state-card state-denied">
          <div class="result-state-label">Restricted</div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(explanation)}</p>
          ${isAccessDenied ? `
            <div class="access-boundary-summary">
              <div><span>Unavailable data</span><strong>${escapeHtml(restrictedData)}</strong></div>
              <div><span>Available scope</span><strong>${escapeHtml(allowedScope.length ? allowedScope.join(', ') : 'Business areas listed in Data Guide')}</strong></div>
              <div><span>Why</span><strong>${escapeHtml(msg.reason || 'Restricted by data classification and access policy.')}</strong></div>
              <div><span>Next step</span><strong>Review access guidance, then contact ${escapeHtml(msg.dataOwner || 'the relevant data owner')} through your organisation’s approved process.</strong></div>
            </div>
          ` : '<div class="result-state-detail"><strong>Available action:</strong> Ask a read-only business question within the areas shown in Data Guide.</div>'}
          ${msg.details ? `<details class="state-details"><summary>Policy guidance</summary><p>${escapeHtml(msg.details)}</p></details>` : ''}
          <div class="result-state-actions">
            <button type="button" class="action-tool-btn btn-revise-question" data-msg-id="${msg.id}">Revise question</button>
            ${isAccessDenied ? '<button type="button" class="action-tool-btn btn-access-guidance">Access guidance &amp; data owner</button>' : ''}
            ${isAccessDenied ? '<button type="button" class="action-tool-btn" disabled aria-describedby="access-request-unavailable" title="No access-request workflow is connected in this prototype">Request access</button>' : ''}
          </div>
          ${isAccessDenied ? '<p class="access-request-note" id="access-request-unavailable">Request access is unavailable in this prototype; no request has been sent.</p>' : ''}
        </div>
      </div>
    `;
  }

  function renderClarificationHtml(msg) {
    const opts = msg.options || [];

    const resolved = Boolean(msg.resolvedAt || msg.resolvedPayload);
    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card clarification-status-card ${resolved ? 'is-resolved' : ''}">
          <div class="result-state-label">${resolved ? 'Clarification confirmed' : 'Clarification needed'}</div>
          <h3>${escapeHtml(resolved ? (msg.resolvedChoice || 'Scope confirmed') : 'One choice is needed before I run this question')}</h3>
          <p>${escapeHtml(msg.question || 'Please confirm the intended meaning or scope.')}</p>
          ${resolved
            ? `<div class="clarification-resolution">
                <div><strong>Selected:</strong> ${escapeHtml(msg.resolvedChoice || '')}</div>
                <span class="clarification-locked-note">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>
                  Confirmed request locked
                </span>
              </div>`
            : `<button type="button" class="action-tool-btn primary btn-open-clarification" data-msg-id="${msg.id}">Answer clarification</button>`}
        </div>
      </div>
    `;

    if (msg.subtype === 'scope_conflict') {
      return `
        <div class="chat-row agent-row" id="msg_row_${msg.id}">
          <div class="agent-response-card scope-conflict-card" style="border: 2px solid var(--warning-color); padding: 22px;">
            <div class="conflict-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div class="conflict-badge" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background-color: var(--warning-bg); border: 1px solid var(--warning-border); color: var(--warning-color); border-radius: var(--radius-full); font-size: 12px; font-weight: 700;">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span>Scope Conflict Resolution Required</span>
              </div>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">Clarification required before query execution</span>
            </div>

            <p class="conflict-explanation" style="font-size: 14px; margin-bottom: 16px; line-height: 1.5; color: var(--text-primary);">${formatMarkdownBold(msg.question || '')}</p>

            ${msg.resolvedPayload ? `
              <div class="conflict-resolved-banner" style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--success-bg); border: 1px solid var(--success-color); border-radius: var(--radius-sm); color: var(--success-color); font-size: 12px; font-weight: 600; margin-bottom: 12px;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Scope conflict resolved: Applied <strong>${escapeHtml(msg.resolvedChoice || msg.resolvedPayload)}</strong></span>
              </div>
            ` : ''}

            <div class="conflict-options-list" style="display: flex; flex-direction: column; gap: 8px;">
              ${opts.map((opt) => {
                const payloadStr = typeof opt.payload === 'object' ? JSON.stringify(opt.payload) : opt.payload;
                const isSelected = msg.resolvedChoice === opt.label || msg.resolvedPayload === opt.label;
                return `
                  <button type="button" class="clarification-chip conflict-option-btn ${opt.isEditScope ? 'btn-edit-scope-action' : ''} ${isSelected ? 'selected-resolution' : ''}" data-msg-id="${msg.id}" data-payload='${escapeHtml(payloadStr)}' data-label="${escapeHtml(opt.label)}" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; font-size: 13.5px; border-radius: var(--radius-md); border: 1px solid ${isSelected ? 'var(--success-color)' : 'var(--border-color)'}; background: ${isSelected ? 'var(--success-bg)' : 'var(--bg-surface)'}; text-align: left; cursor: ${msg.resolvedPayload ? 'default' : 'pointer'};" ${msg.resolvedPayload ? 'disabled' : ''}>
                    <span style="font-weight: 600;">${isSelected ? '✓ ' : ''}${escapeHtml(opt.label)}</span>
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

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
            ${msg.understoodFields ? `
              <div class="clarification-understood-box" style="margin-bottom: 16px; padding: 12px 14px; background: var(--bg-hover); border-left: 3px solid var(--accent-primary); border-radius: 6px; font-size: 12px;">
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>What I understood so far:</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px 14px; color: var(--text-secondary);">
                  ${msg.understoodFields.domain ? `<div><span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600; display: block;">Business area</span><strong style="color: var(--text-primary); font-size: 12px;">${escapeHtml(msg.understoodFields.domain)}</strong></div>` : ''}
                  ${msg.understoodFields.metric ? `<div><span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600; display: block;">Metric</span><strong style="color: var(--text-primary); font-size: 12px;">${escapeHtml(msg.understoodFields.metric)}</strong></div>` : ''}
                  ${msg.understoodFields.period ? `<div><span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600; display: block;">Period</span><strong style="color: var(--text-primary); font-size: 12px;">${escapeHtml(msg.understoodFields.period)}</strong></div>` : ''}
                  ${msg.understoodFields.projectScope ? `<div><span style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600; display: block;">Project scope</span><strong style="color: var(--text-primary); font-size: 12px;">${escapeHtml(msg.understoodFields.projectScope)}</strong></div>` : ''}
                </div>
                ${msg.understoodFields.fieldToClarify ? `
                  <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border-color); color: var(--warning-color); font-weight: 600; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                    <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>${escapeHtml(msg.understoodFields.fieldToClarify)}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            <p class="clarification-question" style="font-size: 15px; margin-bottom: 20px; line-height: 1.5;">${escapeHtml(msg.question || '')}</p>
            ${msg.resolvedPayload ? `
              <div class="conflict-resolved-banner" style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--success-bg); border: 1px solid var(--success-color); border-radius: var(--radius-sm); color: var(--success-color); font-size: 12px; font-weight: 600; margin-bottom: 12px;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Clarification resolved: Selected <strong>${escapeHtml(msg.resolvedChoice || msg.resolvedPayload)}</strong></span>
              </div>
            ` : ''}
            <div class="clarification-chips" style="display: flex; flex-direction: column; gap: 10px;">
              ${opts.map((opt) => `
                <button type="button" class="clarification-chip ${msg.resolvedChoice === opt.label ? 'selected-resolution' : ''}" data-msg-id="${msg.id}" data-payload="${escapeHtml(typeof opt.payload === 'object' ? JSON.stringify(opt.payload) : opt.payload)}" data-label="${escapeHtml(opt.label)}" style="width: 100%; justify-content: space-between; padding: 12px 16px; font-size: 14px; border: 1px solid var(--border-color); background: var(--bg-surface); text-align: left;" ${msg.resolvedPayload ? 'disabled' : ''}>
                  <span style="font-weight: 500;">${msg.resolvedChoice === opt.label ? '✓ ' : ''}${escapeHtml(opt.label)}</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function closeClarificationModal() {
    if (!clarificationModalBackdrop) return;
    clarificationModalBackdrop.classList.remove('open');
    activeClarificationMessageId = null;
    if (activeClarificationTrigger && document.contains(activeClarificationTrigger)) activeClarificationTrigger.focus();
    activeClarificationTrigger = null;
  }

  function cancelClarificationModal() {
    const conv = getActiveConversation();
    const msg = conv && conv.messages.find((item) => item.id === activeClarificationMessageId);
    if (msg && !msg.resolvedAt && !msg.resolvedPayload) {
      msg.clarificationDismissedAt = Date.now();
      saveConversationsToStorage();
    }
    closeClarificationModal();
  }

  function openClarificationModal(msgId, trigger) {
    const conv = getActiveConversation();
    const msg = conv && conv.messages.find((item) => item.id === msgId);
    if (!msg || msg.resolvedAt || msg.resolvedPayload || !clarificationModalBackdrop) return;

    activeClarificationMessageId = msgId;
    activeClarificationTrigger = trigger || null;
    if (msg.clarificationDismissedAt) {
      delete msg.clarificationDismissedAt;
      saveConversationsToStorage();
    }
    clarificationQuestionEl.textContent = msg.question || 'Which interpretation should I use?';
    clarificationModalTitleEl.textContent = msg.subtype === 'interpretation_confirmation' ? 'Confirm interpretation' : 'Before I continue';
    const originalQuestion = findUserQueryForAgentMsg(conv, msg) || msg.originalQuery || '';
    clarificationOriginalQuestionTextEl.textContent = originalQuestion;
    clarificationOriginalQuestionEl.hidden = !originalQuestion;
    if (msg.subtype === 'interpretation_confirmation' && msg.originalQuery) {
      const previewQuestionScope = window.AriaScope.parseQuestionScope(msg.originalQuery);
      const previewIntent = window.AriaScope.parseQuestionIntent(msg.originalQuery, window.DEMO_CONTEXT);
      const previewResolved = window.AriaScope.resolveSelectedScope(state.selectedScope, previewQuestionScope, window.DEMO_CONTEXT);
      msg.understoodFields = {
        metric: previewIntent.metric && previewIntent.metric.label,
        grain: previewIntent.breakdown && previewIntent.breakdown.label,
        period: previewResolved.periodLabel,
        domain: previewResolved.domain || 'All business areas',
        projectScope: previewIntent.projects && previewIntent.projects.label,
        currency: /rate|progress|%/i.test(previewIntent.metric && previewIntent.metric.label) ? 'Not applicable (%)' : (/day|time/i.test(previewIntent.metric && previewIntent.metric.label) ? 'Not applicable (Days)' : (/count/i.test(previewIntent.metric && previewIntent.metric.label) ? 'Not applicable (Count)' : 'USD millions')),
        assumptions: ['Read-only query', previewResolved.calendarBasis ? `${previewResolved.calendarBasis} calendar basis` : 'Workspace calendar basis']
      };
    }
    const understood = msg.understoodFields || {};
    const fieldLabel = (value) => value && typeof value === 'object' ? (value.label || value.value || value.key || '') : value;
    const understoodItems = [
      { label: 'Metric', value: fieldLabel(understood.metric) },
      { label: 'Grain', value: fieldLabel(understood.grain) },
      { label: 'Period', value: fieldLabel(understood.period) },
      { label: 'Business area', value: fieldLabel(understood.domain) },
      { label: 'Project', value: fieldLabel(understood.projectScope) },
      { label: 'Currency / unit', value: fieldLabel(understood.currency) },
      { label: 'Assumptions', value: Array.isArray(understood.assumptions) ? understood.assumptions.join('; ') : fieldLabel(understood.assumptions) }
    ].filter(item => item.value);
    const clarificationTarget = fieldLabel(understood.fieldToClarify);
    clarificationReasonEl.textContent = msg.reason || (clarificationTarget
      ? `I need to confirm ${clarificationTarget.toLowerCase()} before running the query so the answer uses the intended business definition and scope.`
      : (msg.subtype === 'scope_conflict'
        ? 'The question and the active workspace scope point to different interpretations. Confirm which one I should use before I run the query.'
        : 'I found more than one valid interpretation. Confirm the intended meaning before I run the query.'));
    clarificationUnderstoodEl.innerHTML = understoodItems.length
      ? `<strong class="clarification-understood-title">Understood so far</strong><dl>${understoodItems.map(item => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join('')}</dl>`
      : '';
    clarificationUnderstoodEl.hidden = understoodItems.length === 0;
    clarificationOptionsEl.innerHTML = (msg.options || []).map((option, index) => {
      const rawPayload = typeof option.payload === 'object' ? JSON.stringify(option.payload) : String(option.payload || option.label || '');
      return `<label class="clarification-option">
        <input type="radio" name="clarificationChoice" value="${escapeHtml(rawPayload)}" data-label="${escapeHtml(option.label)}" data-option-number="${index + 1}">
        <span class="clarification-option-number" aria-hidden="true">${index + 1}</span>
        <span>${escapeHtml(option.label)}</span>
      </label>`;
    }).join('');
    confirmClarificationBtn.disabled = true;
    clarificationModalBackdrop.classList.add('open');
    requestAnimationFrame(() => {
      const firstOption = clarificationOptionsEl.querySelector('input');
      (firstOption || confirmClarificationBtn).focus();
    });
  }

  function confirmClarification() {
    const conv = getActiveConversation();
    const msg = conv && conv.messages.find((item) => item.id === activeClarificationMessageId);
    if (!msg || msg.resolvedAt || msg.resolvedPayload || state.isThinking) return;
    const selected = clarificationOptionsEl.querySelector('input:checked');
    if (!selected) return;

    const rawPayload = selected.value;
    const label = selected.getAttribute('data-label');
    let parsedPayload = null;
    try { parsedPayload = JSON.parse(rawPayload); } catch (e) { parsedPayload = null; }

    if (parsedPayload && parsedPayload.resolution === 'edit_scope') {
      msg.clarificationDismissedAt = Date.now();
      saveConversationsToStorage();
      closeClarificationModal();
      if (msg.subtype === 'interpretation_confirmation') {
        openEditInterpretationModal(conv, msg.id);
        showToast('Edit the interpretation, then apply it to run the query.');
      } else {
        if (scopeEditorBarEl) scopeEditorBarEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (timeRangeSelectEl) timeRangeSelectEl.focus();
        showToast('Adjust the scope, then answer the clarification again.');
      }
      return;
    }

    msg.resolvedPayload = parsedPayload || rawPayload;
    msg.resolvedChoice = label;
    msg.resolvedAt = Date.now();
    msg.isLocked = true;
    saveConversationsToStorage();
    const originalQuestion = findUserQueryForAgentMsg(conv, msg) || msg.originalQuery || label;
    closeClarificationModal();
    renderActiveConversation();

    if (msg.subtype === 'interpretation_confirmation') {
      processUserPrompt(originalQuestion, {
        interpretationConfirmed: true,
        skipUserMessage: true,
        originalQuestion,
        displayPromptText: originalQuestion
      });
      return;
    }

    if (parsedPayload && parsedPayload.type === 'scope_resolution') {
      processUserPrompt(label, { scopeConfirmation: parsedPayload, originalQuestion });
    } else {
      processUserPrompt(label, { clarificationPayload: rawPayload, originalQuestion });
    }
  }

  function renderErrorHtml(msg) {
    const err = msg.errorData || {};
    const titleText = (err.title || '').toLowerCase();
    const kind = err.kind || (msg.type === 'cancelled' ? 'cancelled' : (titleText.includes('not found') || titleText.includes('not available') ? 'unsupported_question' : 'service_error'));
    const config = kind === 'cancelled'
      ? { label: 'Cancelled', title: err.title || 'Request stopped', tone: 'neutral', reasonLabel: 'Status', body: err.message || 'The run was stopped before a result was produced. No data or previous answer was changed.' }
      : kind === 'unsupported_question'
        ? { label: 'Unsupported question', title: err.title || 'Information is outside this demo', tone: 'warning', reasonLabel: 'Available boundary', body: err.message || 'The requested information is not represented by the connected business data or verified demo fixtures.' }
        : { label: 'Service error', title: err.title || 'The result could not be generated', tone: 'danger', reasonLabel: 'Technical status', body: err.message || 'The query could not complete because a required service failed. No result was produced.' };
    const requestedScope = msg.requestedScope || null;
    let requestedScopeHtml = '';
    if (requestedScope && window.AriaScope) {
      const questionScope = window.AriaScope.parseQuestionScope(msg.originalQuery || '');
      const resolved = window.AriaScope.resolveSelectedScope(requestedScope, questionScope, window.DEMO_CONTEXT);
      const limits = requestedScope.domain && Array.isArray(requestedScope.domain.values) ? requestedScope.domain.values : [];
      const domain = limits.length ? limits.join(' + ') : (resolved.domain || 'Auto — inferred from question');
      requestedScopeHtml = `<div class="state-applied-scope"><span>Scope used for this run</span><strong>${escapeHtml(`${domain} · ${resolved.periodLabel}`)}</strong></div>`;
    }
    return `
      <div class="chat-row agent-row" id="msg_row_${msg.id}">
        <div class="agent-response-card result-state-card state-${config.tone}">
          <div class="result-state-label">${escapeHtml(config.label)}</div>
          <h3>${escapeHtml(config.title)}</h3>
          <p>${escapeHtml(config.body)}</p>
          ${requestedScopeHtml}
          ${err.reason ? `<div class="result-state-detail"><strong>${escapeHtml(config.reasonLabel)}:</strong> ${escapeHtml(err.reason)}</div>` : ''}
          ${err.suggestedActions && err.suggestedActions.length > 0 ? `
            <div class="state-suggestions">
              <strong>What you can do</strong>
              <ul>${err.suggestedActions.map((act) => `<li>${escapeHtml(act)}</li>`).join('')}</ul>
            </div>
          ` : ''}
          <div class="result-state-actions">
            ${kind === 'unsupported_question' ? `<button type="button" class="action-tool-btn btn-edit-failed-scope" data-msg-id="${msg.id}">Edit scope</button>` : ''}
            ${kind !== 'unsupported_question' ? `<button type="button" class="action-tool-btn btn-retry" data-msg-id="${msg.id}">Retry</button>` : ''}
          </div>
          ${kind === 'unsupported_question' ? '<p class="state-history-note">This card preserves the scope used by the unsupported run. Your edited scope will be shown on the next result.</p>' : ''}
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
    if (Array.isArray(state.activeDomainScope) && state.activeDomainScope.length > 0) {
      const filtered = examples.filter((ex) => state.activeDomainScope.includes(ex.domain));
      if (filtered.length > 0) examples = filtered;
    }

    const taskGroups = [
      {
        key: 'Sales',
        description: 'Contracts and buyer activity',
        output: 'Ranking',
        question: examples.find((item) => /contract value|buyer installments/i.test(item.text))
          || { domain: 'Contracts', text: 'Show total active contract value by project in calendar year 2026' }
      },
      {
        key: 'Finance',
        description: 'Receivables and collections',
        output: 'Trend',
        question: examples.find((item) => /monthly buyer payments/i.test(item.text))
          || { domain: 'Finance', text: 'Show monthly buyer payments collected from July to September 2026' }
      },
      {
        key: 'Projects',
        description: 'Delivery and operations',
        output: 'Comparison',
        question: examples.find((item) => /construction progress/i.test(item.text))
          || { domain: 'Construction', text: 'Compare latest construction progress across active project phases' }
      }
    ];

    chatContainerEl.innerHTML = `
      <section class="welcome-hero" id="welcomeHero">
        <h1 class="hero-title task-home-title">What does your business need to understand?</h1>
        <p class="hero-subtitle task-home-subtitle">
          Aria analyses your enterprise operations, finance, and project intelligence.
        </p>

        <div class="example-section task-groups-section">
          <div class="example-section-label task-groups-label">
            <span>Choose a starting point for ${escapeHtml(state.currentUser ? state.currentUser.roleTitle : 'Sales Manager')}</span>
            <small>Select a question to place it in the composer, review scope, then press Ask.</small>
          </div>
          <div class="example-grid task-groups-grid">
            ${taskGroups.map((group) => `
              <section class="task-group-card" aria-labelledby="task_group_${group.key}">
                <div class="task-group-heading">
                  <div>
                    <h2 id="task_group_${group.key}">${escapeHtml(group.key)}</h2>
                    <p>${escapeHtml(group.description)}</p>
                  </div>
                  <span class="task-output-badge">${escapeHtml(group.output)}</span>
                </div>
                <button type="button" class="example-card" data-query="${escapeHtml(group.question.text)}">
                  <span class="example-card-meta">${escapeHtml(group.question.domain || group.key)} · ${escapeHtml(group.output)}</span>
                  <span class="example-card-text">${escapeHtml(group.question.text)}</span>
                  <span class="example-card-action">Use this question</span>
                </button>
              </section>
            `).join('')}
          </div>
        </div>

        <details class="audit-prompt-suite">
          <summary>
            <span>Audit test prompts</span>
            <small>${(window.AriaMock.AUDIT_TEST_PROMPTS || []).length} deterministic checks</small>
          </summary>
          <div class="audit-prompt-help">
            Select a prompt to place it in the composer, then press Enter to run it. Use a non-admin persona for the access-denied check.
          </div>
          ${['Visual examples', 'Result patterns', 'Decision states', 'Access states'].map((group) => `
            <section class="audit-prompt-group">
              <h2>${escapeHtml(group)}</h2>
              <div class="audit-prompt-grid">
                ${(window.AriaMock.AUDIT_TEST_PROMPTS || []).filter((item) => item.group === group).map((item) => `
                  <button type="button" class="audit-prompt-card" data-query="${escapeHtml(item.text)}">
                    <span>${escapeHtml(item.expected)}</span>
                    <strong>${escapeHtml(item.text)}</strong>
                  </button>
                `).join('')}
              </div>
            </section>
          `).join('')}
          <div class="audit-manual-checks">
            <strong>Two interaction checks</strong>
            <ol>
              <li>Select Q3 in Period, then ask a question containing Q2 to verify the scope-conflict clarification.</li>
              <li>Run any result prompt and press Stop while it is processing to verify the Cancelled state.</li>
            </ol>
          </div>
        </details>
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

    chatContainerEl.querySelectorAll('.audit-prompt-card').forEach((card) => {
      card.addEventListener('click', () => {
        chatInputEl.value = card.getAttribute('data-query');
        chatInputEl.focus();
        updateSendButtonState();
        chatInputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  // =========================================================================
  // 6. QUERY EXECUTION PIPELINE (Fix 1: MULTI-TURN IN ACTIVE CONV)
  // =========================================================================
  function handleSendMessage() {
    const text = chatInputEl.value.trim();
    if (!text || state.isThinking) return;

    if (!validateCustomDateRange()) {
      showToast('Invalid date range: Start date cannot be after end date.');
      return;
    }

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

    // 2. Append User Message (unless continuing the same turn after confirmation)
    if (!options.skipUserMessage) {
      const userMsgId = 'msg_' + Date.now() + '_u';
      const userMsg = {
        id: userMsgId,
        role: 'user',
        // Keep the executable query unchanged, but show the scope-adjusted wording
        // for interpretation re-runs so the new turn never contradicts its answer.
        text: options.displayPromptText || promptText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        isScopeRerun: Boolean(options.sourceMessageId),
        scopeEditSummary: options.scopeEditSummary || null
      };
      conv.messages.push(userMsg);
      conv.updatedAt = Date.now();
      saveConversationsToStorage();
      renderActiveConversation();
    }

    // Clear questions get an interpretation confirmation gate. Questions that are
    // already ambiguous continue to the Agent's dedicated clarification gate.
    if (!options.interpretationConfirmed && !options.clarificationPayload && !options.scopeConfirmation && !options.interpretationOverride && !options.retryAttempt) {
      const directFixture = window.AriaMock.QUERY_RESPONSES[promptText];
      const questionScope = window.AriaScope.parseQuestionScope(promptText);
      const scopeConflict = window.AriaScope.detectScopeConflicts(state.selectedScope, questionScope);
      const securityDecision = window.AriaMock.checkSecurityGateways(promptText, state.currentUser);
      const requiresClarification = Boolean((directFixture && directFixture.type === 'clarification') || scopeConflict);

      if (!requiresClarification && !securityDecision.blocked) {
        const intent = window.AriaScope.parseQuestionIntent(promptText, window.DEMO_CONTEXT);
        const resolved = window.AriaScope.resolveSelectedScope(state.selectedScope, questionScope, window.DEMO_CONTEXT);
        const previewResult = { domain: resolved.domain || 'All Domains', originalQuery: promptText };
        const previewAppliedScope = window.AriaScope.buildAppliedInterpretation(previewResult, resolved, intent);
        const confirmationMsg = {
          id: 'msg_' + Date.now() + '_confirm',
          role: 'agent',
          type: 'clarification',
          subtype: 'interpretation_confirmation',
          originalQuery: promptText,
          resultsData: { ...previewResult, appliedScope: previewAppliedScope },
          appliedScope: previewAppliedScope,
          question: 'Is this the interpretation you want me to use?',
          reason: 'Confirm the intended metric and scope before the query runs.',
          understoodFields: {
            metric: intent.metric && intent.metric.label,
            grain: intent.breakdown && intent.breakdown.label,
            period: resolved.periodLabel,
            domain: resolved.domain || 'All business areas',
            projectScope: intent.projects && intent.projects.label,
            currency: /rate|progress|%/i.test(intent.metric && intent.metric.label) ? 'Not applicable (%)' : (/day|time/i.test(intent.metric && intent.metric.label) ? 'Not applicable (Days)' : (/count/i.test(intent.metric && intent.metric.label) ? 'Not applicable (Count)' : 'USD millions')),
            assumptions: ['Read-only query', resolved.calendarBasis ? `${resolved.calendarBasis} calendar basis` : 'Workspace calendar basis']
          },
          options: [
            { id: 'confirm_interpretation', label: 'Use this interpretation', payload: { type: 'interpretation_confirmation', confirmed: true } },
            { id: 'edit_scope', label: 'Edit scope before running', payload: { resolution: 'edit_scope' }, isEditScope: true }
          ],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now()
        };
        conv.messages.push(confirmationMsg);
        conv.updatedAt = Date.now();
        saveConversationsToStorage();
        renderActiveConversation();
        return;
      }
    }

    // 3. Initiate Thinking State
    state.isThinking = true;
    chatContainerEl.setAttribute('aria-busy', 'true');
    updateSendButtonState();
    state.activeAbortController = new AbortController();

    const agentMsgId = 'msg_' + Date.now() + '_a';
    renderThinkingBubble(agentMsgId);

    // 4. Invoke Isolated askAgent()
    window.askAgent(promptText, (stageIdx, stageObj, isRetry) => {
      updateThinkingStage(agentMsgId, stageIdx, stageObj, isRetry);
    }, {
      user: state.currentUser,
      domainScope: options.selectedScope && options.selectedScope.domain ? options.selectedScope.domain.value : state.activeDomainScope,
      timeRange: options.selectedScope && options.selectedScope.time ? options.selectedScope.time.preset : state.activeTimeRange,
      selectedScope: options.selectedScope || state.selectedScope,
      clarificationPayload: options.clarificationPayload,
      scopeConfirmation: options.scopeConfirmation,
      interpretationOverride: options.interpretationOverride,
      auditContext: {
        originalQuestion: options.originalQuestion || promptText,
        displayedQuestion: options.displayPromptText || promptText,
        interactionType: options.retryAttempt ? 'retry' : (options.runAgainOfMessageId ? 'run_again' : (options.clarificationPayload ? 'clarification_selection' : (options.sourceMessageId ? 'scope_rerun' : 'question'))),
        selectedClarification: options.clarificationPayload ? promptText : null
      },
      signal: state.activeAbortController.signal
    })
    .then((result) => {
      state.isThinking = false;
      chatContainerEl.setAttribute('aria-busy', 'false');
      state.activeAbortController = null;
      updateSendButtonState();

      // Mask sensitive columns for current role if required
      if (result.table && state.currentUser) {
        applyRoleColumnMasking(result.table, state.currentUser.role);
      }

      // If re-running from an edited interpretation, mark original response as superseded
      if (options.sourceMessageId) {
        const srcMsg = conv.messages.find(m => m.id === options.sourceMessageId);
        if (srcMsg) {
          srcMsg.isSuperseded = true;
        }
      }

      // Append Agent Message
      const resultPattern = result.type === 'results' ? inferResultPattern(result) : null;
      const agentMsg = {
        id: agentMsgId,
        role: 'agent',
        type: result.type,
        subtype: result.subtype || null,
        blockedType: result.blockedType || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        resultsData: result.type === 'results' ? result : null,
        appliedScope: result.appliedScope || null,
        understoodFields: result.understoodFields || null,
        sourceMessageId: options.sourceMessageId || null,
        runAgainOfMessageId: options.runAgainOfMessageId || null,
        runRootMessageId: options.runRootMessageId || null,
        runNumber: options.runNumber || 1,
        requestedScope: JSON.parse(JSON.stringify(options.selectedScope || state.selectedScope)),
        errorData: result.type === 'error' ? result.friendlyError : null,
        clarificationData: result.type === 'clarification' ? result : null,
        question: result.question || null,
        options: result.options || null,
        originalQuery: result.originalQuery || promptText,
        title: result.title || null,
        message: result.message || null,
        reason: result.reason || null,
        details: result.details || null,
        restrictedData: result.restrictedData || null,
        allowedScope: result.allowedScope || null,
        dataOwner: result.dataOwner || null,
        resultPattern,
        activeView: result.type === 'results' ? getDefaultResultView(resultPattern, result) : null,
        viewUserSelected: false,
        tablePage: 1,
        tableSearch: ''
      };

      conv.messages.push(agentMsg);
      conv.updatedAt = Date.now();
      saveConversationsToStorage();
      renderSidebarConversations();
      renderActiveConversation();
      if (result.type === 'results') {
        const recordCount = result.table && Array.isArray(result.table.rows) ? result.table.rows.length : 0;
        announceAppStatus(`Answer ready${recordCount ? `. ${recordCount} records returned` : ''}. Data as of ${result.dataAsOf || 'not recorded'}.`);
      } else if (result.type === 'clarification') {
        announceAppStatus('Clarification required. Choose an option before the query can continue.');
      } else if (result.type === 'error') {
        announceAppStatus(`Request failed. ${(result.friendlyError && result.friendlyError.message) || 'Review the result for details.'}`, 'assertive');
      } else {
        announceAppStatus(`${result.title || 'Request status updated'}. ${result.message || ''}`);
      }
      scrollToBottom();
    })
    .catch((err) => {
      state.isThinking = false;
      chatContainerEl.setAttribute('aria-busy', 'false');
      state.activeAbortController = null;
      updateSendButtonState();

      if (err.message && err.message.includes('cancelled')) {
        conv.messages.push({
          id: agentMsgId,
          role: 'agent',
          type: 'cancelled',
          originalQuery: options.originalQuestion || promptText,
          requestedScope: JSON.parse(JSON.stringify(options.selectedScope || state.selectedScope)),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          errorData: {
            kind: 'cancelled',
            title: 'Request stopped',
            message: 'You stopped this request before a result was produced.',
            reason: 'No result or data change was created.',
            suggestedActions: ['Ask the question again when you are ready.']
          }
        });
      } else {
        conv.messages.push({
          id: agentMsgId,
          role: 'agent',
          type: 'error',
          originalQuery: options.originalQuestion || promptText,
          requestedScope: JSON.parse(JSON.stringify(options.selectedScope || state.selectedScope)),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          errorData: {
            kind: 'service_error',
            title: 'Execution Error',
            message: String(err),
            reason: 'Client-side processing exception.',
            suggestedActions: ['Check input and try again.']
          }
        });
      }
      saveConversationsToStorage();
      renderActiveConversation();
      announceAppStatus(err.message && err.message.includes('cancelled')
        ? 'Request cancelled. No result was produced.'
        : 'Service error. The request could not be completed.', err.message && err.message.includes('cancelled') ? 'polite' : 'assertive');
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
    const showTechnicalPipeline = Boolean(state.settings.showPipelineDefault);
    thinkingRow.innerHTML = `
      <div class="thinking-container" role="status" aria-label="Aria is processing your question">
        <div class="thinking-header">
          <div class="thinking-title-area">
            <div class="pulse-spinner" aria-hidden="true"></div>
            <span>${showTechnicalPipeline ? 'Technical processing details' : 'Aria is preparing your answer'}</span>
          </div>
          <button type="button" class="btn-stop-generating" id="stopGeneratingBtn">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="12" rx="2"></rect></svg>
            Stop generating
          </button>
        </div>
        ${showTechnicalPipeline ? `<ul class="stage-trail-list" id="trail_${msgId}" aria-label="Technical query processing stages">
          ${stages.map((st, idx) => `
            <li class="stage-item ${idx === 0 ? 'active' : 'pending'}" id="st_${msgId}_${idx}" ${idx === 0 ? 'aria-current="step"' : ''} aria-label="${idx === 0 ? 'In progress' : 'Pending'}: ${escapeHtml(st.label)}">
              <div class="stage-dot" aria-hidden="true">${idx === 0 ? '●' : '○'}</div>
              <span class="stage-label">${escapeHtml(st.label)}</span>
            </li>
          `).join('')}
        </ul>` : `<p class="business-loading-copy" id="business_loading_${msgId}">Understanding your question and checking the available business data…</p>`}
      </div>
    `;

    chatContainerEl.appendChild(thinkingRow);
    announceAppStatus(`Aria is processing your question. ${stages[0] ? stages[0].label : 'Starting query processing'}.`);

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
    if (!trailEl) {
      const businessLoading = document.getElementById(`business_loading_${msgId}`);
      const businessStages = [
        'Understanding your question…',
        'Finding the relevant business information…',
        'Preparing the requested result…',
        'Checking scope and data boundaries…',
        'Finalising your answer…'
      ];
      if (businessLoading) businessLoading.textContent = businessStages[stageIdx] || 'Preparing your answer…';
      announceAppStatus(businessStages[stageIdx] || 'Aria is preparing your answer.');
      return;
    }

    if (isRetry) {
      const retryLi = document.createElement('li');
      retryLi.className = 'stage-item retry-active';
      retryLi.innerHTML = `
        <div class="stage-dot">⚠</div>
        <span class="stage-label">${escapeHtml(stageObj.label)}</span>
      `;
      trailEl.appendChild(retryLi);
      announceAppStatus(`Retrying: ${stageObj.label}`);
    } else {
      for (let i = 0; i < stageIdx; i++) {
        const item = document.getElementById(`st_${msgId}_${i}`);
        if (item) {
          item.className = 'stage-item completed';
          item.removeAttribute('aria-current');
          item.setAttribute('aria-label', `Completed: ${item.querySelector('.stage-label').textContent}`);
          const dot = item.querySelector('.stage-dot');
          if (dot) dot.innerHTML = '✓';
        }
      }
      const curItem = document.getElementById(`st_${msgId}_${stageIdx}`);
      if (curItem) {
        curItem.className = 'stage-item active';
        curItem.setAttribute('aria-current', 'step');
        curItem.setAttribute('aria-label', `In progress: ${stageObj.label}`);
        const dot = curItem.querySelector('.stage-dot');
        if (dot) dot.innerHTML = '●';
      }
      announceAppStatus(`Processing: ${stageObj.label}`);
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

    tableData.maskedColumnInfo = tableData.maskedColumnInfo || {};
    tableData.columns.forEach((colKey, colIdx) => {
      if (roleDef.maskedColumns.includes(colKey)) {
        tableData.types[colIdx] = 'masked';
        const lowerKey = String(colKey).toLowerCase();
        let reason = 'Sensitive business field hidden by the current data classification policy.';
        if (/phone|tax_id|personal_id/.test(lowerKey)) reason = 'Personal identifying information is restricted in your current access scope.';
        else if (/payroll|bonus|bank_account|salary/.test(lowerKey)) reason = 'Confidential workforce or payment information is restricted.';
        else if (/financing_rate|margin|contract_terms|unit_cost/.test(lowerKey)) reason = 'Commercially sensitive pricing or contract terms are restricted.';
        tableData.maskedColumnInfo[colKey] = { reason };
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
    const maskedColumns = tableData.columns.filter((column, index) => tableData.types[index] === 'masked');

    return `
      <div class="result-table-container" id="table_container_${msgId}">
        ${maskedColumns.length ? `
          <div class="masked-data-notice" role="note">
            <strong>Some fields are restricted</strong>
            <span>${maskedColumns.length} sensitive ${maskedColumns.length === 1 ? 'field is' : 'fields are'} masked. Available records and permitted fields are shown below.</span>
            <span>Review access guidance and contact the relevant data owner through your organisation’s approved process if these fields are required.</span>
          </div>
        ` : ''}
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <span style="font-weight: 600; font-size: 12px;">${escapeHtml(tableData.title || 'Query Records')}</span>
            <span style="font-size: 12px; color: var(--text-muted);">(${rows.length} records)</span>
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
                      <div class="restricted-column-header">
                        <span class="restricted-column-name">${escapeHtml(h)}</span>
                        <span class="restricted-column-badge">Restricted</span>
                        <span class="restricted-column-reason">${escapeHtml((tableData.maskedColumnInfo && tableData.maskedColumnInfo[tableData.columns[i]] && tableData.maskedColumnInfo[tableData.columns[i]].reason) || 'Sensitive field hidden by access policy.')}</span>
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
            return `<td><span class="td-masked" title="Restricted by data classification and access policy">Restricted</span></td>`;
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
          <div><strong>${escapeHtml(chartData.title || 'Data visualisation')}</strong><span class="chart-axis-summary">${chartType === 'line' ? 'X-axis: Period' : chartType === 'pie' ? 'Legend: Business category' : 'Y-axis: Business entity'} · ${chartType === 'pie' ? 'Share of total' : `Value axis: ${escapeHtml(chartData.unit || 'Value')}`}</span></div>
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
          const numericValue = Number(item.value) || 0;
          const barWidth = numericValue === 0 ? 0 : Math.max(2, Math.round((numericValue / maxVal) * 360));
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
              <text x="${barWidth === 0 ? 124 : Math.min(540, 130 + barWidth)}" y="${y + 16}" font-size="11" font-weight="600" fill="var(--text-primary)" font-family="var(--font-mono)">
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
  // 9B. R2-09 INTERPRETATION MODAL & EDIT LOGIC
  // =========================================================================
  function findUserQueryForAgentMsg(conv, agentMsg) {
    if (!conv || !agentMsg) return '';
    if (agentMsg.originalQuery) return agentMsg.originalQuery;
    const idx = conv.messages.findIndex(m => m.id === agentMsg.id);
    if (idx > 0) {
      for (let i = idx - 1; i >= 0; i--) {
        if (conv.messages[i].role === 'user') {
          return conv.messages[i].text;
        }
      }
    }
    return '';
  }

  function openEditInterpretationModal(conv, msgId) {
    if (!conv || !msgId || !editInterpretationModalBackdrop) return;
    const msg = conv.messages.find(m => m.id === msgId);
    if (!msg) return;

    const res = msg.resultsData || {};
    const scope = msg.appliedScope || res.appliedScope;
    if (!scope) return;

    const userQuery = findUserQueryForAgentMsg(conv, msg);
    const interpOpts = window.AriaScope.getEditableInterpretationOptions(res, userQuery);

    if (editInterpSourceMsgId) editInterpSourceMsgId.value = msgId;

    // Populate Metric
    if (editInterpMetric) {
      editInterpMetric.innerHTML = (interpOpts.metrics || []).map(m => `
        <option value="${escapeHtml(m.key)}" data-unit="${escapeHtml(m.unit || '')}" ${m.current ? 'selected' : ''}>${escapeHtml(m.label)}</option>
      `).join('');
      if (interpOpts.currentMetric) {
        if (!editInterpMetric.querySelector(`option[value="${CSS.escape(interpOpts.currentMetric)}"]`)) {
          const opt = document.createElement('option');
          opt.value = interpOpts.currentMetric;
          opt.textContent = (scope.metric && scope.metric.label) || interpOpts.currentMetric;
          opt.selected = true;
          editInterpMetric.prepend(opt);
        }
        editInterpMetric.value = interpOpts.currentMetric;
      }
    }

    // Populate Breakdown
    if (editInterpBreakdown) {
      editInterpBreakdown.innerHTML = (interpOpts.breakdowns || []).map(b => `
        <option value="${escapeHtml(b.key)}" ${b.current ? 'selected' : ''}>${escapeHtml(b.label)}</option>
      `).join('');
      if (interpOpts.currentBreakdown) {
        if (!editInterpBreakdown.querySelector(`option[value="${CSS.escape(interpOpts.currentBreakdown)}"]`)) {
          const opt = document.createElement('option');
          opt.value = interpOpts.currentBreakdown;
          opt.textContent = (scope.breakdown && scope.breakdown.label) || interpOpts.currentBreakdown;
          opt.selected = true;
          editInterpBreakdown.prepend(opt);
        }
        editInterpBreakdown.value = interpOpts.currentBreakdown;
      }
    }

    // Populate Domain
    if (editInterpDomain) {
      const activeDom = interpOpts.currentDomain || (scope.domain && (scope.domain.value || scope.domain.label)) || 'Finance';
      if (!editInterpDomain.querySelector(`option[value="${CSS.escape(activeDom)}"]`)) {
        const opt = document.createElement('option');
        opt.value = activeDom;
        opt.textContent = activeDom;
        opt.selected = true;
        editInterpDomain.prepend(opt);
      }
      editInterpDomain.value = activeDom;
    }

    // Populate Projects
    if (editInterpProjects) {
      const projectList = interpOpts.projectScopes || interpOpts.projects || [];
      editInterpProjects.innerHTML = projectList.map(p => `
        <option value="${escapeHtml(p.key)}" ${p.current ? 'selected' : ''}>${escapeHtml(p.label)}</option>
      `).join('');
      if (interpOpts.currentProject) {
        if (!editInterpProjects.querySelector(`option[value="${CSS.escape(interpOpts.currentProject)}"]`)) {
          const opt = document.createElement('option');
          opt.value = interpOpts.currentProject;
          opt.textContent = (scope.projectScope && scope.projectScope.label) || interpOpts.currentProject;
          opt.selected = true;
          editInterpProjects.prepend(opt);
        }
        editInterpProjects.value = interpOpts.currentProject;
      }
    }

    // Populate Period
    if (editInterpPeriod) {
      let activePer = interpOpts.currentPeriod || 'auto';
      if (activePer === 'current_year' || activePer === 'year_to_date') activePer = 'calendar_year';
      const periodList = interpOpts.periods || [];
      editInterpPeriod.innerHTML = periodList.map(p => `
        <option value="${escapeHtml(p.key)}" ${p.current ? 'selected' : ''}>${escapeHtml(p.label)}</option>
      `).join('');
      if (activePer && !editInterpPeriod.querySelector(`option[value="${CSS.escape(activePer)}"]`)) {
        const opt = document.createElement('option');
        opt.value = activePer;
        opt.textContent = (scope.time && scope.time.label) || activePer;
        opt.selected = true;
        editInterpPeriod.prepend(opt);
      }
      editInterpPeriod.value = activePer;
      if (editInterpPeriod.value === 'custom') {
        if (editInterpCustomDateRow) editInterpCustomDateRow.style.display = 'grid';
        if (editInterpStartDate && scope.time && scope.time.start) editInterpStartDate.value = scope.time.start;
        if (editInterpEndDate && scope.time && scope.time.end) editInterpEndDate.value = scope.time.end;
      } else {
        if (editInterpCustomDateRow) editInterpCustomDateRow.style.display = 'none';
      }
    }

    // Update Currency
    updateEditInterpCurrency();

    // Populate Assumptions
    if (editInterpAssumptionsList) {
      const assumptionsList = interpOpts.assumptions || [];
      editInterpAssumptionsList.innerHTML = assumptionsList.map(a => `
        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--text-primary); cursor: pointer; padding: 2px 0;">
          <input type="checkbox" class="interp-assumption-checkbox" value="${escapeHtml(a.label)}" ${a.checked ? 'checked' : ''} style="margin-top: 2px;">
          <span>${escapeHtml(a.label)}</span>
        </label>
      `).join('');
    }

    syncInterpProjectAndBreakdown();
    editInterpretationModalBackdrop.classList.add('open');
  }

  function updateEditInterpCurrency() {
    if (!editInterpCurrency || !editInterpMetric) return;
    const selectedOpt = editInterpMetric.options[editInterpMetric.selectedIndex];
    const metricVal = editInterpMetric.value;
    if (metricVal === 'avg_lead_time') {
      editInterpCurrency.value = 'Not applicable (Days)';
    } else if (metricVal === 'contract_count') {
      editInterpCurrency.value = 'Not applicable (Contracts)';
    } else if (metricVal === 'occupancy_rate' || metricVal === 'construction_progress' || metricVal === 'renewal_rate') {
      editInterpCurrency.value = 'Not applicable (%)';
    } else if (selectedOpt && selectedOpt.getAttribute('data-unit')) {
      const u = selectedOpt.getAttribute('data-unit');
      if (u === '%') editInterpCurrency.value = 'Not applicable (%)';
      else if (u === 'Days') editInterpCurrency.value = 'Not applicable (Days)';
      else if (u === 'Contracts') editInterpCurrency.value = 'Not applicable (Contracts)';
      else editInterpCurrency.value = u.includes('$') ? 'USD millions' : u;
    } else {
      editInterpCurrency.value = 'USD millions';
    }
  }

  function syncInterpProjectAndBreakdown() {
    if (!editInterpProjects || !editInterpBreakdown) return;
    const selectedProject = editInterpProjects.value;
    const selectedMetric = editInterpMetric ? editInterpMetric.value : '';
    let selectedBreakdown = editInterpBreakdown.value;

    const isSingleProject = Boolean(selectedProject && selectedProject !== 'all');
    const agingOpt = editInterpBreakdown.querySelector('option[value="by_aging"], option[value="by_aging_risk_bucket"], option[value="by_risk_bucket"]');
    const buyerOpt = editInterpBreakdown.querySelector('option[value="by_buyer"]');
    const projectOpt = editInterpBreakdown.querySelector('option[value="by_project"]');

    // Keep supported metric/breakdown pairs aligned in the skeleton.
    if (selectedMetric === 'contract_count' && buyerOpt) {
      editInterpBreakdown.value = 'by_buyer';
      selectedBreakdown = 'by_buyer';
    } else if (selectedMetric === 'contract_value' && projectOpt && selectedBreakdown === 'by_buyer') {
      editInterpBreakdown.value = 'by_project';
      selectedBreakdown = 'by_project';
    }

    // A single-project receivables drilldown is represented by buyer rows.
    // Portfolio results return to project aggregation when moving back to All.
    if (isSingleProject && selectedBreakdown === 'by_project' && buyerOpt) {
      editInterpBreakdown.value = 'by_buyer';
      selectedBreakdown = 'by_buyer';
    } else if (!isSingleProject && selectedBreakdown === 'by_buyer' && projectOpt && selectedMetric !== 'contract_count') {
      editInterpBreakdown.value = 'by_project';
      selectedBreakdown = 'by_project';
    }

    if (agingOpt) {
      if (isSingleProject) {
        if (!agingOpt.textContent.includes('(Portfolio only')) {
          agingOpt.setAttribute('data-orig-label', agingOpt.textContent);
          agingOpt.textContent = agingOpt.textContent + ' (Portfolio only in demo)';
        }
      } else {
        if (agingOpt.getAttribute('data-orig-label')) {
          agingOpt.textContent = agingOpt.getAttribute('data-orig-label');
          agingOpt.removeAttribute('data-orig-label');
        }
      }
    }

    if (editInterpDynamicHint) {
      if (isSingleProject && (selectedBreakdown === 'by_aging' || selectedBreakdown === 'by_aging_risk_bucket' || selectedBreakdown === 'by_risk_bucket')) {
        editInterpDynamicHint.textContent = 'Aging risk bucket breakdown is modeled at portfolio level (All active projects). Selecting this with an individual project will return a transparent unsupported scope notice.';
        editInterpDynamicHint.style.display = 'block';
      } else {
        editInterpDynamicHint.style.display = 'none';
        editInterpDynamicHint.textContent = '';
      }
    }
  }

  function buildScopeAdjustedQuestion(originalQuestion, scope) {
    let question = String(originalQuestion || '').trim();
    if (!question) return question;

    const periodLabel = scope.periodKey === 'custom' && scope.startDate && scope.endDate
      ? `${scope.startDate} to ${scope.endDate}`
      : (scope.periodKey === 'auto' ? 'No time restriction' : scope.period);
    const explicitPeriodPattern = /\b(?:all[- ]time|no time restriction|this calendar quarter|current calendar quarter|current quarter|previous calendar quarter|previous quarter|calendar year(?:\s+\d{4})?|FY\s*\d{4}|Q[1-4]\s+\d{4})\b/i;
    const hadExplicitPeriod = explicitPeriodPattern.test(question);

    if (hadExplicitPeriod && periodLabel) {
      question = question.replace(explicitPeriodPattern, periodLabel);
    }

    const appliedClauses = [];
    if (!hadExplicitPeriod && periodLabel) appliedClauses.push(`period: ${periodLabel}`);
    if (scope.project && scope.project !== 'All active projects' && scope.project !== 'All enterprise projects') {
      appliedClauses.push(`project: ${scope.project}`);
    }
    if (scope.domain && scope.domain !== 'Auto' && scope.domain !== 'All Domains') {
      appliedClauses.push(`domain: ${scope.domain}`);
    }
    if (scope.metric) appliedClauses.push(`metric: ${scope.metric}`);
    if (scope.grain) appliedClauses.push(`grain: ${scope.grain}`);

    if (appliedClauses.length > 0) {
      question = `${question.replace(/[?.!]+$/, '')} (Applied scope: ${appliedClauses.join('; ')})?`;
    }
    return question;
  }

  function handleApplyEditInterpretation() {
    const msgId = editInterpSourceMsgId ? editInterpSourceMsgId.value : null;
    const conv = getActiveConversation();
    if (!conv || !msgId) return;

    const srcMsg = conv.messages.find(m => m.id === msgId);
    if (!srcMsg) return;

    const userQuery = findUserQueryForAgentMsg(conv, srcMsg);
    if (!userQuery) {
      showToast('Could not find original user question.');
      return;
    }

    const selectedMetric = editInterpMetric ? editInterpMetric.value : null;
    const selectedBreakdown = editInterpBreakdown ? editInterpBreakdown.value : null;
    const selectedDomain = editInterpDomain ? editInterpDomain.value : null;
    const selectedProject = editInterpProjects ? editInterpProjects.value : null;
    const selectedPeriod = editInterpPeriod ? editInterpPeriod.value : 'auto';

    let startDate = null;
    let endDate = null;
    if (selectedPeriod === 'custom') {
      startDate = editInterpStartDate ? editInterpStartDate.value : null;
      endDate = editInterpEndDate ? editInterpEndDate.value : null;
      if (!startDate || !endDate) {
        showToast('Please select both start and end dates for custom date range.');
        return;
      }
      if (startDate > endDate) {
        showToast('Start date cannot be after end date.');
        return;
      }
    }

    const checkedAssumptions = editInterpAssumptionsList
      ? Array.from(editInterpAssumptionsList.querySelectorAll('.interp-assumption-checkbox:checked')).map(cb => cb.value)
      : [];

    const overrides = {
      metric: selectedMetric,
      breakdown: selectedBreakdown,
      domain: selectedDomain,
      projectScope: selectedProject,
      period: selectedPeriod,
      startDate: startDate,
      endDate: endDate,
      assumptions: checkedAssumptions
    };

    const selectedMetricLabel = editInterpMetric && editInterpMetric.selectedOptions[0]
      ? editInterpMetric.selectedOptions[0].textContent.trim() : selectedMetric;
    const selectedGrainLabel = editInterpBreakdown && editInterpBreakdown.selectedOptions[0]
      ? editInterpBreakdown.selectedOptions[0].textContent.trim() : selectedBreakdown;
    const selectedProjectLabel = editInterpProjects && editInterpProjects.selectedOptions[0]
      ? editInterpProjects.selectedOptions[0].textContent.trim() : selectedProject;
    const selectedPeriodLabel = editInterpPeriod && editInterpPeriod.selectedOptions[0]
      ? editInterpPeriod.selectedOptions[0].textContent.trim() : selectedPeriod;
    const selectedCurrencyLabel = editInterpCurrency ? editInterpCurrency.value : 'Not specified';
    const scopeEditSummary = [
      `Metric: ${selectedMetricLabel}`,
      `Grain: ${selectedGrainLabel}`,
      `Period: ${selectedPeriodLabel}`,
      `Project / domain: ${selectedProjectLabel} / ${selectedDomain}`,
      `Currency / unit: ${selectedCurrencyLabel}`,
      `Assumptions: ${checkedAssumptions.length ? checkedAssumptions.join('; ') : 'None'}`
    ].join(' · ');
    const displayPromptText = buildScopeAdjustedQuestion(userQuery, {
      metric: selectedMetricLabel,
      grain: selectedGrainLabel,
      periodKey: selectedPeriod,
      period: selectedPeriodLabel,
      startDate,
      endDate,
      project: selectedProjectLabel,
      domain: selectedDomain
    });

    const isPreRunConfirmation = srcMsg.subtype === 'interpretation_confirmation';
    // Completed results become superseded; a pre-run confirmation is instead
    // locked with the edited interpretation that will be executed.
    if (isPreRunConfirmation) {
      srcMsg.resolvedPayload = { type: 'interpretation_confirmation', edited: true };
      srcMsg.resolvedChoice = 'Edited interpretation';
      srcMsg.resolvedAt = Date.now();
      srcMsg.isLocked = true;
      delete srcMsg.clarificationDismissedAt;
    } else {
      srcMsg.isSuperseded = true;
    }
    saveConversationsToStorage();

    // Close modal
    if (editInterpretationModalBackdrop) {
      editInterpretationModalBackdrop.classList.remove('open');
    }

    // Re-run original query with overrides
    processUserPrompt(userQuery, {
      interpretationOverride: overrides,
      sourceMessageId: isPreRunConfirmation ? null : msgId,
      interpretationConfirmed: true,
      skipUserMessage: isPreRunConfirmation,
      scopeEditSummary,
      displayPromptText
    });

    showToast('Applying updated interpretation and re-running...');
  }

  function getExportContext(msg, conv) {
    const res = (msg && msg.resultsData) || {};
    const scope = (msg && msg.appliedScope) || res.appliedScope || {};
    const grain = scope.grain || scope.breakdown;
    const period = scope.time
      ? `${scope.time.label || scope.periodLabel || 'Not specified'}${scope.time.dateRange ? ` (${scope.time.dateRange})` : ''}`
      : (scope.periodLabel || 'Not specified');
    const currency = scope.currencyObj ? scope.currencyObj.label : (scope.currency || 'Not specified');
    const domain = scope.domain ? (scope.domain.label || scope.domain.value || scope.domain) : 'All available domains';
    const project = scope.projectScope ? (scope.projectScope.label || scope.projectScope.value || scope.projectScope) : 'All applicable projects';
    return [
      ['Export label', 'Demo — Synthetic data'],
      ['Question', findUserQueryForAgentMsg(conv, msg) || msg.originalQuery || 'Not recorded'],
      ['Metric', scope.metric ? (scope.metric.label || scope.metric.value || scope.metric) : 'Not specified'],
      ['Grain', grain ? (grain.label || grain.value || grain) : 'Not specified'],
      ['Period', period],
      ['Domain', domain],
      ['Project scope', project],
      ['Currency / unit', currency],
      ['Assumptions', Array.isArray(scope.assumptions) && scope.assumptions.length ? scope.assumptions.join('; ') : 'None recorded'],
      ['Data as of', res.dataAsOf || 'Not recorded'],
      ['Exported at', new Date().toISOString()]
    ];
  }

  function filterExportRows(table, searchQuery) {
    if (!table || !Array.isArray(table.rows)) return [];
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return [...table.rows];
    return table.rows.filter(row => Object.values(row).some(value => String(value ?? '').toLowerCase().includes(q)));
  }

  function encodeCsvCell(value) {
    return `"${String(value === undefined || value === null ? '' : value).replace(/"/g, '""')}"`;
  }

  function buildContextualCsv(msg, conv, rowMode) {
    const table = msg.resultsData.table;
    const filteredRows = filterExportRows(table, msg.tableSearch);
    const rows = rowMode === 'filtered' ? filteredRows : table.rows;
    const context = getExportContext(msg, conv);
    const columnCount = Math.max(2, table.headers.length);
    const csvRow = (cells) => [...cells, ...Array(Math.max(0, columnCount - cells.length)).fill('')].map(encodeCsvCell).join(',');
    const lines = [
      csvRow(['Metadata', 'Value']),
      ...context.map(([label, value]) => csvRow([label, value])),
      csvRow(['Row scope', rowMode === 'filtered' ? `Filtered rows (${rows.length} of ${table.rows.length}); filter: ${msg.tableSearch || 'none'}` : `All rows (${table.rows.length})`]),
      csvRow([]),
      csvRow(table.headers),
      ...rows.map(row => csvRow(table.columns.map((column, index) => table.types[index] === 'masked' ? '[RESTRICTED]' : row[column])))
    ];
    return `\uFEFF${lines.join('\r\n')}`;
  }

  function contextualClipboardText(msg, conv, includeTable) {
    const context = getExportContext(msg, conv);
    const res = msg.resultsData || {};
    let text = context.map(([label, value]) => `${label}: ${value}`).join('\n');
    text += `\n\nAnswer:\n${res.answer || res.answerConcise || msg.message || ''}`;
    if (includeTable && res.table) {
      const rows = filterExportRows(res.table, msg.tableSearch);
      text += `\n\nRows: ${msg.tableSearch ? `Filtered (${rows.length} of ${res.table.rows.length}) using “${msg.tableSearch}”` : `All rows (${rows.length})`}\n`;
      text += [
        res.table.headers.join('\t'),
        ...rows.map(row => res.table.columns.map((column, index) => res.table.types[index] === 'masked' ? '[RESTRICTED]' : String(row[column] ?? '')).join('\t'))
      ].join('\n');
    }
    return text;
  }

  function openCsvExportOptions(msg, conv, trigger) {
    const table = msg && msg.resultsData && msg.resultsData.table;
    if (!table) return;
    const filteredRows = filterExportRows(table, msg.tableSearch);
    const hasFilter = Boolean(String(msg.tableSearch || '').trim());
    pendingCsvExport = { msg, conv, trigger };
    csvExportAllLabel.textContent = `All rows (${table.rows.length})`;
    csvExportFilteredLabel.textContent = `Filtered rows (${filteredRows.length} of ${table.rows.length})`;
    csvExportFilterDescription.textContent = hasFilter ? `Current filter: “${msg.tableSearch}”` : 'Apply a table filter first to export a subset.';
    const filteredRadio = csvExportFilteredOption.querySelector('input');
    filteredRadio.disabled = !hasFilter;
    csvExportFilteredOption.classList.toggle('is-disabled', !hasFilter);
    csvExportModalBackdrop.querySelector('input[value="all"]').checked = true;
    csvExportContextPreview.innerHTML = getExportContext(msg, conv).slice(2, 10).map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
    csvExportModalBackdrop.classList.add('open');
    requestAnimationFrame(() => csvExportModalBackdrop.querySelector('input[value="all"]').focus());
  }

  function closeCsvExportOptions() {
    csvExportModalBackdrop.classList.remove('open');
    if (pendingCsvExport && pendingCsvExport.trigger && document.contains(pendingCsvExport.trigger)) pendingCsvExport.trigger.focus();
    pendingCsvExport = null;
  }

  // =========================================================================
  // 10. EVENT HANDLERS ON CHAT INTERACTIONS (Group A, B, C)
  // =========================================================================
  function attachConversationEventHandlers(conv) {
    // 1. Export Conversation
    const exportBtn = document.getElementById('exportConvBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        let md = `# ${conv.title}\n\n> **Demo • Synthetic data** — This export comes from a prototype. Persona access and masking are simulated and do not demonstrate production security enforcement.\n\n*Exported from Aria on ${new Date().toLocaleString()}*\n\n---\n\n`;
        conv.messages.forEach((m) => {
          if (m.role === 'user') {
            md += `### User Query (${m.time})\n> ${m.text}\n\n`;
          } else {
            const scope = m.appliedScope || (m.resultsData && m.resultsData.appliedScope);
            if (scope) {
              md += `#### How I interpreted your question\n`;
              if (scope.metric) md += `- **Metric:** ${scope.metric.label || scope.metric} (${scope.metric.source || 'Standard'})\n`;
              const grain = scope.grain || scope.breakdown;
              if (grain) md += `- **Grain:** ${grain.label || grain} (${grain.source || 'Standard'})\n`;
              if (scope.domain) md += `- **Business area:** ${scope.domain.label || scope.domain.value || scope.domain}\n`;
              if (scope.projectScope) md += `- **Project scope:** ${scope.projectScope.label || scope.projectScope}\n`;
              if (scope.time) md += `- **Period & dates:** ${scope.time.label || scope.periodLabel}${scope.time.dateRange ? ` (${scope.time.dateRange})` : ''}\n`;
              else if (scope.periodLabel) md += `- **Period & dates:** ${scope.periodLabel}\n`;
              const exportCurrency = scope.currencyObj ? scope.currencyObj.label : scope.currency;
              if (exportCurrency) md += `- **Currency / Unit:** ${exportCurrency}\n`;
              if (scope.assumptions && scope.assumptions.length > 0) {
                md += `- **Assumptions:**\n`;
                scope.assumptions.forEach(a => { md += `  - ${a}\n`; });
              }
              md += `\n`;
            }
            if (m.resultsData) {
              md += `- **Data as of:** ${m.resultsData.dataAsOf || 'Not recorded'}\n`;
              md += `- **Result label:** Demo — Synthetic data\n\n`;
            }
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

    chatContainerEl.querySelectorAll('.btn-revise-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msg = conv.messages.find(m => m.id === btn.getAttribute('data-msg-id'));
        const text = msg ? findUserQueryForAgentMsg(conv, msg) : '';
        if (text) {
          chatInputEl.value = text;
          chatInputEl.focus();
          updateSendButtonState();
          showToast('Question ready to revise.');
        }
      });
    });

    chatContainerEl.querySelectorAll('.btn-edit-failed-scope').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msg = conv.messages.find(m => m.id === btn.getAttribute('data-msg-id'));
        const text = msg ? (msg.originalQuery || findUserQueryForAgentMsg(conv, msg)) : '';
        if (text) {
          chatInputEl.value = text;
          updateSendButtonState();
        }
        if (scopeEditorBarEl) {
          scopeEditorBarEl.classList.remove('scope-editor-pulse');
          void scopeEditorBarEl.offsetWidth;
          scopeEditorBarEl.classList.add('scope-editor-pulse');
          scopeEditorBarEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        requestAnimationFrame(() => {
          if (domainScopeSelectEl) domainScopeSelectEl.focus();
          else if (timeRangeSelectEl) timeRangeSelectEl.focus();
        });
        showToast('Adjust domain or period, then send the prepared question. The previous result will remain unchanged.');
      });
    });

    chatContainerEl.querySelectorAll('.btn-access-guidance').forEach((btn) => {
      btn.addEventListener('click', () => {
        helpModalBackdrop.classList.add('open');
        setActiveHelpTab(helpTabScopeBtn);
        renderHelpTabContent('scope');
      });
    });

    // 4. Clarification is resolved in a modal and can only be confirmed once.
    chatContainerEl.querySelectorAll('.btn-open-clarification').forEach((btn) => {
      btn.addEventListener('click', () => openClarificationModal(btn.getAttribute('data-msg-id'), btn));
    });

    // Legacy chips may exist in conversations saved by an older prototype build.
    chatContainerEl.querySelectorAll('.clarification-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const rawPayload = chip.getAttribute('data-payload');
        const label = chip.getAttribute('data-label');
        const msgId = chip.getAttribute('data-msg-id');

        let parsedPayload = null;
        try {
          if (rawPayload && (rawPayload.startsWith('{') || rawPayload.startsWith('['))) {
            parsedPayload = JSON.parse(rawPayload);
          }
        } catch (e) {
          parsedPayload = null;
        }

        if (parsedPayload && parsedPayload.resolution === 'edit_scope') {
          if (scopeEditorBarEl) {
            scopeEditorBarEl.classList.remove('scope-editor-pulse');
            void scopeEditorBarEl.offsetWidth;
            scopeEditorBarEl.classList.add('scope-editor-pulse');
            scopeEditorBarEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          if (timeRangeSelectEl) {
            timeRangeSelectEl.focus();
          }
          showToast('Scope editor highlighted. Adjust domain or period above.');
          return;
        }

        // Mark this clarification message as resolved
        if (msgId) {
          const targetMsg = conv.messages.find((m) => m.id === msgId);
          if (targetMsg) {
            targetMsg.resolvedPayload = label;
            targetMsg.resolvedChoice = label;
            saveConversationsToStorage();
          }
        }

        if (parsedPayload && parsedPayload.type === 'scope_resolution') {
          const clarificationMsg = msgId ? conv.messages.find((m) => m.id === msgId) : null;
          const originalQuestion = clarificationMsg ? findUserQueryForAgentMsg(conv, clarificationMsg) : label;
          processUserPrompt(label, { scopeConfirmation: parsedPayload, originalQuestion });
          return;
        }

        const clarificationMsg = msgId ? conv.messages.find((m) => m.id === msgId) : null;
        const originalQuestion = clarificationMsg ? findUserQueryForAgentMsg(conv, clarificationMsg) : label;
        processUserPrompt(label, { clarificationPayload: rawPayload, originalQuestion });
      });
    });

    // 5. Follow-up Chips
    chatContainerEl.querySelectorAll('.followup-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        const sourceMsg = conv.messages.find((item) => item.id === chip.getAttribute('data-source-msg-id'));
        const inheritedScope = sourceMsg && (sourceMsg.appliedScope || (sourceMsg.resultsData && sourceMsg.resultsData.appliedScope));
        if (inheritedScope) applyExecutionScopeToEditor(buildSavedExecutionOptions(inheritedScope).selectedScope);
        chatInputEl.value = query;
        chatInputEl.focus();
        updateSendButtonState();
        chatInputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast(inheritedScope
          ? 'Follow-up prepared with the previous answer scope. Review or edit scope, then press Ask.'
          : 'Follow-up prepared. Review the scope, then press Ask.');
      });
    });

    // 5B. Edit Interpretation Button (R2-09)
    chatContainerEl.querySelectorAll('.btn-edit-interpretation').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        openEditInterpretationModal(conv, msgId);
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
          msg.viewUserSelected = true;
          saveConversationsToStorage();
          renderActiveConversation();
        }
      });
    });

    // 7. In-Table Filter Search
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
        const card = btn.closest('.agent-response-card');
        const msg = card ? conv.messages.find(item => item.id === card.getAttribute('data-msg-id')) : null;
        const text = msg && msg.resultsData ? contextualClipboardText(msg, conv, false) : btn.getAttribute('data-answer');
        navigator.clipboard.writeText(text);
        showToast('Answer copied with scope and freshness context');
      });
    });

    // 12. Copy Table
    chatContainerEl.querySelectorAll('.btn-copy-table').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg && msg.resultsData && msg.resultsData.table) {
          navigator.clipboard.writeText(contextualClipboardText(msg, conv, true));
          const filtered = Boolean(String(msg.tableSearch || '').trim());
          showToast(`${filtered ? 'Filtered records' : 'All records'} copied with scope and freshness context`);
        }
      });
    });

    // 13. Download Table CSV
    chatContainerEl.querySelectorAll('.btn-export-csv').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (msg && msg.resultsData && msg.resultsData.table) {
          openCsvExportOptions(msg, conv, btn);
        }
      });
    });

    // 14. Pin/Save Answer
    chatContainerEl.querySelectorAll('.btn-pin-answer').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const userId = state.currentUser ? state.currentUser.id : 'default';
        const list = window.AriaMock.getSavedInsights(userId);

        const existing = list.find(a => a.sourceMessageId === msgId);

        if (existing) {
          const removed = window.AriaMock.removeSavedInsight(userId, existing.id);
          if (removed) {
            showToast('Insight removed from saved');
            renderActiveConversation();
          } else {
            showToast('Failed to remove insight');
          }
        } else {
          const msgIdx = conv.messages.findIndex(m => m.id === msgId);
          const msg = conv.messages[msgIdx];
          if (msg && msg.resultsData) {
            let question = conv.title || 'Saved Query';
            for (let i = msgIdx - 1; i >= 0; i--) {
              if (conv.messages[i].role === 'user') {
                question = conv.messages[i].text;
                break;
              }
            }

            const scopeToSave = msg.appliedScope || msg.resultsData.appliedScope || { domain: 'Auto', timeRange: 'auto' };
            const queryData = {
              id: 'sq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              type: 'query',
              title: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
              question: question,
              scope: JSON.parse(JSON.stringify(scopeToSave)),
              executionOptions: buildSavedExecutionOptions(scopeToSave),
              latestResult: JSON.parse(JSON.stringify(msg.resultsData)),
              resultPattern: msg.resultPattern || msg.pattern || 'default',
              sourceMessageId: msg.id,
              sourceConversationId: conv.id,
              savedAt: Date.now(),
              lastRefreshedAt: null,
              dataAsOf: msg.resultsData.dataAsOf || Date.now(),
              refreshCount: 0,
              canRefresh: true,
              legacy: false
            };

            const saved = window.AriaMock.saveQuery(userId, queryData);
            if (saved) {
              showToast('Query saved successfully');
              renderActiveConversation();
            } else {
              showToast('Failed to save query');
            }
          }
        }
      });
    });

    // 15. Run successful answers again with their stored scope. The prior
    // answer remains visible until the new version finishes.
    chatContainerEl.querySelectorAll('.btn-run-again').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.isThinking) {
          showToast('Wait for the current run to finish before starting another.');
          return;
        }
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((item) => item.id === msgId);
        if (!msg || !msg.resultsData) return;
        const originalQuestion = msg.originalQuery || findUserQueryForAgentMsg(conv, msg);
        const storedScope = msg.appliedScope || msg.resultsData.appliedScope;
        if (!originalQuestion || !storedScope) {
          showToast('Run again is unavailable because the original question or scope is missing.');
          return;
        }
        const execution = buildSavedExecutionOptions(storedScope);
        const runRootMessageId = msg.runRootMessageId || msg.id;
        const priorRuns = conv.messages
          .filter(item => item.id === runRootMessageId || item.runRootMessageId === runRootMessageId)
          .map(item => Number(item.runNumber) || 1);
        const nextRunNumber = Math.max(...priorRuns, 1) + 1;
        processUserPrompt(originalQuestion, {
          skipUserMessage: true,
          originalQuestion,
          displayPromptText: originalQuestion,
          interpretationOverride: execution.interpretationOverride,
          selectedScope: execution.selectedScope,
          runAgainOfMessageId: msg.id,
          runRootMessageId,
          runNumber: nextRunNumber
        });
        showToast('Running again with the scope saved on this answer.');
      });
    });

    // Retry is reserved for failed or cancelled executions and keeps the
    // failed event in the conversation as evidence.
    chatContainerEl.querySelectorAll('.btn-retry').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.isThinking) return;
        const msg = conv.messages.find(item => item.id === btn.getAttribute('data-msg-id'));
        if (!msg || (msg.type !== 'error' && msg.type !== 'cancelled')) return;
        const originalQuestion = msg.originalQuery || findUserQueryForAgentMsg(conv, msg);
        if (!originalQuestion) {
          showToast('Retry is unavailable because the original question is missing.');
          return;
        }
        processUserPrompt(originalQuestion, {
          skipUserMessage: true,
          retryAttempt: true,
          originalQuestion,
          selectedScope: msg.requestedScope || state.selectedScope
        });
        showToast('Retrying the failed run with its original scope.');
      });
    });

    // 16. Feedback Buttons
    chatContainerEl.querySelectorAll('.btn-feedback-up').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((m) => m.id === msgId);
        if (!msg) return;
        const isUpdate = Boolean(msg.feedback);
        msg.feedback = { type: 'up', reason: null, comment: '', submittedAt: Date.now() };
        window.AriaMock.recordFeedback('up', null, null, conv.title, state.currentUser, {
          conversationId: conv.id, messageId: msg.id, replaceExisting: isUpdate
        });
        saveConversationsToStorage();
        renderActiveConversation();
        showToast(isUpdate ? 'Feedback updated for this answer.' : 'Feedback saved for this answer.');
      });
    });

    chatContainerEl.querySelectorAll('.btn-feedback-down').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.currentFeedbackMessageId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find((item) => item.id === state.currentFeedbackMessageId);
        const savedFeedback = msg && msg.feedback && msg.feedback.type === 'down' ? msg.feedback : null;
        state.currentFeedbackReason = savedFeedback ? savedFeedback.reason : 'Wrong number';
        feedbackCommentInput.value = savedFeedback ? (savedFeedback.comment || '') : '';
        feedbackReasonChips.querySelectorAll('.reason-chip-btn').forEach((reasonBtn) => {
          reasonBtn.classList.toggle('selected', reasonBtn.textContent.trim() === state.currentFeedbackReason);
        });
        submitFeedbackBtn.textContent = savedFeedback ? 'Update feedback' : 'Save feedback';
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

    // 19. Review Scope & Sources Inspector
    chatContainerEl.querySelectorAll('.btn-inspect-scope').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const msg = conv.messages.find(item => item.id === msgId);
        if (msg) openEvidenceDesk(msg);
      });
    });
  }

  // =========================================================================
  // 11. SOURCE TABLE INSPECTION MODAL (Group B)
  // =========================================================================
  function getVerifiedQuestionForSource(tableName) {
    const source = String(tableName || '').split('.').pop();
    const mappings = {
      projects: 'Show total active contract value by project in calendar year 2026',
      units: 'What is the current occupied-unit rate by project?',
      sales_contracts: 'Show total active contract value by project in calendar year 2026',
      customers: 'Break down Skyline Residences overdue installments by buyer contract',
      payment_schedules: 'Which projects have the highest outstanding buyer installments in 2026?',
      payment_installments: 'Which projects have the highest outstanding buyer installments in 2026?',
      construction_progress: 'Compare latest construction progress across active project phases',
      project_phases: 'Compare latest construction progress across active project phases',
      lease_contracts: 'What is the current occupied-unit rate by project?',
      tenants: 'What is the current occupied-unit rate by project?',
      service_contracts: 'Which active service contracts expire in the next 60 days?',
      vendors: 'List active property service vendors with their category and rating',
      audit_logs: 'Summarise allow, mask, and deny decisions in recent query audit logs',
      data_access_policies: 'Show masked fields configured for the Sales Manager role'
    };
    return mappings[source] || '';
  }

  function openSourceTableModal(tableName) {
    const tableDef = window.AriaMock.SCHEMA_CATALOG.find((t) => t.name === tableName) || {
      name: tableName,
      domain: 'Enterprise Data Mart',
      records: '10,000+',
      description: 'Enterprise operational database table.',
      columns: []
    };

    const businessSource = getBusinessSourceDefinition(tableName);
    const verifiedQuestion = getVerifiedQuestionForSource(tableName);
    sourceTableModalTitle.textContent = businessSource.label;
    sourceTableModalBody.innerHTML = `
      <div class="schema-table-card business-source-overview">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="brand-badge">${escapeHtml(tableDef.domain)}</span>
          <span class="prototype-source-label">Prototype source</span>
        </div>
        <p>${escapeHtml(businessSource.definition)}</p>
        <dl class="source-definition-grid">
          <div><dt>Business owner</dt><dd>${escapeHtml(businessSource.owner)}</dd></div>
          <div><dt>Record grain</dt><dd>${escapeHtml(businessSource.grain)}</dd></div>
          <div><dt>Refresh cadence</dt><dd>${escapeHtml(businessSource.cadence)}</dd></div>
          <div><dt>Metric calculation</dt><dd>${escapeHtml(businessSource.calculation)}</dd></div>
          <div><dt>Exclusions</dt><dd>${escapeHtml(businessSource.exclusions)}</dd></div>
        </dl>
      </div>

      <details class="technical-source-details">
        <summary>Technical schema</summary>
        <p class="technical-source-name">Physical table: <code>${escapeHtml(tableDef.name)}</code> &middot; ${escapeHtml(String(tableDef.records))} demo rows &middot; Primary key: <code>${escapeHtml(tableDef.pk || 'id')}</code></p>
        <div style="max-height: 180px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <table class="result-data-table" style="font-size: 12px;">
            <thead><tr><th>Column</th><th>Data Type</th><th>Attributes</th></tr></thead>
            <tbody>
              ${(tableDef.columns || []).map((col) => `
                <tr>
                  <td><code>${escapeHtml(col.name)}</code></td>
                  <td>${escapeHtml(col.type)}</td>
                  <td>${col.isPk ? '<span class="brand-badge">PK</span>' : (col.isFk ? '<span class="brand-badge">FK</span>' : (col.isSensitive ? '<span class="technical-sensitive-label">Restricted</span>' : ''))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </details>

      ${verifiedQuestion ? `<div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
        <button type="button" class="btn-new-chat ask-about-table-btn" data-query="${escapeHtml(verifiedQuestion)}" style="width: auto; padding: 6px 14px;">Use verified question</button>
      </div>` : '<div class="definition-coverage-note">Technical source available · No verified business question is attached to this source.</div>'}
    `;

    const askSourceButton = sourceTableModalBody.querySelector('.ask-about-table-btn');
    if (askSourceButton) {
      askSourceButton.addEventListener('click', () => {
        sourceTableModalBackdrop.classList.remove('open');
        chatInputEl.value = verifiedQuestion;
        chatInputEl.focus();
        updateSendButtonState();
        if (typeof updateRailActiveState === 'function') showBusinessWorkspaceView('ask');
      });
    }

    sourceTableModalBackdrop.classList.add('open');
  }

  // =========================================================================
  // WORKSPACE RAIL ACTIVE STATE CONTROLLER (Requirement A)
  // =========================================================================
  function updateRailActiveState(activeItem = 'ask') {
    if (railAskBtn) railAskBtn.classList.toggle('active', activeItem === 'ask');
    if (savedAnswersBtn) savedAnswersBtn.classList.toggle('active', activeItem === 'saved');
    if (railDataGuideBtn) railDataGuideBtn.classList.toggle('active', activeItem === 'data_guide');
  }

  function showBusinessWorkspaceView(viewName, options = {}) {
    const focusComposer = options.focusComposer !== false;
    const chatViewport = document.getElementById('chatViewport');
    const savedInsightsViewport = document.getElementById('savedInsightsViewport');

    // Close drawers/inspectors if switching away
    if (viewName === 'ask' || viewName === 'saved') {
      if (typeof closeScopeInspector === 'function') closeScopeInspector();
      if (dataExplorerDrawer && dataExplorerDrawer.classList.contains('open')) {
        dataExplorerDrawer.classList.remove('open');
      }
      if (window.innerWidth <= 820 && sidebarEl) {
        sidebarEl.classList.remove('open');
      }
    }

    if (viewName === 'ask') {
      if (chatViewport) chatViewport.style.display = 'flex';
      if (savedInsightsViewport) savedInsightsViewport.style.display = 'none';
      updateRailActiveState('ask');
      if (focusComposer && chatInputEl && window.innerWidth > 820) chatInputEl.focus();
    } else if (viewName === 'saved') {
      if (chatViewport) chatViewport.style.display = 'none';
      if (savedInsightsViewport) savedInsightsViewport.style.display = 'flex';
      updateRailActiveState('saved');
      if (typeof renderSavedInsights === 'function') renderSavedInsights();
    } else if (viewName === 'data_guide') {
      updateRailActiveState('data_guide');
    }
  }

  // =========================================================================
  // SCOPE & SOURCES CONTEXTUAL INSPECTOR (Requirement B)
  // =========================================================================
  let activeScopeInspectorTriggerBtn = null;

  function renderScopeInspectorContent(msg, conv) {
    if (!scopeInspectorBody) return;
    const res = msg.resultsData || {};
    const scope = msg.appliedScope || res.appliedScope || {};

    const userQuery = findUserQueryForAgentMsg(conv, msg) || 'Natural language question';

    const metricLabel = (scope.metric && scope.metric.label) ? scope.metric.label : 'Enterprise Records';
    const metricSource = (scope.metric && scope.metric.source) ? scope.metric.source : 'Inferred from question';

    const domainLabel = (scope.domain && (scope.domain.label || scope.domain.value)) ? (scope.domain.label || scope.domain.value) : (scope.domain || 'All Domains');
    const domainSource = (scope.domain && scope.domain.source) ? scope.domain.source : ((scope.source && scope.source.domain) ? scope.source.domain : 'Inferred from question');

    const projectLabel = (scope.projectScope && scope.projectScope.label) ? scope.projectScope.label : 'All enterprise projects';
    const projectSource = (scope.projectScope && scope.projectScope.source) ? scope.projectScope.source : 'All active portfolios';

    const timeLabel = (scope.time && scope.time.label) ? scope.time.label : (scope.periodLabel || 'No time restriction');
    const exactDates = (scope.time && scope.time.dateRange) ? scope.time.dateRange : (scope.dateRange || null);
    const timeSource = (scope.time && scope.time.source) ? scope.time.source : ((scope.source && scope.source.time) ? scope.source.time : 'No time restriction');

    const currencyLabel = scope.currency || ((scope.metric && scope.metric.unit) ? scope.metric.unit : 'USD millions');
    const assumptions = scope.assumptions || [];
    const dataFreshness = res.dataAsOf || 'Yesterday 23:59 UTC';
    const calendarBasis = scope.calendarBasis || 'Calendar';

    const formatBusinessSource = (name) => {
      return name.replace('enterprise_dw.', '').replace('dim_', '').replace('fct_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const sources = res.sources || [];

    scopeInspectorBody.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-section-label">Contextual Result</div>
        <div class="inspector-query-title">${escapeHtml(userQuery)}</div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-label">Scope Parameters</div>
        <div class="inspector-fields-list">
          <div class="inspector-field">
            <span class="inspector-field-label">Metric</span>
            <strong class="inspector-field-val">${escapeHtml(metricLabel)}</strong>
            <span class="scope-source-tag ${getInterpSourceClass(metricSource)}">${escapeHtml(metricSource)}</span>
          </div>

          <div class="inspector-field">
            <span class="inspector-field-label">Business Area</span>
            <strong class="inspector-field-val">${escapeHtml(domainLabel)}</strong>
            <span class="scope-source-tag ${getInterpSourceClass(domainSource)}">${escapeHtml(domainSource)}</span>
          </div>

          <div class="inspector-field">
            <span class="inspector-field-label">Project Scope</span>
            <strong class="inspector-field-val">${escapeHtml(projectLabel)}</strong>
            <span class="scope-source-tag ${getInterpSourceClass(projectSource)}">${escapeHtml(projectSource)}</span>
          </div>

          <div class="inspector-field">
            <span class="inspector-field-label">Period &amp; Exact Dates</span>
            <strong class="inspector-field-val">${escapeHtml(timeLabel)}${exactDates && !timeLabel.includes(exactDates) ? ` · <small>(${escapeHtml(exactDates)})</small>` : ''}</strong>
            <span class="scope-source-tag ${getInterpSourceClass(timeSource)}">${escapeHtml(timeSource)}</span>
          </div>

          <div class="inspector-field">
            <span class="inspector-field-label">Currency / Unit</span>
            <strong class="inspector-field-val">${escapeHtml(currencyLabel)}</strong>
            <span class="scope-source-tag source-standard">System standard</span>
          </div>
        </div>
      </div>

      ${assumptions.length > 0 ? `
        <div class="inspector-section">
          <div class="inspector-section-label">Assumptions (${assumptions.length})</div>
          <ul class="inspector-assumptions-list">
            ${assumptions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      
      <div class="inspector-section">
        <div class="inspector-section-label">Data Freshness &amp; Basis</div>
        <div class="inspector-freshness-box">
          <div>Data freshness: <strong>${escapeHtml(dataFreshness)}</strong></div>
          <div>Calendar basis: <strong>${escapeHtml(calendarBasis)}</strong></div>
          <div>Access view: <strong>${escapeHtml(state.currentUser ? state.currentUser.roleTitle : 'Default')}</strong></div>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-label">Business Sources &amp; Definitions</div>
        ${(scope && scope.metric) ? `<div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">${escapeHtml(scope.metric.label || 'Metric')}</div><div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">${escapeHtml(res.confidenceNote || 'Calculated for the applied scope and data date shown above.')}</div>` : ''}
        <div class="inspector-sources-list">
          ${sources.length > 0 ? sources.map(s => `
            <button type="button" class="inspector-source-pill source-badge-btn" data-table-name="${escapeHtml(s.name)}" title="Review technical source definition">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/></svg>
              <span>${escapeHtml(getBusinessSourceDefinition(s.name).label)}</span>
            </button>
          `).join('') : '<span style="font-size: 12px; color: var(--text-muted);">Standard enterprise ledger</span>'}
        </div>
      </div>

      ${res.plainEnglishExplanation ? `
        <div class="inspector-section">
          <div class="inspector-section-label">How this was calculated</div>
          <div style="font-size: 13px; color: var(--text-secondary); background: var(--bg-hover); padding: 8px; border-radius: 4px;">
            ${escapeHtml(res.plainEnglishExplanation)}
          </div>
        </div>
      ` : ''}

      <div class="inspector-section">
        <details class="sql-accordion" style="margin: 0;">
          <summary class="sql-summary" style="list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface); border: 1.5px solid var(--border-color); border-radius: 6px; font-weight: 600; color: var(--text-primary); transition: all 0.2s ease;">
            <div class="sql-summary-left" style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              <span>Review Data Logic (SQL)</span>
            </div>
          </summary>
          <pre class="sql-code-block" style="margin-top: 8px;"><code>${escapeHtml(res.sql || '-- No SQL executed')}</code></pre>
        </details>
      </div>
<div class="inspector-actions">
        <button type="button" class="action-tool-btn btn-edit-interpretation" data-msg-id="${msg.id}" style="width: 100%; justify-content: center; padding: 8px 12px;">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Edit scope parameters</span>
        </button>
      </div>
    `;

    // Attach listeners inside inspector
    scopeInspectorBody.querySelectorAll('.source-badge-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tableName = btn.getAttribute('data-table-name');
        openSourceTableModal(tableName);
      });
    });

    scopeInspectorBody.querySelectorAll('.btn-edit-interpretation').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        closeScopeInspector(false);
        openEditInterpretationModal(conv, msgId);
      });
    });
  }

  function openScopeInspector(msgId, triggerBtn = null) {
    activeScopeInspectorTriggerBtn = triggerBtn;
    const conv = getActiveConversation();
    if (!conv) return;
    const msg = conv.messages.find(m => m.id === msgId);
    if (!msg) return;

    renderScopeInspectorContent(msg, conv);

    if (scopeInspectorPanel) {
      scopeInspectorPanel.inert = false;
      scopeInspectorPanel.classList.add('open');
      scopeInspectorPanel.setAttribute('aria-hidden', 'false');
    }
    if (scopeInspectorBackdrop) {
      scopeInspectorBackdrop.classList.add('open');
    }
    if (closeScopeInspectorBtn) {
      closeScopeInspectorBtn.focus();
    }
  }

  function closeScopeInspector(restoreFocus = true) {
    if (scopeInspectorPanel) {
      scopeInspectorPanel.classList.remove('open');
      scopeInspectorPanel.setAttribute('aria-hidden', 'true');
      scopeInspectorPanel.inert = true;
    }
    if (scopeInspectorBackdrop) {
      scopeInspectorBackdrop.classList.remove('open');
    }
    if (restoreFocus && activeScopeInspectorTriggerBtn && typeof activeScopeInspectorTriggerBtn.focus === 'function') {
      try { activeScopeInspectorTriggerBtn.focus(); } catch (e) {}
    }
    activeScopeInspectorTriggerBtn = null;
  }

  // =========================================================================
  // 12. DATA EXPLORER & BUSINESS GLOSSARY (Group D)
  // =========================================================================
  const CK1_CAPABILITY_MAP = [
    { domain: 'Finance', capability: 'Receivables and aging', metrics: ['Outstanding receivables', 'Overdue receivables >60 days'], demo: 'available', ck1: 'partial', tables: ['invoices', 'payment_installments', 'payment_transactions', 'sales_contracts', 'customers', 'projects'], note: 'CK1 supports invoice and payment events; a receivables snapshot and aging view must be derived.' },
    { domain: 'Property Operations', capability: 'Service contract fees', metrics: ['Monthly service contract fee'], demo: 'available', ck1: 'covered', tables: ['service_contracts', 'vendors', 'projects'], note: 'Calculated from active property service agreements and their monthly fees.' },
    { domain: 'Sales & Contracts', capability: 'Sales contract portfolio', metrics: ['Active contract value', 'Contract count'], demo: 'available', ck1: 'covered', tables: ['sales_contracts', 'contract_parties', 'contract_amendments', 'customers', 'projects'], note: 'Direct CK1 coverage for signed sales contracts and amendments.' },
    { domain: 'Sales & Contracts', capability: 'Buyer receivables', metrics: ['Outstanding buyer receivables', 'Buyer installment receivables'], demo: 'available', ck1: 'covered', tables: ['sales_contracts', 'payment_schedules', 'payment_installments', 'payment_transactions', 'customers'], note: 'Outstanding balance is derived from scheduled installments minus settled transactions.' },
    { domain: 'Property Operations', capability: 'Active service vendors', metrics: ['Vendor rating', 'Active vendor count'], demo: 'available', ck1: 'covered', tables: ['vendors', 'service_contracts'], note: 'Uses active service vendors and the ratings included in the curated CK1 fixture.' },
    { domain: 'Procurement', capability: 'Pending purchase-order approvals', metrics: ['Pending PO value'], demo: 'limited', ck1: 'gap', tables: [], note: 'No purchase-order entity exists in CK1 v2.1, so this question is not offered as a runnable demo.' },
    { domain: 'Property Operations', capability: 'Supplier contract expiry', metrics: ['Active contracts expiring within 60 days'], demo: 'available', ck1: 'covered', tables: ['service_contracts', 'vendors', 'projects'], note: 'Uses active property service contracts and their contractual end dates.' },
    { domain: 'Projects & Property', capability: 'Construction progress and delay', metrics: ['Construction progress', 'Schedule variance'], demo: 'available', ck1: 'covered', tables: ['construction_progress', 'projects', 'project_phases', 'buildings'], note: 'Direct CK1 coverage at project and phase reporting grain.' },
    { domain: 'Projects & Property', capability: 'Contractual delay damages', metrics: ['Liquidated damages exposure'], demo: 'limited', ck1: 'partial', tables: ['sales_contracts', 'contract_amendments', 'construction_progress'], note: 'A governed damages-rate field or metric view is required before this question can run.' },
    { domain: 'Property Operations', capability: 'Occupancy and lease renewal', metrics: ['Occupancy rate', 'Lease renewal forecast'], demo: 'available', ck1: 'covered', tables: ['lease_contracts', 'units', 'buildings', 'projects', 'tenants'], note: 'Occupancy derives from active leases and rentable units; renewal forecasting needs agreed rules.' },
    { domain: 'Marketing & Workforce', capability: 'Marketing headcount budget variance', metrics: ['Headcount budget variance'], demo: 'limited', ck1: 'partial', tables: ['employees', 'budgets', 'cost_centers', 'marketing_campaigns'], note: 'Entities exist, but workforce-to-marketing cost-centre mapping needs governance.' },
    { domain: 'Security & Governance', capability: 'Role access, masking and audit', metrics: ['Policy decision', 'Query audit events'], demo: 'simulated', ck1: 'covered', tables: ['platform.data_access_policies', 'platform.roles', 'platform.system_users', 'platform.user_role_assignments', 'platform.audit_logs'], note: 'CK1 provides RBAC/ABAC and audit structures; demo enforcement remains simulated.' }
  ];

  const BUSINESS_GUIDE_DETAILS = {
    'Receivables and aging': { entity: 'Buyer receivables', definition: 'Amounts still owed by property buyers for due contractual installments, including overdue aging where settlement has not been confirmed.', question: 'Which projects have the highest outstanding buyer installments in 2026?', searchTerms: 'công nợ khoản phải thu debt balance unpaid aging' },
    'Service contract fees': { entity: 'Property service agreements', definition: 'Recurring monthly fees for active vendor service agreements, linked to the relevant project and service provider.', question: 'Compare monthly service contract fees by project and vendor' },
    'Sales contract portfolio': { entity: 'Property sales contracts', definition: 'Signed property sale agreements and their current contractual value, status, project, buyer, and approved amendments.', question: 'Show total active contract value by project in calendar year 2026' },
    'Buyer receivables': { entity: 'Buyer payment schedules', definition: 'Scheduled buyer installments less confirmed settled payments, traceable to the buyer contract and project.', question: 'Break down Skyline Residences overdue installments by buyer contract', searchTerms: 'công nợ khoản phải thu buyer debt unpaid' },
    'Active service vendors': { entity: 'Property service vendors', definition: 'Active vendors providing property services, including their service category and synthetic fixture rating.', question: 'List active property service vendors with their category and rating' },
    'Pending purchase-order approvals': { entity: 'Purchase-order approvals', definition: 'Purchase orders awaiting the required business approval, including their outstanding value and approval stage.', question: 'Show outstanding purchase orders pending executive sign-off' },
    'Supplier contract expiry': { entity: 'Service contracts', definition: 'Active supplier service agreements approaching their contractual end date within the requested date range.', question: 'Which active service contracts expire in the next 60 days?' },
    'Construction progress and delay': { entity: 'Project phases', definition: 'Latest reported completion and schedule variance for active construction phases within each project.', question: 'Compare latest construction progress across active project phases' },
    'Contractual delay damages': { entity: 'Contract delay obligations', definition: 'Pre-agreed contractual exposure associated with unexcused delivery delay beyond an applicable grace period.', question: 'What is the contractual delay liquidated damages clause for Parkview Heights?' },
    'Occupancy and lease renewal': { entity: 'Units and leases', definition: 'Occupancy derived from active leases and rentable units, with lease dates supporting renewal analysis.', question: 'What is the current occupied-unit rate by project?' },
    'Marketing headcount budget variance': { entity: 'Marketing workforce budgets', definition: 'Difference between planned and actual marketing headcount or workforce cost for an agreed reporting period.', question: 'Show total internal marketing headcount budget variance for FY2021' },
    'Role access, masking and audit': { entity: 'Data-access decisions', definition: 'Recorded allow, mask, and deny decisions used to review governed access and recent query activity.', question: 'Summarise allow, mask, and deny decisions in recent query audit logs' }
  };

  const GLOSSARY_EXAMPLE_QUESTIONS = {
    'Outstanding Receivables': 'Which projects have the highest outstanding buyer installments in 2026?',
    'Critical Path Delay': 'Compare latest construction progress across active project phases',
    'Ready-Mix Concrete': '',
    'Net Lettable Area (NLA)': 'What is the current occupied-unit rate by project?',
    'Liquidated Damages (LD)': '',
    'WALE (Weighted Avg Lease Expiry)': '',
    'Purchase Order Lead Time': '',
    'Collection Rate': ''
  };

  const CK1_ENGLISH_OVERRIDES = {
    'platform.audit_logs': { label: 'Data Access and Query Audit Logs', description: 'Audit events for data access and natural-language queries sent to the Agent.', grain: 'One data-access or Agent-query event.' },
    'platform.data_access_policies': { label: 'Data Access Policies', description: 'Governed allow, mask, and deny rules for protected data.', grain: 'One access policy for one role and table or column scope.' },
    'platform.departments': { label: 'Departments', description: 'Organisational departments used for workforce and access governance.', grain: 'One organisational department.' },
    'platform.roles': { label: 'Access Roles', description: 'Role-based access-control definitions used by the platform.', grain: 'One RBAC role.' },
    'platform.system_users': { label: 'System Users', description: 'Human and service accounts that can authenticate to the platform.', grain: 'One human or service account.' },
    'platform.user_role_assignments': { label: 'User Role Assignments', description: 'Role assignments granted to system users, optionally limited by project.', grain: 'One role assignment for one user.' }
  };

  function titleCaseSchemaName(name) {
    const acronyms = { id: 'ID', kyc: 'KYC', rbac: 'RBAC', crm: 'CRM', api: 'API', po: 'PO', url: 'URL' };
    return String(name || '').split('_').filter(Boolean)
      .map(word => acronyms[word.toLowerCase()] || word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function getEnglishSchemaCopy(table) {
    const override = CK1_ENGLISH_OVERRIDES[table.qualifiedName];
    if (override) return override;
    const label = titleCaseSchemaName(table.name);
    const singular = label.endsWith('ies') ? `${label.slice(0, -3)}y` : (label.endsWith('s') ? label.slice(0, -1) : label);
    return {
      label,
      description: `${label} records in the ${table.domain} domain.`,
      grain: `One ${singular.toLowerCase()} record.`
    };
  }

  let explorerActiveTab = 'capabilities';

  function useBusinessGuideQuestion(question) {
    if (!question) return;
    dataExplorerDrawer.classList.remove('open');
    chatInputEl.value = question;
    chatInputEl.focus();
    updateSendButtonState();
    showBusinessWorkspaceView('ask');
    showToast('Question added from Business Data Guide');
  }

  function bindBusinessGuideQuestionButtons() {
    explorerTabContent.querySelectorAll('.use-guide-question').forEach((btn) => {
      btn.addEventListener('click', () => useBusinessGuideQuestion(btn.getAttribute('data-query')));
    });
  }

  function renderDataExplorer() {
    const q = (explorerSearchInput.value || '').toLowerCase().trim();

    if (explorerActiveTab === 'capabilities') {
      const capabilities = CK1_CAPABILITY_MAP.filter((item) => {
        const detail = BUSINESS_GUIDE_DETAILS[item.capability] || {};
        return !q || [item.domain, item.capability, detail.entity, item.metrics.join(' '), detail.definition, detail.question, detail.searchTerms].join(' ').toLowerCase().includes(q);
      });
      const domains = [...new Set(CK1_CAPABILITY_MAP.map(item => item.domain))];
      const groupedDomains = [...new Set(capabilities.map(item => item.domain))];
      explorerTabContent.innerHTML = `
        <div class="business-guide-summary">
          <strong>What you can ask in this demo</strong>
          <p>Browse business concepts without needing table or column knowledge. Availability describes demo coverage only; it does not grant data access.</p>
          <div class="demo-domain-list" aria-label="Domains available in the demo">${domains.map(domain => `<span>${escapeHtml(domain)}</span>`).join('')}</div>
        </div>
        ${groupedDomains.map(domain => `
          <section class="business-guide-domain">
            <h3>${escapeHtml(domain)}</h3>
            ${capabilities.filter(item => item.domain === domain).map((item) => {
              const detail = BUSINESS_GUIDE_DETAILS[item.capability] || {};
              const statusLabel = item.demo === 'available' ? 'Available in demo' : item.demo === 'simulated' ? 'Simulated demo' : 'Limited demo';
              return `<article class="business-entity-card">
                <div class="business-entity-heading"><strong>${escapeHtml(detail.entity || item.capability)}</strong><span class="guide-availability ${escapeHtml(item.demo)}">${statusLabel}</span></div>
                <p class="business-definition">${escapeHtml(detail.definition || item.note)}</p>
                <div class="business-metrics"><span>Metrics</span>${item.metrics.map(metric => `<em>${escapeHtml(metric)}</em>`).join('')}</div>
                <div class="example-question"><span>Example question</span><p>${escapeHtml(detail.question || '')}</p></div>
                <button type="button" class="action-tool-btn use-guide-question" data-query="${escapeHtml(detail.question || '')}" ${item.demo === 'limited' ? 'disabled title="No verified demo answer is available for this capability yet."' : ''}>Use this question</button>
              </article>`;
            }).join('')}
          </section>
        `).join('') || '<div class="empty-state"><strong>No business concepts match this search.</strong><span>Try a domain, entity, metric, or definition such as “receivables” or “công nợ”.</span></div>'}
      `;
      bindBusinessGuideQuestionButtons();
      return;
    }

    if (explorerActiveTab === 'glossary') {
      let glossary = window.AriaMock.BUSINESS_GLOSSARY;
      if (q) {
        glossary = glossary.filter((g) => [g.term, g.definition, g.domain, g.synonyms.join(' '), g.term === 'Outstanding Receivables' ? 'công nợ khoản phải thu' : ''].join(' ').toLowerCase().includes(q));
      }
      explorerTabContent.innerHTML = glossary.map((g) => `
        <article class="schema-table-card business-definition-card">
          <div class="business-entity-heading"><strong>${escapeHtml(g.term)}</strong><span class="brand-badge">${escapeHtml(g.domain)}</span></div>
          <p class="business-definition">${escapeHtml(g.definition)}</p>
          <div class="definition-synonyms"><strong>Also known as:</strong> ${escapeHtml(g.synonyms.join(', '))}</div>
          ${GLOSSARY_EXAMPLE_QUESTIONS[g.term] ? `
            <div class="example-question"><span>Verified example question</span><p>${escapeHtml(GLOSSARY_EXAMPLE_QUESTIONS[g.term])}</p></div>
            <button type="button" class="action-tool-btn use-guide-question" data-query="${escapeHtml(GLOSSARY_EXAMPLE_QUESTIONS[g.term])}">Use this question</button>
          ` : '<div class="definition-coverage-note">Definition available · No verified CK1 demo question yet</div>'}
        </article>
      `).join('') || '<div class="empty-state">No business definitions match this search.</div>';
      bindBusinessGuideQuestionButtons();
      return;
    }

    if (explorerActiveTab === 'capabilities') {
      const capabilities = CK1_CAPABILITY_MAP.filter(item => !q || [item.domain, item.capability, item.metrics.join(' '), item.tables.join(' '), item.note].join(' ').toLowerCase().includes(q));
      const ck1 = window.CK1_SCHEMA || { tableCount: 0, version: 'CK1', schemaDate: 'Unknown' };
      explorerTabContent.innerHTML = `
        <div class="capability-map-summary">
          <strong>Demo UI ↔ CK1 capability map</strong>
          <span>${escapeHtml(ck1.version)} · ${escapeHtml(String(ck1.tableCount))} tables · schema date ${escapeHtml(ck1.schemaDate)}</span>
          <p>Coverage shows whether each UI metric can be grounded in the supplied CK1 schema. It does not imply production data is connected.</p>
        </div>
        ${capabilities.map(item => `
          <article class="capability-map-card">
            <div class="capability-map-heading">
              <div><span>${escapeHtml(item.domain)}</span><strong>${escapeHtml(item.capability)}</strong></div>
              <div class="capability-badges"><span class="capability-status ${escapeHtml(item.demo)}">Demo: ${escapeHtml(item.demo)}</span><span class="capability-status ${escapeHtml(item.ck1)}">CK1: ${escapeHtml(item.ck1)}</span></div>
            </div>
            <dl>
              <div><dt>Business metrics</dt><dd>${escapeHtml(item.metrics.join(', '))}</dd></div>
              <div><dt>CK1 source entities</dt><dd>${item.tables.length ? item.tables.map(table => `<code>${escapeHtml(table)}</code>`).join(' ') : '<span class="capability-gap-text">No CK1 entity mapped</span>'}</dd></div>
              <div><dt>Coverage note</dt><dd>${escapeHtml(item.note)}</dd></div>
            </dl>
          </article>
        `).join('') || '<div class="empty-state">No capabilities match this search.</div>'}
      `;
    } else if (explorerActiveTab === 'tables') {
      let tables = (window.CK1_SCHEMA && window.CK1_SCHEMA.tables) || [];
      if (q) {
        tables = tables.filter((t) => {
          const english = getEnglishSchemaCopy(t);
          return [t.qualifiedName, english.label, t.domain, english.description, english.grain, t.columns.map(column => column.name).join(' ')].join(' ').toLowerCase().includes(q);
        });
      }

      explorerTabContent.innerHTML = tables.map((t) => {
        const english = getEnglishSchemaCopy(t);
        const mockRows = window.CK1_MOCK_DATA ? window.CK1_MOCK_DATA.getRows(t.qualifiedName) : [];
        const fixtureKind = window.CK1_MOCK_DATA && window.CK1_MOCK_DATA.getFixtureKind ? window.CK1_MOCK_DATA.getFixtureKind(t.qualifiedName) : 'none';
        const previewColumns = mockRows.length ? t.columns.map(column => column.name) : [];
        return `
        <div class="schema-table-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="schema-table-name">${escapeHtml(english.label)}</span>
            <div class="schema-card-badges"><span class="brand-badge">${escapeHtml(t.domain)}</span>${mockRows.length ? `<span class="ck1-fixture-badge">${fixtureKind === 'curated' ? 'Curated' : 'Generated'} synthetic fixture · ${mockRows.length} rows</span>` : '<span class="ck1-no-fixture-badge">Schema only</span>'}</div>
          </div>
          <p>${escapeHtml(english.description)}</p>
          <div class="ck1-grain"><strong>Grain:</strong> ${escapeHtml(english.grain)}</div>
          <details class="technical-source-details">
            <summary>Technical schema · <code>${escapeHtml(t.qualifiedName)}</code> · ${t.columns.length} columns</summary>
            <div class="technical-column-list">${t.columns.map(column => `<code title="${escapeHtml(column.type)}">${escapeHtml(column.name)} <small>${escapeHtml(column.type)}</small></code>`).join('')}</div>
          </details>
          ${mockRows.length ? `<details class="ck1-mock-preview">
            <summary>Preview synthetic CK1 rows</summary>
            <div class="table-scroll-wrap"><table class="data-table ck1-preview-table">
              <thead><tr>${previewColumns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
              <tbody>${mockRows.slice(0, 3).map(row => `<tr>${previewColumns.map(column => `<td>${escapeHtml(typeof row[column] === 'object' && row[column] !== null ? JSON.stringify(row[column]) : String(row[column] ?? '—'))}</td>`).join('')}</tr>`).join('')}</tbody>
            </table></div>
          </details>` : ''}
          <div class="technical-source-name" hidden>
            PK: <code>${t.pk}</code> • ${t.columns.length} columns • ${t.records} records
          </div>
        </div>
      `; }).join('') || '<div class="empty-state">No CK1 schema entities match this search.</div>';
    } else {
      let glossary = window.AriaMock.BUSINESS_GLOSSARY;
      if (q) {
        glossary = glossary.filter((g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q) || g.synonyms.some((s) => s.toLowerCase().includes(q)));
      }

      explorerTabContent.innerHTML = glossary.map((g) => `
        <div class="schema-table-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 13px; color: var(--text-primary);">${escapeHtml(g.term)}</span>
            <span class="brand-badge" style="font-size: 12px;">${escapeHtml(g.domain)}</span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(g.definition)}</p>
          <div style="font-size: 12px; color: var(--text-muted);">
            <strong>Synonyms:</strong> ${escapeHtml(g.synonyms.join(', '))}
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
            Technical mappings: ${g.tables.map((tbl) => `<code>${tbl}</code>`).join(' ')}
          </div>
        </div>
      `).join('');
    }
  }

  // =========================================================================
  // 13. SAVED INSIGHTS VIEW
  // =========================================================================
  function savedResultFingerprint(result) {
    if (!result) return '';
    const serialized = JSON.stringify(result);
    let hash = 5381;
    for (let i = 0; i < serialized.length; i++) hash = ((hash << 5) + hash) ^ serialized.charCodeAt(i);
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function createRefreshedFixtureResult(rawResult, item) {
    const refreshedAt = Date.now();
    const previousRevision = Number(item && item.latestResult && item.latestResult.refreshMetadata && item.latestResult.refreshMetadata.fixtureRevision) || 0;
    const result = JSON.parse(JSON.stringify(rawResult));
    result.refreshMetadata = {
      runId: `refresh_${refreshedAt}_${previousRevision + 1}`,
      refreshedAt,
      fixtureRevision: previousRevision + 1,
      source: 'Simulated fixture rerun',
      changedFields: ['dataAsOf', 'fixtureRevision']
    };
    result.dataAsOf = new Date(refreshedAt).toISOString();
    return result;
  }

  function renderSavedInsights() {
    const listContainer = document.getElementById('savedInsightsListContainer');
    if (!listContainer) return;

    const userId = state.currentUser ? state.currentUser.id : 'default';
    const list = window.AriaMock.getSavedInsights(userId);
    if (list.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 48px 0; border: 1px dashed var(--border-color); border-radius: 8px;">
          <div style="margin-bottom: 16px;">
            <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="opacity: 0.5;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">No saved queries or snapshots yet</div>
          <p style="max-width: 320px; margin: 0 auto; line-height: 1.5;">
            <strong>Save a query</strong> to re-run it with the same scope later.<br>
            <strong>Save a snapshot</strong> to keep an immutable result at a point in time.
          </p>
          <div style="margin-top: 16px;">
            Return to <strong>Ask</strong> and click "Save insight" on any result.
          </div>
        </div>
      `;
      return;
    }

    const queryCount = list.filter(item => item.type !== 'snapshot').length;
    const snapshotCount = list.filter(item => item.type === 'snapshot').length;
    const librarySummary = `
      <div class="saved-library-summary" aria-label="Saved insights summary">
        <div><span>Saved queries</span><strong>${queryCount}</strong><small>Reusable question + scope</small></div>
        <div><span>Snapshots</span><strong>${snapshotCount}</strong><small>Immutable captured results</small></div>
      </div>
    `;

    listContainer.innerHTML = librarySummary + list.map((item) => {
      const isSnapshot = item.type === 'snapshot';
      const badgeColor = isSnapshot ? 'var(--info-color, #0ea5e9)' : 'var(--accent-primary)';

      let scopeText = 'Auto';
      if (item.scope) {
        const parts = [];
        if (item.scope.metric && item.scope.metric.label) parts.push('Metric: ' + item.scope.metric.label);
        const domainLabel = item.scope.domain ? (item.scope.domain.label || item.scope.domain.value || item.scope.domain) : 'Auto';
        if (domainLabel && domainLabel !== 'Auto') parts.push('Domain: ' + domainLabel);

        if (item.scope.time && item.scope.time.label) parts.push('Period: ' + item.scope.time.label);
        else if (item.scope.period) parts.push('Period: ' + item.scope.period);
        if (item.scope.breakdown && item.scope.breakdown.label) parts.push('Breakdown: ' + item.scope.breakdown.label);

        if (item.scope.projectScope && item.scope.projectScope.label) parts.push('Project: ' + item.scope.projectScope.label);
        if (parts.length > 0) scopeText = parts.join(' • ');
      }

      const resultData = isSnapshot ? item.result : item.latestResult;
      const escapedItemId = escapeHtml(String(item.id || ''));

      let previewHtml = '';
      if (resultData) {
        const headline = resultData.headline || resultData.kpiHeadline || '';
        const answer = String(resultData.answerConcise || resultData.answer || (resultData.table ? 'Tabular results available' : ''));
        const val = resultData.kpiValue ? `<span style="font-weight:700; color:var(--text-primary);">${escapeHtml(resultData.kpiValue)}</span>` : '';
        previewHtml = `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-color); font-size: 12px;">
          ${headline ? `<div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(headline)}</div>` : ''}
          ${val ? `<div style="margin-bottom: 4px;">${val}</div>` : ''}
          <div style="color: var(--text-secondary);">${escapeHtml(answer.substring(0, 150))}${answer.length > 150 ? '...' : ''}</div>
        </div>
        `;
      }

      return `
      <article class="schema-table-card saved-insight-card ${isSnapshot ? 'is-snapshot' : 'is-query'}" data-insight-id="${escapedItemId}" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 280px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: ${badgeColor}; color: white; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                ${isSnapshot ? 'Snapshot' : 'Query'}
              </span>
              <div style="font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 6px;" class="insight-title-container">
                <span class="insight-title-text">${escapeHtml(item.title)}</span>
                <button type="button" class="header-icon-btn btn-rename-insight" data-id="${escapedItemId}" aria-label="Rename" style="padding: 2px; width: 20px; height: 20px;">
                  <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
              </div>
              <div class="insight-rename-form" style="display: none; align-items: center; gap: 6px;">
                <input type="text" value="${escapeHtml(item.title)}" aria-label="Saved insight title" style="font-size: 13px; padding: 2px 6px; border: 1px solid var(--border-color); border-radius: 4px; width: 200px;">
                <button type="button" class="action-tool-btn btn-rename-save" data-id="${escapedItemId}">Save</button>
                <button type="button" class="action-tool-btn btn-rename-cancel" data-id="${escapedItemId}">Cancel</button>
              </div>
            </div>
            <div class="saved-question-text">
              <span>Question</span>
              <strong>${escapeHtml(item.question)}</strong>
            </div>
            <div class="saved-scope-block">
              <span>Saved scope</span>
              <strong>${escapeHtml(scopeText)}</strong>
              <small>Scope controls query reuse; data access is evaluated separately.</small>
            </div>
            <div class="saved-item-metadata">
              <span><strong>${isSnapshot ? 'Captured at' : 'Saved at'}:</strong> ${new Date(isSnapshot ? (item.capturedAt || item.savedAt) : item.savedAt).toLocaleString()}</span>
              ${!isSnapshot ? `<span><strong>Last refreshed:</strong> ${item.refreshCount > 0 && item.lastRefreshedAt ? new Date(item.lastRefreshedAt).toLocaleString() : 'Never'}</span>` : ''}
              ${!isSnapshot && resultData && resultData.refreshMetadata ? `<span><strong>Refresh status:</strong> Updated · fixture revision ${escapeHtml(String(resultData.refreshMetadata.fixtureRevision))}</span>` : ''}
              ${isSnapshot ? '<span><strong>State:</strong> Immutable result</span>' : ''}
              <span><strong>Data as of:</strong> ${typeof item.dataAsOf === 'number' ? new Date(item.dataAsOf).toLocaleString() : escapeHtml(String(item.dataAsOf))}</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px; flex-shrink: 0; align-items: center; flex-wrap: wrap;">
            <button type="button" class="action-tool-btn btn-open-insight" data-id="${escapedItemId}">Open</button>
            ${!isSnapshot ? (item.canRefresh === false ? `<button type="button" class="action-tool-btn btn-refresh-query" data-id="${escapedItemId}" disabled title="${escapeHtml(item.refreshDisabledReason || 'Refresh not available')}">Refresh</button>` : `<button type="button" class="action-tool-btn btn-refresh-query" data-id="${escapedItemId}">Refresh</button>`) : '<button type="button" class="action-tool-btn" disabled title="Snapshots are immutable; refresh the source saved query instead">Refresh</button>'}
            ${!isSnapshot && item.latestResult ? `<button type="button" class="action-tool-btn btn-save-snapshot" data-id="${escapedItemId}">Save Snapshot</button>` : (!isSnapshot ? '<button type="button" class="action-tool-btn" disabled title="Run or refresh this saved query before creating a snapshot">Save Snapshot</button>' : '')}
            <button type="button" class="conv-action-btn btn-remove-insight" data-id="${escapedItemId}" style="color: var(--danger-color); font-size: 12px; padding: 4px 8px; border: 1px solid transparent; background: transparent; cursor: pointer; border-radius: 4px;">Remove</button>
          </div>
        </div>
        ${!isSnapshot && item.canRefresh === false
          ? `<div class="saved-action-note">Refresh unavailable: ${escapeHtml(item.refreshDisabledReason || 'The saved query cannot be reconstructed safely.')}</div>`
          : (isSnapshot ? '<div class="saved-action-note">Snapshots are immutable. Refresh the source saved query to obtain newer data.</div>' : '')}
        ${previewHtml}
      </article>
      `;
    }).join('');

    // Attach Event Listeners
    listContainer.querySelectorAll('.btn-remove-insight').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const currentItem = window.AriaMock.getSavedInsights(userId).find(item => item.id === id);
        const removed = window.AriaMock.removeSavedInsight(userId, id);
        if (removed) {
          renderSavedInsights();
          showToast(currentItem && currentItem.type === 'snapshot' ? 'Snapshot removed' : 'Saved query removed');
          renderActiveConversation();
        } else {
          showToast('Failed to remove insight');
        }
      });
    });

    listContainer.querySelectorAll('.btn-rename-insight').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.saved-insight-card');
        if (!card) return;
        const titleContainer = card.querySelector('.insight-title-container');
        const renameForm = card.querySelector('.insight-rename-form');
        const input = renameForm ? renameForm.querySelector('input') : null;
        if (titleContainer) titleContainer.style.display = 'none';
        if (renameForm) renameForm.style.display = 'flex';
        if (input) input.focus();
      });
    });

    listContainer.querySelectorAll('.btn-rename-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.saved-insight-card');
        if (!card) return;
        const titleContainer = card.querySelector('.insight-title-container');
        const renameForm = card.querySelector('.insight-rename-form');
        if (renameForm) renameForm.style.display = 'none';
        if (titleContainer) titleContainer.style.display = 'flex';
      });
    });

    listContainer.querySelectorAll('.btn-rename-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const card = btn.closest('.saved-insight-card');
        const input = card ? card.querySelector('.insight-rename-form input') : null;
        if (!input) return;
        const newTitle = input.value.trim();
        if (newTitle !== '') {
          const updated = window.AriaMock.renameSavedInsight(userId, id, newTitle);
          if (updated) {
            renderSavedInsights();
            showToast('Insight renamed');
          } else {
            showToast('Failed to rename insight');
          }
        } else {
          showToast('Title cannot be empty');
        }
      });
    });

    listContainer.querySelectorAll('.btn-open-insight').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const list = window.AriaMock.getSavedInsights(userId);
        const item = list.find(x => x.id === id);
        if (item) {
          const targetConv = createNewConversation(item.title);

          targetConv.messages.push({
            id: 'msg_' + Date.now() + '_u',
            role: 'user',
            text: item.question,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
          });

          const resultData = item.type === 'snapshot' ? item.result : item.latestResult;
          if (resultData) {
             targetConv.messages.push({
                id: 'msg_' + Date.now() + '_a',
                role: 'agent',
                type: 'results',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now(),
                resultsData: resultData,
                resultPattern: item.resultPattern || 'default',
                appliedScope: item.scope,
                activeView: resultData.activeView || 'summary',
                viewUserSelected: resultData.viewUserSelected || false,
                tablePage: resultData.tablePage || 1,
                tableSearch: resultData.tableSearch || ''
             });
          }

          saveConversationsToStorage();
          renderSidebarConversations();
          showBusinessWorkspaceView('ask');
          renderActiveConversation();
          showToast(item.type === 'snapshot' ? 'Opened immutable snapshot' : 'Opened saved query result');
        }
      });
    });

    listContainer.querySelectorAll('.btn-refresh-query').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const list = window.AriaMock.getSavedInsights(userId);
        const item = list.find(x => x.id === id);

        if (item) {
          if (item.canRefresh === false) {
            showToast(item.refreshDisabledReason || 'Refresh is not available for this saved query');
            return;
          }
          btn.innerText = 'Refreshing...';
          btn.disabled = true;

          const opts = isSavedExecutionOptionsValid(item.executionOptions)
            ? item.executionOptions
            : buildSavedExecutionOptions(item.scope);
          item.executionOptions = JSON.parse(JSON.stringify(opts));
          const q = item.question;

          window.askAgent(q, () => {}, {
            user: state.currentUser,
            domainScope: opts.selectedScope && opts.selectedScope.domain
              ? opts.selectedScope.domain.value
              : 'Auto',
            timeRange: opts.selectedScope && opts.selectedScope.time
              ? opts.selectedScope.time.preset
              : 'auto',
            selectedScope: opts.selectedScope,
            interpretationOverride: opts.interpretationOverride
          }).then(result => {
            let resultState = 'unknown';
            if (typeof getResultState === 'function') {
               resultState = getResultState(result) || 'success';
            } else if (result.type === 'results') {
               resultState = 'success';
            } else {
               resultState = result.type;
            }

            if (result.type === 'results' && (resultState === 'success' || resultState === 'partial')) {
              if (result.table && state.currentUser) {
                if (typeof applyRoleColumnMasking === 'function') applyRoleColumnMasking(result.table, state.currentUser.role);
              }
              const refreshedResult = createRefreshedFixtureResult(result, item);
              refreshedResult.resultState = resultState;
              const previousFingerprint = savedResultFingerprint(item.latestResult);
              const refreshedFingerprint = savedResultFingerprint(refreshedResult);
              if (previousFingerprint === refreshedFingerprint) {
                showToast('No changes detected; saved query was not updated');
                return;
              }

              item.latestResult = refreshedResult;
              item.lastRefreshedAt = refreshedResult.refreshMetadata.refreshedAt;
              item.dataAsOf = refreshedResult.dataAsOf;
              item.refreshCount = (item.refreshCount || 0) + 1;
              item.lastRefreshStatus = resultState === 'partial' ? 'partial' : 'updated';
              item.latestResultFingerprint = refreshedFingerprint;

              const saved = window.AriaMock.updateSavedQuery(userId, item);
              if (saved) {
                showToast(resultState === 'partial'
                  ? `Query refreshed with partial data · fixture revision ${refreshedResult.refreshMetadata.fixtureRevision}`
                  : `Query refreshed · fixture revision ${refreshedResult.refreshMetadata.fixtureRevision}`);
                renderSavedInsights();
              } else {
                showToast('Failed to save refreshed query');
              }
            } else {
              showToast('Refresh failed: ' + resultState);
            }
          }).catch(err => {
             showToast('Refresh error: ' + err.message);
          }).finally(() => {
             btn.innerText = 'Refresh';
             btn.disabled = false;
          });
        }
      });
    });

    listContainer.querySelectorAll('.btn-save-snapshot').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const list = window.AriaMock.getSavedInsights(userId);
        const item = list.find(x => x.id === id);

        if (item && item.latestResult) {
          const snapshot = JSON.parse(JSON.stringify(item));
          snapshot.id = 'snap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          snapshot.type = 'snapshot';
          snapshot.sourceQueryId = id;
          snapshot.savedAt = Date.now();
          snapshot.capturedAt = snapshot.savedAt;
          snapshot.result = JSON.parse(JSON.stringify(snapshot.latestResult));
          snapshot.capturedResultFingerprint = savedResultFingerprint(snapshot.result);
          snapshot.title = `Snapshot · ${item.title}`;
          delete snapshot.latestResult;
          delete snapshot.lastRefreshedAt;
          delete snapshot.refreshCount;
          delete snapshot.executionOptions;
          delete snapshot.canRefresh;
          delete snapshot.legacy;
          delete snapshot.refreshDisabledReason;

          const saved = window.AriaMock.saveSnapshot(userId, snapshot);
          if (saved) {
            showToast('Snapshot saved successfully');
            renderSavedInsights();
          } else {
            showToast('Failed to save snapshot');
          }
        }
      });
    });
  }

  function validateCustomDateRange() {
    if (!timeRangeSelectEl || timeRangeSelectEl.value !== 'custom') {
      if (customDateValidationMsgEl) customDateValidationMsgEl.style.display = 'none';
      return true;
    }
    const startVal = customStartDateEl ? customStartDateEl.value : '';
    const endVal = customEndDateEl ? customEndDateEl.value : '';

    if (!startVal || !endVal) {
      if (customDateValidationMsgEl) {
        customDateValidationMsgEl.textContent = 'Please select both start and end dates.';
        customDateValidationMsgEl.style.display = 'flex';
      }
      return false;
    }

    if (startVal > endVal) {
      if (customDateValidationMsgEl) {
        const fmtStart = window.AriaScope ? window.AriaScope.formatDisplayDate(startVal) : startVal;
        const fmtEnd = window.AriaScope ? window.AriaScope.formatDisplayDate(endVal) : endVal;
        customDateValidationMsgEl.textContent = `Start date (${fmtStart}) cannot be after end date (${fmtEnd}). Please select a valid range.`;
        customDateValidationMsgEl.style.display = 'flex';
      }
      return false;
    }

    if (customDateValidationMsgEl) {
      customDateValidationMsgEl.style.display = 'none';
    }
    return true;
  }

  function updateScopeEditorUI() {
    if (!timeRangeSelectEl || !window.AriaScope) return;
    const demoCtx = (window.AriaMock && window.AriaMock.DEMO_CONTEXT) ? window.AriaMock.DEMO_CONTEXT : (window.DEMO_CONTEXT || { dataAsOf: '2026-09-28' });
    const curQ = window.AriaScope.resolvePresetDateRange('current_quarter', demoCtx);
    const prevQ = window.AriaScope.resolvePresetDateRange('previous_quarter', demoCtx);
    const yr = window.AriaScope.resolvePresetDateRange('calendar_year', demoCtx);

    const currentVal = timeRangeSelectEl.value;

    timeRangeSelectEl.innerHTML = `
      <option value="auto" ${currentVal === 'auto' ? 'selected' : ''}>Auto &mdash; infer from question (no added filter)</option>
      <option value="current_quarter" ${currentVal === 'current_quarter' ? 'selected' : ''}>This calendar quarter &mdash; ${curQ.displayRange}</option>
      <option value="previous_quarter" ${currentVal === 'previous_quarter' ? 'selected' : ''}>Previous calendar quarter &mdash; ${prevQ.displayRange}</option>
      <option value="calendar_year" ${currentVal === 'calendar_year' ? 'selected' : ''}>Calendar year ${yr.year} &mdash; ${yr.displayRange}</option>
      <option value="all_time" ${currentVal === 'all_time' ? 'selected' : ''}>All time &mdash; no date boundary</option>
      <option value="custom" ${currentVal === 'custom' ? 'selected' : ''}>Custom date range &mdash; choose start and end dates</option>
    `;

    if (state.selectedScope && state.selectedScope.time) {
      if (state.selectedScope.time.preset === 'current_quarter') {
        state.selectedScope.time.start = curQ.start;
        state.selectedScope.time.end = curQ.end;
        state.activeTimeRange = curQ.label;
      } else if (state.selectedScope.time.preset === 'previous_quarter') {
        state.selectedScope.time.start = prevQ.start;
        state.selectedScope.time.end = prevQ.end;
        state.activeTimeRange = prevQ.label;
      } else if (state.selectedScope.time.preset === 'calendar_year') {
        state.selectedScope.time.start = yr.start;
        state.selectedScope.time.end = yr.end;
        state.activeTimeRange = yr.label;
      }
    }
  }

  window.updateScopeEditorUI = updateScopeEditorUI;

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
            <span class="brand-badge" style="font-size: 12px; margin-right: 6px;">${escapeHtml(s.type)}</span>
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

    // 2. Optional multi-domain search boundary. This is discovery scope, not access.
    if (domainScopeSelectEl && domainScopeMenuEl) {
      const domainCheckboxes = Array.from(domainScopeMenuEl.querySelectorAll('input[type="checkbox"]'));
      const closeDomainMenu = () => {
        domainScopeMenuEl.hidden = true;
        domainScopeSelectEl.setAttribute('aria-expanded', 'false');
      };
      const syncDomainScope = (announce = true) => {
        const selectedDomains = domainCheckboxes.filter(input => input.checked).map(input => input.value);
        const isAuto = selectedDomains.length === 0;
        state.activeDomainScope = isAuto ? 'Auto' : selectedDomains;
        state.selectedScope.domain = {
          mode: isAuto ? 'auto' : 'multi',
          value: isAuto ? 'Auto' : selectedDomains.join(' + '),
          values: selectedDomains
        };
        domainScopeSelectLabelEl.textContent = isAuto
          ? 'Auto — infer from question'
          : selectedDomains.join(' + ');
        domainScopeImpactEl.textContent = isAuto
          ? 'Auto searches domains inferred from the question.'
          : `Search is limited to ${selectedDomains.join(' and ')}. Access policies still apply separately.`;
        if (announce) {
          showToast(isAuto
            ? 'Domain search reset to Auto: inferred from the question'
            : `Search limited to: ${selectedDomains.join(' + ')} (access unchanged)`);
        }
        if (!getActiveConversation() || (getActiveConversation().messages || []).length === 0) {
          renderIdleState();
        }
      };

      domainScopeSelectEl.addEventListener('click', () => {
        const willOpen = domainScopeMenuEl.hidden;
        domainScopeMenuEl.hidden = !willOpen;
        domainScopeSelectEl.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        if (willOpen) (domainCheckboxes.find(input => input.checked) || domainCheckboxes[0]).focus();
      });
      domainCheckboxes.forEach(input => input.addEventListener('change', () => syncDomainScope(true)));
      resetDomainScopeBtnEl.addEventListener('click', () => {
        domainCheckboxes.forEach(input => { input.checked = false; });
        syncDomainScope(true);
        domainScopeSelectEl.focus();
      });
      document.addEventListener('click', (event) => {
        if (!domainScopeMenuEl.hidden && !event.target.closest('.scope-domain-control')) closeDomainMenu();
      });
      domainScopeMenuEl.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeDomainMenu();
          domainScopeSelectEl.focus();
        }
      });
      syncDomainScope(false);
    }

    // 3. Time Range / Scope Editor Select
    if (timeRangeSelectEl) {
      timeRangeSelectEl.addEventListener('change', () => {
        const val = timeRangeSelectEl.value;
        if (val === 'custom') {
          if (customDateRangeBarEl) customDateRangeBarEl.style.display = 'flex';
          state.selectedScope.time = {
            mode: 'custom',
            preset: 'custom',
            start: customStartDateEl ? customStartDateEl.value : null,
            end: customEndDateEl ? customEndDateEl.value : null
          };
          state.activeTimeRange = 'Custom';
          validateCustomDateRange();
          updateSendButtonState();
        } else {
          if (customDateRangeBarEl) customDateRangeBarEl.style.display = 'none';
          if (customDateValidationMsgEl) customDateValidationMsgEl.style.display = 'none';
          updateSendButtonState();

          if (val === 'auto' || val === 'Auto') {
            state.selectedScope.time = { mode: 'auto', preset: 'auto', start: null, end: null };
            state.activeTimeRange = 'Auto';
            showToast('Period set to Auto: inferred from the question; no extra time filter added');
          } else {
            const p = window.AriaScope.resolvePresetDateRange(val, window.AriaMock.DEMO_CONTEXT);
            state.selectedScope.time = {
              mode: 'preset',
              preset: val,
              start: p.start,
              end: p.end
            };
            state.activeTimeRange = p.label;
            showToast(`Time window set to: ${p.label}`);
          }
        }
      });
    }

    if (customStartDateEl && customEndDateEl) {
      const handleCustomDateChange = () => {
        const isValid = validateCustomDateRange();
        if (isValid && state.selectedScope.time.mode === 'custom') {
          state.selectedScope.time.start = customStartDateEl.value;
          state.selectedScope.time.end = customEndDateEl.value;
        }
        updateSendButtonState();
      };
      customStartDateEl.addEventListener('change', handleCustomDateChange);
      customStartDateEl.addEventListener('input', handleCustomDateChange);
      customEndDateEl.addEventListener('change', handleCustomDateChange);
      customEndDateEl.addEventListener('input', handleCustomDateChange);
    }

    if (applyCustomDateBtnEl) {
      applyCustomDateBtnEl.addEventListener('click', () => {
        if (validateCustomDateRange()) {
          state.selectedScope.time.start = customStartDateEl.value;
          state.selectedScope.time.end = customEndDateEl.value;
          showToast(`Custom range applied: ${window.AriaScope.formatDateRange(customStartDateEl.value, customEndDateEl.value)}`);
        }
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

  // =========================================================================

  function buildSavedExecutionOptions(appliedScope) {
    const opts = {
      selectedScope: {
        domain: { mode: 'auto', value: 'Auto' },
        time: { mode: 'auto', preset: 'auto', start: null, end: null }
      },
      interpretationOverride: {
        metric: null,
        breakdown: null,
        domain: 'Auto',
        projectScope: 'all',
        period: 'auto',
        startDate: '',
        endDate: '',
        assumptions: []
      }
    };

    if (!appliedScope) return opts;

    const domainValue = appliedScope.domain && typeof appliedScope.domain === 'object'
      ? (appliedScope.domain.value || appliedScope.domain.label || 'Auto')
      : (appliedScope.domain || 'Auto');
    const domainValues = appliedScope.domain && typeof appliedScope.domain === 'object' && Array.isArray(appliedScope.domain.values)
      ? appliedScope.domain.values.filter(Boolean)
      : [];
    const hasDomainLimits = domainValues.length > 0 && appliedScope.domain && String(appliedScope.domain.source || '').toLowerCase().includes('limited');
    opts.selectedScope.domain = {
      mode: hasDomainLimits ? 'multi' : (domainValue && domainValue !== 'Auto' ? 'explicit' : 'auto'),
      value: hasDomainLimits ? domainValues.join(' + ') : (domainValue || 'Auto'),
      values: hasDomainLimits ? domainValues : []
    };
    opts.interpretationOverride.domain = hasDomainLimits ? 'Auto' : (domainValue || 'Auto');

    const time = appliedScope.time || null;
    if (time) {
      const start = time.start || null;
      const end = time.end || null;
      const rawPreset = typeof time.preset === 'string'
        ? time.preset
        : (typeof time.key === 'string' ? time.key : 'auto');
      const hasExplicitDates = Boolean(start && end);
      const timeMode = hasExplicitDates
        ? 'custom'
        : (rawPreset && rawPreset !== 'auto' ? 'preset' : 'auto');
      const periodKey = timeMode === 'custom' ? 'custom' : (rawPreset || 'auto');

      opts.selectedScope.time = {
        mode: timeMode,
        preset: periodKey,
        start,
        end
      };
      opts.interpretationOverride.period = periodKey;
      opts.interpretationOverride.startDate = start || '';
      opts.interpretationOverride.endDate = end || '';
    } else if (typeof appliedScope.period === 'string') {
      const periodKey = appliedScope.period || 'auto';
      opts.selectedScope.time = {
        mode: periodKey === 'auto' ? 'auto' : 'preset',
        preset: periodKey,
        start: null,
        end: null
      };
      opts.interpretationOverride.period = periodKey;
    }

    const metricKey = appliedScope.metric && typeof appliedScope.metric === 'object'
      ? appliedScope.metric.key
      : appliedScope.metric;
    const breakdownSource = appliedScope.breakdown || appliedScope.grain;
    const breakdownKey = breakdownSource && typeof breakdownSource === 'object'
      ? breakdownSource.key
      : breakdownSource;
    const projectSource = appliedScope.projectScope || appliedScope.projects;
    const projectKey = projectSource && typeof projectSource === 'object'
      ? (projectSource.key || (Array.isArray(projectSource.values) ? projectSource.values[0] : null))
      : projectSource;

    opts.interpretationOverride.metric = metricKey || null;
    opts.interpretationOverride.breakdown = breakdownKey || null;
    opts.interpretationOverride.projectScope = projectKey || 'all';
    opts.interpretationOverride.assumptions = Array.isArray(appliedScope.assumptions)
      ? [...appliedScope.assumptions]
      : [];

    return opts;
  }

  function applyExecutionScopeToEditor(selectedScope) {
    if (!selectedScope) return;
    state.selectedScope = JSON.parse(JSON.stringify(selectedScope));

    const values = selectedScope.domain && Array.isArray(selectedScope.domain.values)
      ? selectedScope.domain.values
      : [];
    if (domainScopeMenuEl) {
      domainScopeMenuEl.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.checked = values.includes(input.value);
      });
    }
    state.activeDomainScope = values.length ? values : 'Auto';
    if (domainScopeSelectLabelEl) domainScopeSelectLabelEl.textContent = values.length
      ? values.join(' + ')
      : 'Auto — infer from question';
    if (domainScopeImpactEl) domainScopeImpactEl.textContent = values.length
      ? `Search is limited to ${values.join(' and ')}. Access policies still apply separately.`
      : 'Auto searches domains inferred from the question.';

    const time = selectedScope.time || { mode: 'auto', preset: 'auto', start: null, end: null };
    if (timeRangeSelectEl) timeRangeSelectEl.value = time.mode === 'custom' ? 'custom' : (time.preset || 'auto');
    if (customStartDateEl) customStartDateEl.value = time.start || '';
    if (customEndDateEl) customEndDateEl.value = time.end || '';
    if (customDateRangeBarEl) customDateRangeBarEl.style.display = time.mode === 'custom' ? 'flex' : 'none';
    state.activeTimeRange = time.mode === 'auto' ? 'Auto' : (time.preset || 'Custom');
    updateScopeEditorUI();
  }

  function isSavedExecutionOptionsValid(options) {
    if (!options || !options.selectedScope || !options.interpretationOverride) return false;
    const domain = options.selectedScope.domain;
    const time = options.selectedScope.time;
    const override = options.interpretationOverride;
    if (!domain || !['auto', 'explicit', 'multi'].includes(domain.mode) || typeof domain.value !== 'string') return false;
    if (domain.mode === 'multi' && (!Array.isArray(domain.values) || domain.values.length === 0)) return false;
    if (!time || !['auto', 'preset', 'custom'].includes(time.mode) || typeof time.preset !== 'string') return false;
    return ['metric', 'breakdown', 'domain', 'projectScope', 'period'].every((key) => {
      const value = override[key];
      return value === null || typeof value === 'string';
    });
  }

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

    const showPipelineChk = document.getElementById('settingShowPipelineDefault');
    if (showPipelineChk) {
      showPipelineChk.checked = Boolean(state.settings.showPipelineDefault);
      showPipelineChk.addEventListener('change', () => {
        state.settings.showPipelineDefault = showPipelineChk.checked;
        showToast(showPipelineChk.checked
          ? 'Technical processing details will be shown for new requests.'
          : 'New requests will show a concise business-friendly loading state.');
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
      // Ctrl+K / Cmd+K = open the dedicated conversation search dialog
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openConversationSearch();
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
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
          <div class="capability-assumption"><strong>CK1 v2.1 capability map loaded.</strong> Data Guide maps the synthetic demo metrics to the supplied 111-table CK1 schema. Coverage indicates schema readiness, not a live production connection.</div>
          <div class="schema-table-card"><strong>Finance</strong> <span class="capability-status available">Available in demo</span><p>Receivables, aging and supplier invoice scenarios.</p></div>
          <div class="schema-table-card"><strong>Sales</strong> <span class="capability-status available">Available in demo</span><p>Executed contracts, buyer ranking and payment schedules.</p></div>
          <div class="schema-table-card"><strong>Property Management</strong> <span class="capability-status available">Available in demo</span><p>Occupancy and lease-renewal scenarios.</p></div>
          <div class="schema-table-card"><strong>Projects</strong> <span class="capability-status limited">Limited demo</span><p>Project master and supporting scope data.</p></div>
          <div class="schema-table-card"><strong>Procurement</strong> <span class="capability-status limited">Limited demo</span><p>Selected spend, purchase-order and supplier scenarios only.</p></div>
          <div class="schema-table-card"><strong>Construction</strong> <span class="capability-status limited">Limited demo</span><p>Selected progress and damages scenarios only.</p></div>
        </div>
      `;
    } else if (tab === 'scope') {
      helpTabContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
          <p><strong>Architecture Boundaries &amp; Known Limitations:</strong></p>
          <div class="schema-table-card">
            <strong>Prototype behaviour:</strong> This demo presents read-only interactions with synthetic data. It does not prove production data controls.
          </div>
          <div class="schema-table-card">
            <strong>Catalog Boundaries:</strong> Indexed operational data spans calendar years 2023–2026. A fiscal-year calendar is not configured. Pre-2023 payroll and internal corporate HR records (stored in Workday) are out-of-scope.
          </div>
          <div class="schema-table-card">
            <strong>Ungrounded Forecasting:</strong> External macroeconomic forecasts (e.g. 2030 mortgage interest rates) are unsupported to prevent hallucination.
          </div>
          <div class="schema-table-card">
            <strong>Simulated access and masking:</strong> Persona-based restrictions and masked fields illustrate intended behaviour only; no production enforcement is implied.
          </div>
        </div>
      `;
    } else if (tab === 'shortcuts') {
      helpTabContent.innerHTML = `
        <table class="result-data-table" style="font-size: 12px;">
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
    settingsDrawer.classList.remove('open');
    helpModalBackdrop.classList.remove('open');
    feedbackModalBackdrop.classList.remove('open');
    sourceTableModalBackdrop.classList.remove('open');
    if (clearHistoryModalBackdrop) clearHistoryModalBackdrop.classList.remove('open');
    if (domainScopeMenuEl) domainScopeMenuEl.hidden = true;
    if (domainScopeSelectEl) domainScopeSelectEl.setAttribute('aria-expanded', 'false');
    closeClarificationModal();
    if (editInterpretationModalBackdrop) editInterpretationModalBackdrop.classList.remove('open');
    if (historySearchModalBackdrop) historySearchModalBackdrop.classList.remove('open');
    closeScopeInspector();
    showBusinessWorkspaceView('ask');
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
    const themeIcon = isDark
      ? `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></svg>`
      : `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    themeToggleBtnEl.innerHTML = `${themeIcon}<span>Use ${isDark ? 'light' : 'dark'} appearance</span>`;
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

  function announceAppStatus(message, priority = 'polite') {
    const target = priority === 'assertive' ? appAlertLiveEl : appStatusLiveEl;
    if (!target || !message) return;
    target.textContent = '';
    window.setTimeout(() => { target.textContent = message; }, 20);
  }

  function initAccessibleModals() {
    const modals = Array.from(document.querySelectorAll('.modal-backdrop'));
    const returnFocus = new WeakMap();
    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const activeModal = () => [...modals].reverse().find(modal => modal.classList.contains('open')) || null;
    const focusableIn = (modal) => Array.from(modal.querySelectorAll(focusableSelector))
      .filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true' && element.offsetParent !== null);

    modals.forEach((modal) => {
      modal.setAttribute('aria-hidden', modal.classList.contains('open') ? 'false' : 'true');
      const dialog = modal.querySelector('[role="dialog"], [role="alertdialog"]');
      if (dialog) {
        dialog.setAttribute('aria-modal', 'true');
        if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
      }

      new MutationObserver(() => {
        const isOpen = modal.classList.contains('open');
        modal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        if (isOpen) {
          if (!returnFocus.has(modal)) returnFocus.set(modal, document.activeElement);
          requestAnimationFrame(() => {
            if (!modal.contains(document.activeElement)) {
              const preferred = modal.querySelector('[autofocus]') || focusableIn(modal)[0] || dialog;
              if (preferred && typeof preferred.focus === 'function') preferred.focus();
            }
          });
        } else if (returnFocus.has(modal)) {
          const trigger = returnFocus.get(modal);
          returnFocus.delete(modal);
          requestAnimationFrame(() => {
            if (trigger && document.contains(trigger) && typeof trigger.focus === 'function') trigger.focus();
          });
        }
      }).observe(modal, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('keydown', (event) => {
      const modal = activeModal();
      if (!modal) return;
      if (event.key === 'Escape') {
        const closeControl = modal.querySelector('.header-icon-btn, [data-modal-close], button[id^="cancel"], button[id^="close"]');
        if (closeControl) {
          event.preventDefault();
          event.stopImmediatePropagation();
          closeControl.click();
        }
        return;
      }
      if (event.key !== 'Tab') return;
      event.stopImmediatePropagation();
      const focusable = focusableIn(modal);
      if (!focusable.length) {
        event.preventDefault();
        const dialog = modal.querySelector('[role="dialog"], [role="alertdialog"]');
        if (dialog) dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!modal.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }, true);
  }

  function updateSendButtonState() {
    resizeChatInput();
    const hasText = chatInputEl.value.trim().length > 0;
    const isCustomDateValid = validateCustomDateRange();
    sendBtnEl.disabled = !hasText || state.isThinking || !isCustomDateValid;
  }

  function resizeChatInput() {
    if (!chatInputEl) return;
    const maxHeight = 144;
    chatInputEl.style.height = 'auto';
    const nextHeight = Math.min(chatInputEl.scrollHeight, maxHeight);
    chatInputEl.style.height = `${nextHeight}px`;
    chatInputEl.style.overflowY = chatInputEl.scrollHeight > maxHeight ? 'auto' : 'hidden';
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

  function initResizablePanels() {
    const sidebarHandle = document.getElementById('sidebarResizeHandle');
    const evidenceHandle = document.getElementById('evidenceResizeHandle');
    const root = document.documentElement;
    const storageKeys = { sidebar: 'aria_sidebar_width_v1', evidence: 'aria_evidence_width_v1' };

    const limits = (kind) => kind === 'sidebar'
      ? { min: 180, max: Math.max(220, Math.min(440, window.innerWidth - 520)) }
      : { min: 320, max: Math.max(360, Math.min(760, window.innerWidth - 360)) };

    const applyWidth = (kind, value, persist = true) => {
      const range = limits(kind);
      const width = Math.min(range.max, Math.max(range.min, Math.round(value)));
      root.style.setProperty(kind === 'sidebar' ? '--sidebar-width' : '--drawer-width', `${width}px`);
      if (persist) {
        try { localStorage.setItem(storageKeys[kind], String(width)); } catch (e) { /* Storage is optional. */ }
      }
      return width;
    };

    Object.keys(storageKeys).forEach((kind) => {
      try {
        const savedWidth = Number(localStorage.getItem(storageKeys[kind]));
        if (Number.isFinite(savedWidth) && savedWidth > 0) applyWidth(kind, savedWidth, false);
      } catch (e) { /* Keep the CSS default. */ }
    });

    const bindHandle = (handle, kind) => {
      if (!handle) return;
      let activePointerId = null;
      const pointerWidth = (clientX) => kind === 'sidebar'
        ? clientX - sidebarEl.getBoundingClientRect().left
        : window.innerWidth - clientX;

      handle.addEventListener('pointerdown', (event) => {
        if (window.innerWidth <= 820 || event.button !== 0) return;
        activePointerId = event.pointerId;
        handle.setPointerCapture(activePointerId);
        document.body.classList.add('panel-resizing');
        event.preventDefault();
      });
      handle.addEventListener('pointermove', (event) => {
        if (activePointerId !== event.pointerId) return;
        applyWidth(kind, pointerWidth(event.clientX), false);
      });

      const finishResize = (event) => {
        if (activePointerId === null || event.pointerId !== activePointerId) return;
        applyWidth(kind, pointerWidth(event.clientX));
        if (handle.hasPointerCapture(activePointerId)) handle.releasePointerCapture(activePointerId);
        activePointerId = null;
        document.body.classList.remove('panel-resizing');
      };
      handle.addEventListener('pointerup', finishResize);
      handle.addEventListener('pointercancel', finishResize);

      handle.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        const panel = kind === 'sidebar' ? sidebarEl : scopeInspectorPanel;
        const currentWidth = panel.getBoundingClientRect().width;
        const visualDirection = event.key === 'ArrowRight' ? 1 : -1;
        const delta = kind === 'sidebar' ? visualDirection * 16 : visualDirection * -16;
        applyWidth(kind, currentWidth + delta);
        event.preventDefault();
      });
    };

    bindHandle(sidebarHandle, 'sidebar');
    bindHandle(evidenceHandle, 'evidence');
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 820) return;
      applyWidth('sidebar', sidebarEl.getBoundingClientRect().width, false);
      applyWidth('evidence', scopeInspectorPanel.getBoundingClientRect().width, false);
    });
  }

  // =========================================================================
  // 17. ATTACH ALL UI BUTTON LISTENERS (DOM READY)
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAccessibleModals();
    initUserIdentity();
    initInputHelpers();
    updateScopeEditorUI();
    initSettingsAndHelp();
    initResizablePanels();

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
      if (typeof updateRailActiveState === 'function') showBusinessWorkspaceView('ask');
    });

    // Conversation search dialog (distinct from filtering rows inside a result).
    openHistorySearchBtnEl.addEventListener('click', openConversationSearch);
    closeHistorySearchBtnEl.addEventListener('click', closeConversationSearch);
    historySearchDialogInputEl.addEventListener('input', renderConversationSearchResults);
    historySearchModalBackdrop.addEventListener('click', (event) => {
      if (event.target === historySearchModalBackdrop) closeConversationSearch();
    });
    historySearchDialogInputEl.addEventListener('keydown', (event) => {
      const firstResult = historySearchResultsEl.querySelector('.history-search-result');
      if (event.key === 'ArrowDown' && firstResult) {
        event.preventDefault();
        firstResult.focus();
      } else if (event.key === 'Enter' && firstResult) {
        event.preventDefault();
        firstResult.click();
      }
    });
    historySearchResultsEl.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const results = Array.from(historySearchResultsEl.querySelectorAll('.history-search-result'));
      const currentIndex = results.indexOf(document.activeElement);
      if (currentIndex < 0) return;
      event.preventDefault();
      if (event.key === 'ArrowUp' && currentIndex === 0) {
        historySearchDialogInputEl.focus();
        return;
      }
      const nextIndex = event.key === 'ArrowDown'
        ? Math.min(currentIndex + 1, results.length - 1)
        : Math.max(currentIndex - 1, 0);
      results[nextIndex].focus();
    });

    // Clear All History
    const closeClearHistoryModal = () => {
      clearHistoryModalBackdrop.classList.remove('open');
      if (clearHistoryTrigger && document.contains(clearHistoryTrigger)) clearHistoryTrigger.focus();
      clearHistoryTrigger = null;
    };
    const openClearHistoryModal = (trigger) => {
      clearHistoryTrigger = trigger;
      const count = state.conversations.length;
      clearHistoryConversationCount.textContent = `${count} ${count === 1 ? 'conversation' : 'conversations'}`;
      clearHistoryModalBackdrop.classList.add('open');
      requestAnimationFrame(() => cancelClearHistoryBtn.focus());
    };
    clearAllHistoryBtnEl.addEventListener('click', () => openClearHistoryModal(clearAllHistoryBtnEl));
    closeClearHistoryModalBtn.addEventListener('click', closeClearHistoryModal);
    cancelClearHistoryBtn.addEventListener('click', closeClearHistoryModal);
    confirmClearHistoryBtn.addEventListener('click', () => {
      state.conversations = [];
      state.activeConversationId = null;
      saveConversationsToStorage();
      closeClearHistoryModal();
      renderSidebarConversations();
      renderActiveConversation();
      showToast('All conversation history cleared');
    });
    clearHistoryModalBackdrop.addEventListener('click', (event) => {
      if (event.target === clearHistoryModalBackdrop) closeClearHistoryModal();
    });
    clearHistoryModalBackdrop.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeClearHistoryModal(); return; }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(clearHistoryModalBackdrop.querySelectorAll('button:not([disabled])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    // Context-preserving CSV export
    closeCsvExportModalBtn.addEventListener('click', closeCsvExportOptions);
    cancelCsvExportBtn.addEventListener('click', closeCsvExportOptions);
    confirmCsvExportBtn.addEventListener('click', () => {
      if (!pendingCsvExport) return;
      const { msg, conv } = pendingCsvExport;
      const selected = csvExportModalBackdrop.querySelector('input[name="csvExportRows"]:checked');
      const rowMode = selected ? selected.value : 'all';
      const table = msg.resultsData.table;
      const exportedCount = rowMode === 'filtered' ? filterExportRows(table, msg.tableSearch).length : table.rows.length;
      const csv = buildContextualCsv(msg, conv, rowMode);
      const safeTitle = String((table && table.title) || 'query_results').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'query_results';
      downloadFile(`${safeTitle}_${rowMode}.csv`, csv, 'text/csv;charset=utf-8');
      closeCsvExportOptions();
      showToast(`Downloaded ${exportedCount} ${rowMode === 'filtered' ? 'filtered' : 'total'} rows with scope and freshness context`);
    });
    csvExportModalBackdrop.addEventListener('click', (event) => {
      if (event.target === csvExportModalBackdrop) closeCsvExportOptions();
    });
    csvExportModalBackdrop.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeCsvExportOptions(); return; }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(csvExportModalBackdrop.querySelectorAll('button:not([disabled]), input:not([disabled])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    // Mobile Hamburger / Desktop Collapse
    mobileMenuBtnEl.addEventListener('click', () => {
      if (window.innerWidth <= 820) {
        sidebarEl.classList.toggle('open');
        mobileMenuBtnEl.setAttribute('aria-expanded', sidebarEl.classList.contains('open') ? 'true' : 'false');
      } else {
        sidebarEl.classList.toggle('collapsed');
      }
    });
    if (sidebarMobileBackdropEl) {
      sidebarMobileBackdropEl.addEventListener('click', () => {
        sidebarEl.classList.remove('open');
        requestAnimationFrame(() => mobileMenuBtnEl.focus());
      });
      new MutationObserver(() => {
        const isMobileOpen = sidebarEl.classList.contains('open') && window.innerWidth <= 820;
        sidebarMobileBackdropEl.classList.toggle('open', isMobileOpen);
        mobileMenuBtnEl.setAttribute('aria-expanded', isMobileOpen ? 'true' : 'false');
        sidebarEl.inert = window.innerWidth <= 820 && !isMobileOpen;
      }).observe(sidebarEl, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener('resize', () => {
        const isMobileOpen = sidebarEl.classList.contains('open') && window.innerWidth <= 820;
        sidebarMobileBackdropEl.classList.toggle('open', isMobileOpen);
        sidebarEl.inert = window.innerWidth <= 820 && !isMobileOpen;
      });
      sidebarEl.inert = window.innerWidth <= 820 && !sidebarEl.classList.contains('open');
    }
    if (closeMobileSidebarBtnEl) {
      closeMobileSidebarBtnEl.addEventListener('click', () => {
        sidebarEl.classList.remove('open');
        requestAnimationFrame(() => mobileMenuBtnEl.focus());
      });
    }

    // User Profile Dropdown Toggle
    userMenuBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuDropdownEl.classList.toggle('open');
      userMenuBtnEl.setAttribute('aria-expanded', userMenuDropdownEl.classList.contains('open') ? 'true' : 'false');
    });
    document.addEventListener('click', () => {
      userMenuDropdownEl.classList.remove('open');
      userMenuBtnEl.setAttribute('aria-expanded', 'false');
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

    // Workspace Rail Navigation (Requirement A)
    if (railAskBtn) {
      railAskBtn.addEventListener('click', () => {
        dataExplorerDrawer.classList.remove('open');
                settingsDrawer.classList.remove('open');
        helpModalBackdrop.classList.remove('open');
        showBusinessWorkspaceView('ask');
        if (window.innerWidth <= 820 && sidebarEl) {
          sidebarEl.classList.remove('open');
        }
        if (chatInputEl) chatInputEl.focus();
      });
    }

    if (railDataGuideBtn) {
      railDataGuideBtn.addEventListener('click', () => {
                dataExplorerDrawer.classList.add('open');
        renderDataExplorer();
        updateRailActiveState('data_guide');
        if (window.innerWidth <= 820 && sidebarEl) {
          sidebarEl.classList.remove('open');
        }
      });
    }

    if (toggleRecentConvsBtn && sidebarConvCollapsible) {
      toggleRecentConvsBtn.addEventListener('click', () => {
        const isCollapsed = sidebarConvCollapsible.classList.toggle('collapsed');
        toggleRecentConvsBtn.classList.toggle('collapsed', isCollapsed);
        toggleRecentConvsBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      });
    }

    // Scope & Sources Inspector Close Handlers (Requirement B)
    if (closeScopeInspectorBtn) {
      closeScopeInspectorBtn.addEventListener('click', closeScopeInspector);
    }
    if (scopeInspectorBackdrop) {
      scopeInspectorBackdrop.addEventListener('click', closeScopeInspector);
    }
    if (scopeInspectorPanel) {
      scopeInspectorPanel.addEventListener('keydown', (event) => {
        if (!scopeInspectorPanel.classList.contains('open')) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopImmediatePropagation();
          closeScopeInspector();
          return;
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(scopeInspectorPanel.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
        )).filter((element) => !element.closest('[hidden]') && element.offsetParent !== null);
        if (!focusable.length) {
          event.preventDefault();
          scopeInspectorPanel.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }

    // Drawers Open / Close
    navDataExplorerBtn.addEventListener('click', () => {
            dataExplorerDrawer.classList.add('open');
      renderDataExplorer();
      updateRailActiveState('data_guide');
    });
    closeExplorerBtn.addEventListener('click', () => {
      dataExplorerDrawer.classList.remove('open');
      showBusinessWorkspaceView('ask');
    });

    tabCapabilitiesBtn.addEventListener('click', () => {
      explorerActiveTab = 'capabilities';
      tabCapabilitiesBtn.classList.add('active');
      tabTablesBtn.classList.remove('active');
      tabGlossaryBtn.classList.remove('active');
      renderDataExplorer();
    });
    tabTablesBtn.addEventListener('click', () => {
      explorerActiveTab = 'tables';
      tabTablesBtn.classList.add('active');
      tabCapabilitiesBtn.classList.remove('active');
      tabGlossaryBtn.classList.remove('active');
      renderDataExplorer();
    });
    tabGlossaryBtn.addEventListener('click', () => {
      explorerActiveTab = 'glossary';
      tabGlossaryBtn.classList.add('active');
      tabCapabilitiesBtn.classList.remove('active');
      tabTablesBtn.classList.remove('active');
      renderDataExplorer();
    });
    explorerSearchInput.addEventListener('input', renderDataExplorer);

    savedAnswersBtn.addEventListener('click', () => {
      showBusinessWorkspaceView('saved');
    });


    settingsBtn.addEventListener('click', () => settingsDrawer.classList.add('open'));
    closeSettingsBtn.addEventListener('click', () => settingsDrawer.classList.remove('open'));

    helpModalBtn.addEventListener('click', () => helpModalBackdrop.classList.add('open'));
    closeHelpModalBtn.addEventListener('click', () => helpModalBackdrop.classList.remove('open'));

    // Feedback Modal Submission
    closeFeedbackModalBtn.addEventListener('click', () => feedbackModalBackdrop.classList.remove('open'));
    cancelFeedbackBtn.addEventListener('click', () => feedbackModalBackdrop.classList.remove('open'));

    feedbackReasonChips.querySelectorAll('.reason-chip-btn').forEach((chip) => {
      chip.addEventListener('click', () => {
        feedbackReasonChips.querySelectorAll('.reason-chip-btn').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        state.currentFeedbackReason = chip.textContent.trim();
      });
    });

    submitFeedbackBtn.addEventListener('click', () => {
      const comment = feedbackCommentInput.value.trim();
      const conv = getActiveConversation();
      const msg = conv && conv.messages.find((item) => item.id === state.currentFeedbackMessageId);
      if (!conv || !msg) {
        feedbackModalBackdrop.classList.remove('open');
        showToast('This answer is no longer available for feedback.');
        return;
      }
      const isUpdate = Boolean(msg.feedback);
      msg.feedback = { type: 'down', reason: state.currentFeedbackReason, comment, submittedAt: Date.now() };
      window.AriaMock.recordFeedback('down', state.currentFeedbackReason, comment, conv.title, state.currentUser, {
        conversationId: conv.id, messageId: msg.id, replaceExisting: isUpdate
      });
      saveConversationsToStorage();
      feedbackModalBackdrop.classList.remove('open');
      feedbackCommentInput.value = '';
      state.currentFeedbackMessageId = null;
      renderActiveConversation();
      showToast(isUpdate ? 'Feedback updated for this answer.' : 'Feedback saved for this answer.');
    });

    closeSourceTableModalBtn.addEventListener('click', () => sourceTableModalBackdrop.classList.remove('open'));

    if (closeClarificationModalBtn) closeClarificationModalBtn.addEventListener('click', cancelClarificationModal);
    if (cancelClarificationBtn) cancelClarificationBtn.addEventListener('click', cancelClarificationModal);
    if (confirmClarificationBtn) confirmClarificationBtn.addEventListener('click', confirmClarification);
    if (clarificationOptionsEl) {
      clarificationOptionsEl.addEventListener('change', () => {
        confirmClarificationBtn.disabled = false;
      });
    }
    if (clarificationModalBackdrop) {
      clarificationModalBackdrop.addEventListener('click', (event) => {
        if (event.target === clarificationModalBackdrop) cancelClarificationModal();
      });
      clarificationModalBackdrop.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          cancelClarificationModal();
          return;
        }
        if (/^[1-9]$/.test(event.key)) {
          const numberedOption = clarificationOptionsEl.querySelector(`input[data-option-number="${event.key}"]`);
          if (numberedOption) {
            event.preventDefault();
            numberedOption.checked = true;
            confirmClarificationBtn.disabled = false;
            announceAppStatus(`Option ${event.key} selected: ${numberedOption.getAttribute('data-label')}`);
          }
          return;
        }
        if (event.key === 'Enter' && clarificationOptionsEl.querySelector('input:checked') && document.activeElement !== cancelClarificationBtn && document.activeElement !== closeClarificationModalBtn) {
          event.preventDefault();
          confirmClarification();
          return;
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(clarificationModalBackdrop.querySelectorAll('button:not([disabled]), input:not([disabled])'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
    }

    // Edit Interpretation Modal Listeners (R2-09)
    if (closeEditInterpretationModalBtn) {
      closeEditInterpretationModalBtn.addEventListener('click', () => {
        if (editInterpretationModalBackdrop) editInterpretationModalBackdrop.classList.remove('open');
      });
    }
    if (btnCancelEditInterpretation) {
      btnCancelEditInterpretation.addEventListener('click', () => {
        if (editInterpretationModalBackdrop) editInterpretationModalBackdrop.classList.remove('open');
      });
    }
    if (btnApplyEditInterpretation) {
      btnApplyEditInterpretation.addEventListener('click', handleApplyEditInterpretation);
    }
    if (editInterpMetric) {
      editInterpMetric.addEventListener('change', () => {
        updateEditInterpCurrency();
        syncInterpProjectAndBreakdown();
      });
    }
    if (editInterpBreakdown) {
      editInterpBreakdown.addEventListener('change', syncInterpProjectAndBreakdown);
    }
    if (editInterpProjects) {
      editInterpProjects.addEventListener('change', syncInterpProjectAndBreakdown);
    }
    if (editInterpPeriod) {
      editInterpPeriod.addEventListener('change', () => {
        if (editInterpCustomDateRow) {
          editInterpCustomDateRow.style.display = editInterpPeriod.value === 'custom' ? 'grid' : 'none';
        }
      });
    }
  });
})();
