$(function () {
  requireAdmin(); // redirects to login.html if not a confirmed admin

  $('#logout-btn').on('click', adminLogout);

  // ---------- Tabs ----------
  $('#admin-tabs button').on('click', function () {
    const tab = $(this).data('tab');
    $('#admin-tabs button').removeClass('active');
    $(this).addClass('active');
    $('.tab-pane').addClass('d-none');
    $('#tab-' + tab).removeClass('d-none');

    // Lazy-load each tab's data only the first time it's opened, rather
    // than fetching everything up front on page load.
    if (tab === 'suppliers' && !$('#tab-suppliers').data('loaded')) loadSuppliers();
    if (tab === 'skills' && !$('#tab-skills').data('loaded')) loadSkills();
    if (tab === 'users' && !$('#tab-users').data('loaded')) loadUsers();
  });

  loadStats(); // overview is the default visible tab

  // ---------- Overview ----------
  function loadStats() {
    adminApi.get('/admin/stats').done(function (data) {
      const cards = [
        { label: 'Total Users', value: data.total_users },
        { label: 'Total Skills', value: data.total_skills },
        { label: 'Pending Swap Requests', value: data.swap_requests.pending },
        { label: 'Completed Swaps', value: data.swap_requests.completed },
        { label: 'Orders Placed', value: data.water_orders.placed },
        { label: 'Orders Delivered', value: data.water_orders.delivered },
        { label: 'Verified Suppliers', value: data.suppliers.verified },
        { label: 'Pending Verification', value: data.suppliers.pending_verification, highlight: data.suppliers.pending_verification > 0 },
      ];

      const html = cards
        .map(
          (c) => `
        <div class="col-md-3 col-sm-6">
          <div class="card stat-card ${c.highlight ? 'stat-card-highlight' : ''}">
            <div class="card-body">
              <div class="stat-value">${c.value}</div>
              <div class="stat-label">${c.label}</div>
            </div>
          </div>
        </div>`
        )
        .join('');

      $('#stats-cards').html(html);
    });
  }

  // ---------- Suppliers ----------
  function loadSuppliers() {
    adminApi.get('/admin/suppliers').done(function (data) {
      $('#tab-suppliers').data('loaded', true);
      const rows = data.suppliers
        .map(
          (s) => `
        <tr>
          <td>${escapeHtml(s.business_name)}</td>
          <td>${escapeHtml(s.user?.name || '')}<br><small class="text-muted">${escapeHtml(s.phone)}</small></td>
          <td>${escapeHtml(s.service_area)}</td>
          <td>₹${s.rate_per_liter}</td>
          <td>${s.tankers.length}</td>
          <td>${
            s.is_verified
              ? '<span class="badge bg-success">Verified</span>'
              : '<span class="badge bg-warning text-dark">Pending</span>'
          }</td>
          <td>
            ${
              s.is_verified
                ? `<button class="btn btn-sm btn-outline-danger" onclick="unverifySupplier(${s.id})">Revoke</button>`
                : `<button class="btn btn-sm btn-success" onclick="verifySupplier(${s.id})">Verify</button>`
            }
          </td>
        </tr>`
        )
        .join('');
      $('#suppliers-table-body').html(rows || '<tr><td colspan="7" class="text-muted">No suppliers yet.</td></tr>');
    });
  }

  window.verifySupplier = function (id) {
    adminApi.post(`/water-suppliers/${id}/verify`).done(function () {
      showAlert('suppliers-alert', 'Supplier verified.', 'success');
      loadSuppliers();
      loadStats();
    });
  };

  window.unverifySupplier = function (id) {
    if (!confirm('Revoke this supplier\'s verification? They will disappear from public listings.')) return;
    adminApi.post(`/water-suppliers/${id}/unverify`).done(function () {
      showAlert('suppliers-alert', 'Verification revoked.', 'warning');
      loadSuppliers();
      loadStats();
    });
  };

  // ---------- Skills ----------
  function loadSkills() {
    adminApi.get('/skills').done(function (data) {
      $('#tab-skills').data('loaded', true);
      const rows = data.skills
        .map(
          (s) => `
        <tr>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.category || '—')}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary" onclick="editSkill(${s.id}, '${escapeJs(s.name)}', '${escapeJs(s.category || '')}')">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteSkill(${s.id})">Delete</button>
          </td>
        </tr>`
        )
        .join('');
      $('#skills-table-body').html(rows);
    });
  }

  // Clicking the "+ Add Skill" button (not the per-row Edit buttons) should
  // always reset the modal to a blank "add" state first.
  $('[data-bs-target="#skill-modal"]').on('click', function () {
    $('#skill-id').val('');
    $('#skill-name').val('');
    $('#skill-category').val('');
    $('.modal-title').text('Add Skill');
    $('#skill-modal-error').addClass('d-none');
  });

  window.editSkill = function (id, name, category) {
    $('#skill-id').val(id);
    $('#skill-name').val(name);
    $('#skill-category').val(category);
    $('.modal-title').text('Edit Skill');
    $('#skill-modal-error').addClass('d-none');
    new bootstrap.Modal('#skill-modal').show();
  };

  $('#skill-save-btn').on('click', function () {
    const id = $('#skill-id').val();
    const payload = { name: $('#skill-name').val(), category: $('#skill-category').val() };
    const request = id ? adminApi.put(`/skills/${id}`, payload) : adminApi.post('/skills', payload);

    request
      .done(function () {
        bootstrap.Modal.getInstance(document.getElementById('skill-modal')).hide();
        showAlert('skills-alert', id ? 'Skill updated.' : 'Skill added.', 'success');
        loadSkills();
      })
      .fail(function (xhr) {
        const message = xhr.responseJSON?.errors?.name?.[0] || 'Could not save this skill.';
        $('#skill-modal-error').text(message).removeClass('d-none');
      });
  });

  window.deleteSkill = function (id) {
    if (!confirm('Delete this skill? Anyone who listed it will lose that entry.')) return;
    $.ajax({
      url: API_BASE + '/skills/' + id,
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token'), Accept: 'application/json' },
    }).done(function () {
      showAlert('skills-alert', 'Skill deleted.', 'warning');
      loadSkills();
    });
  };

  // ---------- Users ----------
  function loadUsers() {
    adminApi.get('/admin/users').done(function (data) {
      $('#tab-users').data('loaded', true);
      const rows = data.users
        .map(
          (u) => `
        <tr>
          <td>${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td>${escapeHtml(u.phone || '—')}</td>
          <td>${u.is_admin ? '<span class="badge bg-primary">Admin</span>' : ''}</td>
          <td>${new Date(u.created_at).toLocaleDateString()}</td>
        </tr>`
        )
        .join('');
      $('#users-table-body').html(rows);
    });
  }

  // ---------- Helpers ----------
  function showAlert(elementId, message, type) {
    $('#' + elementId)
      .removeClass('d-none alert-success alert-warning alert-danger')
      .addClass('alert-' + type)
      .text(message);
    setTimeout(() => $('#' + elementId).addClass('d-none'), 3000);
  }

  function escapeHtml(str) {
    return $('<div>').text(str || '').html();
  }

  function escapeJs(str) {
    return (str || '').replace(/'/g, "\\'");
  }
});
