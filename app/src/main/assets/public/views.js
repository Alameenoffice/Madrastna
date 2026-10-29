// Madrasati Comprehensive Role-Based Views & Educational Modules
(function () {
  const GRADES = [
    "الأول الابتدائي", "الثاني الابتدائي", "الثالث الابتدائي",
    "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي",
    "الأول المتوسط", "الثاني المتوسط", "الثالث المتوسط",
    "الرابع الإعدادي", "الخامس الإعدادي", "السادس الإعدادي"
  ];
  const SECTIONS = ["أ", "ب", "ج", "د"];
  const SUBJECTS = [
    "التربية الإسلامية", "اللغة العربية", "اللغة الإنجليزية",
    "الرياضيات", "العلوم", "الاجتماعيات", "الحاسوب", "التربية الفنية"
  ];
  const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];

  window.GRADES_LIST = GRADES;
  window.SECTIONS_LIST = SECTIONS;
  window.SUBJECTS_LIST = SUBJECTS;

  function roleLabel(role) {
    switch (role) {
      case 'admin': return 'المدير العام';
      case 'teacher': return 'كادر تعليمي (معلم)';
      case 'parent': return 'ولي أمر الطالب';
      case 'student': return 'طالب';
      default: return 'مستخدم';
    }
  }
  window.getRoleLabel = roleLabel;

  function calcEvaluation(avg) {
    if (avg >= 90) return { label: 'ممتاز', cls: 'badge-success' };
    if (avg >= 80) return { label: 'جيد جداً', cls: 'badge-primary' };
    if (avg >= 70) return { label: 'جيد', cls: 'badge-info' };
    if (avg >= 60) return { label: 'متوسط', cls: 'badge-warning' };
    if (avg >= 50) return { label: 'مقبول', cls: 'badge-warning' };
    return { label: 'يحتاج متابعة', cls: 'badge-danger' };
  }

  function formatWaPhone(phone) {
    if (!phone) return '9647512362567';
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.startsWith('07')) {
      cleaned = '964' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      cleaned = '964' + cleaned;
    }
    return cleaned;
  }

  window.buildWhatsAppUrl = function (phone, text) {
    const num = formatWaPhone(phone);
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  function getVisibleStudents(state) {
    const user = state.currentUser;
    if (!user) return [];
    if (user.role === 'student') {
      return state.students.filter(s => s.id === user.studentId);
    }
    if (user.role === 'parent') {
      return state.students.filter(s => s.id === user.studentId || s.parentPhone === user.phone);
    }
    return state.students;
  }

  // 1. DASHBOARD HOME
  window.renderHomeView = function (state) {
    const user = state.currentUser;
    const isPrivate = state.school.type === 'private';
    const today = new Date().toISOString().slice(0, 10);
    const visibleStudents = getVisibleStudents(state);
    const todayRecs = state.attendance.filter(a => a.date === today);
    const presentCount = todayRecs.filter(a => a.status === 'حاضر').length;

    const modules = [
      { id: 'attendance', title: 'الحضور والغياب', icon: 'userCheck', bg: 'var(--success-soft)', color: 'var(--success)' },
      { id: 'schedule', title: 'الجدول والواجبات', icon: 'bookOpen', bg: 'var(--primary-soft)', color: 'var(--primary)' },
      { id: 'grades', title: 'الامتحانات والدرجات', icon: 'clipboard', bg: 'var(--info-soft)', color: 'var(--info)' },
      { id: 'honor', title: 'لوحة الشرف', icon: 'trophy', bg: 'var(--accent-soft)', color: 'var(--accent)' }
    ];

    if (isPrivate) {
      modules.push({ id: 'fees', title: 'الأقساط الدراسية', icon: 'wallet', bg: 'var(--warning-soft)', color: 'var(--warning)' });
    }

    modules.push(
      { id: 'reports', title: 'البلاغات والتواصل', icon: 'message', bg: 'var(--danger-soft)', color: 'var(--danger)' },
      { id: 'gallery', title: 'الفعاليات والأخبار', icon: 'image', bg: 'var(--primary-soft)', color: 'var(--primary)' }
    );

    if (user.role === 'admin') {
      modules.unshift({ id: 'users', title: 'إدارة الحسابات', icon: 'users', bg: 'var(--primary-soft)', color: 'var(--primary)' });
    }

    const recentHomework = state.homeworks.slice(0, 3);
    const topHonors = state.honors.slice(0, 3);

    return `
      <div class="card" style="background: var(--header-grad); color: #fff; border: none;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <span class="badge" style="background:rgba(255,255,255,0.2); color:#fff; margin-bottom:6px;">
              ${icon('shield', 'icon-sm')} ${roleLabel(user.role)}
            </span>
            <h2 style="font-size:1.25rem; font-weight:900;">مرحباً بك، ${user.name}</h2>
            <p style="font-size:0.84rem; opacity:0.9;">
              ${state.school.name} • ${state.school.address || 'الموصل - زمار'} (${isPrivate ? 'مدرسة أهلية' : 'مدرسة حكومية'})
            </p>
          </div>
          <button class="btn btn-sm" style="background:rgba(255,255,255,0.18); color:#fff;" onclick="app.navigate('notifications')">
            ${icon('bell', 'icon-sm')} التنبيهات (${state.notifications.filter(n => !n.read).length})
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--primary-soft); color:var(--primary);">${icon('graduation', 'icon-lg')}</div>
          <div>
            <div class="stat-value">${visibleStudents.length}</div>
            <div class="stat-label">${user.role === 'parent' || user.role === 'student' ? 'بيانات الطالب' : 'إجمالي الطلاب'}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--success-soft); color:var(--success);">${icon('userCheck', 'icon-lg')}</div>
          <div>
            <div class="stat-value">${presentCount}</div>
            <div class="stat-label">حضور اليوم</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--info-soft); color:var(--info);">${icon('bookOpen', 'icon-lg')}</div>
          <div>
            <div class="stat-value">${state.homeworks.length}</div>
            <div class="stat-label">الواجبات المنشورة</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--accent-soft); color:var(--accent);">${icon('trophy', 'icon-lg')}</div>
          <div>
            <div class="stat-value">${state.honors.length}</div>
            <div class="stat-label">لوحة الشرف</div>
          </div>
        </div>
      </div>

      <div class="card-header" style="margin-bottom:10px;">
        <div class="card-title">${icon('sparkles')} الأقسام والخدمات المدرسية</div>
      </div>
      <div class="module-grid">
        ${modules.map(m => `
          <div class="module-tile" onclick="app.navigate('${m.id}')">
            <div class="module-tile-icon" style="background:${m.bg}; color:${m.color};">
              ${icon(m.icon, 'icon-lg')}
            </div>
            <div class="module-tile-title">${m.title}</div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('trophy')} كوكبة لوحة الشرف</div>
          <button class="btn btn-outline btn-sm" onclick="app.navigate('honor')">عرض الجميع ${icon('arrowLeft', 'icon-sm')}</button>
        </div>
        <div class="honor-grid">
          ${topHonors.map(h => `
            <div class="honor-card">
              ${h.photo
                ? `<img src="${h.photo}" class="honor-avatar" alt="${h.studentName}"/>`
                : `<div class="honor-avatar">${icon('award', 'icon-xl')}</div>`
              }
              <span class="badge badge-gold">${icon('star', 'icon-sm')} ${h.badgeTitle}</span>
              <div style="font-weight:800; font-size:1rem;">${h.studentName}</div>
              <div style="font-size:0.8rem; color:var(--text-secondary);">${h.grade} - شعبة ${h.section}</div>
              <div class="badge badge-primary">نقاط التميز: ${h.points} نقطة • المعدل: ${h.average}%</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('bookOpen')} أحدث التحضيرات والواجبات اليومية</div>
          <button class="btn btn-outline btn-sm" onclick="app.navigate('schedule')">الجدول الكامل ${icon('arrowLeft', 'icon-sm')}</button>
        </div>
        ${recentHomework.map(hw => `
          <div class="item-row">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span class="badge badge-primary">${hw.subject}</span>
                <span class="badge badge-info">${hw.grade} (${hw.section})</span>
              </div>
              <div style="font-weight:800;">${hw.title}</div>
              <div style="font-size:0.84rem; color:var(--text-secondary);">${hw.details}</div>
            </div>
            <div style="text-align:left;">
              <span class="badge badge-warning">${icon('calendar', 'icon-sm')} التسليم: ${hw.dueDate}</span>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">المعلم: ${hw.teacherName}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  // 2. USER & ACCOUNT MANAGEMENT (ADMIN ONLY)
  window.renderUsersView = function (state) {
    if (state.currentUser.role !== 'admin') {
      return `<div class="card">هذا القسم مخصص للإدارة فقط.</div>`;
    }
    const subTab = state.ui.usersSubTab || 'students';
    const isPrivate = state.school.type === 'private';

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('users')} إدارة الحسابات والمستخدمين</div>
          <div class="btn-row">
            <button class="btn btn-sm ${subTab === 'students' ? 'btn-primary' : 'btn-outline'}" onclick="app.setSubTab('usersSubTab','students')">
              ${icon('graduation', 'icon-sm')} حسابات الطلاب وأولياء الأمور (${state.students.length})
            </button>
            <button class="btn btn-sm ${subTab === 'teachers' ? 'btn-primary' : 'btn-outline'}" onclick="app.setSubTab('usersSubTab','teachers')">
              ${icon('userCheck', 'icon-sm')} حسابات المعلمين (${state.teachers.length})
            </button>
          </div>
        </div>
        <p style="font-size:0.85rem; color:var(--text-secondary);">
          من هنا تقوم الإدارة حصرياً بإنشاء وتفعيل أو إيقاف حسابات المعلمين والطلاب وأولياء الأمور وإرسال بيانات الدخول مباشرة عبر واتساب.
        </p>
      </div>

      ${subTab === 'teachers' ? `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('userPlus')} إضافة حساب معلم جديد</div>
            <button type="button" class="btn btn-outline btn-sm" onclick="app.generateTeacherCreds()">
              ${icon('key', 'icon-sm')} توليد رمز دخول تلقائي
            </button>
          </div>
          <form onsubmit="app.handleAddTeacher(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">${icon('user', 'icon-sm')} اسم المعلم الثلاثي</label>
                <input type="text" id="t_name" class="form-control" placeholder="مثال: أ. محمود خليل" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('bookOpen', 'icon-sm')} المادة الدراسية</label>
                <select id="t_subject" class="form-control">
                  ${SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">${icon('school', 'icon-sm')} الصفوف المسندة</label>
                <input type="text" id="t_classes" class="form-control" placeholder="مثال: الخامس والسادس الابتدائي" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('phone', 'icon-sm')} رقم هاتف المعلم (واتساب)</label>
                <input type="tel" id="t_phone" class="form-control" placeholder="07512362567" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('mapPin', 'icon-sm')} عنوان السكن</label>
                <input type="text" id="t_address" class="form-control" placeholder="الموصل - زمار" value="الموصل - زمار" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('user', 'icon-sm')} اسم المستخدم للمعلم</label>
                <input type="text" id="t_username" class="form-control" value="teacher${state.teachers.length + 1}" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('lock', 'icon-sm')} كلمة المرور</label>
                <input type="text" id="t_password" class="form-control" value="T@${Math.floor(1000 + Math.random() * 9000)}" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary">
              ${icon('check', 'icon-sm')} إنشاء وتفعيل حساب المعلم
            </button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('users')} قائمة حسابات المعلمين</div>
          </div>
          ${state.teachers.map(t => {
            const waMsg = `السلام عليكم أ. ${t.name} المحترم،\nتم تفعيل حسابكم في منصة مدرستي (${state.school.name}).\nبيانات الدخول:\nاسم المستخدم: ${t.username}\nكلمة المرور: ${t.password}\nالمادة: ${t.subject}\nمع التقدير.`;
            return `
              <div class="item-row">
                <div class="user-info-cell">
                  <div class="avatar-circle">${icon('userCheck')}</div>
                  <div>
                    <div style="font-weight:800; font-size:0.96rem;">${t.name}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">
                      اختصاص: ${t.subject} • الصفوف: ${t.classes} • ${t.address || 'الموصل - زمار'}
                    </div>
                    <div style="margin-top:4px; display:flex; gap:6px; flex-wrap:wrap;">
                      <span class="badge badge-primary">${icon('user', 'icon-sm')} المستخدم: ${t.username}</span>
                      <span class="badge badge-info">${icon('key', 'icon-sm')} الرمز: ${t.password}</span>
                    </div>
                  </div>
                </div>
                <div class="btn-row">
                  <button class="switch-btn ${t.active ? 'on' : 'off'}" onclick="app.toggleUserActive('teacher','${t.id}')">
                    ${icon('power', 'icon-sm')} ${t.active ? 'الحساب مفعل' : 'الحساب متوقف'}
                  </button>
                  <a href="${window.buildWhatsAppUrl(t.phone, waMsg)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
                    ${icon('whatsapp', 'icon-sm')} إرسال بيانات الدخول للمعلم عبر واتساب
                  </a>
                  <button class="btn btn-danger btn-sm" onclick="app.deleteTeacher('${t.id}')">
                    ${icon('trash', 'icon-sm')}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('userPlus')} تسجيل طالب وولي أمره وتوليد بيانات الدخول</div>
            <button type="button" class="btn btn-outline btn-sm" onclick="app.generateStudentCreds()">
              ${icon('key', 'icon-sm')} توليد أكواد دخول جديدة
            </button>
          </div>
          <form onsubmit="app.handleAddStudent(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">${icon('graduation', 'icon-sm')} اسم الطالب الرباعي</label>
                <input type="text" id="s_name" class="form-control" placeholder="مثال: علي عمر الحسن" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('school', 'icon-sm')} الصف الدراسي</label>
                <select id="s_grade" class="form-control">
                  ${GRADES.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">${icon('users', 'icon-sm')} الشعبة</label>
                <select id="s_section" class="form-control">
                  ${SECTIONS.map(sec => `<option value="${sec}">${sec}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">${icon('user', 'icon-sm')} اسم ولي الأمر</label>
                <input type="text" id="s_parentName" class="form-control" placeholder="مثال: عمر الحسن" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('phone', 'icon-sm')} هاتف ولي الأمر (واتساب)</label>
                <input type="tel" id="s_parentPhone" class="form-control" placeholder="07512362567" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('mapPin', 'icon-sm')} عنوان السكن</label>
                <input type="text" id="s_address" class="form-control" placeholder="الموصل - زمار" value="الموصل - زمار" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('key', 'icon-sm')} اسم مستخدم الطالب</label>
                <input type="text" id="s_username" class="form-control" value="std${state.students.length + 101}" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('lock', 'icon-sm')} كلمة مرور / كود الطالب</label>
                <input type="text" id="s_password" class="form-control" value="${Math.floor(100000 + Math.random() * 900000)}" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('key', 'icon-sm')} اسم مستخدم ولي الأمر</label>
                <input type="text" id="s_parentUsername" class="form-control" value="prt${state.students.length + 101}" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('lock', 'icon-sm')} كلمة مرور ولي الأمر</label>
                <input type="text" id="s_parentPassword" class="form-control" value="${Math.floor(100000 + Math.random() * 900000)}" required />
              </div>
              ${isPrivate ? `
                <div class="form-group">
                  <label class="form-label">${icon('wallet', 'icon-sm')} القسط الدراسي الكلي (د.ع)</label>
                  <input type="number" id="s_totalFee" class="form-control" value="1500000" required />
                </div>
                <div class="form-group">
                  <label class="form-label">${icon('calendar', 'icon-sm')} تاريخ استحقاق القسط</label>
                  <input type="date" id="s_dueDate" class="form-control" value="2026-12-01" required />
                </div>
              ` : ''}
              <div class="form-group">
                <label class="form-label">${icon('camera', 'icon-sm')} صورة الطالب (ضغط تلقائي سريع)</label>
                <input type="file" accept="image/*" class="form-control" onchange="app.previewCompressedImage(event, 'studentPreviewImg')" />
                <img id="studentPreviewImg" style="display:none; width:56px; height:56px; border-radius:12px; object-fit:cover; margin-top:6px;" alt="معاينة"/>
              </div>
            </div>
            <button type="submit" class="btn btn-primary">
              ${icon('check', 'icon-sm')} حفظ وتفعيل حساب الطالب وولي الأمر
            </button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('graduation')} سجل حسابات الطلاب وأولياء الأمور</div>
          </div>
          ${state.students.map(s => {
            const waMsg = `السلام عليكم السيد ${s.parentName} المحترم،\nمرحباً بكم في منصة مدرستي (${state.school.name}).\nبيانات دخول ولي الأمر:\nاسم المستخدم: ${s.parentUsername}\nكلمة المرور: ${s.parentPassword}\n---\nبيانات دخول الطالب (${s.name} - ${s.grade} شعبة ${s.section}):\nاسم المستخدم: ${s.username}\nكلمة المرور: ${s.password}\nنتمنى لطالبنا دوام التفوق والنجاح.`;
            return `
              <div class="item-row">
                <div class="user-info-cell">
                  ${s.photo
                    ? `<img src="${s.photo}" class="avatar-circle" alt="${s.name}"/>`
                    : `<div class="avatar-circle">${icon('graduation')}</div>`
                  }
                  <div>
                    <div style="font-weight:800; font-size:0.96rem;">${s.name} <span class="badge badge-info">${s.grade} - ${s.section}</span></div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">
                      ولي الأمر: ${s.parentName} (${s.parentPhone}) • العنوان: ${s.address || 'الموصل - زمار'}
                    </div>
                    <div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;">
                      <span class="badge badge-primary">الطالب: ${s.username} / ${s.password}</span>
                      <span class="badge badge-warning">ولي الأمر: ${s.parentUsername} / ${s.parentPassword}</span>
                    </div>
                  </div>
                </div>
                <div class="btn-row">
                  <button class="switch-btn ${s.active ? 'on' : 'off'}" onclick="app.toggleUserActive('student','${s.id}')">
                    ${icon('power', 'icon-sm')} ${s.active ? 'الحساب مفعل' : 'الحساب متوقف'}
                  </button>
                  <a href="${window.buildWhatsAppUrl(s.parentPhone, waMsg)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
                    ${icon('whatsapp', 'icon-sm')} إرسال بيانات الحساب لولي الأمر عبر واتساب
                  </a>
                  <button class="btn btn-danger btn-sm" onclick="app.deleteStudent('${s.id}')">
                    ${icon('trash', 'icon-sm')}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  };

  // 3. DAILY ATTENDANCE
  window.renderAttendanceView = function (state) {
    const user = state.currentUser;
    const canEdit = user.role === 'admin' || user.role === 'teacher';
    const selGrade = state.ui.attGrade || 'الكل';
    const selSection = state.ui.attSection || 'الكل';
    const selDate = state.ui.attDate || new Date().toISOString().slice(0, 10);

    let students = getVisibleStudents(state);
    if (canEdit) {
      if (selGrade !== 'الكل') students = students.filter(s => s.grade === selGrade);
      if (selSection !== 'الكل') students = students.filter(s => s.section === selSection);
    }

    const getStatus = (studentId) => {
      const rec = state.attendance.find(a => a.studentId === studentId && a.date === selDate);
      return rec ? rec.status : 'حاضر';
    };

    let present = 0, absent = 0, late = 0, excused = 0;
    students.forEach(s => {
      const st = getStatus(s.id);
      if (st === 'حاضر') present++;
      else if (st === 'غائب') absent++;
      else if (st === 'متأخر') late++;
      else if (st === 'إجازة') excused++;
    });

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('userCheck')} سجل الحضور والغياب اليومي</div>
          <span class="badge badge-primary">${icon('calendar', 'icon-sm')} التاريخ: ${selDate}</span>
        </div>

        <div class="form-grid" style="margin-bottom:4px;">
          <div class="form-group">
            <label class="form-label">${icon('calendar', 'icon-sm')} التاريخ</label>
            <input type="date" class="form-control" value="${selDate}" onchange="app.setAttendanceFilter('attDate', this.value)" />
          </div>
          ${canEdit ? `
            <div class="form-group">
              <label class="form-label">${icon('school', 'icon-sm')} الصف الدراسي</label>
              <select class="form-control" onchange="app.setAttendanceFilter('attGrade', this.value)">
                <option value="الكل" ${selGrade === 'الكل' ? 'selected' : ''}>جميع الصفوف</option>
                ${GRADES.map(g => `<option value="${g}" ${selGrade === g ? 'selected' : ''}>${g}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">${icon('users', 'icon-sm')} الشعبة</label>
              <select class="form-control" onchange="app.setAttendanceFilter('attSection', this.value)">
                <option value="الكل" ${selSection === 'الكل' ? 'selected' : ''}>جميع الشعب</option>
                ${SECTIONS.map(sec => `<option value="${sec}" ${selSection === sec ? 'selected' : ''}>شعبة ${sec}</option>`).join('')}
              </select>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--success-soft); color:var(--success);">${icon('checkCircle', 'icon-lg')}</div>
          <div><div class="stat-value">${present}</div><div class="stat-label">حاضر</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--danger-soft); color:var(--danger);">${icon('xCircle', 'icon-lg')}</div>
          <div><div class="stat-value">${absent}</div><div class="stat-label">غائب</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--warning-soft); color:var(--warning);">${icon('clock', 'icon-lg')}</div>
          <div><div class="stat-value">${late}</div><div class="stat-label">متأخر</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--info-soft); color:var(--info);">${icon('fileText', 'icon-lg')}</div>
          <div><div class="stat-value">${excused}</div><div class="stat-label">إجازة</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('users')} قائمة الطلبة (${students.length})</div>
        </div>
        ${students.map(s => {
          const st = getStatus(s.id);
          const waText = `تبليغ من إدارة ${state.school.name}:\nنود إعلامكم بأن الطالب (${s.name}) في الصف (${s.grade} - شعبة ${s.section}) قد سُجل اليوم (${selDate}) بحالة: [${st}].\nيرجى المتابعة مع إدارة المدرسة مع التقدير.`;
          return `
            <div class="item-row">
              <div class="user-info-cell">
                ${s.photo
                  ? `<img src="${s.photo}" class="avatar-circle" alt="${s.name}"/>`
                  : `<div class="avatar-circle">${icon('user')}</div>`
                }
                <div>
                  <div style="font-weight:800;">${s.name}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary);">
                    ${s.grade} - شعبة ${s.section} • ولي الأمر: ${s.parentName}
                  </div>
                </div>
              </div>
              <div class="btn-row">
                ${canEdit ? `
                  <div class="attendance-actions">
                    <button class="status-btn present ${st === 'حاضر' ? 'active' : ''}" onclick="app.markAttendance('${s.id}','${selDate}','حاضر')">
                      ${icon('checkCircle', 'icon-sm')} حاضر
                    </button>
                    <button class="status-btn absent ${st === 'غائب' ? 'active' : ''}" onclick="app.markAttendance('${s.id}','${selDate}','غائب')">
                      ${icon('xCircle', 'icon-sm')} غائب
                    </button>
                    <button class="status-btn late ${st === 'متأخر' ? 'active' : ''}" onclick="app.markAttendance('${s.id}','${selDate}','متأخر')">
                      ${icon('clock', 'icon-sm')} متأخر
                    </button>
                    <button class="status-btn excused ${st === 'إجازة' ? 'active' : ''}" onclick="app.markAttendance('${s.id}','${selDate}','إجازة')">
                      ${icon('fileText', 'icon-sm')} إجازة
                    </button>
                  </div>
                  <a href="${window.buildWhatsAppUrl(s.parentPhone, waText)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
                    ${icon('whatsapp', 'icon-sm')} تبليغ واتساب
                  </a>
                ` : `
                  <span class="badge ${st === 'حاضر' ? 'badge-success' : st === 'غائب' ? 'badge-danger' : st === 'متأخر' ? 'badge-warning' : 'badge-info'}">
                    الحالة اليوم: ${st}
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  // 4. WEEKLY SCHEDULE & DAILY HOMEWORK
  window.renderScheduleView = function (state) {
    const user = state.currentUser;
    const canEdit = user.role === 'admin' || user.role === 'teacher';
    const subTab = state.ui.scheduleSubTab || 'homework';
    const selGrade = state.ui.schedGrade || (state.students[0] ? state.students[0].grade : GRADES[5]);
    const selSection = state.ui.schedSection || 'أ';

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('bookOpen')} جدول الدروس والتحضير اليومي والواجبات</div>
          <div class="btn-row">
            <button class="btn btn-sm ${subTab === 'homework' ? 'btn-primary' : 'btn-outline'}" onclick="app.setSubTab('scheduleSubTab','homework')">
              ${icon('clipboard', 'icon-sm')} التحضير اليومي والواجب القادم
            </button>
            <button class="btn btn-sm ${subTab === 'timetable' ? 'btn-primary' : 'btn-outline'}" onclick="app.setSubTab('scheduleSubTab','timetable')">
              ${icon('calendar', 'icon-sm')} جدول الدروس الأسبوعي
            </button>
          </div>
        </div>
      </div>

      ${subTab === 'homework' ? `
        ${canEdit ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title">${icon('plus')} نشر التحضير اليومي والواجب البيتي القادم</div>
            </div>
            <form onsubmit="app.handleAddHomework(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">${icon('bookOpen', 'icon-sm')} المادة الدراسية</label>
                  <select id="hw_subject" class="form-control">
                    ${SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${icon('school', 'icon-sm')} الصف</label>
                  <select id="hw_grade" class="form-control">
                    ${GRADES.map(g => `<option value="${g}">${g}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${icon('users', 'icon-sm')} الشعبة</label>
                  <select id="hw_section" class="form-control">
                    ${SECTIONS.map(sec => `<option value="${sec}">${sec}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${icon('calendar', 'icon-sm')} موعد التسليم / التحضير</label>
                  <input type="date" id="hw_dueDate" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">${icon('fileText', 'icon-sm')} عنوان الدرس والتحضير القادم</label>
                <input type="text" id="hw_title" class="form-control" placeholder="مثال: الفصل الثالث - المعادلات الكيميائية ص 42" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('clipboard', 'icon-sm')} تفاصيل الواجب البيتي المطلوب</label>
                <textarea id="hw_details" class="form-control" rows="2" placeholder="مثال: حل تمارين الكتاب صفحة 45 في الدفتر الصفي" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">
                ${icon('send', 'icon-sm')} نشر الواجب وإشعار الطلاب وأولياء الأمور
              </button>
            </form>
          </div>
        ` : ''}

        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('bookOpen')} قائمة التحضير اليومي والواجبات البيتية</div>
          </div>
          ${state.homeworks.map(hw => `
            <div class="item-row">
              <div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px;">
                  <span class="badge badge-primary">${icon('bookOpen', 'icon-sm')} ${hw.subject}</span>
                  <span class="badge badge-info">${hw.grade} - شعبة ${hw.section}</span>
                  <span class="badge badge-warning">${icon('calendar', 'icon-sm')} التسليم: ${hw.dueDate}</span>
                </div>
                <div style="font-weight:800; font-size:0.98rem;">${hw.title}</div>
                <div style="font-size:0.86rem; color:var(--text-secondary); margin-top:4px;">${hw.details}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">نُشر بواسطة: ${hw.teacherName}</div>
              </div>
              ${canEdit ? `
                <button class="btn btn-danger btn-sm" onclick="app.deleteHomework('${hw.id}')">
                  ${icon('trash', 'icon-sm')}
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('calendar')} جدول الدروس الأسبوعي</div>
            <div class="btn-row">
              <select class="form-control" style="width:auto;" onchange="app.setAttendanceFilter('schedGrade', this.value)">
                ${GRADES.map(g => `<option value="${g}" ${selGrade === g ? 'selected' : ''}>${g}</option>`).join('')}
              </select>
              <select class="form-control" style="width:auto;" onchange="app.setAttendanceFilter('schedSection', this.value)">
                ${SECTIONS.map(sec => `<option value="${sec}" ${selSection === sec ? 'selected' : ''}>شعبة ${sec}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>اليوم</th>
                  <th>الحصة الأولى</th>
                  <th>الحصة الثانية</th>
                  <th>الحصة الثالثة</th>
                  <th>الحصة الرابعة</th>
                  <th>الحصة الخامسة</th>
                </tr>
              </thead>
              <tbody>
                ${DAYS.map((day, dIdx) => {
                  const row = state.timetable[day] || [
                    SUBJECTS[(dIdx + 0) % SUBJECTS.length],
                    SUBJECTS[(dIdx + 1) % SUBJECTS.length],
                    SUBJECTS[(dIdx + 2) % SUBJECTS.length],
                    SUBJECTS[(dIdx + 3) % SUBJECTS.length],
                    SUBJECTS[(dIdx + 4) % SUBJECTS.length]
                  ];
                  return `
                    <tr>
                      <td style="font-weight:800; color:var(--primary);">${day}</td>
                      ${row.map(sub => `<td><span class="badge badge-primary">${sub}</span></td>`).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    `;
  };

  // 5. EXAMS & DETAILED GRADE SHEET
  window.renderGradesView = function (state) {
    const user = state.currentUser;
    const canEdit = user.role === 'admin' || user.role === 'teacher';
    const subTab = state.ui.gradesSubTab || 'sheet';
    const students = getVisibleStudents(state);
    const selStudentId = state.ui.selectedStudentId || (students[0] ? students[0].id : '');
    const currentStudent = students.find(s => s.id === selStudentId) || students[0];

    const studentGrades = currentStudent
      ? state.grades.filter(g => g.studentId === currentStudent.id)
      : [];

    let overallSum = 0;
    studentGrades.forEach(g => {
      const annualEffort = Math.round((Number(g.daily) + Number(g.month1) + Number(g.month2) + Number(g.midYear)) / 4);
      const finalAvg = Math.round((annualEffort + Number(g.finalExam)) / 2);
      overallSum += finalAvg;
    });
    const totalAverage = studentGrades.length ? Math.round(overallSum / studentGrades.length) : 0;
    const totalEval = calcEvaluation(totalAverage);

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('clipboard')} الامتحانات وكشف الدرجات التفصيلي</div>
          <div class="btn-row">
            <button class="btn btn-sm ${subTab === 'sheet' ? 'btn-primary' : 'btn-outline'}" onclick="app.setSubTab('gradesSubTab','sheet')">
              ${icon('award', 'icon-sm')} كشف الدرجات والمعدل
            </button>
            <button class="btn btn-sm ${subTab === 'exams' ? 'btn-primary' : 'btn-outline'}" onclick="app.setSubTab('gradesSubTab','exams')">
              ${icon('calendar', 'icon-sm')} جدول مواعيد الامتحانات
            </button>
          </div>
        </div>
      </div>

      ${subTab === 'sheet' ? `
        ${canEdit ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title">${icon('plus')} رصد وتحديث درجات طالب</div>
            </div>
            <form onsubmit="app.handleSaveGrade(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">${icon('graduation', 'icon-sm')} اختر الطالب</label>
                  <select id="gr_studentId" class="form-control" onchange="app.setAttendanceFilter('selectedStudentId', this.value)">
                    ${students.map(s => `<option value="${s.id}" ${currentStudent && s.id === currentStudent.id ? 'selected' : ''}>${s.name} (${s.grade})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${icon('bookOpen', 'icon-sm')} المادة الدراسية</label>
                  <select id="gr_subject" class="form-control">
                    ${SUBJECTS.map(sub => `<option value="${sub}">${sub}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">درجة اليومي (100)</label>
                  <input type="number" id="gr_daily" class="form-control" min="0" max="100" value="92" required />
                </div>
                <div class="form-group">
                  <label class="form-label">الشهر الأول (100)</label>
                  <input type="number" id="gr_month1" class="form-control" min="0" max="100" value="90" required />
                </div>
                <div class="form-group">
                  <label class="form-label">الشهر الثاني (100)</label>
                  <input type="number" id="gr_month2" class="form-control" min="0" max="100" value="94" required />
                </div>
                <div class="form-group">
                  <label class="form-label">نصف السنة (100)</label>
                  <input type="number" id="gr_midYear" class="form-control" min="0" max="100" value="91" required />
                </div>
                <div class="form-group">
                  <label class="form-label">الامتحان النهائي (100)</label>
                  <input type="number" id="gr_finalExam" class="form-control" min="0" max="100" value="95" required />
                </div>
              </div>
              <button type="submit" class="btn btn-primary">
                ${icon('check', 'icon-sm')} رصد الدرجة وحساب السعي والمعدل تلقائياً
              </button>
            </form>
          </div>
        ` : ''}

        ${currentStudent ? `
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">${icon('graduation')} كشف درجات الطالب: ${currentStudent.name}</div>
                <div style="font-size:0.82rem; color:var(--text-secondary);">
                  ${currentStudent.grade} - شعبة ${currentStudent.section}
                </div>
              </div>
              <div class="btn-row">
                <span class="badge badge-primary">المعدل العام: ${totalAverage}%</span>
                <span class="badge ${totalEval.cls}">التقدير العام: ${totalEval.label}</span>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>المادة</th>
                    <th>يومي</th>
                    <th>الشهر الأول</th>
                    <th>الشهر الثاني</th>
                    <th>نصف السنة</th>
                    <th>السعي السنوي</th>
                    <th>الامتحان النهائي</th>
                    <th>المعدل النهائي</th>
                    <th>التقدير</th>
                  </tr>
                </thead>
                <tbody>
                  ${studentGrades.map(g => {
                    const annual = Math.round((Number(g.daily) + Number(g.month1) + Number(g.month2) + Number(g.midYear)) / 4);
                    const finalAvg = Math.round((annual + Number(g.finalExam)) / 2);
                    const ev = calcEvaluation(finalAvg);
                    return `
                      <tr>
                        <td style="font-weight:800;">${g.subject}</td>
                        <td>${g.daily}</td>
                        <td>${g.month1}</td>
                        <td>${g.month2}</td>
                        <td>${g.midYear}</td>
                        <td style="font-weight:800; color:var(--primary);">${annual}</td>
                        <td>${g.finalExam}</td>
                        <td style="font-weight:900;">${finalAvg}%</td>
                        <td><span class="badge ${ev.cls}">${ev.label}</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      ` : `
        ${canEdit ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title">${icon('plus')} إضافة موعد امتحان جديد</div>
            </div>
            <form onsubmit="app.handleAddExam(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">المادة</label>
                  <select id="ex_subject" class="form-control">
                    ${SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">الصف الدراسي</label>
                  <select id="ex_grade" class="form-control">
                    ${GRADES.map(g => `<option value="${g}">${g}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">تاريخ الامتحان</label>
                  <input type="date" id="ex_date" class="form-control" value="2026-11-15" required />
                </div>
                <div class="form-group">
                  <label class="form-label">الوقت والمنهاج</label>
                  <input type="text" id="ex_notes" class="form-control" placeholder="مثال: الساعة 8:30 صباحاً - الفصول الثلاثة الأولى" required />
                </div>
              </div>
              <button type="submit" class="btn btn-primary">${icon('check', 'icon-sm')} نشر موعد الامتحان</button>
            </form>
          </div>
        ` : ''}

        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('calendar')} جدول مواعيد الامتحانات المعلنة</div>
          </div>
          ${state.exams.map(ex => `
            <div class="item-row">
              <div>
                <div style="display:flex; gap:6px; margin-bottom:4px;">
                  <span class="badge badge-primary">${ex.subject}</span>
                  <span class="badge badge-info">${ex.grade}</span>
                </div>
                <div style="font-weight:800;">تاريخ الامتحان: ${ex.date}</div>
                <div style="font-size:0.84rem; color:var(--text-secondary);">${ex.notes}</div>
              </div>
              <span class="badge badge-warning">${icon('clock', 'icon-sm')} امتحان رسمي</span>
            </div>
          `).join('')}
        </div>
      `}
    `;
  };

  // 6. HONOR ROLL (GOLDEN CELEBRATORY SECTION)
  window.renderHonorView = function (state) {
    const user = state.currentUser;
    const canEdit = user.role === 'admin' || user.role === 'teacher';

    return `
      <div class="honor-banner">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <span class="badge badge-gold" style="margin-bottom:6px;">${icon('trophy', 'icon-sm')} وسام التميز الأكاديمي والسلوكي</span>
            <h2 style="font-size:1.3rem; font-weight:900;">لوحة الشرف والطلبة المجتهدون</h2>
            <p style="font-size:0.86rem; opacity:0.9;">
              نحتفي بأبنائنا الطلبة الأوائل والمجتهدين في ${state.school.name} تقديراً لتفوقهم العلمي والتزامهم المثالي.
            </p>
          </div>
          <div style="width:58px; height:58px; border-radius:18px; background:rgba(255,255,255,0.45); display:flex; align-items:center; justify-content:center;">
            ${icon('award', 'icon-xl')}
          </div>
        </div>
      </div>

      ${canEdit ? `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('sparkles')} تكريم طالب وإضافته إلى لوحة الشرف</div>
          </div>
          <form onsubmit="app.handleAddHonor(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">اسم الطالب المتفوق</label>
                <input type="text" id="hn_name" class="form-control" placeholder="مثال: سارة مهند العبيدي" required />
              </div>
              <div class="form-group">
                <label class="form-label">الصف الدراسي</label>
                <select id="hn_grade" class="form-control">
                  ${GRADES.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">الشعبة</label>
                <select id="hn_section" class="form-control">
                  ${SECTIONS.map(sec => `<option value="${sec}">${sec}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">وسام التكريم</label>
                <select id="hn_badge" class="form-control">
                  <option value="وسام التفوق الذهبي - الأول على الصف">وسام التفوق الذهبي - الأول على الصف</option>
                  <option value="وسام الطالب المثالي والمجتهد">وسام الطالب المثالي والمجتهد</option>
                  <option value="نجم الأسبوع في الالتزام والتحضير">نجم الأسبوع في الالتزام والتحضير</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">المعدل الدراسي (%)</label>
                <input type="number" id="hn_avg" class="form-control" min="50" max="100" value="98" required />
              </div>
              <div class="form-group">
                <label class="form-label">نقاط التميز</label>
                <input type="number" id="hn_points" class="form-control" min="10" max="1000" value="250" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('camera', 'icon-sm')} صورة الطالب المتفوق</label>
                <input type="file" accept="image/*" class="form-control" onchange="app.previewCompressedImage(event, 'honorPreviewImg')" />
                <img id="honorPreviewImg" style="display:none; width:56px; height:56px; border-radius:50%; object-fit:cover; margin-top:6px;" alt="معاينة"/>
              </div>
            </div>
            <button type="submit" class="btn btn-accent">
              ${icon('trophy', 'icon-sm')} منح الوسام وإدراجه في لوحة الشرف
            </button>
          </form>
        </div>
      ` : ''}

      <div class="honor-grid">
        ${state.honors.map(h => `
          <div class="honor-card">
            ${h.photo
              ? `<img src="${h.photo}" class="honor-avatar" alt="${h.studentName}"/>`
              : `<div class="honor-avatar">${icon('trophy', 'icon-xl')}</div>`
            }
            <span class="badge badge-gold">${icon('star', 'icon-sm')} ${h.badgeTitle}</span>
            <h3 style="font-size:1.05rem; font-weight:900;">${h.studentName}</h3>
            <div style="font-size:0.82rem; color:var(--text-secondary);">
              ${h.grade} • شعبة ${h.section}
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:center; margin-top:4px;">
              <span class="badge badge-success">المعدل: ${h.average}%</span>
              <span class="badge badge-primary">${icon('sparkles', 'icon-sm')} ${h.points} نقطة تميز</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  // 7. TUITION FEES (STRICTLY ONLY FOR PRIVATE SCHOOLS)
  window.renderFeesView = function (state) {
    if (state.school.type !== 'private') {
      return `
        <div class="card">
          <div class="card-title">${icon('shield')} المدرسة حكومية</div>
          <p style="font-size:0.88rem; color:var(--text-secondary); margin-top:6px;">
            قسم الأقساط الدراسية متاح فقط للمدارس الأهلية.
          </p>
        </div>
      `;
    }

    const user = state.currentUser;
    const isAdmin = user.role === 'admin';
    const students = getVisibleStudents(state);

    let totalAll = 0, paidAll = 0;
    students.forEach(s => {
      totalAll += Number(s.totalFee || 0);
      paidAll += Number(s.paidFee || 0);
    });
    const remainingAll = Math.max(0, totalAll - paidAll);

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('wallet')} إدارة الأقساط الدراسية والدفعات المالية</div>
          <span class="badge badge-warning">نظام المدارس الأهلية</span>
        </div>
        <p style="font-size:0.84rem; color:var(--text-secondary);">
          متابعة القسط الكلي، الدفعات المسددة، المبالغ المتبقية، وتواريخ الاستحقاق مع إرسال وصولات القبض والتنبيهات عبر واتساب.
        </p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--primary-soft); color:var(--primary);">${icon('wallet', 'icon-lg')}</div>
          <div><div class="stat-value">${totalAll.toLocaleString()}</div><div class="stat-label">إجمالي الأقساط (د.ع)</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--success-soft); color:var(--success);">${icon('checkCircle', 'icon-lg')}</div>
          <div><div class="stat-value">${paidAll.toLocaleString()}</div><div class="stat-label">المبالغ المسددة (د.ع)</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--danger-soft); color:var(--danger);">${icon('clock', 'icon-lg')}</div>
          <div><div class="stat-value">${remainingAll.toLocaleString()}</div><div class="stat-label">المبالغ المتبقية (د.ع)</div></div>
        </div>
      </div>

      ${isAdmin ? `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('plus')} تسجيل دفعة قسط جديدة وإصدار وصل قبض</div>
          </div>
          <form onsubmit="app.handleAddFeePayment(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">الطالب</label>
                <select id="fee_studentId" class="form-control">
                  ${students.map(s => `<option value="${s.id}">${s.name} (${s.grade})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">مبلغ الدفعة المستلمة (د.ع)</label>
                <input type="number" id="fee_amount" class="form-control" min="1000" step="1000" value="250000" required />
              </div>
              <div class="form-group">
                <label class="form-label">تاريخ الاستحقاق القادم</label>
                <input type="date" id="fee_nextDue" class="form-control" value="2026-12-15" required />
              </div>
            </div>
            <button type="submit" class="btn btn-success">
              ${icon('check', 'icon-sm')} تسجيل الدفعة وإشعار ولي الأمر
            </button>
          </form>
        </div>
      ` : ''}

      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('fileText')} كشف حساب الأقساط للطلبة</div>
        </div>
        ${students.map(s => {
          const total = Number(s.totalFee || 1500000);
          const paid = Number(s.paidFee || 0);
          const rem = Math.max(0, total - paid);
          const receiptText = `وصل قبض رسمي - ${state.school.name}\nاسم الطالب: ${s.name} (${s.grade})\nالقسط الكلي: ${total.toLocaleString()} د.ع\nإجمالي المسدد: ${paid.toLocaleString()} د.ع\nالمبلغ المتبقي: ${rem.toLocaleString()} د.ع\nتاريخ الاستحقاق القادم: ${s.dueDate || '2026-12-01'}\nشكراً لتعاونكم.`;
          const reminderText = `تذكير لطيف من حسابات ${state.school.name}:\nولي أمر الطالب (${s.name}) المحترم، نود تذكيركم بموعد استحقاق القسط الدراسي بتاريخ (${s.dueDate || '2026-12-01'}).\nالمبلغ المتبقي: ${rem.toLocaleString()} د.ع.\nمع فائق التقدير.`;
          return `
            <div class="item-row">
              <div>
                <div style="font-weight:800; font-size:0.98rem;">${s.name} <span class="badge badge-info">${s.grade}</span></div>
                <div style="font-size:0.8rem; color:var(--text-secondary); margin:4px 0;">
                  ولي الأمر: ${s.parentName} (${s.parentPhone}) • تاريخ الاستحقاق: ${s.dueDate || '2026-12-01'}
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                  <span class="badge badge-primary">القسط الكلي: ${total.toLocaleString()} د.ع</span>
                  <span class="badge badge-success">المسدد: ${paid.toLocaleString()} د.ع</span>
                  <span class="badge ${rem > 0 ? 'badge-danger' : 'badge-success'}">المتبقي: ${rem.toLocaleString()} د.ع</span>
                </div>
              </div>
              <div class="btn-row">
                <a href="${window.buildWhatsAppUrl(s.parentPhone, receiptText)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
                  ${icon('whatsapp', 'icon-sm')} إرسال وصل قبض عبر واتساب
                </a>
                <a href="${window.buildWhatsAppUrl(s.parentPhone, reminderText)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
                  ${icon('bell', 'icon-sm')} تنبيه استحقاق
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  // 8. DIRECT REPORTS & PARENT-SCHOOL MESSAGING
  window.renderReportsView = function (state) {
    const user = state.currentUser;
    const canSendReport = user.role === 'admin' || user.role === 'teacher';
    const students = getVisibleStudents(state);

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('message')} نظام البلاغات والتواصل المباشر مع أولياء الأمور</div>
        </div>
        ${canSendReport ? `
          <form onsubmit="app.handleSendReport(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">الطالب المعني</label>
                <select id="rp_studentId" class="form-control">
                  ${state.students.map(s => `<option value="${s.id}">${s.name} (${s.grade}) - ولي الأمر: ${s.parentName}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">نوع البلاغ / الرسالة</label>
                <select id="rp_type" class="form-control">
                  <option value="شكر وتقدير">شكر وتقدير</option>
                  <option value="ملاحظة علمية">ملاحظة علمية</option>
                  <option value="تنبيه سلوكي">تنبيه سلوكي</option>
                  <option value="استدعاء ولي أمر">استدعاء ولي أمر</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">نص التبليغ أو الرسالة</label>
              <textarea id="rp_message" class="form-control" rows="2" placeholder="اكتب تفاصيل التبليغ لولي الأمر..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">
              ${icon('send', 'icon-sm')} إرسال التبليغ الفوري لولي الأمر
            </button>
          </form>
        ` : `
          <form onsubmit="app.handleParentMessage(event)">
            <div class="form-group">
              <label class="form-label">${icon('message', 'icon-sm')} إرسال رسالة أو استفسار مباشر لإدارة المدرسة</label>
              <textarea id="pm_message" class="form-control" rows="2" placeholder="اكتب رسالتك أو استفسارك لإدارة المدرسة..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">
              ${icon('send', 'icon-sm')} إرسال الرسالة للإدارة
            </button>
          </form>
        `}
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('clipboard')} سجل البلاغات وصندوق المحادثات</div>
        </div>
        ${state.reports.map(r => {
          const st = state.students.find(s => s.id === r.studentId) || state.students[0];
          const badgeCls = r.type === 'شكر وتقدير' ? 'badge-success'
            : r.type === 'استدعاء ولي أمر' ? 'badge-danger'
            : r.type === 'تنبيه سلوكي' ? 'badge-warning' : 'badge-primary';
          const waText = `تبليغ رسمي من ${state.school.name} (${r.type}):\nالطالب: ${r.studentName}\n${r.message}`;
          return `
            <div class="item-row">
              <div style="flex:1; min-width:220px;">
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                  <span class="badge ${badgeCls}">${r.type}</span>
                  <span class="badge badge-info">الطالب: ${r.studentName}</span>
                  <span style="font-size:0.75rem; color:var(--text-muted);">${r.date} • المرسل: ${r.senderName}</span>
                </div>
                <div style="font-size:0.9rem; font-weight:600; margin-top:4px;">${r.message}</div>
                ${r.reply ? `
                  <div style="margin-top:8px; padding:8px 12px; border-radius:10px; background:var(--primary-soft); font-size:0.82rem;">
                    <strong>رد التفاعل:</strong> ${r.reply}
                  </div>
                ` : ''}
              </div>
              <div class="btn-row">
                <button class="btn btn-outline btn-sm" onclick="app.promptReplyReport('${r.id}')">
                  ${icon('message', 'icon-sm')} رد مباشر
                </button>
                ${st ? `
                  <a href="${window.buildWhatsAppUrl(st.parentPhone, waText)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
                    ${icon('whatsapp', 'icon-sm')} مراسلة واتساب
                  </a>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  // 9. EVENTS & NEWS GALLERY (WITH SMART AUTO IMAGE COMPRESSION)
  window.renderGalleryView = function (state) {
    const canEdit = state.currentUser.role === 'admin' || state.currentUser.role === 'teacher';

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('image')} معرض الفعاليات والأخبار والأنشطة الطلابية</div>
          <span class="badge badge-success">${icon('sparkles', 'icon-sm')} معالجة ذكية سريعة للصور</span>
        </div>
        ${canEdit ? `
          <form onsubmit="app.handleAddGalleryItem(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">عنوان الخبر أو الفعالية</label>
                <input type="text" id="gl_title" class="form-control" placeholder="مثال: مهرجان التفوق العلمي السنوي" required />
              </div>
              <div class="form-group">
                <label class="form-label">التصنيف</label>
                <select id="gl_category" class="form-control">
                  <option value="فعالية مدرسية">فعالية مدرسية</option>
                  <option value="أخبار وإعلانات">أخبار وإعلانات</option>
                  <option value="تكريم المتفوقين">تكريم المتفوقين</option>
                  <option value="نشاط رياضي وفني">نشاط رياضي وفني</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">${icon('camera', 'icon-sm')} صورة الفعالية</label>
                <input type="file" accept="image/*" class="form-control" onchange="app.previewCompressedImage(event, 'galleryPreviewImg')" />
                <img id="galleryPreviewImg" style="display:none; width:80px; height:56px; border-radius:10px; object-fit:cover; margin-top:6px;" alt="معاينة"/>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">تفاصيل الخبر أو الفعالية</label>
              <textarea id="gl_desc" class="form-control" rows="2" placeholder="اكتب تفاصيل النشاط أو الخبر المدرسي..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">
              ${icon('check', 'icon-sm')} نشر الفعالية في المعرض
            </button>
          </form>
        ` : `
          <p style="font-size:0.85rem; color:var(--text-secondary);">
            تابع أحدث أخبار المدرسة، المهرجانات، والأنشطة اللاصفية المصورة.
          </p>
        `}
      </div>

      <div class="gallery-grid">
        ${state.gallery.map(item => `
          <div class="gallery-card">
            ${item.photo
              ? `<img src="${item.photo}" class="gallery-img" alt="${item.title}"/>`
              : `<div class="gallery-img" style="display:flex; align-items:center; justify-content:center; color:var(--primary);">${icon('image', 'icon-xl')}</div>`
            }
            <div class="gallery-body">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span class="badge badge-primary">${item.category}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">${item.date}</span>
              </div>
              <h3 style="font-size:0.98rem; font-weight:800; margin-bottom:4px;">${item.title}</h3>
              <p style="font-size:0.83rem; color:var(--text-secondary);">${item.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  // 10. SMART NOTIFICATIONS CENTER
  window.renderNotificationsView = function (state) {
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('bell')} المركز الذكي للإشعارات والتنبيهات الفورية</div>
          <div class="btn-row">
            <button class="btn btn-outline btn-sm" onclick="app.markAllNotificationsRead()">
              ${icon('check', 'icon-sm')} تحديد الكل كمقروء
            </button>
            <button class="btn btn-primary btn-sm" onclick="app.triggerTestNotification()">
              ${icon('bell', 'icon-sm')} تجربة التنبيه الصوتي والبصري
            </button>
          </div>
        </div>
        ${state.notifications.map(n => `
          <div class="item-row" style="${!n.read ? 'border-right:4px solid var(--primary);' : ''}">
            <div class="user-info-cell">
              <div class="avatar-circle" style="background:${n.type === 'غياب' ? 'var(--danger-soft)' : 'var(--primary-soft)'}; color:${n.type === 'غياب' ? 'var(--danger)' : 'var(--primary)'};">
                ${icon('bell')}
              </div>
              <div>
                <div style="display:flex; gap:6px; align-items:center;">
                  <span class="badge badge-primary">${n.type}</span>
                  <span style="font-weight:800;">${n.title}</span>
                </div>
                <div style="font-size:0.84rem; color:var(--text-secondary); margin-top:3px;">${n.body}</div>
                <div style="font-size:0.74rem; color:var(--text-muted); margin-top:3px;">${n.time}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  // 11. SETTINGS & SCHOOL CONFIGURATION
  window.renderSettingsView = function (state) {
    const user = state.currentUser;
    const isAdmin = user.role === 'admin';

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icon('settings')} الإعدادات والملف الشخصي</div>
          <button class="btn btn-danger btn-sm" onclick="app.logout()">
            ${icon('logout', 'icon-sm')} تسجيل الخروج
          </button>
        </div>
        <div class="item-row">
          <div class="user-info-cell">
            <div class="avatar-circle">${icon('user')}</div>
            <div>
              <div style="font-weight:800; font-size:1rem;">${user.name}</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">
                الصفة: ${roleLabel(user.role)} • اسم المستخدم: ${user.username}
              </div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="app.toggleDarkMode()">
            ${icon(state.darkMode ? 'sun' : 'moon', 'icon-sm')}
            ${state.darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          </button>
        </div>
      </div>

      ${isAdmin ? `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${icon('school')} إعدادات وهوية المدرسة (المدير العام)</div>
          </div>
          <form onsubmit="app.handleUpdateSchoolSettings(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">${icon('school', 'icon-sm')} اسم المدرسة</label>
                <input type="text" id="set_schoolName" class="form-control" value="${state.school.name}" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('mapPin', 'icon-sm')} عنوان المدرسة</label>
                <input type="text" id="set_schoolAddress" class="form-control" placeholder="الموصل - زمار" value="${state.school.address || 'الموصل - زمار'}" required />
              </div>
              <div class="form-group">
                <label class="form-label">${icon('shield', 'icon-sm')} نوع المدرسة (يتحكم بقسم الأقساط)</label>
                <select id="set_schoolType" class="form-control">
                  <option value="public" ${state.school.type === 'public' ? 'selected' : ''}>مدرسة حكومية (إخفاء الأقساط)</option>
                  <option value="private" ${state.school.type === 'private' ? 'selected' : ''}>مدرسة أهلية (تفعيل الأقساط)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">${icon('camera', 'icon-sm')} تحديث شعار المدرسة</label>
                <input type="file" accept="image/*" class="form-control" onchange="app.previewCompressedImage(event, 'settingsLogoPreview')" />
                <img id="settingsLogoPreview" src="${state.school.logo || ''}" style="${state.school.logo ? '' : 'display:none;'} width:52px; height:52px; border-radius:12px; object-fit:cover; margin-top:6px;" alt="شعار المدرسة"/>
              </div>
            </div>
            <button type="submit" class="btn btn-primary">
              ${icon('check', 'icon-sm')} حفظ إعدادات المدرسة
            </button>
          </form>
        </div>
      ` : ''}

      <div style="margin-top: 24px;">
        ${window.renderDeveloperFooter()}
      </div>
    `;
  };
})();
