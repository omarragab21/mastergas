import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_mastergas_plan():
    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # Remove default sheet

    # Color Palette - Professional Corporate Navy & Emerald
    NAVY_DARK = "1E293B"      # 29405b / Slate 800
    NAVY_BLUE = "0F172A"      # Slate 900
    ACCENT_BLUE = "2563EB"    # Blue 600
    LIGHT_BLUE = "EFF6FF"     # Blue 50
    ICE_BLUE = "F0F9FF"       # Sky 50
    WHITE = "FFFFFF"
    GRAY_LIGHT = "F8FAFC"     # Slate 50
    GRAY_BORDER = "CBD5E1"    # Slate 300
    GRAY_TEXT = "64748B"      # Slate 500
    
    # Priority & Status Fills
    P1_FILL = "FEE2E2"        # Red 100
    P1_FONT = "991B1B"        # Red 800
    P2_FILL = "FEF3C7"        # Amber 100
    P2_FONT = "92400E"        # Amber 800
    P3_FILL = "E0E7FF"        # Indigo 100
    P3_FONT = "3730A3"        # Indigo 800
    
    STATUS_DONE_FILL = "DCFCE7"    # Green 100
    STATUS_DONE_FONT = "166534"    # Green 800
    STATUS_PROG_FILL = "DBEAFE"    # Blue 100
    STATUS_PROG_FONT = "1E40AF"    # Blue 800
    STATUS_WAIT_FILL = "F3F4F6"    # Gray 100
    STATUS_WAIT_FONT = "4B5563"    # Gray 700

    thin_border = Border(
        left=Side(style='thin', color=GRAY_BORDER),
        right=Side(style='thin', color=GRAY_BORDER),
        top=Side(style='thin', color=GRAY_BORDER),
        bottom=Side(style='thin', color=GRAY_BORDER)
    )
    
    header_border = Border(
        left=Side(style='thin', color="475569"),
        right=Side(style='thin', color="475569"),
        top=Side(style='medium', color="0F172A"),
        bottom=Side(style='medium', color="0F172A")
    )

    # -------------------------------------------------------------------------
    # SHEET 1: Overview & Executive Summary
    # -------------------------------------------------------------------------
    ws1 = wb.create_sheet(title="Executive Summary")
    ws1.views.sheetView[0].showGridLines = True

    # Title Block
    ws1.merge_cells("A1:H1")
    title_cell = ws1["A1"]
    title_cell.value = "MASTERGAS PLATFORM — 2-WEEK PROJECT COMPLETION PLAN"
    title_cell.font = Font(name="Calibri", size=16, bold=True, color=WHITE)
    title_cell.fill = PatternFill(start_color=NAVY_BLUE, end_color=NAVY_BLUE, fill_type="solid")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[1].height = 40

    ws1.merge_cells("A2:H2")
    subtitle_cell = ws1["A2"]
    subtitle_cell.value = "خطة تسليم المشروع الشاملة (أسبوعين / 14 يوماً) — إنهاء المتبقي من التصميم، التيستينج، ومزامنة الربط مع الداشبورد"
    subtitle_cell.font = Font(name="Calibri", size=11, italic=True, color=WHITE)
    subtitle_cell.fill = PatternFill(start_color=ACCENT_BLUE, end_color=ACCENT_BLUE, fill_type="solid")
    subtitle_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[2].height = 25

    # Project Metadata Box
    metadata = [
        ("Project Name", "Mastergas E-Commerce & Admin CMS", "Target Duration", "2 Weeks (14 Calendar Days)"),
        ("Tech Stack", "Vue 3 + Vite + Tailwind CSS + Laravel API", "Daily Allocation", "Cross-functional (Design / QA / Dev)"),
        ("Base API URL", "https://backend-mastergas.be-kite.com/api", "Primary Goals", "Design Polish + QA + Dashboard Sync"),
        ("Payment Gateway", "PayTabs (Idempotent Callback & Draft)", "Final Deliverable", "100% Production Ready & Deployed")
    ]
    
    ws1.cell(row=4, column=1, value="PROJECT METADATA & PARAMETERS").font = Font(bold=True, size=12, color=NAVY_DARK)
    row_idx = 5
    for m in metadata:
        ws1.cell(row=row_idx, column=1, value=m[0]).font = Font(bold=True, color=NAVY_DARK)
        ws1.cell(row=row_idx, column=1).fill = PatternFill(start_color=LIGHT_BLUE, fill_type="solid")
        ws1.cell(row=row_idx, column=1).border = thin_border
        
        ws1.cell(row=row_idx, column=2, value=m[1]).font = Font(color="000000")
        ws1.cell(row=row_idx, column=2).border = thin_border
        
        ws1.cell(row=row_idx, column=4, value=m[2]).font = Font(bold=True, color=NAVY_DARK)
        ws1.cell(row=row_idx, column=4).fill = PatternFill(start_color=LIGHT_BLUE, fill_type="solid")
        ws1.cell(row=row_idx, column=4).border = thin_border
        
        ws1.cell(row=row_idx, column=5, value=m[3]).font = Font(color="000000")
        ws1.cell(row=row_idx, column=5).border = thin_border
        row_idx += 1

    # Milestones Summary Table
    row_idx += 2
    ws1.cell(row=row_idx, column=1, value="2-WEEK MILESTONES SUMMARY").font = Font(bold=True, size=12, color=NAVY_DARK)
    row_idx += 1
    
    headers_ms = ["Milestone", "Timeline", "Target Focus / Scope", "Key Deliverables", "Tracks Involved", "Target Status"]
    for col_idx, h in enumerate(headers_ms, start=1):
        cell = ws1.cell(row=row_idx, column=col_idx, value=h)
        cell.font = Font(bold=True, color=WHITE, size=11)
        cell.fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = header_border
    ws1.row_dimensions[row_idx].height = 28

    milestones_data = [
        ("Milestone 1: Dashboard Refinements & Data Fixes", "Days 1 – 3", 
         "معالجة حالات التدقيق الـ 7 في DashboardView ومطابقة حسابات السيرفر والإحصائيات والرسوم",
         "إحصائيات دقيقة 100%، استقرار Chart.js، معالجة الـ Trends، وغياب أي NaN أو أرقام وهمية",
         "Dashboard & API Sync / QA", "Planned (Days 1-3)"),
        ("Milestone 2: Design Polish & Responsive Experience", "Days 4 – 6",
         "مراجعة واجهات المتجر والداشبورد، توحيد الهوية البصرية لـ Mastergas، وتحسين تجربة الهاتف",
         "تصميم متناسق بالكامل، ريسبونسف ممتاز (360px-1440px)، وتصميم شاشات Loading/Empty",
         "Design & UI/UX / Frontend", "Planned (Days 4-6)"),
        ("Milestone 3: End-to-End Orders & PayTabs Integration", "Days 7 – 9",
         "ربط ومزامنة دورة الطلب كاملة بين المتجر والداشبورد والسيرفر وبوابة الدفع PayTabs",
         "دورة طلب ناجحة (سلة -> كوبون -> شحن -> PayTabs -> خصم مخزون -> ظهور بالداشبورد)",
         "Backend Integration / Sync", "Planned (Days 7-9)"),
        ("Milestone 4: Comprehensive Testing & QA Suite", "Days 10 – 12",
         "تنفيذ اختبارات الأمان والـ Idempotency، فحص المتصفحات، سيناريوهات الشبكة، والمرتجعات",
         "اجتياز جميع الـ 90+ اختبار، فحص التعافي من انقطاع الاتصال، واستقرار الجلسات وحفظ السلة",
         "QA & Testing Suite", "Planned (Days 10-12)"),
        ("Milestone 5: Production Readiness & Final Handover", "Days 13 – 14",
         "بناء نسخة الإنتاج، تحسين الأداء وSEO وميتا بيكسل، مراجعة الإعدادات، والتسليم النهائي",
         "Vite Production Build ناجح وخالٍ من الأخطاء، جاهزية النشر على الاستضافة، واعتماد العميل",
         "DevOps / Final Delivery", "Planned (Days 13-14)")
    ]

    for m in milestones_data:
        row_idx += 1
        ws1.row_dimensions[row_idx].height = 36
        for col_idx, val in enumerate(m, start=1):
            cell = ws1.cell(row=row_idx, column=col_idx, value=val)
            cell.border = thin_border
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            if col_idx == 1:
                cell.font = Font(bold=True, color=NAVY_BLUE)
                cell.fill = PatternFill(start_color=ICE_BLUE, fill_type="solid")
            elif col_idx == 2:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = Font(bold=True, color=ACCENT_BLUE)
            elif col_idx == 6:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.fill = PatternFill(start_color=STATUS_WAIT_FILL, fill_type="solid")
                cell.font = Font(bold=True, color=STATUS_WAIT_FONT)

    # Track Distribution Summary Box
    row_idx += 3
    ws1.cell(row=row_idx, column=1, value="WORK TRACKS ALLOCATION").font = Font(bold=True, size=12, color=NAVY_DARK)
    row_idx += 1
    
    ws1.merge_cells(start_row=row_idx, start_column=1, end_row=row_idx, end_column=2)
    ws1.cell(row=row_idx, column=1, value="Track").font = Font(bold=True, color=WHITE)
    ws1.cell(row=row_idx, column=1).fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")
    ws1.cell(row=row_idx, column=1).alignment = Alignment(horizontal="center")
    
    ws1.cell(row=row_idx, column=3, value="Weight").font = Font(bold=True, color=WHITE)
    ws1.cell(row=row_idx, column=3).fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")
    ws1.cell(row=row_idx, column=3).alignment = Alignment(horizontal="center")

    ws1.cell(row=row_idx, column=4, value="Focus Objective").font = Font(bold=True, color=WHITE)
    ws1.cell(row=row_idx, column=4).fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")

    tracks = [
        ("🎨 Design & UI/UX Polish", "25%", "Storefront & Admin aesthetics, mobile responsive, loading states"),
        ("⚡ Testing & Senior QA", "30%", "Unit, integration, regression, idempotency, and browser tests"),
        ("🔗 Dashboard & API Integration", "30%", "Data synchronization, order lifecycle, PayTabs, catalog feeds"),
        ("🚀 Production Launch & Handover", "15%", "Vite clean build, SEO, Meta Pixel, environment config, docs")
    ]
    for t in tracks:
        row_idx += 1
        ws1.merge_cells(start_row=row_idx, start_column=1, end_row=row_idx, end_column=2)
        c1 = ws1.cell(row=row_idx, column=1, value=t[0])
        c1.font = Font(bold=True, color=NAVY_BLUE)
        c1.border = thin_border
        ws1.cell(row=row_idx, column=2).border = thin_border
        
        c2 = ws1.cell(row=row_idx, column=3, value=t[1])
        c2.alignment = Alignment(horizontal="center")
        c2.font = Font(bold=True, color=ACCENT_BLUE)
        c2.border = thin_border
        
        c3 = ws1.cell(row=row_idx, column=4, value=t[2])
        c3.border = thin_border

    # Adjust ws1 column widths
    ws1.column_dimensions['A'].width = 32
    ws1.column_dimensions['B'].width = 16
    ws1.column_dimensions['C'].width = 38
    ws1.column_dimensions['D'].width = 44
    ws1.column_dimensions['E'].width = 24
    ws1.column_dimensions['F'].width = 20

    # -------------------------------------------------------------------------
    # SHEET 2: Detailed 14-Day Gantt / Roadmap
    # -------------------------------------------------------------------------
    ws2 = wb.create_sheet(title="14-Day Roadmap")
    ws2.views.sheetView[0].showGridLines = True

    ws2.merge_cells("A1:Q1")
    title2 = ws2["A1"]
    title2.value = "MASTERGAS — 14-DAY EXECUTION TIMELINE & DAILY SCHEDULE"
    title2.font = Font(name="Calibri", size=14, bold=True, color=WHITE)
    title2.fill = PatternFill(start_color=NAVY_BLUE, fill_type="solid")
    title2.alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[1].height = 35

    roadmap_headers = ["ID", "Phase", "Activity / Focus Area", "Owner"] + [f"Day {i}" for i in range(1, 15)]
    ws2.row_dimensions[3].height = 28
    for c_idx, h in enumerate(roadmap_headers, start=1):
        cell = ws2.cell(row=3, column=c_idx, value=h)
        cell.font = Font(bold=True, color=WHITE, size=10)
        cell.fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = header_border

    roadmap_schedule = [
        ("M1-01", "Milestone 1", "إصلاح الحالات الـ 7 بدقة بيانات الداشبورد (DashboardView)", "Frontend/API", [1, 2], ACCENT_BLUE),
        ("M1-02", "Milestone 1", "تحديث استقرار Chart.js ومنع تراكم الرسوم والتعامل مع NaN", "Frontend Dev", [2, 3], ACCENT_BLUE),
        ("M1-03", "Milestone 1", "التحقق من جلسات الأدمن (401/403) وفصلها عن جلسة العميل", "Fullstack", [2, 3], ACCENT_BLUE),
        ("M2-01", "Milestone 2", "تحسين الهوية البصرية والألوان والخطوط لشاشات المتجر", "UI/UX Designer", [4, 5], "8B5CF6"), # Purple
        ("M2-02", "Milestone 2", "ضبط الـ Responsive على مقاسات الموبايل (360px - 768px)", "Frontend Dev", [4, 5, 6], "8B5CF6"),
        ("M2-03", "Milestone 2", "تصميم وتطبيق حالات التحميل والفراغ (Loading & Empty States)", "Frontend Dev", [5, 6], "8B5CF6"),
        ("M2-04", "Milestone 2", "مراجعة تصميم لوحة التحكم (الجداول، الفلاتر، النماذج، الأزرار)", "UI/UX Designer", [6], "8B5CF6"),
        ("M3-01", "Milestone 3", "ربط دورة السلة والكوبونات وحساب الشحن بالمدن مع السيرفر", "Fullstack", [7, 8], "059669"), # Emerald
        ("M3-02", "Milestone 3", "مزامنة بوابة PayTabs (إنشاء الدفعة، إعادة التوجيه، Callback)", "Fullstack", [7, 8, 9], "059669"),
        ("M3-03", "Milestone 3", "انعكاس الطلب المنشأ في شاشة الطلبات بالداشبورد وتغيير الحالات", "Fullstack", [8, 9], "059669"),
        ("M3-04", "Milestone 3", "ربط مسار المرتجعات والمحفظة وتحديث المخزون التلقائي", "Fullstack", [9], "059669"),
        ("M4-01", "Milestone 4", "تشغيل وتحديث اختبارات الأمان والـ Idempotency (npm test)", "Senior QA", [10, 11], "D97706"), # Amber
        ("M4-02", "Milestone 4", "فحص المتصفحات (Chrome, Safari, Firefox, Edge) والهواتف الحقيقية", "QA Tester", [10, 11], "D97706"),
        ("M4-03", "Milestone 4", "اختبار سيناريوهات انقطاع وعودة الشبكة أثناء الشراء", "Senior QA", [11, 12], "D97706"),
        ("M4-04", "Milestone 4", "إصلاح أي ثغرات أو Bugs تظهر أثناء مرحلة التيستينج المكثف", "Frontend Dev", [11, 12], "D97706"),
        ("M5-01", "Milestone 5", "بناء نسخة الإنتاج (npm run build) وتوليد feeds والتحقق من الحجم", "DevOps/Lead", [13], "DC2626"), # Red
        ("M5-02", "Milestone 5", "مراجعة إعدادات SEO، Meta Pixel، وخرائط الموقع والمتغيرات .env", "Fullstack", [13, 14], "DC2626"),
        ("M5-03", "Milestone 5", "المراجعة النهائية مع صاحب العمل والتسليم النهائي للمشروع", "Lead / Omar", [14], "DC2626"),
    ]

    r_idx = 4
    for item in roadmap_schedule:
        ws2.row_dimensions[r_idx].height = 24
        ws2.cell(row=r_idx, column=1, value=item[0]).alignment = Alignment(horizontal="center")
        ws2.cell(row=r_idx, column=1).font = Font(bold=True, size=9)
        ws2.cell(row=r_idx, column=1).border = thin_border
        
        ws2.cell(row=r_idx, column=2, value=item[1]).alignment = Alignment(horizontal="center")
        ws2.cell(row=r_idx, column=2).font = Font(size=9, color=NAVY_DARK)
        ws2.cell(row=r_idx, column=2).border = thin_border
        
        ws2.cell(row=r_idx, column=3, value=item[2]).font = Font(size=9.5)
        ws2.cell(row=r_idx, column=3).border = thin_border
        
        ws2.cell(row=r_idx, column=4, value=item[3]).alignment = Alignment(horizontal="center")
        ws2.cell(row=r_idx, column=4).font = Font(size=9, bold=True, color=GRAY_TEXT)
        ws2.cell(row=r_idx, column=4).border = thin_border
        
        # Day columns (5 to 18)
        active_days = item[4]
        fill_color = item[5]
        for day in range(1, 15):
            c = ws2.cell(row=r_idx, column=4 + day)
            c.border = thin_border
            if day in active_days:
                c.fill = PatternFill(start_color=fill_color, fill_type="solid")
                c.value = "●"
                c.font = Font(color=WHITE, size=8, bold=True)
                c.alignment = Alignment(horizontal="center", vertical="center")
            else:
                c.fill = PatternFill(start_color=GRAY_LIGHT, fill_type="solid")
        r_idx += 1

    ws2.column_dimensions['A'].width = 10
    ws2.column_dimensions['B'].width = 14
    ws2.column_dimensions['C'].width = 46
    ws2.column_dimensions['D'].width = 16
    for i in range(1, 15):
        ws2.column_dimensions[get_column_letter(4 + i)].width = 7

    # -------------------------------------------------------------------------
    # SHEET 3: Master WBS & Detailed Tasks
    # -------------------------------------------------------------------------
    ws3 = wb.create_sheet(title="Detailed WBS & Tasks")
    ws3.views.sheetView[0].showGridLines = True

    ws3.merge_cells("A1:K1")
    title3 = ws3["A1"]
    title3.value = "MASTERGAS — COMPLETE WORK BREAKDOWN STRUCTURE (WBS)"
    title3.font = Font(name="Calibri", size=14, bold=True, color=WHITE)
    title3.fill = PatternFill(start_color=NAVY_BLUE, fill_type="solid")
    title3.alignment = Alignment(horizontal="center", vertical="center")
    ws3.row_dimensions[1].height = 35

    wbs_headers = [
        "Task ID", "Milestone", "Track", "Module / Screen", 
        "Task Title & Scope", "Priority", "Days", "Assigned Role", 
        "Definition of Done (DoD) / Acceptance Criteria", "Audit Reference", "Status"
    ]
    ws3.row_dimensions[3].height = 30
    for col_idx, h in enumerate(wbs_headers, start=1):
        cell = ws3.cell(row=3, column=col_idx, value=h)
        cell.font = Font(bold=True, color=WHITE, size=10)
        cell.fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = header_border

    tasks_detailed = [
        # Milestone 1: Dashboard Refinements & Data Fixes (Days 1-3)
        ("TSK-01", "M1 (Days 1-3)", "Dashboard & API Sync", "DashboardView.vue",
         "تصحيح حساب إجمالي الطلبات وعدم استبداله بمجموع التوزيع الجزئي (Fix total orders replacement)",
         "P1 - Critical", "Day 1", "Frontend Dev",
         "عدم استبدال إجمالي السيرفر برقم التوزيع الجزئي. عرض الإجمالي الأصلي دائماً وبيان التعارض إن وُجد.",
         "Audit Item #1 (P1)", "Not Started"),
        
        ("TSK-02", "M1 (Days 1-3)", "Dashboard & API Sync", "DashboardView.vue",
         "دعم قراءة حقول summary المستقلة عند غياب orders_by_status",
         "P2 - High", "Day 1", "Frontend Dev",
         "الحفاظ على قراءة completed_orders و pending_orders من الـ summary بشكل مستقل حتى لو غاب توزيع الحالات.",
         "Audit Item #2 (P2)", "Not Started"),

        ("TSK-03", "M1 (Days 1-3)", "Dashboard & API Sync", "DashboardView.vue",
         "دعم الأسماء البديلة للمنتجات والمخزون المنخفض (top_products & low_stock) قبل اللجوء للـ fallback",
         "P2 - High", "Day 2", "Frontend Dev",
         "قراءة البيانات إذا وصلت بأسماء بديلة وتفادي إظهار القائمة فارغة إلا عند التأكد من خلو البيانات.",
         "Audit Item #3 (P2)", "Not Started"),

        ("TSK-04", "M1 (Days 1-3)", "Dashboard & UI/UX", "DashboardView.vue",
         "تمييز حالة 'البيانات غير متاحة' عن 'صفر' في مخطط توزيع الحالات",
         "P2 - High", "Day 2", "UI/UX / Dev",
         "عرض رسالة واضحة بأن التوزيع غير متاح بدلاً من رسم دائرة بأصفار توحي بالقياس الفعلي.",
         "Audit Item #4 (P2)", "Not Started"),

        ("TSK-05", "M1 (Days 1-3)", "Dashboard & API Sync", "DashboardView.vue",
         "معالجة المدخلات غير الصالحة (Invalid values) دون إخفائها كأصفار وهمية",
         "P2 - High", "Day 2", "Frontend Dev",
         "عرض شرطة (-) أو حالة 'غير متاح' عند وصول نصوص غير صالحة بدلاً من تحويلها إلى 0 يضلل الإدارة.",
         "Audit Item #5 (P2)", "Not Started"),

        ("TSK-06", "M1 (Days 1-3)", "Dashboard & UI/UX", "DashboardView.vue",
         "معالجة نسب التغيير (Trend Percentages) وإخفاء الأسهم عند غياب القيمة",
         "P2 - High", "Day 3", "Frontend Dev",
         "إخفاء نسبة التغيير أو عرض 'N/A' إذا لم تأتِ من السيرفر، وعدم إظهار سهم أخضر مع 0% افتراضياً.",
         "Audit Item #6 (P2)", "Not Started"),

        ("TSK-07", "M1 (Days 1-3)", "Dashboard & QA", "DashboardView.vue",
         "التحقق الشامل من قيم الرسوم البيانية وتنظيف Chart.js عند مغادرة الصفحة",
         "P2 - High", "Day 3", "Senior QA / Dev",
         "فحص دقيق لمصفوفات sales_chart، تدمير مثيل Chart.js في onUnmounted لمنع تسريب الذاكرة وتكرار الرسوم.",
         "Audit Item #7 (P2)", "Not Started"),

        ("TSK-08", "M1 (Days 1-3)", "Dashboard & Auth", "Router & AuthGuards",
         "فصل وتأمين جلسة الأدمن (admin token) عن جلسة العميل (c_token) عند حدوث 401",
         "P1 - Critical", "Day 3", "Fullstack",
         "توجيه الأدمن لتسجيل الدخول عند 401 دون مسح بيانات سلة العميل أو التسبب في حلقة إعادة توجيه.",
         "Audit Verified", "Not Started"),

        # Milestone 2: Design Polish & Responsive Experience (Days 4-6)
        ("TSK-09", "M2 (Days 4-6)", "Design & UI/UX", "Storefront (Home & Products)",
         "توحيد الهوية البصرية وألوان Mastergas والخطوط والأزرار الرئيسية",
         "P2 - High", "Day 4", "UI/UX Designer",
         "تطبيق لوحة ألوان موحدة ومتناسقة، خطوط حديثة، وتنسيق بطاقات المنتجات والعروض والسلايدر.",
         "Design Polish", "Not Started"),

        ("TSK-10", "M2 (Days 4-6)", "Design & UI/UX", "Storefront (Mobile & RTL)",
         "مراجعة وضبط Responsive المتجر على شاشات الموبايل (360px, 390px, 414px)",
         "P1 - Critical", "Day 4-5", "Frontend Dev",
         "تأكيد عمل القائمة الجانبية (Drawer)، محاذاة العناصر العربية RTL، وعدم وجود أي Horizontal Scroll.",
         "Mobile Viewport QA", "Not Started"),

        ("TSK-11", "M2 (Days 4-6)", "Design & UI/UX", "Storefront & Admin",
         "تصميم وتطبيق شاشات وحالات التحميل والفراغ (Loading Skeleton & Empty States)",
         "P2 - High", "Day 5", "UI/UX / Dev",
         "إضافة Skeleton Loaders جذابة أثناء جلب البيانات، ورسومات تعبيرية واضحة للقوائم والسلات الفارغة.",
         "UX Enhancement", "Not Started"),

        ("TSK-12", "M2 (Days 4-6)", "Design & UI/UX", "Storefront (Product Detail)",
         "تحسين تجربة صفحة تفاصيل المنتج (ProductDetailView) ومعرض الصور والخصائص",
         "P2 - High", "Day 5-6", "Frontend Dev",
         "تجربة سلسة لتحديد الخصائص (الألوان، المقاسات، الكمية)، تكبير الصور، وعرض المنتجات ذات الصلة.",
         "Catalog UX", "Not Started"),

        ("TSK-13", "M2 (Days 4-6)", "Design & UI/UX", "Admin CMS (Tables & Modals)",
         "تحسين تصميم جداول ونماذج لوحة التحكم (Data Tables, Modals, Filters)",
         "P3 - Medium", "Day 6", "UI/UX / Dev",
         "تنسيق جداول الطلبات والمنتجات والعملاء، ترقيم الصفحات، ومربعات الحوار الخاصة بالحذف والتعديل.",
         "Admin UI Polish", "Not Started"),

        # Milestone 3: End-to-End Orders & PayTabs Integration (Days 7-9)
        ("TSK-14", "M3 (Days 7-9)", "Integration & Sync", "CartView & CheckoutView",
         "ربط السلة وحساب الشحن حسب المدينة وتطبيق كود الخصم (Coupon Validation)",
         "P1 - Critical", "Day 7", "Fullstack",
         "استدعاء API للتحقق من الكوبون، حساب تكلفة الشحن ديناميكياً حسب مدينة العميل، وتحديث الإجمالي.",
         "Checkout Flow", "Not Started"),

        ("TSK-15", "M3 (Days 7-9)", "Integration & Sync", "CheckoutView -> PayTabs",
         "تكامل بوابة PayTabs مع خاصية الـ Idempotency Key ومسودة الدفع بالسيرفر",
         "P1 - Critical", "Day 7-8", "Fullstack",
         "إرسال Idempotency-Key مستقر، إنشاء Payment Draft على السيرفر، وتوجيه العميل لصفحة PayTabs الآمنة.",
         "Financial Safety", "Not Started"),

        ("TSK-16", "M3 (Days 7-9)", "Integration & Sync", "PaymentSuccessView & Orders",
         "معالجة Callback بوابة الدفع والتحقق الذاتي من المعاملة وتأكيد الطلب",
         "P1 - Critical", "Day 8", "Fullstack",
         "استقبال استجابة PayTabs، إرسال /frontend/paytabs/order، تفريغ السلة، وعرض رقم الطلب والفاتورة.",
         "Order Confirmation", "Not Started"),

        ("TSK-17", "M3 (Days 7-9)", "Integration & Sync", "Admin Orders & Returns",
         "مزامنة دورة الطلب في لوحة التحكم (من جديد إلى جاري التجهيز، شحن، تم التسليم)",
         "P1 - Critical", "Day 8-9", "Fullstack",
         "ظهور الطلب فوراً في OrdersView بالداشبورد، إمكانية تعديل الحالة ورقم التتبع وإشعار العميل.",
         "Order Lifecycle", "Not Started"),

        ("TSK-18", "M3 (Days 7-9)", "Integration & Sync", "Inventory & Wallet",
         "خصم المخزون التلقائي وإدارة رصيد المحفظة عند الإلغاء أو المرتجع",
         "P2 - High", "Day 9", "Fullstack",
         "تحديث كميات المخزون بدقة، وإمكانية إرجاع المبالغ لمحفظة العميل من خلال شاشة المرتجعات بالداشبورد.",
         "Inventory Sync", "Not Started"),

        # Milestone 4: Comprehensive Testing & QA Suite (Days 10-12)
        ("TSK-19", "M4 (Days 10-12)", "Testing & Senior QA", "Test Suite (npm test)",
         "تشغيل وتثبيت مجموعة اختبارات الأمان والـ Checkout (جميع الـ 90 اختبار)",
         "P1 - Critical", "Day 10", "Senior QA",
         "اجتياز 100% من الاختبارات المبرمجة بدون أي إخفاق، وإصلاح خطأ step 5 في aboutViewQA.",
         "Regression Suite", "Not Started"),

        ("TSK-20", "M4 (Days 10-12)", "Testing & Senior QA", "Payment Recovery Tests",
         "اختبار استرجاع الطلب عند انقطاع الاتصال أو إغلاق المتصفح أثناء الدفع",
         "P1 - Critical", "Day 10-11", "Senior QA",
         "التأكد من حفظ الـ attempt في LocalStorage واسترجاع الإيصال دون سحب مالي مكرر عند عودة الاتصال.",
         "Failure Recovery", "Not Started"),

        ("TSK-21", "M4 (Days 10-12)", "Testing & Senior QA", "Browser & Device Matrix",
         "فحص توافق المنصة عبر الأجهزة والمتصفحات (Chrome, Safari, iOS Safari, Android Chrome)",
         "P2 - High", "Day 11", "QA Tester",
         "عدم وجود مشاكل تنسيق أو تكسير في الخطوط أو تعليق في الواجهة على أنظمة iOS و Android و Desktop.",
         "Cross-Browser QA", "Not Started"),

        ("TSK-22", "M4 (Days 10-12)", "Testing & Senior QA", "End-to-End User Journeys",
         "اختبار رحلات المستخدم الكاملة (تصفح -> إضافة للسلة -> شراء -> تتبع الطلب بالداشبورد)",
         "P1 - Critical", "Day 11-12", "QA Lead",
         "تنفيذ طلبات حقيقية واختبار كامل للدورة من منظور العميل والمدير مع التحقق من الرسائل البريدية.",
         "E2E Verification", "Not Started"),

        ("TSK-23", "M4 (Days 10-12)", "Testing & Senior QA", "Bug Triaging & Hotfixes",
         "معالجة وحل كافة الملاحظات والأخطاء المكتشفة خلال مرحلة الفحص الشامل",
         "P1 - Critical", "Day 12", "Frontend / Dev",
         "إغلاق جميع الـ Issues المسجلة خلال أيام التيستينج والتأكد من استقرار المنصة تماماً.",
         "Bug Free Sign-off", "Not Started"),

        # Milestone 5: Production Readiness & Final Handover (Days 13-14)
        ("TSK-24", "M5 (Days 13-14)", "Production Handover", "Build & Feed Generation",
         "بناء حزمة الإنتاج النظيفة (npm run build) وتوليد Data Feeds للمنتجات",
         "P1 - Critical", "Day 13", "DevOps / Lead",
         "بناء سليم 100% عبر Vite دون تحذيرات كود، وضغط ملفات الـ JS/CSS، وتوليد ملفات feed بنجاح.",
         "Production Bundle", "Not Started"),

        ("TSK-25", "M5 (Days 13-14)", "Production Handover", "SEO & Meta Pixel",
         "فحص وضبط الميتا تاج (SEO Meta Tags) وربط أحداث Meta Pixel التجارية",
         "P2 - High", "Day 13", "Frontend Dev",
         "تأكيد إرسال أحداث Pixel (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase).",
         "Tracking & Analytics", "Not Started"),

        ("TSK-26", "M5 (Days 13-14)", "Production Handover", "Security & Environment",
         "تأمين المتغيرات البيئية .env وإعدادات .htaccess والـ SSL ومسارات النشر",
         "P1 - Critical", "Day 14", "DevOps",
         "إعداد الـ Base URL ومفاتيح بوابة الدفع الحية وإعدادات الـ CORS والـ Headers الأمنية.",
         "Deployment Security", "Not Started"),

        ("TSK-27", "M5 (Days 13-14)", "Production Handover", "Final Acceptance & Delivery",
         "المراجعة الختامية، إعداد دليل التشغيل، والتسليم النهائي للمشروع",
         "P1 - Critical", "Day 14", "Project Lead",
         "اعتماد العميل النهائي، تسليم المشروع بكافة وثائقه وخلوه من أي مشاكل تشغيلية.",
         "Final Sign-off", "Not Started")
    ]

    t_row = 4
    for task in tasks_detailed:
        ws3.row_dimensions[t_row].height = 28
        for c_i, val in enumerate(task, start=1):
            cell = ws3.cell(row=t_row, column=c_i, value=val)
            cell.border = thin_border
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            
            # Formats
            if c_i == 1:
                cell.font = Font(bold=True, size=9.5, color=NAVY_DARK)
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_i == 2:
                cell.font = Font(size=9, bold=True, color=ACCENT_BLUE)
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_i == 3:
                cell.font = Font(size=9, color=NAVY_DARK)
            elif c_i == 6:  # Priority
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = Font(bold=True, size=9)
                if "P1" in val:
                    cell.fill = PatternFill(start_color=P1_FILL, fill_type="solid")
                    cell.font = Font(bold=True, color=P1_FONT, size=9)
                elif "P2" in val:
                    cell.fill = PatternFill(start_color=P2_FILL, fill_type="solid")
                    cell.font = Font(bold=True, color=P2_FONT, size=9)
                else:
                    cell.fill = PatternFill(start_color=P3_FILL, fill_type="solid")
                    cell.font = Font(bold=True, color=P3_FONT, size=9)
            elif c_i == 7:  # Days
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = Font(size=9)
            elif c_i == 11: # Status
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.fill = PatternFill(start_color=STATUS_WAIT_FILL, fill_type="solid")
                cell.font = Font(bold=True, size=9, color=STATUS_WAIT_FONT)
        t_row += 1

    ws3.column_dimensions['A'].width = 11
    ws3.column_dimensions['B'].width = 16
    ws3.column_dimensions['C'].width = 24
    ws3.column_dimensions['D'].width = 22
    ws3.column_dimensions['E'].width = 42
    ws3.column_dimensions['F'].width = 14
    ws3.column_dimensions['G'].width = 12
    ws3.column_dimensions['H'].width = 16
    ws3.column_dimensions['I'].width = 45
    ws3.column_dimensions['J'].width = 20
    ws3.column_dimensions['K'].width = 14

    # -------------------------------------------------------------------------
    # SHEET 4: Audit Findings & QA Checklist
    # -------------------------------------------------------------------------
    ws4 = wb.create_sheet(title="Dashboard Audit & QA")
    ws4.views.sheetView[0].showGridLines = True

    ws4.merge_cells("A1:G1")
    title4 = ws4["A1"]
    title4.value = "MASTERGAS — DASHBOARD AUDIT (7 ITEMS) & FINANCIAL QA MATRIX"
    title4.font = Font(name="Calibri", size=14, bold=True, color=WHITE)
    title4.fill = PatternFill(start_color=NAVY_BLUE, fill_type="solid")
    title4.alignment = Alignment(horizontal="center", vertical="center")
    ws4.row_dimensions[1].height = 35

    ws4.cell(row=3, column=1, value="1. DASHBOARD AUDIT REMAINING ITEMS (تقرير إعادة فحص الداشبورد)").font = Font(bold=True, size=11, color=NAVY_DARK)
    
    audit_headers = ["Item #", "Priority", "Observed Evidence / Defect", "Target Code File & Line", "Required Engineering Action", "Verification Method", "Status"]
    ws4.row_dimensions[4].height = 26
    for c_idx, h in enumerate(audit_headers, start=1):
        cell = ws4.cell(row=4, column=c_idx, value=h)
        cell.font = Font(bold=True, color=WHITE, size=9.5)
        cell.fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = header_border

    audit_rows = [
        ("1", "P1: دقة الإجمالي", 
         "summary.total_orders=10 مع orders_by_status={completed:2} يعرض الإجمالي 2",
         "src/views/DashboardView.vue:396",
         "لا تستبدل إجمالي السيرفر بمجموع توزيع جزئي. اعرض الإجمالي والتوزيع الجزئي بوضوح أو بيّن التعارض.",
         "Mock API with partial status & verify total=10", "Scheduled (Day 1)"),
        
        ("2", "P2: توافق البيانات",
         "عند غياب orders_by_status ووجود summary.completed_orders=2 و pending_orders=8 تُعرض الحالتان 0",
         "src/views/DashboardView.vue:582",
         "قراءة حقول summary موجودة داخل شرط وجود orders_by_status فقط. حافظ على قراءة حقول summary المستقلة.",
         "Mock API without orders_by_status & verify numbers", "Scheduled (Day 1)"),

        ("3", "P2: توافق المنتجات",
         "إرسال المنتجات في top_products والمخزون في low_stock يؤدي لطلبات fallback ويظهر أفضل المنتجات فارغاً",
         "src/views/DashboardView.vue:617 & :630",
         "استعد دعم الاسمين البديلين قبل fallback، أو أثبت بعقد API أن إسقاطهما مقصود.",
         "Test fallback prevention when alt keys exist", "Scheduled (Day 2)"),

        ("4", "P2: تمييز غير المتاح",
         "غياب توزيع الحالات يُظهر إجمالي 10 وكل الحالات 0 دون رسالة ظاهرة أن التوزيع غير متاح",
         "src/views/DashboardView.vue:58 (hasStatusBreakdown)",
         "استخدم حالة 'غير متاح' واضحة، ولا تعرض أصفاراً توحي بأن الأعداد قِيست.",
         "Verify N/A placeholder in doughnut chart container", "Scheduled (Day 2)"),

        ("5", "P2: القيم غير الصالحة",
         "completed='invalid' يظهر كأنه 0 طلب مكتمل ويخفي خطأ البيانات",
         "src/views/DashboardView.vue:412 & :585",
         "منع NaN نجح، لكن fallback إلى صفر يخفي خطأ البيانات. اعرض شرطة/غير متاح أو خطأ مناسب للقسم.",
         "Inject invalid string values & verify UI indicates error", "Scheduled (Day 2)"),

        ("6", "P2: نسب التغيير",
         "غياب customers_change يُظهر 0% وسهماً صاعداً على بطاقة العملاء",
         "src/views/DashboardView.vue:563 (trend fields)",
         "أخفِ النسبة أو اعرض غير متاح عندما لا تصل قيمة صالحة، واحتفظ بـ 0% فقط عندما تأتي صراحة.",
         "Test cards with null/undefined change indicators", "Scheduled (Day 3)"),

        ("7", "P2: صحة بيانات الرسم",
         "monthly_data=[{month_ar:'يناير',sales:'123garbage'}] يُنتج نقطة مبيعات 123 بسبب parseFloat",
         "src/views/DashboardView.vue:723",
         "استخدم تحققاً كاملاً للقيمة، وميّز القيمة المرفوضة عن الصفر لمنع تشويه الرسوم البيانية.",
         "Verify sales_chart regex number validation", "Scheduled (Day 3)")
    ]

    a_idx = 5
    for a in audit_rows:
        ws4.row_dimensions[a_idx].height = 30
        for ci, val in enumerate(a, start=1):
            c = ws4.cell(row=a_idx, column=ci, value=val)
            c.border = thin_border
            c.alignment = Alignment(vertical="center", wrap_text=True)
            if ci == 1:
                c.alignment = Alignment(horizontal="center", vertical="center")
                c.font = Font(bold=True)
            elif ci == 2:
                c.alignment = Alignment(horizontal="center", vertical="center")
                c.font = Font(bold=True, size=9)
                if "P1" in val:
                    c.fill = PatternFill(start_color=P1_FILL, fill_type="solid")
                    c.font = Font(bold=True, color=P1_FONT, size=9)
                else:
                    c.fill = PatternFill(start_color=P2_FILL, fill_type="solid")
                    c.font = Font(bold=True, color=P2_FONT, size=9)
            elif ci == 4:
                c.font = Font(name="Consolas", size=9, color=ACCENT_BLUE)
            elif ci == 7:
                c.alignment = Alignment(horizontal="center", vertical="center")
                c.fill = PatternFill(start_color=STATUS_WAIT_FILL, fill_type="solid")
                c.font = Font(bold=True, size=9, color=STATUS_WAIT_FONT)
        a_idx += 1

    # Financial & Idempotency Checklist
    a_idx += 2
    ws4.cell(row=a_idx, column=1, value="2. CHECKOUT & FINANCIAL SAFETY CONTRACT (قواعد أمان الدفع والطلبات)").font = Font(bold=True, size=11, color=NAVY_DARK)
    a_idx += 1
    
    sec_headers = ["Rule #", "Contract Rule", "Description & Frontend Enforcement", "Backend Verification & Idempotency", "Test Coverage"]
    ws4.row_dimensions[a_idx].height = 25
    for ci, h in enumerate(sec_headers, start=1):
        cell = ws4.cell(row=a_idx, column=ci, value=h)
        cell.font = Font(bold=True, color=WHITE, size=9.5)
        cell.fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = header_border

    sec_rules = [
        ("SEC-01", "Idempotency-Key Stability", 
         "الواجهة ترسل Idempotency-Key / checkout_attempt_id ثابت طوال محاولة الدفع الواحدة.",
         "السيرفر يمنع تكرار المعاملة ويخزن الرابط لمدة 24 ساعة، ويرجع نفس الطلب عند إعادة الإرسال.",
         "checkoutSafety.test.js"),
        ("SEC-02", "Server-Side Pricing Draft",
         "الواجهة ترسل لقطة المنتجات بدون فرض الإجمالي، ويقوم السيرفر بإعادة حساب الأسعار والضرائب والخصم.",
         "POST /frontend/paytabs/checkout ينشئ payment draft موثق بأسعار قاعدة البيانات.",
         "checkoutView.test.js"),
        ("SEC-03", "Atomic Order & Stock Transaction",
         "لا يتم تأكيد الطلب إلا بعد استجابة PayTabs الإيجابية وتطابق المبلغ والعملة ورقم العميل.",
         "خصم المخزون وخصم المحفظة وإنشاء الطلب يتم في عملية قاعدة بيانات ذرية واحدة DB::transaction.",
         "paymentSuccessView.test.js"),
        ("SEC-04", "Offline Resilience & Reconnect",
         "إذا انقطع الاتصال بالإنترنت بعد الدفع وقبل إتمام الطلب، يتم الاحتفاظ بالمعاملة في LocalStorage.",
         "عند عودة الاتصال يبدأ Auto-reconnect تلقائياً لاسترجاع الطلب دون فقدان حق العميل.",
         "PaymentSuccessView safety scenarios")
    ]

    a_idx += 1
    for r in sec_rules:
        ws4.row_dimensions[a_idx].height = 28
        for ci, val in enumerate(r, start=1):
            c = ws4.cell(row=a_idx, column=ci, value=val)
            c.border = thin_border
            c.alignment = Alignment(vertical="center", wrap_text=True)
            if ci == 1:
                c.alignment = Alignment(horizontal="center", vertical="center")
                c.font = Font(bold=True, size=9)
            elif ci == 2:
                c.font = Font(bold=True, color=NAVY_BLUE, size=9.5)
            elif ci == 5:
                c.font = Font(name="Consolas", size=9, color=ACCENT_BLUE)
        a_idx += 1

    ws4.column_dimensions['A'].width = 10
    ws4.column_dimensions['B'].width = 24
    ws4.column_dimensions['C'].width = 44
    ws4.column_dimensions['D'].width = 30
    ws4.column_dimensions['E'].width = 44
    ws4.column_dimensions['F'].width = 30
    ws4.column_dimensions['G'].width = 18

    # -------------------------------------------------------------------------
    # SHEET 5: Storefront & Dashboard API Matrix
    # -------------------------------------------------------------------------
    ws5 = wb.create_sheet(title="API Integration Matrix")
    ws5.views.sheetView[0].showGridLines = True

    ws5.merge_cells("A1:G1")
    title5 = ws5["A1"]
    title5.value = "MASTERGAS — STOREFRONT & DASHBOARD API INTEGRATION MATRIX"
    title5.font = Font(name="Calibri", size=14, bold=True, color=WHITE)
    title5.fill = PatternFill(start_color=NAVY_BLUE, fill_type="solid")
    title5.alignment = Alignment(horizontal="center", vertical="center")
    ws5.row_dimensions[1].height = 35

    api_headers = ["Module", "Storefront View", "Frontend Endpoint", "Admin Dashboard View", "Dashboard Endpoint", "Guard / Auth", "Sync Status"]
    ws5.row_dimensions[3].height = 28
    for ci, h in enumerate(api_headers, start=1):
        cell = ws5.cell(row=3, column=ci, value=h)
        cell.font = Font(bold=True, color=WHITE, size=10)
        cell.fill = PatternFill(start_color=NAVY_DARK, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = header_border

    api_matrix = [
        ("Catalog & Products", "ProductsView.vue", "GET /api/frontend/products", "ProductsView.vue", "GET/POST /api/dashboard/products", "Public / Admin Token", "Active & Integrated"),
        ("Product Details", "ProductDetailView.vue", "GET /api/frontend/products/{id}", "ProductsView.vue", "POST /api/dashboard/products/{id}", "Public / Admin Token", "Active & Integrated"),
        ("Categories", "HomeView & ProductsView", "GET /api/frontend/categories", "CategoriesView.vue", "GET/POST /api/dashboard/categories", "Public / Admin Token", "Active & Integrated"),
        ("Brands", "HomeView & Filters", "GET /api/frontend/filters", "BrandsView.vue", "GET/POST /api/dashboard/brands", "Public / Admin Token", "Active & Integrated"),
        ("Coupons & Discounts", "CheckoutView.vue", "POST /api/frontend/coupons/validate", "CouponsView.vue", "GET/POST /api/dashboard/coupons", "Customer / Admin Token", "Needs End-to-End Test"),
        ("City Shipping Rates", "CheckoutView.vue", "GET /api/frontend/cities", "CityShippingRatesView.vue", "GET/PUT /api/dashboard/city-shipping-rates", "Public / Admin Token", "Needs Rate Sync Test"),
        ("Orders Creation & Flow", "CheckoutView.vue", "POST /api/frontend/orders", "OrdersView.vue", "GET/PATCH /api/dashboard/orders/{id}/status", "c_token + Idempotency", "Needs Full Sync Test"),
        ("PayTabs Gateway", "PaymentSuccessView.vue", "POST /api/frontend/paytabs/order", "PaymentsView.vue", "GET /api/dashboard/orders", "Public/Customer + Signature", "High Priority QA"),
        ("Returns & Refunds", "ProfileView.vue", "POST /api/frontend/returns", "ReturnsView.vue", "PATCH /api/dashboard/returns/{id}/status", "Customer / Admin Token", "Needs Wallet Sync Test"),
        ("Customer Reviews", "ProductDetailView.vue", "POST /api/frontend/reviews", "ReviewsView.vue", "PATCH /api/dashboard/reviews/{id}/approve", "Customer / Admin Token", "Active & Integrated"),
        ("Sliders & Banners", "HomeView.vue", "GET /api/frontend/sliders", "SlidersView.vue", "GET/POST /api/dashboard/sliders", "Public / Admin Token", "Active & Integrated"),
        ("Site Settings & Contact", "ContactView / Footer", "GET /api/frontend/settings", "SettingsView.vue", "POST /api/dashboard/settings/multiple", "Public / Admin Token", "Active & Integrated")
    ]

    api_r = 4
    for row in api_matrix:
        ws5.row_dimensions[api_r].height = 25
        for ci, val in enumerate(row, start=1):
            c = ws5.cell(row=api_r, column=ci, value=val)
            c.border = thin_border
            c.alignment = Alignment(vertical="center", wrap_text=True)
            if ci == 1:
                c.font = Font(bold=True, size=9.5, color=NAVY_DARK)
            elif ci in (3, 5):
                c.font = Font(name="Consolas", size=9, color=ACCENT_BLUE)
            elif ci == 7:
                c.alignment = Alignment(horizontal="center", vertical="center")
                c.font = Font(bold=True, size=9)
                if "Active" in val:
                    c.fill = PatternFill(start_color=STATUS_DONE_FILL, fill_type="solid")
                    c.font = Font(bold=True, color=STATUS_DONE_FONT, size=9)
                else:
                    c.fill = PatternFill(start_color=STATUS_PROG_FILL, fill_type="solid")
                    c.font = Font(bold=True, color=STATUS_PROG_FONT, size=9)
        api_r += 1

    ws5.column_dimensions['A'].width = 22
    ws5.column_dimensions['B'].width = 22
    ws5.column_dimensions['C'].width = 34
    ws5.column_dimensions['D'].width = 24
    ws5.column_dimensions['E'].width = 38
    ws5.column_dimensions['F'].width = 24
    ws5.column_dimensions['G'].width = 22

    # Save to Project Directory
    output_path = "/Users/omarragab/Projects/mastergas/Mastergas_Project_Execution_Plan_2Weeks.xlsx"
    wb.save(output_path)
    print(f"Successfully generated: {output_path}")

if __name__ == "__main__":
    create_mastergas_plan()
