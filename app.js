/**
 * Aria - Enterprise NL Query Assistant
 * app.js - Main Application Controller
 *
 * Handles chat interactions, thinking pipeline animations, clarification flows,
 * sortable data tables, inline charts, error/retry states, and conversation history.
 */

(function () {
  'use strict';

  // DOM Elements
  const chatMessagesEl = document.getElementById('chatMessages');
  const chatContainerEl = document.getElementById('chatContainer');
  const chatInputEl = document.getElementById('chatInput');
  const sendBtnEl = document.getElementById('sendBtn');
  const historyListEl = document.getElementById('historyList');
  const newQueryBtnEl = document.getElementById('newQueryBtn');
  const themeToggleBtnEl = document.getElementById('themeToggleBtn');
  const mobileMenuBtnEl = document.getElementById('mobileMenuBtn');
  const sidebarEl = document.getElementById('sidebar');

  // Application State
  const state = {
    theme: localStorage.getItem('aria_theme') || 'light',
    sessionQueries: [], // Array of { id, text, elementId, timestamp }
    activeQueryId: null,
    isThinking: false
  };

  // -------------------------------------------------------------
  // 1. THEME MANAGEMENT
  // -------------------------------------------------------------
  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();

    if (themeToggleBtnEl) {
      themeToggleBtnEl.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('aria_theme', state.theme);
        updateThemeIcon();
      });
    }
  }

  function updateThemeIcon() {
    if (!themeToggleBtnEl) return;
    const isDark = state.theme === 'dark';
    themeToggleBtnEl.innerHTML = isDark
      ? `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    themeToggleBtnEl.setAttribute('aria-label', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
  }

  // -------------------------------------------------------------
  // 2. MOBILE SIDEBAR TOGGLE
  // -------------------------------------------------------------
  function initMobileMenu() {
    if (mobileMenuBtnEl && sidebarEl) {
      mobileMenuBtnEl.addEventListener('click', () => {
        sidebarEl.classList.toggle('open');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (sidebarEl.classList.contains('open') &&
            !sidebarEl.contains(e.target) &&
            !mobileMenuBtnEl.contains(e.target)) {
          sidebarEl.classList.remove('open');
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 3. IDLE STATE & WELCOME HERO
  // -------------------------------------------------------------
  function renderIdleScreen() {
    chatContainerEl.innerHTML = `
      <section class="welcome-hero" id="welcomeHero">
        <div class="hero-chip">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-9H9v5h2V7zm0 6H9v2h2v-2z"/>
          </svg>
          Grounded Enterprise AI Agent Layer
        </div>
        <h1 class="hero-title">Ask anything about enterprise operations</h1>
        <p class="hero-subtitle">
          Aria translates natural-language questions into validated SQL across 100+ raw tables
          in projects, contracts, procurement, construction, sales, and finance.
        </p>

        <div class="example-section">
          <div class="example-section-label">Suggested Example Questions</div>
          <div class="example-grid" id="exampleGrid">
            ${window.AriaMock.EXAMPLE_QUESTIONS.map((ex) => `
              <button type="button" class="example-card" data-query="${escapeHtml(ex.text)}">
                <div class="example-card-header">
                  <span class="example-card-category">${escapeHtml(ex.category)}</span>
                  ${ex.id === 'ex-4' || ex.id === 'ex-5' 
                    ? '<span class="example-card-tag ambiguous">Ambiguous (Clarifies)</span>' 
                    : ex.id === 'ex-6' 
                    ? '<span class="example-card-tag error-test">Error & Retry Test</span>' 
                    : '<span class="example-card-tag">Verified Query</span>'}
                </div>
                <div class="example-card-text">${escapeHtml(ex.text)}</div>
              </button>
            `).join('')}
          </div>
        </div>
      </section>
    `;

    // Attach click events to example prompt cards
    const cards = chatContainerEl.querySelectorAll('.example-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const query = card.getAttribute('data-query');
        chatInputEl.value = query;
        chatInputEl.focus();
        updateSendButtonState();
      });
    });
  }

  // -------------------------------------------------------------
  // 4. USER INPUT & SUBMISSION
  // -------------------------------------------------------------
  function initChatInput() {
    chatInputEl.addEventListener('input', () => {
      updateSendButtonState();
    });

    chatInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    });

    sendBtnEl.addEventListener('click', () => {
      handleSubmit();
    });

    if (newQueryBtnEl) {
      newQueryBtnEl.addEventListener('click', () => {
        resetToIdle();
      });
    }
  }

  function updateSendButtonState() {
    const hasText = chatInputEl.value.trim().length > 0;
    sendBtnEl.disabled = !hasText || state.isThinking;
  }

  function handleSubmit() {
    const query = chatInputEl.value.trim();
    if (!query || state.isThinking) return;

    chatInputEl.value = '';
    updateSendButtonState();

    // If welcome hero is visible, remove it
    const welcomeHero = document.getElementById('welcomeHero');
    if (welcomeHero) {
      welcomeHero.remove();
    }

    processUserQuery(query);
  }

  // -------------------------------------------------------------
  // 5. QUERY PROCESSING PIPELINE
  // -------------------------------------------------------------
  function processUserQuery(queryText, options = {}) {
    state.isThinking = true;
    updateSendButtonState();

    const queryId = 'q_' + Date.now();
    const queryElementId = 'query_node_' + queryId;

    // 1. Render User Bubble
    const userRow = document.createElement('div');
    userRow.className = 'chat-row user-row';
    userRow.id = queryElementId;
    userRow.innerHTML = `
      <div class="user-bubble">${escapeHtml(queryText)}</div>
    `;
    chatContainerEl.appendChild(userRow);

    // 2. Add to Sidebar Session History
    recordQueryToHistory(queryId, queryText, queryElementId);

    // 3. Render Thinking Component
    const thinkingRow = document.createElement('div');
    thinkingRow.className = 'chat-row agent-row';
    const thinkingId = 'thinking_' + queryId;
    thinkingRow.id = thinkingId;

    const stages = window.AriaMock.PIPELINE_STAGES;
    thinkingRow.innerHTML = `
      <div class="thinking-container">
        <div class="thinking-header">
          <div class="pulse-spinner" aria-hidden="true"></div>
          <span>Aria Query Pipeline Execution</span>
        </div>
        <ul class="stage-trail-list" id="trail_${queryId}">
          ${stages.map((st, idx) => `
            <li class="stage-item ${idx === 0 ? 'active' : 'pending'}" id="st_${queryId}_${idx}">
              <div class="stage-dot">${idx === 0 ? '●' : '○'}</div>
              <span class="stage-label">${escapeHtml(st.label)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    chatContainerEl.appendChild(thinkingRow);
    scrollToBottom();

    // 4. Invoke Isolated askAgent()
    window.askAgent(queryText, (stageIdx, stageObj, isRetry) => {
      // Progress Callback: Update visual stages
      const trailEl = document.getElementById(`trail_${queryId}`);
      if (!trailEl) return;

      if (isRetry) {
        // Append retry status item
        const retryLi = document.createElement('li');
        retryLi.className = 'stage-item retry-active';
        retryLi.innerHTML = `
          <div class="stage-dot">⚠</div>
          <span class="stage-label">${escapeHtml(stageObj.label)}</span>
        `;
        trailEl.appendChild(retryLi);
      } else {
        // Mark previous stages as completed
        for (let i = 0; i < stageIdx; i++) {
          const item = document.getElementById(`st_${queryId}_${i}`);
          if (item) {
            item.className = 'stage-item completed';
            const dot = item.querySelector('.stage-dot');
            if (dot) dot.innerHTML = '✓';
          }
        }
        // Mark current stage as active
        const curItem = document.getElementById(`st_${queryId}_${stageIdx}`);
        if (curItem) {
          curItem.className = 'stage-item active';
          const dot = curItem.querySelector('.stage-dot');
          if (dot) dot.innerHTML = '●';
        }
      }
      scrollToBottom();
    }, options)
    .then((result) => {
      state.isThinking = false;
      updateSendButtonState();

      // Handle based on result type
      if (result.type === 'clarification') {
        // Replace thinking with clarification card
        renderClarificationState(thinkingRow, queryText, result);
      } else if (result.type === 'error' || result.alwaysFails) {
        // Replace thinking with error recovery card
        renderErrorState(thinkingRow, queryText, result);
      } else {
        // Standard Results State
        renderResultsState(thinkingRow, queryText, result, queryId);
      }
      scrollToBottom();
    })
    .catch((err) => {
      state.isThinking = false;
      updateSendButtonState();
      renderErrorState(thinkingRow, queryText, {
        friendlyError: {
          title: 'System Communication Exception',
          message: 'An unexpected client-side error occurred while processing the response.',
          reason: String(err),
          suggestedActions: ['Please try repeating your question or refreshing the session.']
        }
      });
      scrollToBottom();
    });
  }

  // -------------------------------------------------------------
  // 6. RENDER CLARIFICATION STATE
  // -------------------------------------------------------------
  function renderClarificationState(containerRow, originalQuery, result) {
    containerRow.innerHTML = `
      <div class="agent-response-card">
        <div class="clarification-box">
          <div class="clarification-title">
            <svg width="18" height="18" fill="none" stroke="var(--accent-primary)" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Aria Needs Clarification
          </div>
          <p class="clarification-question">${escapeHtml(result.question)}</p>
          <div class="clarification-chips">
            ${result.options.map((opt) => `
              <button type="button" class="clarification-chip" data-payload="${escapeHtml(opt.payload)}" data-label="${escapeHtml(opt.label)}">
                <span>${escapeHtml(opt.label)}</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Wire up clarification chips
    const chips = containerRow.querySelectorAll('.clarification-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const payload = chip.getAttribute('data-payload');
        const label = chip.getAttribute('data-label');

        // Disable all chips in this box to lock selection
        chips.forEach(c => {
          c.disabled = true;
          c.style.opacity = '0.5';
          c.style.pointerEvents = 'none';
        });

        // Trigger processing of clarified intent
        processUserQuery(label, { clarificationPayload: payload });
      });
    });
  }

  // -------------------------------------------------------------
  // 7. RENDER RESULTS STATE
  // -------------------------------------------------------------
  function renderResultsState(containerRow, queryText, result, queryId) {
    const tableHtml = generateTableHtml(result.table, queryId);
    const chartHtml = generateChartHtml(result.chart);
    const sourcesHtml = (result.sources || []).map(s => `
      <span class="source-badge">
        <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/></svg>
        ${escapeHtml(s.name)}
      </span>
    `).join('');

    const followUpsHtml = (result.followUps || []).map(f => `
      <button type="button" class="followup-chip" data-query="${escapeHtml(f)}">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        ${escapeHtml(f)}
      </button>
    `).join('');

    containerRow.innerHTML = `
      <div class="agent-response-card">
        <!-- Collapsed Pipeline Status Line -->
        <div class="collapsed-pipeline" id="collapse_btn_${queryId}" title="Click to view stage details">
          <div class="collapsed-pipeline-text">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${escapeHtml(result.summary || 'Understood intent, retrieved schema, generated and validated query')}</span>
          </div>
          <span style="font-size: 10px;">Details ▼</span>
        </div>
        <div class="pipeline-details-drawer" id="drawer_${queryId}">
          <ul class="stage-trail-list">
            ${window.AriaMock.PIPELINE_STAGES.map(s => `
              <li class="stage-item completed">
                <div class="stage-dot">✓</div>
                <span>${escapeHtml(s.label)}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Grounded Natural Language Answer -->
        <div class="grounded-answer-text">
          ${formatMarkdownBold(result.answer)}
        </div>

        <!-- Data Table (Sortable) -->
        ${tableHtml}

        <!-- Inline Visualisation Chart -->
        ${chartHtml}

        <!-- Source Tables Row -->
        <div class="sources-row">
          <span class="sources-label">Sources:</span>
          ${sourcesHtml}
        </div>

        <!-- Collapsible SQL (<details>) -->
        <details class="sql-accordion">
          <summary class="sql-summary">
            <div class="sql-summary-left">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              <span>View Generated SQL Query</span>
            </div>
            <button type="button" class="btn-copy-sql" id="copy_sql_${queryId}">Copy SQL</button>
          </summary>
          <pre class="sql-code-block"><code>${escapeHtml(result.sql || '-- No SQL executed')}</code></pre>
        </details>

        <!-- Feedback & Follow-up Actions -->
        <div class="response-actions-row">
          <div class="feedback-buttons">
            <span style="font-size: 11px; color: var(--text-muted); margin-right: 4px;">Helpful?</span>
            <button type="button" class="feedback-btn" id="fb_up_${queryId}" title="Good answer" aria-label="Thumbs up">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            </button>
            <button type="button" class="feedback-btn" id="fb_down_${queryId}" title="Poor answer" aria-label="Thumbs down">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
            </button>
            <span class="feedback-status-text" id="fb_msg_${queryId}">Feedback saved!</span>
          </div>
        </div>

        <!-- Suggested Follow-ups -->
        ${result.followUps && result.followUps.length > 0 ? `
          <div class="followups-container">
            <div class="followups-label">Suggested Follow-ups</div>
            <div class="followups-chips-list">
              ${followUpsHtml}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // 1. Hook up collapsible pipeline drawer
    const collapseBtn = document.getElementById(`collapse_btn_${queryId}`);
    const drawer = document.getElementById(`drawer_${queryId}`);
    if (collapseBtn && drawer) {
      collapseBtn.addEventListener('click', () => {
        drawer.classList.toggle('expanded');
        const arrow = collapseBtn.querySelector('span:last-child');
        if (arrow) arrow.textContent = drawer.classList.contains('expanded') ? 'Details ▲' : 'Details ▼';
      });
    }

    // 2. Hook up Table Sorting
    if (result.table) {
      initTableSorting(queryId, result.table);
    }

    // 3. Hook up Copy SQL Button
    const copyBtn = document.getElementById(`copy_sql_${queryId}`);
    if (copyBtn && result.sql) {
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(result.sql).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy SQL'; }, 2000);
        }).catch(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy SQL'; }, 2000);
        });
      });
    }

    // 4. Hook up Feedback Buttons
    const fbUp = document.getElementById(`fb_up_${queryId}`);
    const fbDown = document.getElementById(`fb_down_${queryId}`);
    const fbMsg = document.getElementById(`fb_msg_${queryId}`);

    if (fbUp && fbDown) {
      fbUp.addEventListener('click', () => {
        fbUp.classList.toggle('active');
        fbDown.classList.remove('active');
        if (fbMsg) {
          fbMsg.style.display = 'inline';
          fbMsg.textContent = 'Helpful feedback recorded!';
        }
      });
      fbDown.addEventListener('click', () => {
        fbDown.classList.toggle('active');
        fbUp.classList.remove('active');
        if (fbMsg) {
          fbMsg.style.display = 'inline';
          fbMsg.textContent = 'Flagged for model review.';
        }
      });
    }

    // 5. Hook up Follow-up Chips
    const followUpBtns = containerRow.querySelectorAll('.followup-chip');
    followUpBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        processUserQuery(query);
      });
    });
  }

  // -------------------------------------------------------------
  // 8. RENDER ERROR / RETRY STATE
  // -------------------------------------------------------------
  function renderErrorState(containerRow, queryText, result) {
    const errorInfo = result.friendlyError || {
      title: 'Query Could Not Be Fulfilled',
      message: 'I couldn’t locate matching information in our current enterprise catalog.',
      reason: 'No schema relationship was identified for the requested parameters.',
      suggestedActions: ['Try rephrasing your question with broader terms.']
    };

    containerRow.innerHTML = `
      <div class="agent-response-card">
        <!-- Error & Recovery Box -->
        <div class="error-card">
          <div class="error-header">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            ${escapeHtml(errorInfo.title)}
          </div>
          <div class="error-message">${escapeHtml(errorInfo.message)}</div>
          <div class="error-reason">
            <strong>Context & Boundary:</strong> ${escapeHtml(errorInfo.reason)}
          </div>
          <div class="error-suggestions">
            <strong>Recommended Next Steps:</strong>
            <ul>
              ${errorInfo.suggestedActions.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="sources-row">
          <span class="sources-label">Pipeline Trace:</span>
          <span class="source-badge">Recovery: 2 retries exhausted</span>
          <span class="source-badge">Catalog: Real Estate Data Mart (FY2023-FY2026)</span>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // 9. TABLE RENDERING & INTERACTIVE SORTING
  // -------------------------------------------------------------
  function generateTableHtml(tableData, queryId) {
    if (!tableData || !tableData.headers || !tableData.rows) return '';

    return `
      <div class="result-table-container">
        <div class="table-title-bar">
          <span>${escapeHtml(tableData.title || 'Data Records')}</span>
          <span style="font-weight: normal; font-size: 11px; color: var(--text-muted);">${tableData.rows.length} rows returned</span>
        </div>
        <div class="table-scroll-wrapper">
          <table class="result-data-table" id="table_${queryId}">
            <thead>
              <tr>
                ${tableData.headers.map((h, i) => `
                  <th data-col-idx="${i}" data-type="${tableData.types[i] || 'string'}">
                    ${escapeHtml(h)}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody id="tbody_${queryId}">
              ${renderTableRowsHtml(tableData.rows, tableData.columns, tableData.types)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTableRowsHtml(rows, columns, types) {
    return rows.map(row => `
      <tr>
        ${columns.map((colKey, colIdx) => {
          const val = row[colKey];
          const type = types[colIdx];
          if (type === 'badge') {
            const badgeClass = 'status-' + String(val).toLowerCase().replace(/[^a-z0-9]/g, '-');
            return `<td><span class="td-badge ${badgeClass}">${escapeHtml(String(val))}</span></td>`;
          } else if (type === 'number') {
            const formatted = typeof val === 'number' ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val;
            return `<td class="td-number">${escapeHtml(String(formatted))}</td>`;
          } else if (type === 'percent' || type === 'variance') {
            return `<td class="td-number">${typeof val === 'number' ? (val > 0 && type === 'variance' ? '+' : '') + val.toFixed(1) + '%' : escapeHtml(String(val))}</td>`;
          } else {
            return `<td>${escapeHtml(String(val !== undefined ? val : ''))}</td>`;
          }
        }).join('')}
      </tr>
    `).join('');
  }

  function initTableSorting(queryId, tableData) {
    const tableEl = document.getElementById(`table_${queryId}`);
    const tbodyEl = document.getElementById(`tbody_${queryId}`);
    if (!tableEl || !tbodyEl) return;

    let currentSortCol = -1;
    let isAsc = true;
    let currentRows = [...tableData.rows];

    const ths = tableEl.querySelectorAll('th');
    ths.forEach((th, colIdx) => {
      th.addEventListener('click', () => {
        const colKey = tableData.columns[colIdx];
        const colType = tableData.types[colIdx];

        if (currentSortCol === colIdx) {
          isAsc = !isAsc;
        } else {
          currentSortCol = colIdx;
          isAsc = true;
        }

        // Update header classes
        ths.forEach(h => {
          h.classList.remove('sort-asc', 'sort-desc');
        });
        th.classList.add(isAsc ? 'sort-asc' : 'sort-desc');

        // Sort data
        currentRows.sort((a, b) => {
          let valA = a[colKey];
          let valB = b[colKey];

          if (colType === 'number' || colType === 'percent' || colType === 'variance') {
            valA = Number(valA) || 0;
            valB = Number(valB) || 0;
            return isAsc ? valA - valB : valB - valA;
          } else {
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
            return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
        });

        // Re-render tbody
        tbodyEl.innerHTML = renderTableRowsHtml(currentRows, tableData.columns, tableData.types);
      });
    });
  }

  // -------------------------------------------------------------
  // 10. INLINE BAR CHART GENERATOR
  // -------------------------------------------------------------
  function generateChartHtml(chartData) {
    if (!chartData || !chartData.items || chartData.items.length === 0) return '';

    // Calculate maximum value for 100% scale
    const maxVal = Math.max(...chartData.items.map(i => Math.max(i.value || 0, i.targetValue || 0, i.secondaryValue || 0))) || 1;

    return `
      <div class="chart-container">
        <div class="chart-title">${escapeHtml(chartData.title || 'Summary Chart')}</div>
        <div class="css-bar-chart">
          ${chartData.items.map(item => {
            const pct = Math.min(100, Math.max(8, Math.round((item.value / maxVal) * 100)));
            const barColor = item.color || 'var(--accent-primary)';
            return `
              <div class="chart-row-item">
                <div class="chart-row-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</div>
                <div class="chart-row-bar-track">
                  <div class="chart-row-bar-fill" style="width: ${pct}%; background-color: ${barColor};" title="${item.value}${chartData.unit || ''}"></div>
                </div>
                <div class="chart-row-value">${item.value}${chartData.unit || ''}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // 11. CONVERSATION HISTORY (SIDEBAR)
  // -------------------------------------------------------------
  function recordQueryToHistory(id, queryText, elementId) {
    state.sessionQueries.unshift({
      id: id,
      text: queryText,
      elementId: elementId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    renderHistorySidebar();
  }

  function renderHistorySidebar() {
    if (!historyListEl) return;
    if (state.sessionQueries.length === 0) {
      historyListEl.innerHTML = `<li style="padding: 10px; color: var(--text-muted); font-size: 11px;">No queries yet in this session.</li>`;
      return;
    }

    historyListEl.innerHTML = state.sessionQueries.map((item, idx) => `
      <li class="history-item ${idx === 0 ? 'active' : ''}" data-element-id="${item.elementId}">
        <span class="history-item-text" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</span>
        <span class="history-item-badge">${item.time}</span>
      </li>
    `).join('');

    const items = historyListEl.querySelectorAll('.history-item');
    items.forEach(it => {
      it.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        it.classList.add('active');

        const targetElId = it.getAttribute('data-element-id');
        const targetEl = document.getElementById(targetElId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function resetToIdle() {
    chatContainerEl.innerHTML = '';
    renderIdleScreen();
    chatInputEl.value = '';
    updateSendButtonState();
    scrollToBottom();
  }

  // -------------------------------------------------------------
  // 12. UTILITY HELPERS
  // -------------------------------------------------------------
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
    // Safely escape html first, then convert **bold** into <strong>
    const escaped = escapeHtml(text);
    return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (chatMessagesEl) {
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
      }
    });
  }

  // -------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // -------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initChatInput();
    renderIdleScreen();
    renderHistorySidebar();
  });
})();
