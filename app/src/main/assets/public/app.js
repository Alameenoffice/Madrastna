// Madrasati Core Application Controller, Smart Image Compression & Audio Notification Engine
(function () {
  const STORAGE_KEY = 'madrasati_platform_v1';

  // Generate clean SVG data URI portraits for initial sample students/events
  function makeSvgAvatar(bg, fg, label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="40" fill="${bg}"/>
      <circle cx="120" cy="92" r="42" fill="${fg}" opacity="0.9"/>
      <path d="M52 208c0-38 30-62 68-62s68 24 68 62" fill="${fg}" opacity="0.9"/>
      <text x="120" y="228" font-family="Cairo, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function makeEventBanner(bg1, bg2, title) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <circle cx="540" cy="70" r="95" fill="#ffffff" opacity="0.08"/>
      <circle cx="90" cy="290" r="120" fill="#ffffff" opacity="0.08"/>
      <text x="320" y="190" font-family="Cairo, sans-serif" font-size="30" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  const DEFAULT_STATE = {
    onboardingDone: false,
    onboardingSlide: 0,
    darkMode: false,
    currentRoute: 'home',
    currentUser: null,
    tempCompressedImage: null,
    ui: {
      setupSchoolType: 'private',
      usersSubTab: 'students',
      scheduleSubTab: 'homework',
      gradesSubTab: 'sheet',
      attDate: todayStr,
      attGrade: 'الكل',
      attSection: 'الكل'
    },
    school: {
      initialized: false,
      name: 'مدرسة النخبة النموذجية',
      address: 'الموصل - زمار',
      type: 'private', // 'public' or 'private'
      logo: '',
      adminUsername: 'admin',
      adminPassword: '123456',
      adminName: 'المدير العام للمدرسة'
    },
    teachers: [
      {
        id: 't1',
        name: 'أ. عبد الله الجبوري',
        subject: 'الرياضيات',
        classes: 'السادس الابتدائي والأول المتوسط',
        phone: '07512362567',
        address: 'الموصل - زمار',
        username: 't_abdullah',
        password: '123456',
        active: true
      },
      {
        id: 't2',
        name: 'أ. فاطمة الموصلي',
        subject: 'اللغة العربية',
        classes: 'الخامس والسادس الابتدائي',
        phone: '07512362567',
        address: 'الموصل - زمار',
        username: 't_fatima',
        password: '123456',
        active: true
      }
    ],
    students: [
      {
        id: 's1',
        name: 'يوسف أحمد العبيدي',
        grade: 'السادس الابتدائي',
        section: 'أ',
        parentName: 'أحمد العبيدي',
        parentPhone: '07512362567',
        address: 'الموصل - زمار',
        username: 'std101',
        password: '123456',
        parentUsername: 'prt101',
        parentPassword: '123456',
        totalFee: 1500000,
        paidFee: 1000000,
        dueDate: '2026-12-01',
        photo: makeSvgAvatar('#0F4C81', '#F59E0B', 'يوسف'),
        active: true
      },
      {
        id: 's2',
        name: 'مريم خالد الزماري',
        grade: 'السادس الابتدائي',
        section: 'أ',
        parentName: 'خالد الزماري',
        parentPhone: '07512362567',
        address: 'الموصل - زمار',
        username: 'std102',
        password: '123456',
        parentUsername: 'prt102',
        parentPassword: '123456',
        totalFee: 1500000,
        paidFee: 1500000,
        dueDate: '2026-12-01',
        photo: makeSvgAvatar('#059669', '#FDE68A', 'مريم'),
        active: true
      },
      {
        id: 's3',
        name: 'عمر سالم الحمداني',
        grade: 'الأول المتوسط',
        section: 'ب',
        parentName: 'سالم الحمداني',
        parentPhone: '07512362567',
        address: 'الموصل - زمار',
        username: 'std103',
        password: '123456',
        parentUsername: 'prt103',
        parentPassword: '123456',
        totalFee: 1750000,
        paidFee: 750000,
        dueDate: '2026-11-20',
        photo: makeSvgAvatar('#D97706', '#FEF3C7', 'عمر'),
        active: true
      }
    ],
    attendance: [
      { studentId: 's1', date: todayStr, status: 'حاضر' },
      { studentId: 's2', date: todayStr, status: 'حاضر' },
      { studentId: 's3', date: todayStr, status: 'متأخر' }
    ],
    homeworks: [
      {
        id: 'hw1',
        subject: 'الرياضيات',
        grade: 'السادس الابتدائي',
        section: 'أ',
        title: 'الفصل الرابع: الكسور الاعتيادية والعشرية',
        details: 'حل تمارين (4-1) صفحة 58 في الدفتر الصفي مع مراجعة القواعد الأساسية.',
        dueDate: todayStr,
        teacherName: 'أ. عبد الله الجبوري'
      },
      {
        id: 'hw2',
        subject: 'اللغة العربية',
        grade: 'السادس الابتدائي',
        section: 'أ',
        title: 'قواعد اللغة العربية: المبتدأ والخبر',
        details: 'كتابة التمرين الأول والثاني مع حفظ قصيدة التسامح.',
        dueDate: todayStr,
        teacherName: 'أ. فاطمة الموصلي'
      }
    ],
    timetable: {
      "الأحد": ["التربية الإسلامية", "اللغة العربية", "الرياضيات", "العلوم", "اللغة الإنجليزية"],
      "الإثنين": ["اللغة العربية", "الرياضيات", "الاجتماعيات", "العلوم", "التربية الفنية"],
      "الثلاثاء": ["الرياضيات", "اللغة الإنجليزية", "اللغة العربية", "الحاسوب", "التربية الإسلامية"],
      "الأربعاء": ["العلوم", "اللغة العربية", "الرياضيات", "الاجتماعيات", "اللغة الإنجليزية"],
      "الخميس": ["اللغة الإنجليزية", "العلوم", "التربية الإسلامية", "الرياضيات", "التربية الفنية"]
    },
    grades: [
      { studentId: 's1', subject: 'الرياضيات', daily: 96, month1: 95, month2: 98, midYear: 94, finalExam: 97 },
      { studentId: 's1', subject: 'اللغة العربية', daily: 92, month1: 90, month2: 94, midYear: 93, finalExam: 95 },
      { studentId: 's1', subject: 'العلوم', daily: 95, month1: 93, month2: 96, midYear: 95, finalExam: 96 },
      { studentId: 's1', subject: 'اللغة الإنجليزية', daily: 90, month1: 89, month2: 92, midYear: 91, finalExam: 94 },
      { studentId: 's2', subject: 'الرياضيات', daily: 99, month1: 98, month2: 100, midYear: 99, finalExam: 99 },
      { studentId: 's2', subject: 'اللغة العربية', daily: 97, month1: 96, month2: 98, midYear: 97, finalExam: 98 },
      { studentId: 's3', subject: 'الرياضيات', daily: 88, month1: 85, month2: 90, midYear: 87, finalExam: 89 }
    ],
    exams: [
      { id: 'ex1', subject: 'الرياضيات', grade: 'السادس الابتدائي', date: '2026-11-15', notes: 'الساعة 8:30 صباحاً • الفصول الأول والثاني والثالث' },
      { id: 'ex2', subject: 'اللغة العربية', grade: 'السادس الابتدائي', date: '2026-11-17', notes: 'الساعة 8:30 صباحاً • القواعد والمحفوظات' }
    ],
    honors: [
      {
        id: 'h1',
        studentName: 'مريم خالد الزماري',
        grade: 'السادس الابتدائي',
        section: 'أ',
        badgeTitle: 'وسام التفوق الذهبي - الأولى على الصف',
        average: 99,
        points: 350,
        photo: makeSvgAvatar('#059669', '#FDE68A', 'مريم')
      },
      {
        id: 'h2',
        studentName: 'يوسف أحمد العبيدي',
        grade: 'السادس الابتدائي',
        section: 'أ',
        badgeTitle: 'وسام الطالب المثالي والمجتهد',
        average: 95,
        points: 310,
        photo: makeSvgAvatar('#0F4C81', '#F59E0B', 'يوسف')
      }
    ],
    reports: [
      {
        id: 'rp1',
        studentId: 's1',
        studentName: 'يوسف أحمد العبيدي',
        type: 'شكر وتقدير',
        message: 'تتقدم إدارة المدرسة بالشكر والتقدير لولي أمر الطالب يوسف لتميزه العلمي والتزامه بالتحضير اليومي.',
        date: todayStr,
        senderName: 'إدارة المدرسة',
        reply: 'شكراً جزيلاً لإدارة المدرسة الكريمة وكادرها التدريسي المتميز.'
      }
    ],
    gallery: [
      {
        id: 'g1',
        title: 'حفل تكريم الطلبة الأوائل في الموصل - زمار',
        category: 'تكريم المتفوقين',
        date: todayStr,
        description: 'أقامت إدارة المدرسة احتفالية تكريمية لتوزيع الأوسمة الذهبية والشهادات التقديرية على كوكبة الطلبة المتفوقين.',
        photo: makeEventBanner('#0F4C81', '#1E3A8A', 'مهرجان التفوق السنوي')
      },
      {
        id: 'g2',
        title: 'المعرض العلمي والنشاط الطلابي السنوي',
        category: 'فعالية مدرسية',
        date: todayStr,
        description: 'مشاركة متميزة لطلبتنا في تقديم الابتكارات والوسائل التعليمية الحديثة بحضور أولياء الأمور.',
        photo: makeEventBanner('#059669', '#0F4C81', 'المعرض العلمي للطلبة')
      }
    ],
    notifications: [
      {
        id: 'n1',
        type: 'واجب',
        title: 'نشر واجب بيتي جديد في الرياضيات',
        body: 'تم نشر تحضير الفصل الرابع وحل تمارين ص 58 للصف السادس الابتدائي.',
        time: 'اليوم • 08:30 ص',
        read: false
      },
      {
        id: 'n2',
        type: 'لوحة الشرف',
        title: 'تحديث قائمة لوحة الشرف الذهبية',
        body: 'تم منح وسام التفوق الذهبي للطلبة الأوائل لهذا الشهر.',
        time: 'اليوم • 09:15 ص',
        read: false
      }
    ]
  };

  function loadState() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Object.assign({}, DEFAULT_STATE, parsed, {
          ui: Object.assign({}, DEFAULT_STATE.ui, parsed.ui || {})
        });
      }
    } catch (_) {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  let state = loadState();

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  // Pleasant Web Audio Chime for Instant In-App Notifications
  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.18, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.36);
      });
    } catch (_) {}
  }

  function showToast(title, body, type = 'تنبيه') {
    playChime();
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast-alert';
    el.innerHTML = `
      <div style="color:var(--primary);">${window.icon('bell', 'icon-lg')}</div>
      <div style="flex:1;">
        <div style="font-weight:800; font-size:0.88rem;">${type}: ${title}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary);">${body}</div>
      </div>
    `;
    container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 4000);
  }

  function addNotification(type, title, body) {
    state.notifications.unshift({
      id: 'n_' + Date.now(),
      type,
      title,
      body,
      time: 'الآن',
      read: false
    });
    saveState();
    showToast(title, body, type);
  }

  // Smart HTML5 Canvas Image Compression (Max width 800px, quality 0.7 JPEG, strictly < 60KB)
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.7;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > 78000 && quality > 0.25) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Render First-Time Welcome Screen (3 Interactive Real Lottie JSON Slides)
  function renderOnboardingScreen() {
    const idx = state.onboardingSlide || 0;
    const slide = window.ONBOARDING_SLIDES[idx] || window.ONBOARDING_SLIDES[0];

    return `
      <div class="auth-shell">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge badge-primary">${window.icon('school', 'icon-sm')} منصة مدرستي</span>
          <button class="btn btn-outline btn-sm" onclick="app.finishOnboarding()">
            تخطي ${window.icon('arrowLeft', 'icon-sm')}
          </button>
        </div>

        <div class="onboarding-card">
          <div class="lottie-box">
            <lottie-player
              id="onboardingLottiePlayer"
              autoplay
              loop
              mode="normal"
              style="width: 220px; height: 220px; position:absolute; inset:0;"
            ></lottie-player>
            <div style="width:92px; height:92px; border-radius:28px; background:${slide.color}; color:#ffffff; display:flex; align-items:center; justify-content:center; position:relative; z-index:2; box-shadow:0 12px 28px rgba(15,76,129,0.28);">
              ${window.icon(slide.iconName, 'icon-xl')}
            </div>
          </div>

          <span class="badge badge-gold" style="margin-bottom:10px;">
            ${window.icon('sparkles', 'icon-sm')} ${slide.badge}
          </span>
          <h1 style="font-size:1.35rem; font-weight:900; margin-bottom:8px;">${slide.title}</h1>
          <p style="font-size:0.9rem; color:var(--text-secondary); max-width:420px; margin:0 auto;">
            ${slide.subtitle}
          </p>

          <div class="dots-row">
            ${window.ONBOARDING_SLIDES.map((_, i) => `<div class="dot ${i === idx ? 'active' : ''}"></div>`).join('')}
          </div>

          <div class="btn-row" style="justify-content:center;">
            ${idx > 0 ? `
              <button class="btn btn-outline" onclick="app.prevSlide()">
                ${window.icon('arrowRight', 'icon-sm')} السابق
              </button>
            ` : ''}
            ${idx < window.ONBOARDING_SLIDES.length - 1 ? `
              <button class="btn btn-primary" onclick="app.nextSlide()">
                التالي ${window.icon('arrowLeft', 'icon-sm')}
              </button>
            ` : `
              <button class="btn btn-primary btn-block" onclick="app.finishOnboarding()">
                ${window.icon('check', 'icon-sm')} البدء الآن
              </button>
            `}
          </div>
        </div>

        ${window.renderDeveloperFooter()}
      </div>
    `;
  }

  // Render First-Time School Initialization & General Director Account Setup
  function renderAdminSetupScreen() {
    const selType = state.ui.setupSchoolType || 'private';
    return `
      <div class="auth-shell">
        <div style="text-align:center; margin-bottom:12px;">
          <span class="badge badge-primary">${window.icon('shield', 'icon-sm')} التأسيس الرسمي لأول مرة</span>
          <h1 style="font-size:1.3rem; font-weight:900; margin-top:6px;">
            تأسيس منصة المدرسة وإنشاء حساب المدير العام
          </h1>
          <p style="font-size:0.84rem; color:var(--text-secondary);">
            أدخل بيانات المدرسة الأساسية وأنشئ حساب الإدارة الموحد للبدء بإدارة حسابات المعلمين والطلاب وأولياء الأمور.
          </p>
        </div>

        <div class="card">
          <form onsubmit="app.handleCompleteSetup(event)">
            <div class="form-group">
              <label class="form-label">${window.icon('school', 'icon-sm')} اسم المدرسة الرسمي</label>
              <input type="text" id="init_schoolName" class="form-control" placeholder="مثال: مدرسة النخبة النموذجية" value="${state.school.name}" required />
            </div>

            <div class="form-group">
              <label class="form-label">${window.icon('mapPin', 'icon-sm')} العنوان الجغرافي للمدرسة</label>
              <input type="text" id="init_schoolAddress" class="form-control" placeholder="الموصل - زمار" value="الموصل - زمار" required />
            </div>

            <div class="form-group">
              <label class="form-label">${window.icon('shield', 'icon-sm')} تحديد نوع المدرسة</label>
              <div class="type-selector">
                <div class="type-option ${selType === 'public' ? 'active' : ''}" onclick="app.selectSetupType('public')">
                  ${window.icon('school', 'icon-lg')}
                  <span>مدرسة حكومية</span>
                  <small style="font-size:0.72rem; opacity:0.8;">بدون قسم أقساط دراسية</small>
                </div>
                <div class="type-option ${selType === 'private' ? 'active' : ''}" onclick="app.selectSetupType('private')">
                  ${window.icon('award', 'icon-lg')}
                  <span>مدرسة أهلية</span>
                  <small style="font-size:0.72rem; opacity:0.8;">مع تفعيل نظام الأقساط</small>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">${window.icon('camera', 'icon-sm')} شعار المدرسة (اختياري)</label>
              <input type="file" accept="image/*" class="form-control" onchange="app.previewCompressedImage(event, 'initLogoPreview')" />
              <img id="initLogoPreview" style="display:none; width:60px; height:60px; border-radius:14px; object-fit:cover; margin-top:6px;" alt="شعار المدرسة"/>
            </div>

            <hr style="border:none; border-top:1px solid var(--border); margin:14px 0;" />

            <div class="form-group">
              <label class="form-label">${window.icon('user', 'icon-sm')} اسم المدير العام</label>
              <input type="text" id="init_adminName" class="form-control" placeholder="مثال: أ. أحمد أبو رسلان" value="أ. أحمد أبو رسلان" required />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">${window.icon('userCheck', 'icon-sm')} اسم مستخدم الإدارة</label>
                <input type="text" id="init_adminUser" class="form-control" placeholder="admin" value="admin" required />
              </div>
              <div class="form-group">
                <label class="form-label">${window.icon('lock', 'icon-sm')} كلمة المرور</label>
                <input type="password" id="init_adminPass" class="form-control" placeholder="••••••" value="123456" required />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block">
              ${window.icon('check', 'icon-sm')} اعتماد تأسيس المدرسة والدخول لحساب الإدارة
            </button>
          </form>
        </div>

        ${window.renderDeveloperFooter()}
      </div>
    `;
  }

  // Render Unified Login Screen (No Exposed Role Switching Buttons!)
  function renderLoginScreen() {
    return `
      <div class="auth-shell">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge badge-primary">${window.icon('school', 'icon-sm')} ${state.school.name}</span>
          <button class="btn btn-outline btn-sm" onclick="app.toggleDarkMode()">
            ${window.icon(state.darkMode ? 'sun' : 'moon', 'icon-sm')}
          </button>
        </div>

        <div class="card" style="margin:auto 0; padding:24px 20px;">
          <div style="text-align:center; margin-bottom:18px;">
            <div style="width:68px; height:68px; border-radius:20px; background:var(--header-grad); color:#fff; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; box-shadow:var(--shadow-md);">
              ${state.school.logo
                ? `<img src="${state.school.logo}" style="width:100%; height:100%; border-radius:20px; object-fit:cover;" alt="شعار"/>`
                : window.icon('graduation', 'icon-xl')
              }
            </div>
            <h1 style="font-size:1.3rem; font-weight:900;">بوابة تسجيل الدخول الموحدة</h1>
            <p style="font-size:0.84rem; color:var(--text-secondary);">
              ${state.school.name} • ${state.school.address || 'الموصل - زمار'}
            </p>
          </div>

          <form onsubmit="app.handleLogin(event)">
            <div class="form-group">
              <label class="form-label">${window.icon('user', 'icon-sm')} اسم المستخدم أو كود الدخول</label>
              <input type="text" id="login_username" class="form-control" placeholder="أدخل اسم المستخدم الممنوح من الإدارة" required />
            </div>
            <div class="form-group">
              <label class="form-label">${window.icon('lock', 'icon-sm')} كلمة المرور</label>
              <input type="password" id="login_password" class="form-control" placeholder="أدخل كلمة المرور" required />
            </div>
            <div id="loginErrorBox" style="display:none; padding:10px 12px; border-radius:10px; background:var(--danger-soft); color:var(--danger); font-size:0.82rem; font-weight:700; margin-bottom:12px;"></div>
            <button type="submit" class="btn btn-primary btn-block">
              ${window.icon('login', 'icon-sm')} تسجيل الدخول إلى المنصة
            </button>
          </form>
        </div>

        ${window.renderDeveloperFooter()}
      </div>
    `;
  }

  // Render Authenticated Shell with Top Bar & Bottom Navigation
  function renderAuthenticatedApp() {
    const user = state.currentUser;
    const isPrivate = state.school.type === 'private';
    const unreadCount = state.notifications.filter(n => !n.read).length;
    const route = state.currentRoute || 'home';

    let mainContent = '';
    if (route === 'home') mainContent = window.renderHomeView(state);
    else if (route === 'users') mainContent = window.renderUsersView(state);
    else if (route === 'attendance') mainContent = window.renderAttendanceView(state);
    else if (route === 'schedule') mainContent = window.renderScheduleView(state);
    else if (route === 'grades') mainContent = window.renderGradesView(state);
    else if (route === 'honor') mainContent = window.renderHonorView(state);
    else if (route === 'fees') mainContent = window.renderFeesView(state);
    else if (route === 'reports') mainContent = window.renderReportsView(state);
    else if (route === 'gallery') mainContent = window.renderGalleryView(state);
    else if (route === 'notifications') mainContent = window.renderNotificationsView(state);
    else if (route === 'settings') mainContent = window.renderSettingsView(state);
    else mainContent = window.renderHomeView(state);

    const navItems = [
      { id: 'home', label: 'الرئيسية', icon: 'home' },
      { id: 'attendance', label: 'الحضور', icon: 'userCheck' },
      { id: 'schedule', label: 'الواجبات', icon: 'bookOpen' },
      { id: 'grades', label: 'الدرجات', icon: 'clipboard' },
      { id: 'honor', label: 'لوحة الشرف', icon: 'trophy' }
    ];

    if (isPrivate) {
      navItems.push({ id: 'fees', label: 'الأقساط', icon: 'wallet' });
    }

    if (user.role === 'admin') {
      navItems.push({ id: 'users', label: 'الحسابات', icon: 'users' });
    } else {
      navItems.push({ id: 'reports', label: 'التواصل', icon: 'message' });
    }

    navItems.push({ id: 'settings', label: 'الإعدادات', icon: 'settings' });

    return `
      <div class="app-shell">
        <header class="top-header">
          <div class="header-inner">
            <div class="school-brand" onclick="app.navigate('home')" style="cursor:pointer;">
              <div class="school-logo-img">
                ${state.school.logo
                  ? `<img src="${state.school.logo}" style="width:100%; height:100%; border-radius:12px; object-fit:cover;" alt="شعار"/>`
                  : window.icon('graduation', 'icon-lg')
                }
              </div>
              <div class="school-title-wrap">
                <div class="school-title">${state.school.name}</div>
                <div class="school-subtitle">
                  ${window.icon('mapPin', 'icon-sm')}
                  <span>${state.school.address || 'الموصل - زمار'}</span>
                  <span>•</span>
                  <span>${window.getRoleLabel(user.role)}</span>
                </div>
              </div>
            </div>

            <div class="header-actions">
              <button class="icon-btn" onclick="app.navigate('notifications')" title="الإشعارات" aria-label="الإشعارات">
                ${window.icon('bell')}
                ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
              </button>
              <button class="icon-btn" onclick="app.toggleDarkMode()" title="الوضع الليلي/النهاري" aria-label="الوضع الليلي">
                ${window.icon(state.darkMode ? 'sun' : 'moon')}
              </button>
              <button class="icon-btn" onclick="app.logout()" title="تسجيل الخروج" aria-label="تسجيل الخروج">
                ${window.icon('logout')}
              </button>
            </div>
          </div>
        </header>

        <main class="main-container">
          ${mainContent}
        </main>

        <nav class="bottom-nav">
          ${navItems.map(item => `
            <button class="nav-item ${route === item.id ? 'active' : ''}" onclick="app.navigate('${item.id}')">
              ${window.icon(item.icon)}
              <span>${item.label}</span>
            </button>
          `).join('')}
        </nav>
      </div>
    `;
  }

  function render() {
    document.body.classList.toggle('dark-mode', !!state.darkMode);
    const root = document.getElementById('appRoot');
    if (!root) return;

    if (!state.onboardingDone) {
      root.innerHTML = renderOnboardingScreen();
      const player = document.getElementById('onboardingLottiePlayer');
      const slide = window.ONBOARDING_SLIDES[state.onboardingSlide || 0];
      if (player && player.load && slide && slide.lottieData) {
        try { player.load(slide.lottieData); } catch (_) {}
      }
      return;
    }

    if (!state.school.initialized) {
      root.innerHTML = renderAdminSetupScreen();
      return;
    }

    if (!state.currentUser) {
      root.innerHTML = renderLoginScreen();
      return;
    }

    root.innerHTML = renderAuthenticatedApp();
  }

  // Expose Public Application Actions
  window.app = {
    nextSlide() {
      if (state.onboardingSlide < window.ONBOARDING_SLIDES.length - 1) {
        state.onboardingSlide++;
        saveState();
        render();
      }
    },
    prevSlide() {
      if (state.onboardingSlide > 0) {
        state.onboardingSlide--;
        saveState();
        render();
      }
    },
    finishOnboarding() {
      state.onboardingDone = true;
      saveState();
      render();
    },
    selectSetupType(type) {
      state.ui.setupSchoolType = type;
      render();
    },
    async previewCompressedImage(event, previewImgId) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        const compressed = await compressImage(file);
        state.tempCompressedImage = compressed;
        const previewEl = document.getElementById(previewImgId);
        if (previewEl) {
          previewEl.src = compressed;
          previewEl.style.display = 'block';
        }
      } catch (_) {}
    },
    handleCompleteSetup(event) {
      event.preventDefault();
      const name = document.getElementById('init_schoolName').value.trim();
      const address = document.getElementById('init_schoolAddress').value.trim() || 'الموصل - زمار';
      const adminName = document.getElementById('init_adminName').value.trim();
      const adminUser = document.getElementById('init_adminUser').value.trim();
      const adminPass = document.getElementById('init_adminPass').value.trim();

      state.school = {
        initialized: true,
        name: name || 'منصة مدرستي',
        address,
        type: state.ui.setupSchoolType || 'private',
        logo: state.tempCompressedImage || state.school.logo || '',
        adminName,
        adminUsername: adminUser,
        adminPassword: adminPass
      };
      state.tempCompressedImage = null;
      state.currentUser = {
        id: 'admin_main',
        name: adminName,
        username: adminUser,
        role: 'admin'
      };
      state.currentRoute = 'home';
      saveState();
      render();
      addNotification('إداري', 'تم تأسيس منصة المدرسة بنجاح', `مرحباً بك في ${state.school.name} (${state.school.address}).`);
    },
    handleLogin(event) {
      event.preventDefault();
      const u = document.getElementById('login_username').value.trim();
      const p = document.getElementById('login_password').value.trim();
      const errBox = document.getElementById('loginErrorBox');

      if (u === state.school.adminUsername && p === state.school.adminPassword) {
        state.currentUser = {
          id: 'admin_main',
          name: state.school.adminName || 'المدير العام',
          username: u,
          role: 'admin'
        };
        state.currentRoute = 'home';
        saveState();
        render();
        showToast('تم تسجيل الدخول', `مرحباً بك ${state.currentUser.name}`, 'ترحيب');
        return;
      }

      const teacher = state.teachers.find(t => t.username === u && t.password === p);
      if (teacher) {
        if (!teacher.active) {
          errBox.style.display = 'block';
          errBox.textContent = 'عذراً، هذا الحساب موقوف حالياً من قبل إدارة المدرسة.';
          return;
        }
        state.currentUser = {
          id: teacher.id,
          name: teacher.name,
          username: teacher.username,
          subject: teacher.subject,
          role: 'teacher'
        };
        state.currentRoute = 'home';
        saveState();
        render();
        showToast('تم تسجيل الدخول', `مرحباً بك ${teacher.name}`, 'كادر تعليمي');
        return;
      }

      const parentStudent = state.students.find(s => s.parentUsername === u && s.parentPassword === p);
      if (parentStudent) {
        if (!parentStudent.active) {
          errBox.style.display = 'block';
          errBox.textContent = 'عذراً، الحساب موقوف حالياً. يرجى مراجعة إدارة المدرسة.';
          return;
        }
        state.currentUser = {
          id: 'prt_' + parentStudent.id,
          name: parentStudent.parentName,
          username: parentStudent.parentUsername,
          phone: parentStudent.parentPhone,
          studentId: parentStudent.id,
          role: 'parent'
        };
        state.currentRoute = 'home';
        saveState();
        render();
        showToast('تم تسجيل الدخول', `مرحباً بك ولي أمر الطالب ${parentStudent.name}`, 'ولي أمر');
        return;
      }

      const student = state.students.find(s => s.username === u && s.password === p);
      if (student) {
        if (!student.active) {
          errBox.style.display = 'block';
          errBox.textContent = 'عذراً، الحساب موقوف حالياً من قبل إدارة المدرسة.';
          return;
        }
        state.currentUser = {
          id: student.id,
          name: student.name,
          username: student.username,
          studentId: student.id,
          role: 'student'
        };
        state.currentRoute = 'home';
        saveState();
        render();
        showToast('تم تسجيل الدخول', `مرحباً بك أيها الطالب المجتهد ${student.name}`, 'طالب');
        return;
      }

      if (errBox) {
        errBox.style.display = 'block';
        errBox.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات الممنوحة من الإدارة.';
      }
    },
    logout() {
      state.currentUser = null;
      state.currentRoute = 'home';
      saveState();
      render();
    },
    navigate(route) {
      state.currentRoute = route;
      state.tempCompressedImage = null;
      saveState();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    toggleDarkMode() {
      state.darkMode = !state.darkMode;
      saveState();
      render();
    },
    setSubTab(key, val) {
      state.ui[key] = val;
      saveState();
      render();
    },
    setAttendanceFilter(key, val) {
      state.ui[key] = val;
      saveState();
      render();
    },
    generateTeacherCreds() {
      const uEl = document.getElementById('t_username');
      const pEl = document.getElementById('t_password');
      if (uEl) uEl.value = 't_' + Math.floor(100 + Math.random() * 900);
      if (pEl) pEl.value = 'T@' + Math.floor(1000 + Math.random() * 9000);
    },
    generateStudentCreds() {
      const num = Math.floor(100 + Math.random() * 900);
      const su = document.getElementById('s_username');
      const sp = document.getElementById('s_password');
      const pu = document.getElementById('s_parentUsername');
      const pp = document.getElementById('s_parentPassword');
      if (su) su.value = 'std' + num;
      if (sp) sp.value = String(Math.floor(100000 + Math.random() * 900000));
      if (pu) pu.value = 'prt' + num;
      if (pp) pp.value = String(Math.floor(100000 + Math.random() * 900000));
    },
    handleAddTeacher(event) {
      event.preventDefault();
      const name = document.getElementById('t_name').value.trim();
      const subject = document.getElementById('t_subject').value;
      const classes = document.getElementById('t_classes').value.trim();
      const phone = document.getElementById('t_phone').value.trim();
      const address = document.getElementById('t_address').value.trim() || 'الموصل - زمار';
      const username = document.getElementById('t_username').value.trim();
      const password = document.getElementById('t_password').value.trim();

      state.teachers.unshift({
        id: 't_' + Date.now(),
        name,
        subject,
        classes,
        phone,
        address,
        username,
        password,
        active: true
      });
      saveState();
      render();
      addNotification('حسابات', 'إضافة حساب معلم جديد', `تم إنشاء وتفعيل حساب المعلم ${name} (${subject}).`);
    },
    handleAddStudent(event) {
      event.preventDefault();
      const name = document.getElementById('s_name').value.trim();
      const grade = document.getElementById('s_grade').value;
      const section = document.getElementById('s_section').value;
      const parentName = document.getElementById('s_parentName').value.trim();
      const parentPhone = document.getElementById('s_parentPhone').value.trim();
      const address = document.getElementById('s_address').value.trim() || 'الموصل - زمار';
      const username = document.getElementById('s_username').value.trim();
      const password = document.getElementById('s_password').value.trim();
      const parentUsername = document.getElementById('s_parentUsername').value.trim();
      const parentPassword = document.getElementById('s_parentPassword').value.trim();
      const feeEl = document.getElementById('s_totalFee');
      const dueEl = document.getElementById('s_dueDate');

      const newStudent = {
        id: 's_' + Date.now(),
        name,
        grade,
        section,
        parentName,
        parentPhone,
        address,
        username,
        password,
        parentUsername,
        parentPassword,
        totalFee: feeEl ? Number(feeEl.value) : 1500000,
        paidFee: 0,
        dueDate: dueEl ? dueEl.value : '2026-12-01',
        photo: state.tempCompressedImage || makeSvgAvatar('#0F4C81', '#F59E0B', name.split(' ')[0]),
        active: true
      };

      state.students.unshift(newStudent);
      state.tempCompressedImage = null;
      saveState();
      render();
      addNotification('حسابات', 'تفعيل حساب طالب وولي أمر', `تم تسجيل الطالب ${name} (${grade}) وتفعيل حساب ولي أمره.`);
    },
    toggleUserActive(type, id) {
      if (type === 'teacher') {
        const t = state.teachers.find(x => x.id === id);
        if (t) t.active = !t.active;
      } else {
        const s = state.students.find(x => x.id === id);
        if (s) s.active = !s.active;
      }
      saveState();
      render();
    },
    deleteTeacher(id) {
      state.teachers = state.teachers.filter(t => t.id !== id);
      saveState();
      render();
    },
    deleteStudent(id) {
      state.students = state.students.filter(s => s.id !== id);
      saveState();
      render();
    },
    markAttendance(studentId, date, status) {
      const idx = state.attendance.findIndex(a => a.studentId === studentId && a.date === date);
      if (idx >= 0) {
        state.attendance[idx].status = status;
      } else {
        state.attendance.push({ studentId, date, status });
      }
      const st = state.students.find(s => s.id === studentId);
      saveState();
      render();
      if (st && (status === 'غائب' || status === 'متأخر')) {
        addNotification(
          'غياب',
          `تنبيه حضور وغياب: ${st.name}`,
          `تم تسجيل الطالب (${st.name} - ${st.grade}) بحالة [${status}] بتاريخ ${date} وإشعار حساب ولي الأمر.`
        );
      }
    },
    handleAddHomework(event) {
      event.preventDefault();
      const subject = document.getElementById('hw_subject').value;
      const grade = document.getElementById('hw_grade').value;
      const section = document.getElementById('hw_section').value;
      const dueDate = document.getElementById('hw_dueDate').value;
      const title = document.getElementById('hw_title').value.trim();
      const details = document.getElementById('hw_details').value.trim();

      state.homeworks.unshift({
        id: 'hw_' + Date.now(),
        subject,
        grade,
        section,
        title,
        details,
        dueDate,
        teacherName: state.currentUser.name
      });
      saveState();
      render();
      addNotification('واجب', `واجب جديد في ${subject}`, `${title} - للصف ${grade} (${section})`);
    },
    deleteHomework(id) {
      state.homeworks = state.homeworks.filter(h => h.id !== id);
      saveState();
      render();
    },
    handleSaveGrade(event) {
      event.preventDefault();
      const studentId = document.getElementById('gr_studentId').value;
      const subject = document.getElementById('gr_subject').value;
      const daily = Number(document.getElementById('gr_daily').value);
      const month1 = Number(document.getElementById('gr_month1').value);
      const month2 = Number(document.getElementById('gr_month2').value);
      const midYear = Number(document.getElementById('gr_midYear').value);
      const finalExam = Number(document.getElementById('gr_finalExam').value);

      const idx = state.grades.findIndex(g => g.studentId === studentId && g.subject === subject);
      if (idx >= 0) {
        state.grades[idx] = { studentId, subject, daily, month1, month2, midYear, finalExam };
      } else {
        state.grades.push({ studentId, subject, daily, month1, month2, midYear, finalExam });
      }
      state.ui.selectedStudentId = studentId;
      const st = state.students.find(s => s.id === studentId);
      saveState();
      render();
      if (st) {
        addNotification('درجات', `رصد درجات ${subject}`, `تم تحديث كشف درجات الطالب ${st.name} في مادة ${subject}.`);
      }
    },
    handleAddExam(event) {
      event.preventDefault();
      const subject = document.getElementById('ex_subject').value;
      const grade = document.getElementById('ex_grade').value;
      const date = document.getElementById('ex_date').value;
      const notes = document.getElementById('ex_notes').value.trim();
      state.exams.unshift({ id: 'ex_' + Date.now(), subject, grade, date, notes });
      saveState();
      render();
      addNotification('امتحانات', `موعد امتحان ${subject}`, `تم تحديد امتحان ${subject} للصف ${grade} بتاريخ ${date}.`);
    },
    handleAddHonor(event) {
      event.preventDefault();
      const studentName = document.getElementById('hn_name').value.trim();
      const grade = document.getElementById('hn_grade').value;
      const section = document.getElementById('hn_section').value;
      const badgeTitle = document.getElementById('hn_badge').value;
      const average = Number(document.getElementById('hn_avg').value);
      const points = Number(document.getElementById('hn_points').value);

      state.honors.unshift({
        id: 'hn_' + Date.now(),
        studentName,
        grade,
        section,
        badgeTitle,
        average,
        points,
        photo: state.tempCompressedImage || makeSvgAvatar('#D97706', '#FEF3C7', studentName.split(' ')[0])
      });
      state.tempCompressedImage = null;
      saveState();
      render();
      addNotification('لوحة الشرف', `تكريم الطالب ${studentName}`, `مبارك منح ${badgeTitle} للطالب ${studentName} (${grade}).`);
    },
    handleAddFeePayment(event) {
      event.preventDefault();
      const studentId = document.getElementById('fee_studentId').value;
      const amount = Number(document.getElementById('fee_amount').value);
      const nextDue = document.getElementById('fee_nextDue').value;
      const st = state.students.find(s => s.id === studentId);
      if (st) {
        st.paidFee = Number(st.paidFee || 0) + amount;
        st.dueDate = nextDue;
        saveState();
        render();
        addNotification('أقساط', `استلام دفعة قسط دراسي`, `تم تسديد ${amount.toLocaleString()} د.ع لحساب الطالب ${st.name}.`);
      }
    },
    handleSendReport(event) {
      event.preventDefault();
      const studentId = document.getElementById('rp_studentId').value;
      const type = document.getElementById('rp_type').value;
      const message = document.getElementById('rp_message').value.trim();
      const st = state.students.find(s => s.id === studentId);
      state.reports.unshift({
        id: 'rp_' + Date.now(),
        studentId,
        studentName: st ? st.name : 'طالب',
        type,
        message,
        date: todayStr,
        senderName: state.currentUser.name,
        reply: ''
      });
      saveState();
      render();
      addNotification('بلاغ إداري', `${type} - ${st ? st.name : ''}`, message);
    },
    handleParentMessage(event) {
      event.preventDefault();
      const message = document.getElementById('pm_message').value.trim();
      const st = state.students.find(s => s.id === state.currentUser.studentId) || state.students[0];
      state.reports.unshift({
        id: 'rp_' + Date.now(),
        studentId: st ? st.id : '',
        studentName: st ? st.name : state.currentUser.name,
        type: 'رسالة ولي أمر',
        message,
        date: todayStr,
        senderName: state.currentUser.name,
        reply: ''
      });
      saveState();
      render();
      addNotification('تواصل', 'تم إرسال رسالتكم للإدارة', message);
    },
    promptReplyReport(reportId) {
      const r = state.reports.find(x => x.id === reportId);
      if (!r) return;
      const reply = window.prompt('اكتب الرد المباشر على هذه الرسالة:', r.reply || 'تم الاطلاع والمتابعة، مع جزيل الشكر.');
      if (reply !== null && reply.trim()) {
        r.reply = reply.trim();
        saveState();
        render();
        addNotification('رد تفاعلي', `رد جديد بخصوص ${r.studentName}`, r.reply);
      }
    },
    handleAddGalleryItem(event) {
      event.preventDefault();
      const title = document.getElementById('gl_title').value.trim();
      const category = document.getElementById('gl_category').value;
      const description = document.getElementById('gl_desc').value.trim();
      state.gallery.unshift({
        id: 'gl_' + Date.now(),
        title,
        category,
        date: todayStr,
        description,
        photo: state.tempCompressedImage || makeEventBanner('#0F4C81', '#059669', title)
      });
      state.tempCompressedImage = null;
      saveState();
      render();
      addNotification('الفعاليات', title, description);
    },
    markAllNotificationsRead() {
      state.notifications.forEach(n => { n.read = true; });
      saveState();
      render();
    },
    triggerTestNotification() {
      addNotification('تنبيه فوري', 'اختبار نظام التنبيهات الذكي', 'يعمل التنبيه الصوتي والبصري الفوري لمنصة مدرستي بنجاح تام.');
      render();
    },
    handleUpdateSchoolSettings(event) {
      event.preventDefault();
      state.school.name = document.getElementById('set_schoolName').value.trim() || state.school.name;
      state.school.address = document.getElementById('set_schoolAddress').value.trim() || 'الموصل - زمار';
      state.school.type = document.getElementById('set_schoolType').value;
      if (state.tempCompressedImage) {
        state.school.logo = state.tempCompressedImage;
        state.tempCompressedImage = null;
      }
      saveState();
      render();
      addNotification('الإعدادات', 'تم تحديث بيانات المدرسة', `${state.school.name} - ${state.school.address}`);
    }
  };

  window.handleAndroidBack = function () {
    if (state.currentUser && state.currentRoute !== 'home') {
      state.currentRoute = 'home';
      saveState();
      render();
      return true;
    }
    return false;
  };

  document.addEventListener('DOMContentLoaded', render);
})();
